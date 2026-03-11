
import { Navbar } from "@/components/Navbar";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto prose prose-slate">
          <h1 className="text-4xl font-headline font-black mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground font-medium">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section className="mt-12 space-y-6">
            <h2 className="text-2xl font-bold">1. Introduction</h2>
            <p>
              Welcome to AI Tool Scout. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
            </p>

            <h2 className="text-2xl font-bold">2. Data We Collect</h2>
            <p>
              We do not require users to create accounts to browse our directory. We may collect minimal data such as:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Usage data (pages visited, search queries).</li>
              <li>Technical data (IP address, browser type).</li>
              <li>Contact data (if you submit a tool for review).</li>
            </ul>

            <h2 className="text-2xl font-bold">3. Cookies and Advertising</h2>
            <p>
              We use Google AdSense to serve advertisements. Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.
            </p>
            <p>
              Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" className="text-primary hover:underline">Google Ad Settings</a>.
            </p>

            <h2 className="text-2xl font-bold">4. How We Use Your Data</h2>
            <p>
              We use your data to provide and improve our services, manage tool submissions, and personalize your experience. We do not sell your personal data to third parties.
            </p>

            <h2 className="text-2xl font-bold">5. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy, please contact us at support@aitoolscout.com.
            </p>
          </section>
          
          <div className="mt-12 pt-8 border-t">
            <Link href="/" className="text-primary font-bold hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
