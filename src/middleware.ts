import { authMiddleware } from "@clerk/nextjs";
 
// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    "/",
    "/recipes",
    "/recipes/(.*)",  // Allow access to individual recipe pages
    "/api/recipes",   // Allow public access to recipe API
    "/api/recipes/(.*)",
    "/search",
    "/categories/(.*)",
    "/chefs",
    "/chefs/(.*)",
  ],
  // Routes that can always be accessed, and have
  // no authentication information
  ignoredRoutes: [
    "/api/webhook/clerk",
    "/api/webhook/stripe",
    "/_next/static/(.*)",
    "/favicon.ico",
  ],
});
 
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
