<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import Textarea from "$lib/components/ui/textarea/textarea.svelte";
  import { ArrowUp } from "@lucide/svelte";
  import { useConvexClient, useQuery } from "convex-svelte";
  import { api } from "$lib/service/convex";
  import Modes from "./Modes.svelte";

  const convex = useConvexClient();

  let {
    onsubmit,
    onstop,
  }: {
    onsubmit: (submition: {
      mode: string;
      model: string;
      text: string;
    }) => Promise<unknown>;
    onstop?: () => void;
  } = $props();

  const user = useQuery(api.user.get, {});

  let text = $state("");
  let loading = $state(false);

  function submit() {
    setTimeout(() => (text = ""), 200);
    onsubmit({
      mode: user.data?.mode,
      model: user.data?.modes[user.data?.mode],
      text,
    });
  }

  async function updateMode(update: { mode: string; model?: string }) {
    await convex.mutation(api.user.update, update);
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }
</script>

<form onsubmit={submit} class="space-y-1 rounded-lg">
  <Textarea
    id="chat-input"
    bind:value={text}
    disabled={loading}
    {onkeydown}
    autofocus
    class="min-h-0 max-h-80 resize-none border-none shadow-none ring-0! bg-secondary px-3.5"
    placeholder="What's on your mind?"
  />
  <div class="pr-1 flex justify-between items-center">
    <div class="flex gap-2">
      <Modes
        value={user.data?.mode}
        onclick={updateMode}
        onOpenChange={(open, mode) => open && updateMode({ mode })}
      />
    </div>
    {#if onstop}
      <Button onclick={onstop} variant="ghost" class="px-3">
        <div class="size-4 rounded-sm bg-primary"></div>
      </Button>
    {:else}
      <Button type="submit" disabled={!text} variant="ghost">
        <ArrowUp />
      </Button>
    {/if}
  </div>
</form>
