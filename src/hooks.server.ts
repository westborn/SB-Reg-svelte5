import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import {
	canAccessWithoutUser,
	getAuthFlags,
	isAdminRoute,
	isLoginRoute,
	isRegisterRoute,
	shouldBlockRegisterRoute
} from '$lib/server/auth';

// https://khromov.se/the-comprehensive-guide-to-locals-in-sveltekit/
// https://joyofcode.xyz/sveltekit-hooks#creating-routes

const auth: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll() {
				return event.cookies.getAll();
			},
			setAll(cookiesToSet) {
				/**
				 * Note: You have to add the `path` variable to the
				 * set and remove method due to sveltekit's cookie API
				 * requiring this to be set, setting the path to an empty string
				 * will replicate previous/standard behavior (https://kit.svelte.dev/docs/types#public-types-cookies)
				 */
				cookiesToSet.forEach(({ name, value, options }) => event.cookies.set(name, value, { ...options, path: '/' }));
			}
		}
	});

	/**
	 * Unlike `supabase.auth.getSession()`, which returns the session _without_
	 * validating the JWT, this function also calls `getUser()` to validate the
	 * JWT before returning the session.
	 */
	event.locals.V1safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) {
			return { session: null, user: null };
		}
		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error) {
			// JWT validation has failed
			return { session: null, user: null };
		}
		user.isSuperAdmin = false;
		user.isAdmin = false;
		user.proxyEmail = user.email;

		const { isAdmin, isSuperAdmin } = getAuthFlags(user.email);
		if (isAdmin && session && user) {
			user.isAdmin = true;
			if (isSuperAdmin) {
				const proxyEmail = event.cookies.get('proxyEmail');
				user.proxyEmail = proxyEmail ? proxyEmail : user.email;
				user.isSuperAdmin = true;
			}
		}
		return { session, user };
	};
	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

const routeGuards: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.V1safeGetSession();
	if (isLoginRoute(event.url.pathname) && user) {
		throw redirect(303, '/');
	}

	if ((!session || !user) && !canAccessWithoutUser(event.url.pathname)) {
		throw redirect(303, '/login');
	}
	// only allow /admin if user is admin
	if (isAdminRoute(event.url.pathname) && !user.isAdmin) {
		throw redirect(303, '/');
	}
	// don't allow /register routes if registrations are closed - admin is exempt
	if (isRegisterRoute(event.url.pathname) && shouldBlockRegisterRoute(user.isAdmin)) {
		throw redirect(303, '/view');
	}

	return resolve(event);
};

export const handle = sequence(auth, routeGuards);
