<script lang="ts">
  import { api } from "$lib/service/convex";
  import { useQuery } from "convex-svelte";
  import { page } from "$app/state";
  import { getOnStreaming, getStream } from "$lib/service/message.state.svelte";
  import ChatInput from "$lib/components/ChatInput.svelte";
  import { backend } from "$lib/service/backend";
  import Button from "$lib/components/ui/button/button.svelte";
  import { Loader2, RefreshCw } from "@lucide/svelte";
  import showdown from "showdown";
  import * as Accordion from "$lib/components/ui/accordion";

  const converter = new showdown.Converter({
    tables: true,
    openLinksInNewWindow: true,
  });

  const messages = useQuery(api.message.get, { chat: page.params.id });

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

  async function edit() {
    const res = await backend.messages.$patch({
      json: {
        message: focused,
        mode: "cheap",
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

  function onkeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      edit();
    }
  }

  async function rerun(message: string, mode: string) {
    const res = await backend.messages.$delete({
      json: { message, mode },
    });

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No reader");

    const event = await reader.read();
    const decoded = new TextDecoder().decode(event.value);
    const id = decoded.split("data:").pop()?.trim();

    onStreaming(id, reader);
  }
</script>

<div class="h-screen items-center relative flex flex-col-reverse overflow-auto">
  <div class="sticky bottom-0 rounded px-10 p-4 glass z-10">
    <div class="w-screen max-w-2xl">
      <ChatInput onsubmit={submit} />
    </div>
  </div>
  {#if messages.data}
    <div class="grow w-full max-w-2xl py-2 flex flex-col-reverse">
      {#each messages.data.reverse() as message}
        {#if message.user}
          <div class="self-end flex flex-col gap-1 items-end">
            <div
              oninput={(e) => (editingText = e.currentTarget.innerText)}
              contenteditable
              role="textbox"
              tabindex="0"
              {onkeydown}
              onfocus={() => (focused = message._id)}
              onblur={() => setTimeout(() => (focused = ""), 100)}
              class="rounded-lg p-2 bg-muted whitespace-pre-line"
            >
              {message.text}
              {#if focused === message._id}
                <div class="inline-block float-end">
                  <div class="flex items-center pl-2">
                    <!-- <Select.Root type="single">
                        <Select.Trigger class="bg-transparent border-none">
                          GPT-4o
                        </Select.Trigger>
                      </Select.Root> -->
                    <Button onclick={edit} class="h-auto p-1!">
                      <RefreshCw />
                    </Button>
                  </div>
                </div>
              {/if}
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
                    {#if message.state === "in_progress"}
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
            {#if message.state === "done"}
              <div
                class="flex px-2 gap-2 items-center opacity-0 group-hover:opacity-50 hover:opacity-100 transition"
              >
                <RefreshCw size={16} />
                <Button
                  onclick={() => rerun(message._id, "smart")}
                  variant="ghost"
                >
                  Smart
                </Button>
                <Button
                  onclick={() => rerun(message._id, "fast")}
                  variant="ghost"
                >
                  Fast
                </Button>
                <Button
                  onclick={() => rerun(message._id, "cheap")}
                  variant="ghost"
                >
                  Cheap
                </Button>
              </div>
            {/if}
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>
