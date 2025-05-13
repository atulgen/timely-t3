import { auth } from "@/server/auth";
import TimelyApp from "./_component/TimelyApp";

export default async function TimelyPage() {
  const session = await auth();

  return (
    <TimelyApp
      developer={{
        name: session?.user.name ?? null,
        email: session?.user.email ?? null,
      }}
    />
  );
}
