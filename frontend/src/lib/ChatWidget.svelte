<script lang="ts">
  import { onMount, tick } from 'svelte';
  // 🚀 Step 1: Central api client se functions ko import karo
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
      
      // 🚀 Step 2: Purane localhost fetch ko hata kar type-safe API client use kiya
      try {
        const historyMessages = await getConversationHistory(savedSession);
        
        // Map backend response to UI format
        messages = historyMessages.map((msg: any) => ({
          id: msg.id,
          sender: msg.sender as 'USER' | 'AI',
          text: msg.text,
          timestamp: new Date(msg.timestamp)
        }));
        
        console.log(`✅ Loaded ${messages.length} messages from conversation ${savedSession}`);
        
      } catch (error) {
        console.warn('⚠️ Failed to fetch history from API, using empty state:', error);
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
    if (!cleanText || isAiTyping) return; // Lock check

    // 1. Instantly push user message to UI
    messages.push({
      sender: 'USER',
      text: cleanText,
      timestamp: new Date()
    });

    inputMessage = ''; // Clear input field instantly
    isAiTyping = true;  // Trigger typing state & lock buttons
    await scrollToBottom();

    try {
      // 🚀 Step 3: Central api client ke call se fetch chain ko replace kar diya
      const data = await sendApiMessage(cleanText, sessionId || undefined);

      // Update active session cache
      if (data.sessionId) {
        sessionId = data.sessionId;
        localStorage.setItem('spur_chat_session', data.sessionId);
      }

      // Push real AI generated response to UI
      messages.push({
        sender: 'AI',
        text: data.reply,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('❌ Frontend pipeline capture:', error);
      messages.push({
        sender: 'AI',
        text: "I'm experiencing a quick connection delay. Could you please send that message once more?",
        timestamp: new Date()
      });
    } finally {
      isAiTyping = false; // Release input lock
      await scrollToBottom();
    }
  }

  // Handle Enter Keypress submission
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      sendMessage();
    }
  }
</script>