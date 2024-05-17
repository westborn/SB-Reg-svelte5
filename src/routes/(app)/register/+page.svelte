<script lang="ts">
	import { getRegisterState } from '$lib/state.svelte.js';

	let { data } = $props();
	let submission = data.submission;

	let state = getRegisterState();

	if (data.submission) {
		// state.registrationExists = true;
		console.log('got it');
	} else {
		// state.registrationExists = false;
		console.log('NOT got it');
	}

	const steps = ['Register', 'Entries', 'Confirm', 'Complete'];

	function setCurrent(newStep = 1) {
		let next = newStep;
		// if (newStep < 0) {
		//   next = 0
		// }
		// if (next > steps.length - 1) {
		//   next = steps.length - 1
		// }
		// if ($registrationExists?.email == null) {
		//   return 0
		// }
		// if (next > 1 && $entryStore.length == 0) {
		//   return 1
		// }
		// if (next > 1 && $registrationExists.bumpIn === '') {
		//   return 2
		// }
		// if ($registrationExists.complete === 'Y') {
		//   return 3
		// }
		return next;
	}

	// const handleProgress = (stepIncrement: number) => {
	// 	setCurrent = setCurrent(setCurrent + stepIncrement);
	// };
</script>

<h1>Register</h1>
<pre>{JSON.stringify(data, null, 2)} </pre>
