<script lang="ts">
  import { api } from "$lib/service/convex";
  import { useConvexClient, useQuery } from "convex-svelte";
  import { page } from "$app/state";
  import { getOnStreaming, getStream } from "$lib/service/message.state.svelte";
  import ChatInput from "$lib/components/ChatInput.svelte";
  import { backend } from "$lib/service/backend";
  import { Loader2, RefreshCw } from "@lucide/svelte";
  import showdown from "showdown";
  import * as Accordion from "$lib/components/ui/accordion";
  import Modes from "$lib/components/Modes.svelte";
  import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
  import CopyButton from "$lib/components/CopyButton.svelte";

  const convex = useConvexClient();

  const converter = new showdown.Converter({
    tables: true,
    openLinksInNewWindow: true,
  });

  const messages = useQuery(api.message.get, { chat: page.params.id });
  const streamingMessage = $derived(
    messages.data?.filter((m) => m.state === "in_progress")[0],
  );

  let focused = $state("");
  let editingText = $state("");

  const onStreaming = getOnStreaming();

  async function submit(submition: { mode: string; text: string }) {
    const res = await backend.messages.$post({
      json: { chat: page.params.id, ...submition },
    });

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No reader");

    const event = await reader.read();
    const decoded = new TextDecoder().decode(event.value);
    const message = decoded.split("data:").pop()?.trim();

    onStreaming(message, reader);
  }

  function scrollIntoView(e: MouseEvent) {
    const target = e.target as HTMLElement;
    setTimeout(
      () => target.scrollIntoView({ behavior: "smooth", block: "nearest" }),
      150,
    );
  }

  const user = useQuery(api.user.get, {});

  async function updateMode(update: { mode: string; model?: string }) {
    await convex.mutation(api.user.update, update);
  }

  async function edit(
    messageId: string,
    config?: { mode: string; model?: string },
  ) {
    if (config?.model) {
      updateMode(config);
    }
    const mode = (config ?? user.data)?.mode;
    const res = await backend.messages.$patch({
      json: {
        message: messageId,
        mode,
        model: config?.model ?? user.data?.modes[mode],
        text: editingText,
      },
    });

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No reader");

    const event = await reader.read();
    const decoded = new TextDecoder().decode(event.value);
    const message = decoded.split("data:").pop()?.trim();

    onStreaming(message, reader);
  }

  async function onkeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      edit(focused);
    }
  }

  async function rerun(
    messageId: string,
    config?: { mode: string; model?: string },
  ) {
    if (config?.model) {
      updateMode(config);
    }
    const mode = (config ?? user.data)?.mode;

    const res = await backend.messages.$delete({
      json: {
        message: messageId,
        mode,
        model: config?.model ?? user.data?.modes[mode],
      },
    });

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No reader");

    const event = await reader.read();
    const decoded = new TextDecoder().decode(event.value);
    const id = decoded.split("data:").pop()?.trim();

    onStreaming(id, reader);
  }

  let open = $state();
  function onOpenChange(o: boolean, messageId: string) {
    if (o) {
      setTimeout(() => (open = messageId), 100);
    } else {
      open = undefined;
    }
  }

  function stop() {
    if (!streamingMessage) return;
    backend.messages.stop[":id"].$post({
      param: { id: streamingMessage._id },
    });
  }
</script>

<div class="h-screen items-center relative flex flex-col-reverse overflow-auto">
  <div
    class="sticky bottom-0 w-full rounded px-10 p-4 glass z-10 flex justify-center"
  >
    <div class="w-full max-w-2xl">
      <ChatInput
        onsubmit={submit}
        onstop={streamingMessage ? stop : undefined}
      />
    </div>
  </div>
  {#if messages.data}
    <div class="grow w-full max-w-2xl p-2 flex flex-col-reverse">
      {#each messages.data.reverse() as message}
        {#if message.user}
          <div class="self-end flex flex-col gap-1 items-end group">
            {#key message.text}
              <div
                oninput={(e) => (editingText = e.currentTarget.innerText)}
                contenteditable
                role="textbox"
                tabindex="0"
                {onkeydown}
                onfocus={() => (focused = message._id)}
                onblur={() => setTimeout(() => (focused = ""), 100)}
                class="p-2 rounded-lg bg-muted hover:bg-muted/50 whitespace-pre-line"
              >
                {message.text}
              </div>
            {/key}
            <div
              class={[
                "flex gap-2 group-hover:opacity-50 hover:opacity-100 transition",
                focused === message._id || open === message._id
                  ? "opacity-50"
                  : "opacity-0 ",
              ]}
            >
              <Modes
                onclick={(config) => edit(message._id, config)}
                onOpenChange={(open) => onOpenChange(open, message._id)}
              >
                <RefreshCw />
              </Modes>
              <CopyButton value={message.text} />
            </div>
          </div>
        {:else}
          <div class="group">
            {#if getStream(message._id)?.reasoning || message.reasoning}
              <Accordion.Root type="single">
                <Accordion.Item
                  value="item-1"
                  class="rounded-lg px-2 self-start"
                >
                  <Accordion.Trigger onclick={scrollIntoView}>
                    Reasoning
                    {#if !(getStream(message._id)?.text || message.text)}
                      <Loader2 size={20} class="animate-spin" />
                    {/if}
                  </Accordion.Trigger>
                  <Accordion.Content
                    class="prose dark:prose-invert rounded-lg  bg-muted px-4 py-2"
                  >
                    {@html converter.makeHtml(
                      getStream(message._id)?.reasoning || message.reasoning,
                    )}
                  </Accordion.Content>
                </Accordion.Item>
              </Accordion.Root>
            {/if}
            <div class="prose dark:prose-invert rounded-lg px-2">
              {@html converter.makeHtml(
                getStream(message._id)?.text || message.text,
              )}
            </div>
            {#if !(getStream(message._id)?.reasoning || message.reasoning || getStream(message._id)?.text || message.text)}
              <div class="space-y-2">
                <Skeleton class="w-full h-3 rounded-lg" />
                <Skeleton class="w-full h-3 rounded-lg" />
                <Skeleton class="w-1/2 h-3 rounded-lg" />
              </div>
            {/if}
            <div
              class={[
                "flex gap-2 opacity-0 transition",
                open === message._id ? "opacity-50" : "opacity-0 ",
                message.state === "done" &&
                  "group-hover:opacity-50 hover:opacity-100",
              ]}
            >
              <Modes
                onclick={(config) => rerun(message._id, config)}
                onOpenChange={(open) => onOpenChange(open, message._id)}
              >
                <RefreshCw />
              </Modes>
              <CopyButton
                value={getStream(message._id)?.text || message.text}
              />
            </div>
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>
