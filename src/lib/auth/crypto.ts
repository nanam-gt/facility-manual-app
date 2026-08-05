const PASSWORD_ALGORITHM = "pbkdf2_sha256";
const PASSWORD_ITERATIONS = 210_000;

export function generateId(prefix: string): string {
	return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;
}

export function generateToken(): string {
	return base64UrlEncode(crypto.getRandomValues(new Uint8Array(32)));
}

export async function hashSessionToken(token: string, secret: string): Promise<string> {
	return sha256Hex(`${secret}:${token}`);
}

export async function hashPassword(password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const key = await derivePasswordKey(password, salt, PASSWORD_ITERATIONS);
	const hash = new Uint8Array(await crypto.subtle.exportKey("raw", key));

	return [PASSWORD_ALGORITHM, PASSWORD_ITERATIONS.toString(), base64UrlEncode(salt), base64UrlEncode(hash)].join("$");
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
	const [algorithm, iterationsRaw, saltRaw, hashRaw] = storedHash.split("$");

	if (algorithm !== PASSWORD_ALGORITHM || !iterationsRaw || !saltRaw || !hashRaw) {
		return false;
	}

	const iterations = Number(iterationsRaw);
	if (!Number.isInteger(iterations) || iterations < 100_000) {
		return false;
	}

	const salt = base64UrlDecode(saltRaw);
	const expected = base64UrlDecode(hashRaw);
	const key = await derivePasswordKey(password, salt, iterations);
	const actual = new Uint8Array(await crypto.subtle.exportKey("raw", key));

	return timingSafeEqual(actual, expected);
}

async function derivePasswordKey(password: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
	const importedKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
		"deriveKey",
	]);
	const saltBuffer = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer;

	return crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			hash: "SHA-256",
			salt: saltBuffer,
			iterations,
		},
		importedKey,
		{
			name: "HMAC",
			hash: "SHA-256",
			length: 256,
		},
		true,
		["sign"],
	);
}

async function sha256Hex(input: string): Promise<string> {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
	return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length) {
		return false;
	}

	let diff = 0;
	for (let index = 0; index < a.length; index += 1) {
		diff |= a[index] ^ b[index];
	}

	return diff === 0;
}

function base64UrlEncode(bytes: Uint8Array): string {
	const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
	return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlDecode(value: string): Uint8Array {
	const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
	const binary = atob(padded);
	return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
