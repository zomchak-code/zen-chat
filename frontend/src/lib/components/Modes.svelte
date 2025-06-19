<script lang="ts">
  import { useQuery } from "convex-svelte";
  import { api } from "$lib/service/convex";
  import Button from "./ui/button/button.svelte";
  import * as Select from "$lib/components/ui/select";
  import type { Snippet } from "svelte";

  let {
    children,
    value,
    onOpenChange,
    onclick,
  }: {
    children?: Snippet;
    value?: string;
    open?: boolean;
    onOpenChange?: (open: boolean, mode: string) => void;
    onclick: (update: { mode: string; model?: string }) => void;
  } = $props();

  const modes = {
    smart: {
      label: "Smart",
      models: {
        "google/gemini-2.5-pro": "Gemini 2.5 Pro",
        "anthropic/claude-opus-4": "Claude 4 Opus",
        "o3-pro": "o3-pro",
      },
    },
    fast: {
      label: "Fast",
      models: {
        "gemini-2.5-flash": "Gemini 2.5 Flash",
        "x-ai/grok-3-mini-beta": "Grok 3 mini",
        "openai/o4-mini": "o4-mini",
      },
    },
    cheap: {
      label: "Cheap",
      models: {
        "meta-llama/llama-4-scout": "Llama 4 Scout",
        "x-ai/grok-3-mini-beta": "Grok 3 mini",
        "deepseek/deepseek-chat-v3-0324": "Deepseek V3",
      },
    },
  };

  const user = useQuery(api.user.get, {});
</script>

{#each Object.entries(modes) as [modeKey, mode]}
  <div class={["flex"]}>
    <Button
      onclick={() => onclick({ mode: modeKey })}
      variant={modeKey === value ? "secondary" : "ghost"}
      class="pr-0!"
    >
      {@render children?.()}
      {mode.label}
      <Select.Root
        value={user.data?.modes[modeKey]}
        onValueChange={(model) => onclick({ mode: modeKey, model })}
        onOpenChange={(open) => onOpenChange?.(open, modeKey)}
        type="single"
      >
        <Select.Trigger
          onclick={(e) => e.stopPropagation()}
          class="cursor-pointer border-none shadow-none bg-transparent! hover:bg-input! transition-all rounded-l-none p-2"
        />
        <Select.Content class="border-none shadow-none glass bg-transparent">
          {#each Object.entries(mode.models) as [key, model]}
            <Select.Item value={key}>{model}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </Button>
  </div>
{/each}
