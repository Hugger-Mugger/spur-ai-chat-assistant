<script lang="ts">
  export interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: Date;
  }

  export let message: Message;

  function formatTime(date: Date): string {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
</script>

<div class="flex {message.sender === 'user' ? 'justify-end' : 'justify-start'}">
  <div
    class="flex flex-col {message.sender === 'user' ? 'items-end' : 'items-start'} gap-1"
  >
    <div
      class="max-w-xs lg:max-w-md px-4 py-3 rounded-lg break-words {message.sender === 'user'
        ? 'bg-blue-600 text-white rounded-br-none'
        : 'bg-gray-200 text-gray-900 rounded-bl-none'}"
    >
      <p class="text-sm">{message.text}</p>
    </div>
    <span class="text-xs {message.sender === 'user' ? 'text-blue-600' : 'text-gray-500'} px-2">
      {formatTime(message.timestamp)}
    </span>
  </div>
</div>

<style lang="postcss">
  /* Component styles scoped */
</style>
