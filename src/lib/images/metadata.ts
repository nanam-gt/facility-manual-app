export type ImageMetadata = {
	mimeType: "image/jpeg" | "image/png" | "image/webp";
	width: number;
	height: number;
};

const decoder = new TextDecoder("ascii");

export function detectImageMetadata(bytes: ArrayBuffer): ImageMetadata | null {
	const data = new Uint8Array(bytes);

	return detectPng(data) ?? detectJpeg(data) ?? detectWebp(data);
}

function detectPng(data: Uint8Array): ImageMetadata | null {
	const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
	if (data.length < 24 || !signature.every((byte, index) => data[index] === byte) || ascii(data, 12, 16) !== "IHDR") {
		return null;
	}

	const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
	const width = view.getUint32(16);
	const height = view.getUint32(20);

	return validSize(width, height) ? { mimeType: "image/png", width, height } : null;
}

function detectJpeg(data: Uint8Array): ImageMetadata | null {
	if (data.length < 4 || data[0] !== 0xff || data[1] !== 0xd8) {
		return null;
	}

	const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
	let position = 2;

	while (position + 9 < data.length) {
		while (data[position] === 0xff) {
			position += 1;
		}

		const marker = data[position];
		position += 1;

		if (marker === 0xd9 || marker === 0xda) {
			break;
		}

		if (position + 2 > data.length) {
			break;
		}

		const length = view.getUint16(position);
		if (length < 2 || position + length > data.length) {
			break;
		}

		if (isJpegStartOfFrame(marker)) {
			const height = view.getUint16(position + 3);
			const width = view.getUint16(position + 5);

			return validSize(width, height) ? { mimeType: "image/jpeg", width, height } : null;
		}

		position += length;
	}

	return null;
}

function detectWebp(data: Uint8Array): ImageMetadata | null {
	if (data.length < 30 || ascii(data, 0, 4) !== "RIFF" || ascii(data, 8, 12) !== "WEBP") {
		return null;
	}

	const chunkType = ascii(data, 12, 16);
	if (chunkType === "VP8X" && data.length >= 30) {
		const width = 1 + readUint24LittleEndian(data, 24);
		const height = 1 + readUint24LittleEndian(data, 27);

		return validSize(width, height) ? { mimeType: "image/webp", width, height } : null;
	}

	if (chunkType === "VP8L" && data.length >= 25 && data[20] === 0x2f) {
		const width = 1 + data[21] + ((data[22] & 0x3f) << 8);
		const height = 1 + ((data[22] & 0xc0) >> 6) + (data[23] << 2) + ((data[24] & 0x0f) << 10);

		return validSize(width, height) ? { mimeType: "image/webp", width, height } : null;
	}

	if (chunkType === "VP8 " && data.length >= 30 && data[23] === 0x9d && data[24] === 0x01 && data[25] === 0x2a) {
		const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
		const width = view.getUint16(26, true) & 0x3fff;
		const height = view.getUint16(28, true) & 0x3fff;

		return validSize(width, height) ? { mimeType: "image/webp", width, height } : null;
	}

	return null;
}

function isJpegStartOfFrame(marker: number): boolean {
	return (
		(marker >= 0xc0 && marker <= 0xc3) ||
		(marker >= 0xc5 && marker <= 0xc7) ||
		(marker >= 0xc9 && marker <= 0xcb) ||
		(marker >= 0xcd && marker <= 0xcf)
	);
}

function validSize(width: number, height: number): boolean {
	return width > 0 && height > 0 && width <= 12000 && height <= 12000;
}

function ascii(data: Uint8Array, start: number, end: number): string {
	return decoder.decode(data.subarray(start, end));
}

function readUint24LittleEndian(data: Uint8Array, start: number): number {
	return data[start] + (data[start + 1] << 8) + (data[start + 2] << 16);
}
