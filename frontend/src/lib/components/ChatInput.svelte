<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import Textarea from "$lib/components/ui/textarea/textarea.svelte";
  import { ArrowUp, Square } from "@lucide/svelte";
  import { useConvexClient, useQuery } from "convex-svelte";
  import { api } from "$lib/service/convex";
  import Modes from "./Modes.svelte";
  import { on } from "svelte/events";

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

  async function submit() {
    loading = true;
    try {
      await onsubmit({
        mode: user.data?.mode,
        model: user.data?.modes[user.data?.mode],
        text,
      });
      text = "";
    } finally {
      loading = false;
    }
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
    bind:value={text}
    disabled={loading}
    {onkeydown}
    autofocus
    class="bg-transparent! min-h-0 resize-none border-none shadow-none ring-0!"
    placeholder="What's on your mind?"
  />
  <div class="px-1 flex justify-between">
    <div class="flex gap-2">
      <Modes
        value={user.data?.mode}
        onclick={updateMode}
        onOpenChange={(open, mode) => open && updateMode({ mode })}
      />
    </div>
    {#if onstop}
      <Button onclick={onstop} class="size-6 p-0"></Button>
    {:else}
      <Button type="submit" variant="ghost" disabled={!text}>
        <ArrowUp />
      </Button>
    {/if}
  </div>
</form>
