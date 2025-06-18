<script lang="ts">
  import { goto } from "$app/navigation";
  import { backend } from "$lib/service/backend";
  import { getOnStreaming } from "$lib/service/message.state.svelte";
  import ChatInput from "$lib/components/ChatInput.svelte";

  const onStreaming = getOnStreaming();

  async function submit(json: { mode: string; model: string; text: string }) {
    const res = await backend.chats.$post({ json });

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No reader");

    const decoder = new TextDecoder();

    let event = await reader.read();
    let decoded = decoder.decode(event.value);
    const chat = decoded.split("data:").pop()?.trim();

    event = await reader.read();
    decoded = decoder.decode(event.value);
    const message = decoded.split("data:").pop()?.trim();

    onStreaming(message, reader);

    await goto(`/chat/${chat}`);
  }
</script>

<div class="h-full w-full flex items-center justify-center">
  <div class="w-full max-w-2xl">
    <ChatInput onsubmit={submit} />
  </div>
</div>
