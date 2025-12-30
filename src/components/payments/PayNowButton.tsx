'use client';

import { useState } from 'react';
import { FiCreditCard, FiLoader } from 'react-icons/fi';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PayNowButtonProps {
  shopId: string;
  planId: string;
  amount: number;
  shopName?: string;
  planName?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function PayNowButton({
  shopId,
  planId,
  amount,
  shopName,
  planName,
  onSuccess,
  onError,
  className = '',
}: PayNowButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayNow = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to continue');
      }

      // Create payment order
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          shopId,
          planId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create payment order');
      }

      const data = await response.json();
      
      if (!data.success || !data.orderId) {
        throw new Error('Invalid response from payment server');
      }

      // Get Razorpay key
      const keyResponse = await fetch('/api/payments/razorpay-key');
      const keyData = await keyResponse.json();
      
      if (!keyData.success || !keyData.keyId) {
        throw new Error('Razorpay key not configured');
      }

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => openRazorpayCheckout(data.orderId, keyData.keyId);
        script.onerror = () => {
          setLoading(false);
          const errorMsg = 'Failed to load Razorpay SDK';
          if (onError) onError(errorMsg);
          else alert(errorMsg);
        };
        document.body.appendChild(script);
      } else {
        openRazorpayCheckout(data.orderId, keyData.keyId);
      }
    } catch (err: any) {
      setLoading(false);
      const errorMsg = err.message || 'Failed to initiate payment';
      if (onError) {
        onError(errorMsg);
      } else {
        alert(errorMsg);
      }
    }
  };

  const openRazorpayCheckout = (orderId: string, keyId: string) => {
    if (!window.Razorpay) {
      setLoading(false);
      const errorMsg = 'Razorpay SDK not loaded';
      if (onError) onError(errorMsg);
      return;
    }

    const options = {
      key: keyId,
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      name: '8Rupiya',
      description: `Payment for ${planName || 'Plan'} - ${shopName || 'Shop'}`,
      order_id: orderId,
      handler: async function (response: any) {
        // Verify payment
        const token = localStorage.getItem('token');
        const verifyResponse = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });

        setLoading(false);

        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          if (verifyData.success) {
            if (onSuccess) {
              onSuccess();
            } else {
              // Default: reload page
              window.location.reload();
            }
          } else {
            const errorMsg = 'Payment verification failed';
            if (onError) onError(errorMsg);
            else alert(errorMsg);
          }
        } else {
          const errorData = await verifyResponse.json();
          const errorMsg = errorData.error || 'Payment verification failed';
          if (onError) onError(errorMsg);
          else alert(errorMsg);
        }
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
        },
      },
      theme: {
        color: '#6366f1',
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      setLoading(false);
      const errorMsg = error.message || 'Failed to open payment gateway';
      if (onError) onError(errorMsg);
      else alert(errorMsg);
    }
  };

  return (
    <button
      onClick={handlePayNow}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <>
          <FiLoader className="animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <FiCreditCard />
          Pay Now
        </>
      )}
    </button>
  );
}

