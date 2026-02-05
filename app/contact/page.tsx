import Image from "next/image";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-primary">Contact Us</h1>
      <p className="mt-1 text-lg font-medium text-secondary">City Plus Pet Shop (City Pet Shop bd)</p>
      <p className="mt-2 max-w-2xl text-gray-600">
        Your pet, our passion. We&apos;d love to hear from you—visit us, call, or send a message.
      </p>

      <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-slate-50">
        <div className="relative h-40 w-full sm:h-48">
          <Image
            src="/ui/customer-service.webp"
            alt="Customer support"
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-primary">Store Information</h2>
          <ul className="mt-6 space-y-4 text-gray-600">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
              <span>Mirpur 2, Borobag, Dhaka, Bangladesh</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-5 w-5 shrink-0 text-secondary" />
              <a href="tel:+8801643390045" className="hover:text-primary">+880 1643-390045</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-5 w-5 shrink-0 text-secondary" />
              <a href="mailto:info@citypluspetshop.com" className="hover:text-primary">info@citypluspetshop.com</a>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
              <span>Mon–Sat: 9:00 AM – 8:00 PM<br />Sun: 10:00 AM – 6:00 PM</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-primary">Send a Message</h2>
          <p className="mt-2 text-sm text-gray-600">
            Use the form below for general inquiries. We typically respond within 24 hours.
          </p>
          <form className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Your message"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
