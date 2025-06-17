<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import Textarea from "$lib/components/ui/textarea/textarea.svelte";
  import { ArrowUp } from "@lucide/svelte";
  import { useConvexClient, useQuery } from "convex-svelte";
  import { api } from "$lib/service/convex";
  import { authService } from "$lib/service/auth";
  import * as ToggleGroup from "$lib/components/ui/toggle-group";

  const modes = {
    smart: "Smart",
    fast: "Fast",
    cheap: "Cheap",
  };

  const convex = useConvexClient();

  let {
    onsubmit,
  }: {
    onsubmit: (submition: { mode: string; text: string }) => Promise<unknown>;
  } = $props();

  const user = useQuery(api.user.get, {});

  let text = $state("");
  let loading = $state(false);

  async function submit() {
    loading = true;
    try {
      await onsubmit({ mode: user.data?.mode, text });
      text = "";
    } finally {
      loading = false;
    }
  }

  async function saveMode(value: string) {
    await convex.mutation(api.user.update, { mode: value });
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }
</script>

<form onsubmit={submit} class="space-y-1">
  <Textarea
    bind:value={text}
    disabled={loading}
    {onkeydown}
    autofocus
    class="bg-transparent! min-h-0 resize-none border-none shadow-none ring-0!"
    placeholder="What's on your mind?"
  />
  <div class="px-1 flex justify-between">
    <ToggleGroup.Root
      value={user.data?.mode}
      onValueChange={saveMode}
      type="single"
      class="opacity-50 hover:opacity-100 transition"
    >
      {#each Object.entries(modes) as [value, label]}
        <ToggleGroup.Item {value}>{label}</ToggleGroup.Item>
      {/each}
    </ToggleGroup.Root>
    <Button type="submit" variant="ghost" disabled={!text}>
      <ArrowUp />
    </Button>
  </div>
</form>
