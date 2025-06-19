import { useClerkContext } from 'svelte-clerk/client';
import { useConvexClient, useQuery } from 'convex-svelte';

const clerk = useClerkContext();
const convex = useConvexClient();
convex.setAuth(async () => await clerk.session?.getToken({ template: 'convex' }));

export const convexQuery = useQuery;