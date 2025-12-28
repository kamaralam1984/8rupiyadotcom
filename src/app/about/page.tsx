import Link from 'next/link';

export const metadata = {
  title: "About Us - 8rupiya.com",
};

export default function About() {
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
          <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">About 8rupiya.com</h1>

          <p className="mb-6 text-lg">
            8rupiya.com is India's smart local business discovery platform. We help
            people find nearby shops and services easily.
          </p>

          <p className="text-lg">
            Our mission is to support local businesses and make shopping simple for
            everyone.
          </p>
        </div>
      </div>
    </div>
  );
}
  