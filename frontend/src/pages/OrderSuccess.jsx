import React from 'react';
import { useParams, Link } from 'react-router-dom';

export const OrderSuccessPage = () => {
    const { id } = useParams();
    return (
        <div className="container mx-auto px-4 py-20 text-center">
            <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-lg border border-ink-100">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-3xl font-script text-ink-900 mb-2">Thank You!</h1>
                <p className="text-ink-600 mb-6 font-body">Your order #{id} has been placed successfully.</p>
                <Link to="/" className="inline-block bg-ink-900 text-white px-8 py-3 rounded-full hover:bg-gold-calligraphy transition-colors">
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
};
