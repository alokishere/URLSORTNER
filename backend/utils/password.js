const argon2 = require("argon2");
const { timingSafeEqual } = require("crypto");

const validPassword = (value) =>
  typeof value === "string" &&
  value.length >= 6 &&
  Buffer.byteLength(value, "utf8") <= 1024;
const hashPassword = (password) =>
  argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
const verifyPassword = async (user, password) => {
  if (!validPassword(password)) return false;
  if (user.passwordHash) {
    try {
      return await argon2.verify(user.passwordHash, password, {
        type: argon2.argon2id,
      });
    } catch {
      return false;
    }
  }
  // Legacy plaintext values are migrated only on successful authentication.
  // Recognized hash-looking legacy values require a reset instead of guessing their format.
  if (
    typeof user.password !== "string" ||
    /^\$(argon2|2[aby]\$)/.test(user.password)
  )
    return false;
  const actual = Buffer.from(user.password);
  const supplied = Buffer.from(password);
  return actual.length === supplied.length && timingSafeEqual(actual, supplied);
};
module.exports = { validPassword, hashPassword, verifyPassword };
