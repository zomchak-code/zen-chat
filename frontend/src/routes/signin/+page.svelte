<script>
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { authService } from "$lib/service/auth";
  import { Loader2 } from "@lucide/svelte";
  import { mode } from "mode-watcher";

  async function init() {
    if (browser) {
      const user = await authService.getUser();
      if (user) {
        return goto("/");
      } else {
        authService.signIn(mode.current);
      }
    }
  }
  $effect(() => {
    init();
  });
</script>

<div class="h-screen w-full flex justify-center items-center">
  <div id="sign-in"></div>
</div>
