<script lang="ts">
  import { authService } from "$lib/service/auth";

  $effect(() => {
    authService.mountButton();
  });
</script>

<div id="profile"></div>
