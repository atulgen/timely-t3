import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import { TimelyForm } from "./_component/TimelyForm";
import { ActivitiesList } from "./_component/ActivitiesList";

export default async function TimelyPage() {
  // Check authentication
  const session = await auth();

  // Redirect to signin if not authenticated
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center gap-12 px-4 py-16">
          <div className="flex w-full max-w-md items-center justify-between">
            <h1 className="text-4xl font-extrabold tracking-tight">Timely</h1>
            <Link
              href="/"
              className="rounded-full bg-white/10 px-4 py-2 font-semibold no-underline transition hover:bg-white/20"
            >
              Back to Home
            </Link>
          </div>

          <TimelyForm />

          {/* <ActivitiesList/> */}
        </div>
      </main>
    </HydrateClient>
  );
}
