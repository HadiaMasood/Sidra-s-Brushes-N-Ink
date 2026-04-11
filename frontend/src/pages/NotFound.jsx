import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
            <h1 className="text-6xl font-script text-ink-900 mb-4">404</h1>
            <p className="text-xl font-body text-ink-600 mb-8">Page not found</p>
            <Link to="/" className="bg-ink-900 text-white px-8 py-3 rounded-full hover:bg-gold-calligraphy transition-colors">
                Back to Home
            </Link>
        </div>
    );
};
