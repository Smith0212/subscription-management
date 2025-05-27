// api/apiHandler.js
import { decrypt, encrypt } from "./apiClient"

export async function API(values, endpoint, method) {

  const url = `https://subscription-management-pw3f.onrender.com${endpoint}`
  console.log("API Request", url)

  const myHeaders = new Headers({
    "Content-Type": "text/plain",
    "accept": "application/json",
    "Accept-Language": "en",
  })

  const token = localStorage.getItem("user_token") || localStorage.getItem("admin_token")
  console.log("token header:", token)

  if (!url.includes("/login") && !url.includes("/signup")) {
    if (token) {
      myHeaders.append("token", `${token}`)
    }
  }

  let raw = ""

  if (values !== undefined && values !== null && values !== "") {
    raw = encrypt(values)
  }
  console.log("body:", raw)


  let requestOptions
  if (method === "GET") {
    requestOptions = {
      method: method,
      credentials: 'include',
      headers: myHeaders,
      redirect: "follow",
    }
  } else if (method === "POST") {
    requestOptions = {
      method: method,
      credentials: 'include',
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    }
  }

  try {
    const res = await fetch(url, requestOptions)
    console.log("Response status111111111:", res)

    if (!res.ok) {
      console.error(`HTTP error Status: ${res.status}`)
      return { error: `HTTP error Status: ${res.status}`, code: res.status }
    }

    const responseText = await res.text()

    if (responseText?.trim() !== "") {
      try {
        const result = decrypt(responseText)
        console.log("Decrypted result:", result)

        if (result?.error) {
          console.error("Decryption error:", result.error)
          return { error: result.error, code: 0 }
        }
        return result
      } catch (error) {
        console.error("Decryption error:", error)
        return { error: error.message, code: 0 }
      }
    } else {
      console.log("Empty response received")
      return {}
    }
  } catch (error) {
    console.error("API Request Error:", error)
    return { error: error.message, code: 0 }
  }
}

export const isUserLogIn = () => {
  return !!localStorage.getItem("user_token") || !!localStorage.getItem("admin_token")
}

export const isAdmin = () => {
  return !!localStorage.getItem("admin_token")
}

