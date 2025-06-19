<script lang="ts">
  import { authService } from "$lib/service/auth";
  import { mode } from "mode-watcher";
  import * as Avatar from "$lib/components/ui/avatar";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { LogOut, Settings } from "@lucide/svelte";
  import { useSidebar } from "./ui/sidebar";

  const sidebar = useSidebar();
  let user = $state();

  async function init() {
    user = await authService.getUser();
  }

  function manageAccount() {
    if (sidebar.isMobile) sidebar.toggle();
    authService.openProfile(mode.current);
  }

  $effect(() => {
    init();
  });
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger class="cursor-pointer">
    <Avatar.Root>
      <Avatar.Image src={user?.imageUrl} alt={user?.fullName} />
    </Avatar.Root>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content class="bg-background/50 glass border-none">
    <DropdownMenu.Group>
      <DropdownMenu.Item onclick={manageAccount}>
        <Settings /> Manage account
      </DropdownMenu.Item>
      <DropdownMenu.Item onclick={authService.signOut}>
        <LogOut /> Sign out
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
