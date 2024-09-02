<script lang="ts">
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Select } from 'bits-ui';
	import { Field, Control, Label, FieldErrors } from 'formsnap';
	import { z } from 'zod';

	const languages = {
		en: 'English',
		es: 'Spanish',
		fr: 'French',
		de: 'German',
		it: 'Italian',
		pt: 'Portuguese',
		ru: 'Russian',
		zh: 'Chinese',
		ja: 'Japanese',
		ko: 'Korean'
	};

	type Language = keyof typeof languages;

	const langSchema = z.object({
		language: z.enum(Object.keys(languages) as [Language, ...Language[]]).default('en')
	});
	type LangForm = SuperValidated<Infer<typeof langSchema>>;
	type Artists = {
		firstName: string;
		lastName: string;
		phone: string;
		id: number;
		email: string;
	}[];

	let { data } = $props();
	const { langForm, artists }: { langForm: LangForm; artists: Artists } = data;
	console.log(langForm);
	console.log(artists);

	const form = superForm(langForm, {
		validators: zodClient(langSchema),
		onResult({ result, cancel }: { result: any; cancel: () => void }) {
			if (result.type != 'success') {
				console.error('Failed to Update the Registration');
				cancel();
				return;
			}
			console.log(' Registration Updated');
			return;
		}
	});

	const { form: formData, enhance } = form;

	const selectedLanguage = $derived({
		label: languages[$formData.language],
		value: $formData.language
	});
</script>

<form method="POST" use:enhance>
	<Field {form} name="language">
		<Control let:attrs>
			<Label>Language</Label>
			<Select.Root
				selected={selectedLanguage}
				onSelectedChange={(s) => {
					s && ($formData.language = s.value);
				}}
			>
				<Select.Input name={attrs.name} />
				<Select.Trigger {...attrs}>
					<Select.Value placeholder="Select a language" />
				</Select.Trigger>
				<Select.Content>
					{#each Object.entries(languages) as [value, label]}
						<Select.Item {value} {label} />
					{/each}
				</Select.Content>
			</Select.Root>
		</Control>
		<FieldErrors />
	</Field>
	<button type="submit">Submit</button>
</form>
