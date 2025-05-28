import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

export async function middleware(request) {
  const { pathname } = request.nextUrl;


  const userToken = request.cookies.get("token")?.value || "";
  let role = null;

  if (userToken) {
    try {
      const decodedToken = jwtDecode(userToken);
      console.log("Decoded Token from middleware:", decodedToken);
      role = decodedToken.role;
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }

  

  console.log("Role from middlewareeeeeeee:", role);

  const userProtectedRoutes = ["/subscriptions", "/orders"];
  const adminProtectedRoutes = ["/admin"];
  const authRoutes = ["/login", "/signup", "/verifyOTP"];

  if (userProtectedRoutes.some((route) => pathname.startsWith(route)) && role === "admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (adminProtectedRoutes.some((route) => pathname.startsWith(route)) && role === "user") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // if (
  //   userProtectedRoutes.some((route) => pathname.startsWith(route)) &&
  //   role !== "user" &&
  //   role !== "admin"
  // ) {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }

  if (authRoutes.some((route) => pathname.startsWith(route)) && role) {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else if (role === "user") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
