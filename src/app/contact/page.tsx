import Link from 'next/link';
import Footer from '@/components/common/Footer';

export const metadata = {
  title: "Contact Us - 8rupiya.com",
};

export default function Contact() {
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
          <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">Contact Us</h1>

          <p className="mb-8 text-lg">If you have any questions, feel free to contact us.</p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📧</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Email</p>
                <a href="mailto:support@8rupiya.com" className="text-blue-600 dark:text-blue-400 hover:underline">8rupiya@gmail.com</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌐</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Website</p>
                <a href="https://8rupiya.com" className="text-blue-600 dark:text-blue-400 hover:underline">https://8rupiya.com</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
  