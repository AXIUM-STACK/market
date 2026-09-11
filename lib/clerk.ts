/**
 * AXIUMarket — Server-side Clerk helpers
 *
 * Provides utilities for getting the current authenticated user
 * and synchronizing their Clerk identity with our Prisma User model.
 *
 * NEVER import this in client components.
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import type { User } from "@/generated/prisma";

/**
 * Returns the current Clerk user ID or null if unauthenticated.
 * Use this for optional auth checks (e.g., checking favorites).
 */
export async function getCurrentClerkId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Returns the current Clerk user ID and redirects to /sign-in
 * if the user is not authenticated.
 * Use this in protected pages/actions.
 */
export async function requireClerkAuth(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  return userId;
}

/**
 * Helper to determine if a given Clerk user qualifies as Super Admin.
 */
function checkIsSuperAdmin(clerkUser: {
  id: string;
  publicMetadata?: Record<string, unknown>;
  emailAddresses?: { emailAddress: string }[];
}): boolean {
  const metaRole = (clerkUser.publicMetadata?.role as string | undefined)?.toLowerCase();
  if (metaRole === "super_admin" || metaRole === "admin") {
    return true;
  }

  // Check against SUPER_ADMIN_CLERK_IDS env
  const adminIds = process.env.SUPER_ADMIN_CLERK_IDS?.split(",").map((s) => s.trim()) || [];
  if (adminIds.includes(clerkUser.id)) {
    return true;
  }

  // Check against SUPER_ADMIN_EMAILS env
  const adminEmails = process.env.SUPER_ADMIN_EMAILS?.split(",").map((s) => s.trim().toLowerCase()) || [];
  const userEmails = clerkUser.emailAddresses?.map((e) => e.emailAddress.toLowerCase()) || [];
  if (userEmails.some((email) => adminEmails.includes(email))) {
    return true;
  }

  return false;
}

/**
 * Finds or creates a Prisma User record for the given Clerk user.
 * This is the canonical way to get a DB user in server actions.
 *
 * Call this pattern in every server action that needs the DB user:
 *   const dbUser = await getOrCreateDbUser();
 */
export async function getOrCreateDbUser(): Promise<User> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const isAdmin = checkIsSuperAdmin(clerkUser);

  // Try to find existing user
  const existingUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (existingUser) {
    // If user gained super admin privileges via Clerk or env, promote in DB
    if (isAdmin && existingUser.role !== "SUPER_ADMIN") {
      return prisma.user.update({
        where: { id: existingUser.id },
        data: { role: "SUPER_ADMIN" },
      });
    }
    return existingUser;
  }

  // Create new user record (first sign-in)
  const newUser = await prisma.user.create({
    data: {
      clerkId: clerkUser.id,
      role: isAdmin ? "SUPER_ADMIN" : "USER",
    },
  });

  return newUser;
}

/**
 * Returns the Prisma User for the current Clerk session, or null.
 * Does NOT redirect — use when auth is optional.
 */
export async function getCurrentDbUser(): Promise<User | null> {
  const clerkId = await getCurrentClerkId();
  if (!clerkId) return null;

  return prisma.user.findUnique({
    where: { clerkId },
  });
}

/**
 * Checks if the currently authenticated user is a Super Admin.
 */
export async function isCurrentSuperAdmin(): Promise<boolean> {
  const clerkUser = await currentUser();
  if (!clerkUser) return false;

  if (checkIsSuperAdmin(clerkUser)) return true;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    select: { role: true },
  });

  return dbUser?.role === "SUPER_ADMIN";
}

/**
 * Ensures the caller is an authenticated Super Admin.
 * Redirects to /dashboard if unauthenticated or unauthorized.
 */
export async function requireSuperAdmin(): Promise<{
  clerkUser: NonNullable<Awaited<ReturnType<typeof currentUser>>>;
  dbUser: User;
}> {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect("/sign-in");
  }

  const dbUser = await getOrCreateDbUser();

  const isSuper = checkIsSuperAdmin(clerkUser) || dbUser.role === "SUPER_ADMIN";
  if (!isSuper) {
    redirect("/dashboard");
  }

  return { clerkUser, dbUser };
}
