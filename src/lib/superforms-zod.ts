import { config, safeParseAsync, toJSONSchema } from 'zod/v4/core';

import { createAdapter } from '../../node_modules/sveltekit-superforms/dist/adapters/adapters.js';

// Local Zod-only Superforms adapter used by the Vite alias in `vite.config.ts`.
// We implement it here instead of re-exporting Superforms' internal `zod4.js`
// because that file depends on an internal memoize helper that triggers a Vite
// dev-time ESM/CJS interop error with `memoize-weak`.

const defaultJSONSchemaOptions = {
	unrepresentable: 'any' as const,
	override: (ctx: any) => {
		const def = ctx.zodSchema._zod.def;

		if (def.type === 'date') {
			ctx.jsonSchema.type = 'integer';
			ctx.jsonSchema.format = 'unix-time';
		} else if (def.type === 'bigint') {
			ctx.jsonSchema.type = 'string';
			ctx.jsonSchema.format = 'bigint';
		} else if (def.type === 'pipe') {
			const pipeDef = def;
			const inSchema = pipeDef.in;
			const outSchema = pipeDef.out;

			if (inSchema?._zod?.def.type === 'string') {
				let currentSchema = outSchema;
				let isStringBool = false;

				while (currentSchema?._zod?.def) {
					const currentDef = currentSchema._zod.def;

					if (currentDef.type === 'boolean') {
						isStringBool = true;
						break;
					} else if (currentDef.type === 'transform') {
						break;
					} else if (currentDef.type === 'pipe') {
						currentSchema = currentDef.out;
					} else {
						break;
					}
				}

				if (!isStringBool && outSchema?._zod?.def.type === 'boolean') {
					isStringBool = true;
				}

				if (isStringBool) {
					ctx.jsonSchema.type = 'string';
					ctx.jsonSchema.format = 'stringbool';
				}
			}
		} else if (def.type === 'set') {
			ctx.jsonSchema.type = 'array';
			ctx.jsonSchema.uniqueItems = true;

			if ('default' in ctx.jsonSchema && ctx.jsonSchema.default instanceof Set) {
				ctx.jsonSchema.default = Array.from(ctx.jsonSchema.default);
			}
		} else if (def.type === 'map') {
			ctx.jsonSchema.type = 'array';
			ctx.jsonSchema.format = 'map';

			if ('default' in ctx.jsonSchema && ctx.jsonSchema.default instanceof Map) {
				ctx.jsonSchema.default = Array.from(ctx.jsonSchema.default);
			}
		} else if (def.type === 'default') {
			const innerDef = def.innerType._zod.def;

			if (innerDef.type === 'set' && def.defaultValue instanceof Set) {
				ctx.jsonSchema.type = 'array';
				ctx.jsonSchema.uniqueItems = true;
				ctx.jsonSchema.default = Array.from(def.defaultValue);
			} else if (innerDef.type === 'map' && def.defaultValue instanceof Map) {
				ctx.jsonSchema.type = 'array';
				ctx.jsonSchema.format = 'map';
				ctx.jsonSchema.default = Array.from(def.defaultValue);
			}
		}
	}
};

export const zodToJSONSchema = (schema: any, options?: Record<string, unknown>) => {
	return toJSONSchema(schema, { ...defaultJSONSchemaOptions, ...options });
};

async function validate(schema: any, data: unknown, error?: unknown) {
	if (error === undefined) {
		const zodConfig = config();
		error = zodConfig.customError ?? zodConfig.localeError;
	}

	const result = await safeParseAsync(schema, data, { error: error as never });

	if (result.success) {
		return {
			data: result.data,
			success: true as const
		};
	}

	return {
		issues: result.error.issues.map(({ message, path }) => ({ message, path })),
		success: false as const
	};
}

export function zod4(schema: any, options?: any) {
	return createAdapter({
		superFormValidationLibrary: 'zod4',
		validate: async (data: unknown) => validate(schema, data, options?.error),
		jsonSchema: options?.jsonSchema ?? zodToJSONSchema(schema, options?.config),
		defaults: options?.defaults
	});
}

export function zod4Client(schema: any, options?: any) {
	return {
		superFormValidationLibrary: 'zod4',
		validate: async (data: unknown) => validate(schema, data, options?.error)
	};
}
