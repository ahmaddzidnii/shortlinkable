import { Buffer } from "node:buffer";

const CHARSET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BASE = 62n;

// Map untuk lookup cepat saat decoding
const CHAR_MAP = new Map<string, bigint>();
for (let i = 0; i < CHARSET.length; i++) {
    CHAR_MAP.set(CHARSET[i], BigInt(i));
}

/**
 * Mengonversi Buffer (Bytes) menjadi Base62 string.
 */
export function encodeBytesToBase62(bytes: Uint8Array | Buffer): string {
    if (bytes.length === 0) return "";

    // 1. Hitung leading zeros (agar byte bernilai 0x00 tidak hilang)
    let leadingZeros = 0;
    while (leadingZeros < bytes.length && bytes[leadingZeros] === 0) {
        leadingZeros++;
    }

    // 2. Ubah bytes menjadi BigInt
    let num = 0n;
    for (let i = 0; i < bytes.length; i++) {
        num = (num << 8n) | BigInt(bytes[i]);
    }

    // 3. Konversi BigInt ke Base62
    let result = "";
    while (num > 0n) {
        const remainder = num % BASE;
        result = CHARSET[Number(remainder)] + result;
        num = num / BASE;
    }

    // 4. Tambahkan karakter '0' untuk setiap leading zero byte
    const prefix = CHARSET[0].repeat(leadingZeros);

    return prefix + result || CHARSET[0];
}

/**
 * Mengonversi string Base62 kembali menjadi Buffer (Bytes).
 * Melempar Error jika ada karakter ilegal di luar CHARSET.
 */
export function decodeBase62ToBytes(
    str: string,
    targetByteLength?: number
): Uint8Array<ArrayBuffer> {
    if (!str) {
        throw new Error("Input string Base62 tidak boleh kosong.");
    }

    // 1. Hitung leading zeros pada string
    let leadingZeros = 0;
    while (leadingZeros < str.length && str[leadingZeros] === CHARSET[0]) {
        leadingZeros++;
    }

    // 2. Decode string ke BigInt
    let num = 0n;
    for (let i = 0; i < str.length; i++) {
        const val = CHAR_MAP.get(str[i]);
        if (val === undefined) {
            throw new Error(`Karakter Base62 tidak valid: "${str[i]}"`);
        }
        num = num * BASE + val;
    }

    // 3. Konversi BigInt kembali ke byte array
    const byteList: number[] = [];
    while (num > 0n) {
        byteList.unshift(Number(num & 0xffn));
        num = num >> 8n;
    }

    const totalLeading = new Array(leadingZeros).fill(0);
    const resultBytes = [...totalLeading, ...byteList];
    const length = targetByteLength
        ? Math.max(targetByteLength, resultBytes.length)
        : resultBytes.length;

    // Alokasikan ArrayBuffer standar
    const arrayBuffer = new ArrayBuffer(length);
    const uint8 = new Uint8Array(arrayBuffer);

    const offset = length - resultBytes.length;
    uint8.set(resultBytes, offset);

    return uint8;
}