# Testing Setup

This project uses [Vitest](https://vitest.dev/) for unit testing and [Testing Library](https://testing-library.com/) for component testing.

## Available Test Scripts

- `pnpm test` - Run tests in watch mode
- `pnpm test:run` - Run tests once
- `pnpm test:ui` - Run tests with UI interface
- `pnpm test:coverage` - Run tests with coverage report

## Test Structure

Tests are located alongside the source files they test:

```
src/
  lib/
    utils.ts
    utils.test.ts           # Tests for utils
    zod-schemas.ts
    zod-schemas.test.ts     # Tests for schemas
    components/
      theme-toggle.svelte
    theme-toggle.test.ts    # Tests for theme toggle
  tests/
    setup.ts               # Test setup and mocks
    example.test.ts        # Example component test
    MockPage.svelte        # Mock component for testing
```

## Testing Guidelines

### Component Testing

Components are tested using `@testing-library/svelte`:

```typescript
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent.svelte';

describe('MyComponent', () => {
	it('renders correctly', () => {
		render(MyComponent, { props: { title: 'Test' } });
		expect(screen.getByText('Test')).toBeInTheDocument();
	});

	it('handles user interaction', async () => {
		const user = userEvent.setup();
		render(MyComponent);

		await user.click(screen.getByRole('button'));
		// Assert expected behavior
	});
});
```

### Utility Function Testing

Utility functions are tested with standard Vitest assertions:

```typescript
import { describe, it, expect } from 'vitest';
import { myUtilFunction } from './utils';

describe('myUtilFunction', () => {
	it('returns expected result', () => {
		expect(myUtilFunction('input')).toBe('expected output');
	});
});
```

### Schema Testing

Zod schemas are tested by validating input/output:

```typescript
import { describe, it, expect } from 'vitest';
import { mySchema } from './schemas';

describe('mySchema', () => {
	it('validates correct data', () => {
		expect(() => mySchema.parse(validData)).not.toThrow();
	});

	it('rejects invalid data', () => {
		expect(() => mySchema.parse(invalidData)).toThrow();
	});
});
```

## Mocking

### SvelteKit Modules

Common SvelteKit modules are automatically mocked in `src/tests/setup.ts`:

- `$app/environment`
- `$app/navigation`
- `$app/stores`

### External Dependencies

Mock external dependencies using `vi.mock()`:

```typescript
import { vi } from 'vitest';

vi.mock('external-library', () => ({
	someFunction: vi.fn().mockReturnValue('mocked result')
}));
```

## Configuration

### Vitest Config (`vitest.config.ts`)

- Uses jsdom environment for DOM testing
- Includes setup file for global mocks
- Supports Svelte components via SvelteKit plugin

### Test Setup (`src/tests/setup.ts`)

- Extends Jest DOM matchers
- Mocks common browser APIs
- Sets up SvelteKit module mocks

## Best Practices

1. **Test behavior, not implementation** - Focus on what the user sees and does
2. **Use descriptive test names** - Make it clear what each test is verifying
3. **Group related tests** - Use `describe` blocks to organize tests logically
4. **Mock external dependencies** - Keep tests isolated and fast
5. **Test edge cases** - Include tests for error conditions and boundary values
6. **Keep tests simple** - One assertion per test when possible

## Running Tests

### Watch Mode (Development)

```bash
pnpm test
```

### Single Run (CI/CD)

```bash
pnpm test:run
```

### With UI

```bash
pnpm test:ui
```

### With Coverage

```bash
pnpm test:coverage
```

## Example Test Files

Check out these example test files to get started:

- `src/lib/utils.test.ts` - Utility function tests
- `src/lib/zod-schemas.test.ts` - Schema validation tests
- `src/lib/theme-toggle.test.ts` - Component interaction tests
- `src/tests/example.test.ts` - Basic component rendering tests
