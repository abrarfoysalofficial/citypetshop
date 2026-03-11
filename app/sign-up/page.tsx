import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <SignUp
        path="/sign-up"
        routing="path"
        fallbackRedirectUrl="/account"
        forceRedirectUrl="/account"
      />
    </div>
  );
}

