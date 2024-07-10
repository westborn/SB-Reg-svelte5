function stateObj() {
	let value = $state({});

	return {
		get value() {
			return value;
		},
		set value(v) {
			value = v;
		}
	};
}

export const currentStep = stateObj(0);
