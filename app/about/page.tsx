import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <Image src="/brand/logo-dark.png" alt="City Plus Pet Shop" width={120} height={120} className="h-24 w-24 shrink-0 object-contain sm:h-28 sm:w-28" />
        <div>
          <h1 className="text-3xl font-bold text-primary">About Us</h1>
          <p className="mt-2 text-secondary font-medium">City Plus Pet Shop (City Pet Shop bd)</p>
          <p className="mt-1 text-sm text-gray-500">Your pet, our passion.</p>
        </div>
      </div>

      <div className="mt-8 space-y-6 text-gray-600">
        <p>
          City Plus Pet Shop is a trusted name in pet care in Bangladesh. We offer a wide range of
          products for cats, dogs, birds, rabbits, and more—from premium food and litter to health
          supplements, toys, and accessories.
        </p>
        <p>
          Our mission is to make quality pet products accessible with fast delivery and reliable
          service. We are based in Mirpur 2, Borobag, Dhaka, and serve customers across the
          country.
        </p>
        <p>
          Thank you for choosing City Plus Pet Shop. We are committed to the well-being of your
          furry and feathered friends.
        </p>
      </div>

      <div className="mt-10 border-t border-gray-200 pt-8">
        <Link href="/contact" className="font-semibold text-secondary hover:underline">
          Contact Us →
        </Link>
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-600">
        <p className="font-medium text-slate-800">Website developed by Fresher IT</p>
        <p className="mt-1"><strong>Abrar Foysal</strong> — Founder &amp; CEO, Fresher IT</p>
        <p className="mt-2">
          <a href="mailto:abrar@fresheritbd.com" className="text-primary hover:underline">abrar@fresheritbd.com</a>
          {" · "}
          <a href="https://abrarfoysal.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">abrarfoysal.com</a>
          {" · "}
          <a href="https://wa.me/8801929524975" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">WhatsApp: 01929524975</a>
        </p>
      </div>
    </div>
  );
}
