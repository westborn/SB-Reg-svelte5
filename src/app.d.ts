// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	let Square: {
		payments: (appId: string, locationId: string) => { card: (options: CardOptions) => Promise<Card> };
	};
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface Locals {
			supabase: SupabaseClient;
			V1safeGetSession(): Promise<{ session: Session | null; user: User | null }>;
		}
		interface PageData {
			session: Session | null;
			user: User | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}
export {};
