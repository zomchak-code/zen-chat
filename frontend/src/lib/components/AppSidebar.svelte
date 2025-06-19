<script lang="ts">
  import { goto } from "$app/navigation";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import Button from "./ui/button/button.svelte";
  import { useConvexClient, useQuery } from "convex-svelte";
  import { api, type Id } from "$lib/service/convex";
  import { Plus, SquareChevronLeft, Trash } from "@lucide/svelte";
  import { page } from "$app/state";
  import berlin from "$lib/assets/berlin.svg";
  import { mode } from "mode-watcher";
  import Progress from "./ui/progress/progress.svelte";
  import { ENV } from "$lib/util/env";
  import AuthButton from "./AuthButton.svelte";

  const convex = useConvexClient();
  const chats = useQuery(api.chat.get, {});
  const user = useQuery(api.user.get, {});

  async function remove(chat: { _id: Id<"chats">; name: string }) {
    if (confirm(`Are you sure you want to delete ${chat.name}?`)) {
      await convex.mutation(api.chat.remove, { id: chat._id });
      if (page.params.id === chat._id) {
        await goto("/");
      }
    }
  }

  function getGroupName(creationTime: number): string {
    const now = new Date();
    const chatDate = new Date(creationTime);

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfYesterday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1,
    );
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 7,
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    if (chatDate >= startOfToday) {
      return "Today";
    }
    if (chatDate >= startOfYesterday) {
      return "Yesterday";
    }
    if (chatDate >= startOfWeek) {
      return "Previous 7 Days";
    }
    if (chatDate >= startOfMonth) {
      // Returns the full name of the current month, e.g., "June"
      return now.toLocaleString("default", { month: "long" });
    }

    // For all older chats, group them by their year
    return chatDate.getFullYear().toString();
  }

  const groupedChats = $derived.by(() => {
    const groups: Record<string, { _id: Id<"chats">; name: string }[]> = {};

    for (const chat of chats.data ?? []) {
      const groupName = getGroupName(chat._creationTime);
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(chat);
    }
    return groups;
  });
</script>

<Sidebar.Root
  variant="floating"
  class="opacity-30 hover:opacity-100 transition z-20"
>
  <Sidebar.Header class="gap-4">
    <div class="pl-1.5 flex justify-between">
      <div class="flex gap-1.5 items-center">Zen Chat</div>
      <Sidebar.Trigger>
        <SquareChevronLeft />
      </Sidebar.Trigger>
    </div>
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
    </Sidebar.Menu>
  </Sidebar.Header>
  <Sidebar.Content>
    {#each Object.entries(groupedChats) as [groupName, chats]}
      <Sidebar.Group>
        <Sidebar.GroupLabel>{groupName}</Sidebar.GroupLabel>
        <Sidebar.Menu>
          {#each chats as chat}
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
      </Sidebar.Group>
    {/each}
  </Sidebar.Content>

  <Sidebar.Footer class="pr-5">
    {#if user.data && user.data.creditsUsed > 1}
      <div class="pl-2 py-2 space-y-2">
        <div class="flex justify-between text-xs">
          <span>Credits used</span>
          <span>
            {Math.round(user.data.creditsUsed)} / {user.data.creditsAvailable}
          </span>
        </div>
        <Progress value={user.data.creditsUsed} />
      </div>
    {/if}
    <div class="flex gap-2">
      <Button
        href={`https://${ENV.VITE_FEATUREBASE_ORGANIZATION}.featurebase.app`}
        target="_blank"
        variant="ghost"
        class="grow justify-start px-2"
      >
        <span>🙏</span> Feedback
      </Button>
      <AuthButton />
    </div>
    <!-- <div class="text-xs opacity-30 hover:opacity-100">
      Made for 🧘 in Berlin
      <img src={berlin} alt="Berlin" class="inline h-5" /> by Mykola 🇺🇦
    </div> -->
    <!-- <Feedback /> -->
  </Sidebar.Footer>
</Sidebar.Root>
