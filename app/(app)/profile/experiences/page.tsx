export const dynamic = "force-dynamic";

import { requireProfile } from "@/lib/utils/auth";
import { Header } from "@/components/nav/header";
import { ExperiencesClient } from "./experiences-client";

export default async function ExperiencesPage() {
  await requireProfile();
  // In demo mode — return empty list. When Supabase is connected, fetch from DB
  const experiences = [] as never[];

  return (
    <>
      <Header title="経験談・ガクチカ管理" showBack />
      <ExperiencesClient initialExperiences={experiences} />
    </>
  );
}
