<script lang="ts">
  import Button from "./ui/button/button.svelte";
  import { Check, Copy } from "@lucide/svelte";

  let { value }: { value: string } = $props();

  let copied = $state(false);

  function onclick() {
    navigator.clipboard.writeText(value);
    copied = true;
    setTimeout(() => (copied = false), 1000);
  }
</script>

<Button {onclick} variant="ghost">
  {#if copied}
    <Check />
  {:else}
    <Copy />
  {/if}
</Button>
