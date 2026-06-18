import { auth } from "@/auth"

export default auth((req) => {
  // Allow access to auth-related pages and the home/landing page
  if (!req.auth) {
    const signinUrl = new URL("/auth/signin", req.url)
    return Response.redirect(signinUrl)
  }
})

// Protect all dashboard, workspace, and non-auth API routes
export const config = {
  matcher: ["/dashboard/:path*", "/workspace/:path*", "/api/concepts/:path*"],
}
