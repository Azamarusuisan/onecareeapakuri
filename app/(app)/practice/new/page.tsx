import { requireProfile } from "@/lib/utils/auth";
import { PracticeWizardClient } from "./practice-wizard-client";

export default async function NewPracticePage() {
  await requireProfile();

  return <PracticeWizardClient />;
}
