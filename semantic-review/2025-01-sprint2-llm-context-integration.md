# Sprint 2: LLM Context History and Session Nullability Refactor

This refactor introduces real LLM responses with conversation context history while tightening the session lifecycle. The handler now retrieves prior messages before calling the LLM, permitting the model to maintain logical continuity across turns. The validation layer shifts to permit `null` sessionId values, enabling the lazy session resolver to treat null and undefined identically. Watch for: **session nullability validation asymmetry** (confirmed), **context window slicing off-by-one risk** (confirmed), and **message truncation silent failure** (likely).

## High-level view

The validation schema rejects `sessionId: null` but the handler accepts it—the `.nullable()` fix closes this gap. The refactor retrieves full conversation history before calling the LLM, then strips the just-added user message to avoid repetition. This works if history always returns messages in timestamp order with the user message last, but couples context assembly to database ordering invariants. Message truncation to 3000 chars happens silently with only a console warning, leaving callers unaware data was lost. The handler's verbose logging (context window size, conversation lifecycle) aids debugging. The proposed `getMessagesByConversationId()` duplicates `getConversationHistory()` and should be removed.

<details>
<summary>Issues (3)</summary>

1. **Session nullability type guard bug** — The handler checks `activeSessionId === 'null'` (string comparison), which will never match actual `null` values. Change to `if (!activeSessionId)` to catch both `null` and `undefined`.

2. **Context window slicing couples to database ordering** — Stripping the last message via `.slice(0, -1)` assumes messages always return in timestamp order with the user message last. If ordering changes or concurrent writes occur, the wrong message gets stripped, risking hallucination. Safer: fetch history *before* adding the user message, then add it for persistence.

3. **Silent message truncation** — Messages over 3000 chars are truncated silently with only `console.warn()`. Clients get no indication data was lost. Return HTTP 413, reject client-side, or include a warning flag in the response (`{ reply: "...", truncated: true }`).

</details>

<details>
<summary>Details</summary>

### Session nullability validation-handler mismatch

The proposed validation adds `.nullable()` to sessionId, aligning schema with handler intent. However, the handler code checks `if (!activeSessionId || activeSessionId === 'null')`. The string comparison `=== 'null'` will never fire for actual `null` values—only for the literal string `'null'`. This is a type guard bug. The fix: replace `|| activeSessionId === 'null'` with just `if (!activeSessionId)`, which covers both `null` and `undefined` via truthiness and requires no string comparison.

### Context assembly depends on deterministic message ordering

The handler retrieves history after adding the user message, then strips it via `.slice(0, -1)`:

```
const allMessages = await databaseService.getConversationHistory(activeSessionId);
const contextHistory = allMessages.slice(0, -1); // Remove last message
```

This is safe only if `getConversationHistory` always returns messages ordered by timestamp ascending and the user message is always last. In single-threaded execution with synchronous add/fetch, this holds. But the design couples context assembly to database ordering guarantees. If a future change adds concurrent write batching or changes sort order, the wrong message could be stripped from context.

Safer approach: fetch history *before* adding the user message, construct context from that fetch, then persist the user message for next turn. This decouples context from message ordering:

```
const priorMessages = await databaseService.getConversationHistory(sessionId);
const contextHistory = priorMessages.map(msg => ({ sender: msg.sender, text: msg.text }));
await databaseService.addMessage(sessionId, 'USER', message);
```

Current implementation is likely safe in practice but trades safety for simplicity.

### Silent data loss on message truncation

Messages over 3000 characters are truncated silently:

```
if (cleanMessage.length > 3000) {
  console.warn(`⚠️  Message truncated from ${cleanMessage.length} to 3000 characters`);
  cleanMessage = cleanMessage.substring(0, 3000);
}
```

The client receives no indication data was lost—no HTTP error, no flag in the response. This violates transparency: data loss should be explicit to the caller. Also, the schema allows up to 4000 chars (`max(4000)`), but the handler truncates to 3000, creating inconsistency. Either enforce the 3000 limit in the schema, or return HTTP 413 if the message exceeds it. If truncation is intentional for token budgets, include a `truncated: true` flag in the response.

### Error resilience without specificity

The LLM handler gracefully falls back on failure: missing API key or network timeout returns a user-facing message rather than throwing. This is solid defensive design and preserves the persisted message for safe retry. The catch block doesn't distinguish between failure modes (auth vs. network vs. malformed prompt), making debugging harder. Log the specific error type before returning the fallback.

### Redundant database method

The proposed addition of `getMessagesByConversationId()` duplicates `getConversationHistory()`. Both retrieve messages by conversationId with the same projection and ordering. Remove the new method or clarify if it should differ (e.g., different projection, filtering, or ordering).

</details>

<details>
<summary>File changes</summary>

- **validation.ts**: Add `.nullable()` to sessionId field (line 8)
- **chatController.ts**: Rewrite for message sanitization, context history, and LLM integration
- **databaseService.ts**: Do not add `getMessagesByConversationId()` (use existing `getConversationHistory()`)

</details>
