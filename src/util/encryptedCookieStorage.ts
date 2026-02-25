
const IS_SERVER = typeof window === "undefined";

export async function setEncrypted<T>(key: string, data: T): Promise<void> {
  if (IS_SERVER) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to store "${key}" in localStorage:`, e);
  }
}

export async function getEncrypted<T>(key: string): Promise<T | null> {
  if (IS_SERVER) return null;
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (e) {
    console.error(`Failed to read "${key}" from localStorage:`, e);
    return null;
  }
}

export async function removeEncrypted(key: string): Promise<void> {
  if (IS_SERVER) return;
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`Failed to remove "${key}" from localStorage:`, e);
  }
}
