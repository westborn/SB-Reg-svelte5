import { SquareClient, SquareEnvironment } from 'square';

export function resolveSquareEnvironment(environment?: string) {
	return environment?.toLowerCase() === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox;
}

export function createSquareClient(token: string, environment?: string) {
	return new SquareClient({
		token,
		environment: resolveSquareEnvironment(environment)
	});
}
