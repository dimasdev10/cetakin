import { LandingNavbar } from "@/components/navbar/landing-nav";
import { getCurrentUser } from "@/actions/current-user";
import { ProfileForm } from "@/components/form/profile-form";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <>
      <LandingNavbar />
      <main className="px-4 md:px-14">
        <div className="border-r border-l border-dashed px-4 pt-24 min-h-screen pb-10">
          <ProfileForm
            initialData={{
              name: user?.name ?? "",
              email: user?.email ?? "",
              phone: user?.phone ?? null,
              address: user?.address ?? null,
              image: user?.image ?? null,
            }}
          />
        </div>
      </main>
    </>
  );
}
