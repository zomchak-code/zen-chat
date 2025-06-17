<script lang="ts">
  import { goto } from "$app/navigation";
  import { backend } from "$lib/service/backend";
  import { getOnStreaming } from "$lib/service/chat.state.svelte";
  import ChatInput from "$lib/components/ChatInput.svelte";

  const onStreaming = getOnStreaming();

  async function submit(json: { mode: string; text: string }) {
    const res = await backend.chats.$post({ json });

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No reader");

    const { value } = await reader.read();
    const event = new TextDecoder().decode(value);
    const chatId = event.split("data:").pop()?.trim();

    onStreaming(chatId, reader);

    await goto(`/chat/${chatId}`);
  }
</script>

<div class="h-full w-full flex items-center justify-center">
  <div class="w-full max-w-2xl">
    <ChatInput onsubmit={submit} />
  </div>
</div>
