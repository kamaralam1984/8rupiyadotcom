import Link from 'next/link';
import Footer from '@/components/common/Footer';

export const metadata = {
  title: "Terms & Conditions - 8rupiya.com",
};

export default function Terms() {
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
          <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">Terms & Conditions</h1>

          <p className="mb-6 text-lg">
            By using 8rupiya.com, you agree not to misuse the platform or provide false
            information.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">Listings</h2>
          <p className="mb-6">
            Shop owners are responsible for their listings. We do not guarantee
            accuracy.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">Ads</h2>
          <p className="mb-6">We show ads from Google and partners.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">Law</h2>
          <p className="mb-6">These terms follow Indian law.</p>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
  