import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api, AuthContext } from '../context/AuthContext';
import { CreditCard, Wallet, Lock, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const Payment = () => {
    const { id } = useParams(); // Booking ID
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(AuthContext);

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('idle'); // idle, processing, success, failed
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedGateway, setSelectedGateway] = useState('razorpay');

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const { data } = await api.get(`/bookings/${id}`);
                setBooking(data);
                
                if (data.status === 'Confirmed' || data.paymentStatus === 'Paid') {
                   setStatus('success'); 
                }
            } catch (error) {
                console.error(error);
                navigate('/my-bookings');
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [id, navigate]);

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const success = query.get('success');
        const sessionId = query.get('session_id');
        const gateway = query.get('gateway');

        if (success === 'true' && (sessionId || gateway === 'stripe')) {
            const verifyStripe = async () => {
                setStatus('processing');
                try {
                    await api.post('/payments/verify-stripe', {
                        sessionId: sessionId || 'sess_mock_' + Date.now(),
                        bookingId: id
                    });
                    setStatus('success');
                    setTimeout(() => navigate('/my-bookings'), 3000);
                } catch (error) {
                    setStatus('failed');
                    setErrorMessage('Stripe verification failed.');
                }
            };
            verifyStripe();
        }
    }, [location, id, navigate]);

    const handlePayment = async () => {
        setStatus('processing');
        setErrorMessage('');
        
        try {
            if (selectedGateway === 'razorpay') {
                const { data: order } = await api.post('/payments/create-order', {
                    bookingId: booking._id
                });

                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'test_key_id',
                    amount: order.amount,
                    currency: "INR",
                    name: "Navan",
                    description: "Booking Payment",
                    order_id: order.id,
                    handler: async function (response) {
                        try {
                            setStatus('processing');
                            await api.post('/payments/verify', {
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpayOrderId: response.razorpay_order_id,
                                razorpaySignature: response.razorpay_signature,
                                bookingId: booking._id,
                            });
                            setStatus('success');
                            setTimeout(() => navigate('/my-bookings'), 3000);
                        } catch (error) {
                            setStatus('failed');
                            setErrorMessage('Payment verification failed.');
                        }
                    },
                    prefill: {
                        name: user?.name,
                        email: user?.email,
                    },
                    theme: { color: "#003049" },
                    modal: { ondismiss: () => setStatus('idle') }
                };

                if (order.isMock) {
                    await options.handler({
                        razorpay_payment_id: 'pay_mock_' + Date.now(),
                        razorpay_order_id: order.id,
                        razorpay_signature: 'mock_sig'
                    });
                    return;
                }

                const rzp1 = new window.Razorpay(options);
                rzp1.open();
            } else if (selectedGateway === 'stripe') {
                const { data } = await api.post('/payments/create-stripe-session', {
                    bookingId: booking._id
                });

                if (data.isMock) {
                    window.location.href = data.url;
                    return;
                }

                const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');
                await stripe.redirectToCheckout({ sessionId: data.id });
            }
        } catch (error) {
            setStatus('failed');
            setErrorMessage('Initialization of secure payment failed.');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#EDF7BD]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003049]"></div>
        </div>
    );

    return (
        <div className="bg-[#EDF7BD] min-h-screen pt-32 pb-12 px-4 flex flex-col items-center">
            <div className="max-w-2xl w-full">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#003049] mb-4 block">Secure Payment Gateway</span>
                    <h1 className="text-4xl md:text-5xl font-serif font-black text-[#003049] italic uppercase tracking-tighter mb-4">Payment</h1>
                    <div className="flex items-center justify-center gap-2 text-[#003049]">
                        <Lock size={14} />
                        <span className="text-[10px] uppercase font-black tracking-widest">Secure 256-bit Connection</span>
                    </div>
                </div>

                {status === 'success' ? (
                    <div className="bg-[#003049] border border-white/10 rounded-[3rem] p-16 text-center shadow-2xl animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
                            <CheckCircle2 className="text-green-500" size={40} />
                        </div>
                        <h3 className="text-2xl font-serif font-black text-white uppercase italic mb-2">Payment Successful</h3>
                        <p className="text-xs font-black text-white/60 uppercase tracking-widest">Redirecting to your dashboard...</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Booking Summary Card */}
                        <div className="bg-[#003049] border border-white/10 rounded-[3rem] p-10 shadow-2xl overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-transparent opacity-50"></div>
                            <h3 className="text-xs font-black text-white/40 mb-10 uppercase tracking-[0.5em]">Booking Summary</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Hotel</span>
                                        <strong className="text-2xl font-black text-white uppercase tracking-tight italic">{booking.hotelId?.name}</strong>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Arrival</span>
                                            <strong className="text-sm font-black text-white">
                                                {new Date(booking.checkIn).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                            </strong>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Departure</span>
                                            <strong className="text-sm font-black text-white">
                                                {new Date(booking.checkOut).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="md:text-right flex flex-col justify-between">
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Total Folio Settlement</span>
                                        <div className="text-5xl font-serif font-black text-white italic leading-none">₹{booking.totalAmount}</div>
                                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Inclusive of Taxes</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Card */}
                        <div className="bg-[#003049] border border-white/10 rounded-[3rem] p-10 shadow-2xl">
                            <h3 className="text-xs font-black text-white/40 mb-10 uppercase tracking-[0.5em]">Payment Method Selection</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Razorpay Option */}
                                <div 
                                    onClick={() => setSelectedGateway('razorpay')}
                                    className={`relative p-8 rounded-[2rem] border-2 transition-all cursor-pointer flex flex-col gap-4 ${selectedGateway === 'razorpay' ? 'border-white/40 bg-white/5' : 'border-white/5 hover:border-white/10'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <Wallet className="text-white/40" size={24} />
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedGateway === 'razorpay' ? 'border-white' : 'border-white/20'}`}>
                                            {selectedGateway === 'razorpay' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-xl font-serif font-black text-white uppercase italic tracking-tighter">Razorpay</span>
                                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1">Wallet & UPI</p>
                                    </div>
                                </div>

                                {/* Stripe Option */}
                                <div 
                                    onClick={() => setSelectedGateway('stripe')}
                                    className={`relative p-8 rounded-[2rem] border-2 transition-all cursor-pointer flex flex-col gap-4 ${selectedGateway === 'stripe' ? 'border-white/40 bg-white/5' : 'border-white/5 hover:border-white/10'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <CreditCard className="text-white/40" size={24} />
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedGateway === 'stripe' ? 'border-white' : 'border-white/20'}`}>
                                            {selectedGateway === 'stripe' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-xl font-serif font-black text-white uppercase italic tracking-tighter">Stripe</span>
                                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1">Cards & Global</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {status === 'failed' && (
                            <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 text-rose-500 text-xs font-black uppercase tracking-widest">
                                <AlertCircle size={18} />
                                {errorMessage}
                            </div>
                        )}

                        {/* Pay Now Button */}
                        <button
                            onClick={handlePayment}
                            disabled={status === 'processing'}
                            className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black uppercase tracking-[0.5em] py-8 rounded-[2.5rem] shadow-2xl transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 text-xs"
                        >
                            {status === 'processing' ? 'Authorizing Secure Corridor...' : (
                                <>
                                    <span className="text-lg">🛡️</span>
                                    Proceed to Settlement - ₹ {booking.totalAmount}
                                </>
                            )}
                        </button>

                        {/* Visual Security Elements */}
                        <div className="flex justify-center gap-12 opacity-30 grayscale pt-4">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={16} className="text-white" />
                                <span className="text-[9px] font-black text-white uppercase tracking-widest">PCI DSS Compliant</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payment;
