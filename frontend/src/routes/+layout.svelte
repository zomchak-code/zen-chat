<script lang="ts">
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { authService } from "$lib/service/auth";
	import "../app.css";
	import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
	import { ModeWatcher } from "mode-watcher";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import AppSidebar from "$lib/components/app-sidebar.svelte";
	import { ENV } from "$lib/util/env";
	import { setupConvex, useConvexClient } from "convex-svelte";
	import { setOnStreaming } from "$lib/service/chat.state.svelte";
	import { SquareChevronRight } from "@lucide/svelte";

	setupConvex(ENV.VITE_CONVEX_URL);
	const client = useConvexClient();
	client.setAuth(authService.getToken);

	const queryClient = new QueryClient();

	let { children } = $props();

	let loading = $state(true);
	let open = $state(true);

	const guest = $derived(page.route.id?.startsWith("/signin"));

	function init() {
		if (browser) {
			if (!guest) {
				const user = authService.getUser();
				if (!user) {
					goto("/signin");
				}
			}
			loading = false;
		}
	}
	init();

	setOnStreaming();
</script>

<ModeWatcher />
<QueryClientProvider client={queryClient}>
	{#if loading}
		Loading...
	{:else if guest}
		{@render children?.()}
	{:else}
		<Sidebar.Provider bind:open class="flex">
			<AppSidebar />
			<main class="grow">
				{#if !open}
					<Sidebar.Trigger class="fixed top-4 left-3 z-10">
						<SquareChevronRight />
					</Sidebar.Trigger>
				{/if}
				{#key page.url}
					{@render children?.()}
				{/key}
			</main>
		</Sidebar.Provider>
	{/if}
</QueryClientProvider>
