import { UserProfile } from "@clerk/nextjs";

export default function UserProfilePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <UserProfile path="/user-profile" routing="path" />
    </div>
  );
}

