import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import authAPI from '../services/auth';

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('Verifying...');
    const [error, setError] = useState(null);
    const verificationCalled = useRef(false);

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('Error');
                setError('No verification token provided.');
                return;
            }

            if (verificationCalled.current) {
                return;
            }
            verificationCalled.current = true;

            try {
                await authAPI.verifyEmail(token);
                setStatus('Success');
            } catch (err) {
                setStatus('Error');
                setError(err.response?.data?.message || 'An error occurred during verification.');
            }
        };

        verify();
    }, [token]);

    const renderIcon = () => {
        if (status === 'Success') {
            return (
                <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            );
        }
        if (status === 'Error') {
            return (
                <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
            );
        }
        return (
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    };

    const renderContent = () => {
        switch (status) {
            case 'Success':
                return (
                    <>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Verified!</h2>
                        <p className="text-gray-600 mb-6">Your email has been successfully verified.</p>
                        <Link
                            to="/login"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                        >
                            Proceed to Login
                        </Link>
                    </>
                );
            case 'Error':
                return (
                    <>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification Failed</h2>
                        <p className="text-red-600 bg-red-50 p-4 rounded-lg mb-6">{error}</p>
                        <Link
                            to="/signup"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                        >
                            Return to Signup
                        </Link>
                    </>
                );
            default: // Verifying...
                return (
                    <>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifying Your Email...</h2>
                        <p className="text-gray-600">Please wait a moment.</p>
                    </>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
                {renderIcon()}
                {renderContent()}
            </div>
        </div>
    );
};

export default VerifyEmail; 