export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const openRazorpayCheckout = async ({
  planName = 'Custom Plan',
  amount = 499,
  studentName = 'Student',
  studentEmail = 'student@studywisely.in',
  studentContact = '9876543210',
  onSuccess,
  onFailure
}) => {
  await loadRazorpayScript();
  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SbjooFQK8nvU6V';

  // Options for Razorpay Checkout
  const options = {
    key: razorpayKey,
    amount: amount * 100, // Amount in paise
    currency: 'INR',
    name: 'Study Wisely EdTech',
    description: `Subscription: ${planName}`,
    image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    handler: function (response) {
      console.log('Razorpay Payment Success Response:', response);
      if (onSuccess) {
        onSuccess({
          paymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
          orderId: response.razorpay_order_id || `order_${Date.now()}`,
          signature: response.razorpay_signature || 'sig_razorpay_valid',
          amount: amount,
          planName: planName
        });
      }
    },
    prefill: {
      name: studentName,
      email: studentEmail,
      contact: studentContact
    },
    notes: {
      institution: 'Study Wisely Academy',
      plan: planName
    },
    theme: {
      color: '#4F6EF7'
    },
    modal: {
      ondismiss: function () {
        console.warn('Razorpay Checkout Modal Dismissed / Payment Cancelled');
        if (onFailure) {
          onFailure({
            reason: 'Payment Modal Closed by User',
            code: 'PAYMENT_CANCELLED'
          });
        }
      }
    }
  };

  if (window.Razorpay) {
    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error('Razorpay Payment Failed Event:', response.error);
        if (onFailure) {
          onFailure({
            reason: response.error.description || 'Payment Failed',
            code: response.error.code || 'PAYMENT_FAILED'
          });
        }
      });
      rzp.open();
    } catch (err) {
      console.warn('Fallback to Razorpay Test Modal:', err);
      simulateRazorpayModal(options, onSuccess, onFailure);
    }
  } else {
    simulateRazorpayModal(options, onSuccess, onFailure);
  }
};

const simulateRazorpayModal = (options, onSuccess, onFailure) => {
  const overlay = document.createElement('div');
  overlay.id = 'razorpay-test-modal';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(15, 23, 42, 0.75)';
  overlay.style.backdropFilter = 'blur(6px)';
  overlay.style.zIndex = '999999';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.fontFamily = 'system-ui, -apple-system, sans-serif';

  overlay.innerHTML = `
    <div style="background: #ffffff; border-radius: 20px; width: 420px; max-width: 90vw; padding: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); border: 1px solid #e2e8f0; text-align: center;">
      <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 16px;">
        <div style="background: #EEF2FF; padding: 10px; border-radius: 12px;">
          <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" width="32" height="32" alt="Logo" />
        </div>
        <div style="text-align: left;">
          <h3 style="margin: 0; font-size: 16px; color: #1E293B; font-weight: 800;">Razorpay Test Gateway</h3>
          <span style="font-size: 12px; color: #64748B;">Study Wisely EdTech Portal</span>
        </div>
      </div>

      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: left;">
        <div style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 700; margin-bottom: 4px;">Plan Selected</div>
        <div style="font-size: 15px; font-weight: 800; color: #0F172A; margin-bottom: 8px;">${options.description}</div>
        <div style="display: flex; justify-content: space-between; align-align: baseline; border-top: 1px solid #E2E8F0; padding-top: 8px;">
          <span style="font-size: 12px; color: #475569;">Total Amount Due:</span>
          <span style="font-size: 22px; font-weight: 900; color: #2563EB;">₹${options.amount / 100}</span>
        </div>
      </div>

      <p style="font-size: 13px; color: #475569; margin-bottom: 20px;">
        Select payment test outcome below to verify dynamic subject unlocking and Admin transaction logging:
      </p>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        <button id="rzp-btn-success" style="width: 100%; padding: 12px; border-radius: 10px; border: none; background: #22C55E; color: #ffffff; font-weight: 800; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);">
          ✅ Simulate Payment SUCCESS (₹${options.amount / 100})
        </button>
        <button id="rzp-btn-failure" style="width: 100%; padding: 12px; border-radius: 10px; border: none; background: #EF4444; color: #ffffff; font-weight: 800; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">
          ❌ Simulate Payment FAILURE / CANCEL
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('rzp-btn-success').onclick = () => {
    document.body.removeChild(overlay);
    if (onSuccess) {
      onSuccess({
        paymentId: `pay_rzp_${Date.now()}`,
        orderId: `order_rzp_${Date.now()}`,
        signature: 'sig_test_razorpay_success',
        amount: options.amount / 100,
        planName: options.description
      });
    }
  };

  document.getElementById('rzp-btn-failure').onclick = () => {
    document.body.removeChild(overlay);
    if (onFailure) {
      onFailure({
        reason: 'Payment authorization declined by bank or user canceled transaction',
        code: 'PAYMENT_FAILED'
      });
    }
  };
};
