import React, { useEffect, useRef } from 'react';

/**
 * JazzCashPaymentForm
 * Yeh component hidden form generate karta hai aur usse auto-submit karta hai
 * taake user JazzCash ke portal par redirect ho jaye.
 */
export const JazzCashPaymentForm = ({ paymentData }) => {
    const formRef = useRef(null);

    useEffect(() => {
        if (paymentData && formRef.current) {
            console.log('Redirecting to JazzCash...', paymentData);
            formRef.current.submit();
        }
    }, [paymentData]);

    if (!paymentData) return null;

    // JazzCash Sandbox ya Production URL
    const JAZZCASH_URL = "https://sandbox.jazzcash.com.pk/CustomerPortal/transaction/Checkout";
    // Note: Live hone par isse "https://payments.jazzcash.com.pk/CustomerPortal/transaction/Checkout" karna hoga.

    return (
        <div className="hidden">
            <form ref={formRef} name="jsform" method="post" action={JAZZCASH_URL}>
                {Object.entries(paymentData).map(([key, value]) => (
                    <input key={key} type="hidden" name={key} value={value} />
                ))}
            </form>
            <div className="flex flex-col items-center justify-center p-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mb-4"></div>
                <p className="text-xl font-serif italic text-ink-900">Connecting to JazzCash Payment Gateway...</p>
            </div>
        </div>
    );
};
