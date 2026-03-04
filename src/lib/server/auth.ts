import { ADMIN_DOMAIN, REGISTRATIONS_OPEN } from '$lib/constants';

const SUPER_ADMIN_USERNAMES = new Set(['george', 'david', 'webmaster']);
const ROUTES_ALLOWED_WITHOUT_USER = new Set(['/signup', '/verify-email', '/login']);

export function getUserEmailParts(email: string | undefined) {
	if (!email || !email.includes('@')) {
		return { userName: '', userDomain: '' };
	}

	const [userName, userDomain] = email.split('@');
	return { userName, userDomain };
}

export function getAuthFlags(email: string | undefined) {
	const { userName, userDomain } = getUserEmailParts(email);
	const isAdmin = userDomain === ADMIN_DOMAIN;
	const isSuperAdmin = isAdmin && SUPER_ADMIN_USERNAMES.has(userName);

	return { isAdmin, isSuperAdmin };
}

export function canAccessWithoutUser(pathname: string) {
	return ROUTES_ALLOWED_WITHOUT_USER.has(pathname);
}

export function isLoginRoute(pathname: string) {
	return pathname === '/login';
}

export function isAdminRoute(pathname: string) {
	return pathname.startsWith('/admin');
}

export function isRegisterRoute(pathname: string) {
	return pathname.startsWith('/register');
}

export function shouldBlockRegisterRoute(isAdmin: boolean | undefined) {
	return !isAdmin && !REGISTRATIONS_OPEN;
}
