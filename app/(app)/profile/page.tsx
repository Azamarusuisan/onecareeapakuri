import { requireProfile } from "@/lib/utils/auth";
import { Header } from "@/components/nav/header";
import { ProfileEditor } from "./profile-editor";

export default async function ProfilePage() {
  const profile = await requireProfile();

  return (
    <>
      <Header title="プロフィール" />
      <div className="px-4 py-4">
        <ProfileEditor profile={profile} />
      </div>
    </>
  );
}
