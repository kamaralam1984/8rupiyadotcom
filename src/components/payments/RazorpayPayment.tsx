'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentProps {
  orderId: string;
  amount: number;
  currency?: string;
  keyId: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onError: (error: string) => void;
  onClose?: () => void;
}

export default function RazorpayPayment({
  orderId,
  amount,
  currency = 'INR',
  keyId,
  name = '8Rupiya',
  description = 'Payment for subscription plan',
  prefill,
  onSuccess,
  onError,
  onClose,
}: RazorpayPaymentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    if (razorpayLoaded && window.Razorpay) {
      openRazorpay();
    }
  }, [razorpayLoaded]);

  const openRazorpay = () => {
    if (!window.Razorpay) {
      onError('Razorpay SDK not loaded. Please refresh the page.');
      return;
    }

    setLoading(true);

    const options = {
      key: keyId,
      amount: amount,
      currency: currency,
      name: name,
      description: description,
      order_id: orderId,
      prefill: prefill || {},
      theme: {
        color: '#6366f1',
      },
      handler: function (response: any) {
        setLoading(false);
        onSuccess(
          response.razorpay_payment_id,
          response.razorpay_order_id,
          response.razorpay_signature
        );
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
          if (onClose) {
            onClose();
          }
        },
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      setLoading(false);
      onError(error.message || 'Failed to initialize Razorpay');
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => {
          setLoading(false);
          onError('Failed to load Razorpay SDK. Please check your internet connection.');
        }}
      />
      {loading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
              <p className="text-gray-900 dark:text-white">Opening payment gateway...</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

