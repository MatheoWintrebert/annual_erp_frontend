export const storage = {
	getItem(key: string, defaultValue?: string) {
		try {
			const storageValue = localStorage.getItem(key);

			return storageValue !== null ? deserialize(storageValue) : defaultValue;
		} catch (e) {
			if (defaultValue) return defaultValue;
			console.error(e);
		}
	},

	setItem(key: string, value: string) {
		try {
			localStorage.setItem(key, serialize(value));
		} catch (e) {
			console.error(e);
		}
	},

	removeItem(key: string) {
		try {
			localStorage.removeItem(key);
		} catch (e) {
			console.error(e);
		}
	},
};

function serialize<T>(value: T) {
	try {
		return JSON.stringify(value);
	} catch (error) {
		throw new Error(`Failed to serialize the value`);
	}
}

function deserialize(value: string) {
	try {
		return JSON.parse(value);
	} catch {
		return value;
	}
}
