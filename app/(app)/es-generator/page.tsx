export const dynamic = "force-dynamic";

import { requireProfile } from "@/lib/utils/auth";
import { Header } from "@/components/nav/header";
import { GeneratorClient } from "./generator-client";

export default async function EsGeneratorPage() {
  await requireProfile();
  // In demo mode — provide empty experiences. When Supabase is connected, this will fetch from DB
  const experiences = [] as never[];

  return (
    <>
      <Header title="ES自動生成" />
      <GeneratorClient experiences={experiences} />
    </>
  );
}
