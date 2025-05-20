'use client';

import { signIn } from "next-auth/react";

export function AuthButtons() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <button
        type="button"
        onClick={() => signIn("github")}
        className="btn btn-primary flex items-center justify-center gap-2"
      >
        {/* ...GitHub SVG... */}
        Sign in with GitHub
      </button>
      <button
        type="button"
        onClick={() => signIn("discord")}
        className="btn btn-secondary text-center"
      >
        Sign in with Discord
      </button>
    </div>
  );
}