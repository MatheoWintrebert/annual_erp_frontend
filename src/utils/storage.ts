export const storage = {
  getItem(key: string, defaultValue?: string): string | undefined {
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

function serialize(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    throw new Error(`Failed to serialize the value`);
  }
}

function deserialize(value: string): string {
  try {
    return JSON.parse(value) as unknown as string;
  } catch {
    return value;
  }
}
