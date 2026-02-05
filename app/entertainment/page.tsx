import Link from "next/link";
import { Smile } from "lucide-react";

export default function EntertainmentPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-center">
      <Smile className="mx-auto h-16 w-16 text-accent" />
      <h1 className="mt-6 text-3xl font-bold text-primary">Entertainment</h1>
      <p className="mt-2 text-slate-600">
        Pet tips, fun facts, and community. (Content managed from Admin CMS.)
      </p>
      <Link href="/shop" className="mt-8 inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90">
        Shop Now
      </Link>
    </div>
  );
}
