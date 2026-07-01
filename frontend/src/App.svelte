<script lang="ts">
  import ChatWidget from './lib/ChatWidget.svelte';
</script>

<main>
  <ChatWidget />
</main>

<style lang="postcss">
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background-color: #fff;
    overflow: hidden;
  }

  :global(main) {
    width: 100vw;
    height: 100vh;
    display: flex;
  }
</style>
