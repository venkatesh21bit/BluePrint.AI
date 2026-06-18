"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"

/**
 * AuthButtons renders the correct UI based on session state:
 * - Authenticated: Shows the user's name/avatar + a Sign Out button
 * - Loading: Disables buttons while session is being fetched
 * - Unauthenticated: Shows GitHub + Google sign-in buttons
 */
export function AuthButtons() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3">
        <div className="h-8 w-20 bg-neutral-800 animate-pulse rounded" />
        <div className="h-8 w-24 bg-neutral-800 animate-pulse rounded" />
      </div>
    )
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name ?? "User avatar"}
            className="h-8 w-8 rounded-full border border-white/10"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
            {session.user.name?.charAt(0) ?? "?"}
          </div>
        )}
        <span className="text-sm text-neutral-300 hidden sm:inline">
          {session.user.name}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut()}
          className="text-xs border-white/10 text-neutral-400 hover:text-white"
        >
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => signIn("github")}
        className="text-xs border-white/10 text-neutral-400 hover:text-white"
      >
        GitHub
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => signIn("google")}
        className="text-xs border-white/10 text-neutral-400 hover:text-white"
      >
        Google
      </Button>
    </div>
  )
}
