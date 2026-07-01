<script lang="ts">
  import { onMount, tick } from 'svelte';
  // 🚀 Sahi explicit path
  import { sendMessage as sendApiMessage, getConversationHistory } from './api';

  // --- State Architecture via Svelte 5 Runes ---
  let messages = $state<Array<{ id?: string; sender: 'USER' | 'AI'; text: string; timestamp: Date }>>([]);
  let inputMessage = $state('');
  let sessionId = $state<string | null>(null);
  let isAiTyping = $state(false);
  let chatContainer = $state<HTMLDivElement | null>(null);

  // --- Auto-Scroll Guardrail ---
  async function scrollToBottom() {
    await tick();
    if (chatContainer) {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  // --- Session Restoration on Load ---
  onMount(async () => {
    const savedSession = localStorage.getItem('spur_chat_session');
    
    if (savedSession) {
      sessionId = savedSession;
      
      try {
        const historyMessages = await getConversationHistory(savedSession);
        
        if (historyMessages && Array.isArray(historyMessages)) {
          messages = historyMessages.map((msg: any) => ({
            id: msg.id || '',
            sender: (msg.sender === 'USER' || msg.sender === 'AI') ? msg.sender : 'AI',
            text: msg.text || '',
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
          }));
        } else {
          messages = [];
        }
        
      } catch (error) {
        console.warn('⚠️ Failed to fetch history safely:', error);
        messages = [];
      }
    }
    
    await scrollToBottom();
  });

  // --- Handle Clear/Reset Chat Macro ---
  function clearChat() {
    messages = [];
    sessionId = null;
    localStorage.removeItem('spur_chat_session');
    inputMessage = '';
    isAiTyping = false;
  }

  // --- Dispatch Message Pipeline ---
  async function sendMessage() {
    const cleanText = inputMessage.trim();
    if (!cleanText || isAiTyping) return;

    messages.push({
      sender: 'USER',
      text: cleanText,
      timestamp: new Date()
    });

    inputMessage = '';
    isAiTyping = true;
    await scrollToBottom();

    try {
      const data = await sendApiMessage(cleanText, sessionId || undefined);

      if (data && data.sessionId) {
        sessionId = data.sessionId;
        localStorage.setItem('spur_chat_session', data.sessionId);
      }

      if (data && data.reply) {
        messages.push({
          sender: 'AI',
          text: data.reply,
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error('❌ Frontend pipeline capture:', error);
      messages.push({
        sender: 'AI',
        text: "I'm experiencing a quick connection delay. Could you please send that message once more?",
        timestamp: new Date()
      });
    } finally {
      isAiTyping = false;
      await scrollToBottom();
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      sendMessage();
    }
  }
</script>

<div class="w-full h-full bg-white flex flex-col overflow-hidden">
  
  <header class="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between shadow-sm">
    <div class="flex items-center gap-3">
      <span class="relative flex h-2.5 w-2.5">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
      </span>
      <div>
        <h1 class="text-sm font-semibold text-slate-900 tracking-tight">Spur AI Assistant</h1>
        <p class="text-[11px] text-slate-400 font-medium">Instant Support Tier</p>
      </div>
    </div>

    <button 
      onclick={clearChat}
      class="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
      title="Reset entire conversation state"
    >
      Clear Chat
    </button>
  </header>

  <div 
    bind:this={chatContainer}
    class="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/60"
  >
    {#if messages.length === 0}
      <div class="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
        <div class="p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <h3 class="text-xs font-semibold text-slate-800">Welcome to Spur Support</h3>
        <p class="text-[11px] text-slate-400 max-w-[240px] leading-relaxed">
          Ask me about our worldwide shipping, return timelines, or corporate operating hours!
        </p>
      </div>
    {:else}
      {#each messages as msg}
        <div class="flex flex-col {msg.sender === 'USER' ? 'items-end' : 'items-start'}">
          <div class="max-w-[80%] px-4 py-2.5 shadow-sm text-xs leading-relaxed
            {msg.sender === 'USER' 
              ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none' 
              : 'bg-white border border-slate-200/60 text-slate-800 rounded-2xl rounded-tl-none'}"
          >
            {msg.text}
          </div>
          
          <span class="text-[9px] text-slate-400 mt-1 px-1">
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      {/each}
    {/if}

    {#if isAiTyping}
      <div class="flex flex-col items-start animate-fade-in">
        <div class="bg-white border border-slate-200/60 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
          <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
          <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
          <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
        </div>
      </div>
    {/if}
  </div>

  <div class="p-4 border-t border-slate-100 bg-white flex items-center gap-2">
    <input
      type="text"
      bind:value={inputMessage}
      onkeydown={handleKeyDown}
      disabled={isAiTyping}
      placeholder={isAiTyping ? "Agent is processing response..." : "Type your inquiry..."}
      class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 disabled:opacity-60 disabled:cursor-not-allowed placeholder-slate-400"
    />
    
    <button
      onclick={sendMessage}
      disabled={!inputMessage.trim() || isAiTyping}
      class="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
    >
      <svg xmlns="http://www.w3.org/2000/xl" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
    </button>
  </div>

</div>