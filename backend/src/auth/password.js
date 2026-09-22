import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
function derive(password, salt) {
  return new Promise((resolve, reject) =>
    scrypt(
      password,
      salt,
      64,
      { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 },
      (error, key) => (error ? reject(error) : resolve(key)),
    ),
  );
}
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt-v1$${salt}$${(await derive(password, salt)).toString("hex")}`;
}
async function verifyPassword(password, hash) {
  const [version, salt, digest] = hash.split("$");
  if (
    version !== "scrypt-v1" ||
    !/^[a-f0-9]{32}$/.test(salt ?? "") ||
    !/^[a-f0-9]{128}$/.test(digest ?? "")
  )
    return false;
  return timingSafeEqual(
    await derive(password, salt),
    Buffer.from(digest, "hex"),
  );
}
const dummyHash = "scrypt-v1$" + "0".repeat(32) + "$" + "0".repeat(128);
export { dummyHash, hashPassword, verifyPassword };
