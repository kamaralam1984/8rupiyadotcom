import { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/common/Footer';

export const metadata: Metadata = {
  title: "Privacy Policy - 8rupiya.com",
  description: "Privacy Policy for 8rupiya.com - Learn how we collect, use and protect your data.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto p-6 py-12">
        {/* Back to Home Link */}
        <Link 
          href="/" 
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 font-medium"
        >
          ← Back to Home
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-gray-800 dark:text-gray-200">
          <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">Privacy Policy</h1>

          <p className="mb-6 text-lg">
            8rupiya.com respects your privacy. This policy explains how we collect,
            use and protect your data.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">Information We Collect</h2>
          <ul className="list-disc ml-6 space-y-2 mb-6">
            <li>Name, email, phone number</li>
            <li>Location to show nearby shops</li>
            <li>Cookies and usage data</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">Google AdSense</h2>
          <p className="mb-6">
            We use Google AdSense. Google may use cookies to show relevant ads based on
            your browsing activity.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">Contact</h2>
          <p className="text-lg">Email: <a href="mailto:support@8rupiya.com" className="text-blue-600 dark:text-blue-400 hover:underline">8rupiya@gmail.com</a></p>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
  