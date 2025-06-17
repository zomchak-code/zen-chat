<script lang="ts">
	import "../app.css";
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { authService } from "$lib/service/auth";
	import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
	import { ModeWatcher } from "mode-watcher";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import AppSidebar from "$lib/components/AppSidebar.svelte";
	import { ENV } from "$lib/util/env";
	import { setupConvex, useConvexClient } from "convex-svelte";
	import { setOnStreaming } from "$lib/service/message.state.svelte";
	import { SquareChevronRight } from "@lucide/svelte";
	import { anal } from "$lib/service/anal";
	import { IsMobile } from "$lib/hooks/is-mobile.svelte";

	setupConvex(ENV.VITE_CONVEX_URL);
	const client = useConvexClient();
	client.setAuth(authService.getToken);
	anal.init();

	const isMobile = new IsMobile();

	const queryClient = new QueryClient();

	let { children } = $props();

	let loading = $state(true);
	let open = $state(true);

	const guest = $derived(page.route.id?.startsWith("/signin"));

	async function init() {
		if (browser) {
			if (!guest) {
				const user = await authService.getUser();
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
	{#if guest}
		{@render children?.()}
	{:else}
		<Sidebar.Provider bind:open class="flex">
			<AppSidebar />
			<main class="grow">
				{#if isMobile.current || !open}
					<Sidebar.Trigger class="fixed top-4 left-3 z-10 glass">
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
