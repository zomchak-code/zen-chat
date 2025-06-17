<script lang="ts">
  import { goto } from "$app/navigation";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { clerk } from "$lib/service/auth";
  import Button from "./ui/button/button.svelte";
  import { useConvexClient, useQuery } from "convex-svelte";
  import { api } from "$lib/service/convex";
  import { Plus, SquareChevronLeft, Trash } from "@lucide/svelte";
  import { page } from "$app/state";
  import berlin from "$lib/assets/berlin.svg";
  import { mode } from "mode-watcher";
  import Progress from "./ui/progress/progress.svelte";
  import { authService } from "$lib/service/auth";

  const convex = useConvexClient();
  const chats = useQuery(api.chat.get, {});
  const user = useQuery(api.user.get, {});

  async function remove(chat: { _id: string; name: string }) {
    if (confirm(`Are you sure you want to delete ${chat.name}?`)) {
      await convex.mutation(api.chat.remove, { id: chat._id });
      if (page.params.id === chat._id) {
        await goto("/");
      }
    }
  }

  $effect(authService.mountButton);
</script>

<Sidebar.Root
  variant="floating"
  class="opacity-30 hover:opacity-100 transition"
>
  <Sidebar.Header class="pl-4 flex-row justify-between items-center text-sm">
    Zen Chat
    <Sidebar.Trigger>
      <SquareChevronLeft />
    </Sidebar.Trigger>
  </Sidebar.Header>
  <Sidebar.Content class="p-2">
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton isActive={page.route.id === "/"}>
          {#snippet child({ props })}
            <a href={`/`} {...props}>
              <Plus />
              <span>New chat</span>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
      {#each chats.data ?? [] as chat}
        <Sidebar.MenuItem class="group/item flex gap-1">
          <Sidebar.MenuButton isActive={page.params.id === chat._id}>
            {#snippet child({ props })}
              <a href={`/chat/${chat._id}`} {...props}>
                <!-- <item.icon /> -->
                <span>{chat.name}</span>
              </a>
            {/snippet}
          </Sidebar.MenuButton>
          <Button
            onclick={() => remove(chat)}
            variant="ghost"
            class="hidden group-hover/item:block h-auto p-2!"
          >
            <Trash />
          </Button>
        </Sidebar.MenuItem>
      {/each}
    </Sidebar.Menu>
  </Sidebar.Content>

  <Sidebar.Footer class="space-y-2">
    <div class="flex gap-2">
      <div id="profile"></div>
      <div class="grow flex flex-col justify-between">
        <div class="flex justify-between text-xs">
          <span>Credits used</span>
          <span>
            {Math.round(user.data?.creditsUsed)} / {user.data?.creditsAvailable}
          </span>
        </div>
        <Progress value={user.data?.creditsUsed} />
      </div>
    </div>
    <!-- <div class="text-xs opacity-30 hover:opacity-100">
      Made with {mode.current === "light" ? "🖤" : "🤍"} in Berlin
      <img src={berlin} alt="Berlin" class="inline h-5" /> by Mykola 🇺🇦
    </div> -->
  </Sidebar.Footer>
</Sidebar.Root>
