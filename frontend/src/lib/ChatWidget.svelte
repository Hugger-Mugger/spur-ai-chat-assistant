<script lang="ts">
  import { onMount, tick } from 'svelte';
  // 🚀 Perfect relative path
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
        
        // 🚀 CRITICAL FIX: Fallback lagaya hai agar api array return na kare, taaki app crash na ho
        if (historyMessages && Array.isArray(historyMessages)) {
          messages = historyMessages.map((msg: any) => ({
            id: msg.id || '',
            sender: (msg.sender === 'USER' || msg.sender === 'AI') ? msg.sender : 'AI',
            text: msg.text || '',
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
          }));
          console.log(`✅ Loaded ${messages.length} messages safely.`);
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