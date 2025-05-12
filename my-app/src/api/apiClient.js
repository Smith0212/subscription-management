import crypto from "crypto"

export function encrypt(request_data) {
  if (!request_data) return ""
  console.log("Encrypting data:", typeof request_data, request_data)

  const iv = Buffer.from("5ng5nhy9mlo64r6k")
  const hash_key = crypto.createHash("sha256").update("xza548sa3vcr641b5ng5nhy9mlo64r6k").digest()

  try {
    const data = typeof request_data === "object" ? JSON.stringify(request_data) : request_data
    const cipher = crypto.createCipheriv("aes-256-cbc", hash_key, iv)
    let encrypted = cipher.update(data, "utf-8", "hex")
    encrypted += cipher.final("hex")
    console.log("Encrypted data:", encrypted)
    return encrypted
  } catch (error) {
    console.error("Encryption Error:", error)
    return ""
  }
}

export function decrypt(requestedData) {
  try {
    console.log("Decrypting data:", typeof requestedData, requestedData)

    if (!requestedData) return {}

    // remove double quotes 
    if (typeof requestedData === "string" && requestedData.startsWith('"') && requestedData.endsWith('"')) {
      requestedData = requestedData.slice(1, -1)
    }

    const iv = Buffer.from("5ng5nhy9mlo64r6k")
    const hash_key = crypto.createHash("sha256").update("xza548sa3vcr641b5ng5nhy9mlo64r6k").digest()

    const decipher = crypto.createDecipheriv("aes-256-cbc", hash_key, iv)
    let decrypted = decipher.update(requestedData, "hex", "utf-8")
    decrypted += decipher.final("utf-8")
    console.log("Decrypted data:", decrypted)

    return isJson(decrypted) ? JSON.parse(decrypted) : decrypted
  } catch (error) {
    console.error("Decryption Error:", error)
    return {}
  }
}

function isJson(request_data) {
  try {
    JSON.parse(request_data)
    return true
  } catch (error) {
    return false
  }
}
