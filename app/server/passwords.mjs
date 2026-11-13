import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const keyLength = 64;

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, keyLength);
  return `${salt.toString("hex")}:${Buffer.from(key).toString("hex")}`;
}

export async function verifyPassword(password, storedHash) {
  const [saltHex, keyHex] = storedHash.split(":");
  if (!saltHex || !keyHex) return false;

  const expectedKey = Buffer.from(keyHex, "hex");
  const actualKey = Buffer.from(await scrypt(password, Buffer.from(saltHex, "hex"), expectedKey.length));
  return actualKey.length === expectedKey.length && timingSafeEqual(actualKey, expectedKey);
}