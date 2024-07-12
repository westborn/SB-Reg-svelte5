let step = $state(0);

export function getStep() {
	return {
		get step() {
			return step;
		},
		set step(init) {
			step = init;
		}
	};
}
