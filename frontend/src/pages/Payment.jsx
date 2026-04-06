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
    const [upiId, setUpiId] = useState('');
    const [activeBrand, setActiveBrand] = useState(''); // gpay, phonepe
    const [stripe, setStripe] = useState(null);
    const [cardNumberVal, setCardNumberVal] = useState('');
    const [cardExpiryVal, setCardExpiryVal] = useState('');
    const [cardCvcVal, setCardCvcVal] = useState('');

    useEffect(() => {
        const initStripe = async () => {
            const stripeInstance = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');
            setStripe(stripeInstance);
        };
        initStripe();
    }, []);

    useEffect(() => {
        // Stripe Elements are no longer used for card inputs to allow strict 12-digit limit and custom layout.
    }, [stripe]);


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
            if (selectedGateway === 'razorpay' || selectedGateway === 'netbanking') {
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
            } else if (selectedGateway === 'stripe' || selectedGateway === 'upi') {
                const { data } = await api.post('/payments/create-payment-intent', {
                    bookingId: booking._id
                });

                if (selectedGateway === 'stripe') {
                    const [month, year] = cardExpiryVal.split('/').map(v => v.trim());
                    const result = await stripe.confirmCardPayment(data.clientSecret, {
                        payment_method: {
                            card: {
                                number: cardNumberVal,
                                cvc: cardCvcVal,
                                exp_month: parseInt(month),
                                exp_year: parseInt(year),
                            },
                            billing_details: {
                                name: user?.name,
                                email: user?.email,
                            },
                        },
                    });

                    if (result.error) {
                        setErrorMessage(result.error.message);
                        setStatus('failed');
                    } else if (result.paymentIntent.status === 'succeeded' || result.paymentIntent.status === 'processing') {
                        await api.post('/payments/verify-payment-intent', {
                            paymentIntentId: result.paymentIntent.id,
                            bookingId: booking._id
                        });
                        setStatus('success');
                        setTimeout(() => navigate('/my-bookings'), 3000);
                    }
                } else if (selectedGateway === 'upi') {
                    if (!upiId) {
                        setErrorMessage('Please enter your UPI ID');
                        setStatus('idle');
                        return;
                    }
                    const result = await stripe.confirmUpiPayment(data.clientSecret, {
                        payment_method: {
                            upi: { vpa: upiId },
                            billing_details: {
                                name: user?.name,
                                email: user?.email,
                            },
                        },
                    });

                    if (result.error) {
                        setErrorMessage(result.error.message);
                        setStatus('failed');
                    } else if (result.paymentIntent.status === 'succeeded' || result.paymentIntent.status === 'processing') {
                        await api.post('/payments/verify-payment-intent', {
                            paymentIntentId: result.paymentIntent.id,
                            bookingId: booking._id
                        });
                        setStatus('success');
                        setTimeout(() => navigate('/my-bookings'), 3000);
                    }
                }
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
                    <div className="space-y-8 animate-in zoom-in duration-500">
                        {/* Header Section */}
                        <div className="text-center mb-8">
                            <h2 className="text-5xl font-black text-[#003049] uppercase tracking-tighter leading-none mb-4">Payment Successful</h2>
                            <p className="text-[#003049]/60 text-sm font-bold max-w-[280px] mx-auto leading-relaxed">
                                Your payment is complete! Your booking is currently pending final approval from the hotel manager.
                            </p>
                        </div>

                        {/* Summary Card */}
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl relative border border-[#003049]/5">
                            <div className="space-y-10">
                                <div>
                                    <span className="text-[10px] font-black text-[#003049]/40 uppercase tracking-widest block mb-2">Booking ID</span>
                                    <strong className="text-2xl font-black text-[#003049] tracking-tight italic">
                                        #{booking._id.toString().slice(-6).toUpperCase()}
                                    </strong>
                                </div>

                                <div>
                                    <span className="text-[10px] font-black text-[#003049]/40 uppercase tracking-widest block mb-2">Hotel</span>
                                    <strong className="text-2xl font-black text-[#003049] uppercase tracking-tight italic">
                                        {booking.hotelId?.name}
                                    </strong>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-[#003049]/40 uppercase tracking-widest block">Check-in</span>
                                    <div className="flex items-center gap-4 py-4 bg-[#EDF7BD]/30 rounded-2xl justify-center">
                                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600">📅</div>
                                        <span className="text-xl font-black text-[#003049]">
                                            {new Date(booking.checkIn).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-[#003049]/40 uppercase tracking-widest block">Check-out</span>
                                    <div className="flex items-center gap-4 py-4 bg-[#EDF7BD]/30 rounded-2xl justify-center">
                                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600">📅</div>
                                        <span className="text-xl font-black text-[#003049]">
                                            {new Date(booking.checkOut).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => navigate(`/invoice/${booking._id}`)}
                                className="w-full bg-[#003049] text-white font-black uppercase tracking-[0.4em] py-6 rounded-[2rem] shadow-xl hover:bg-[#002538] transition-all"
                            >
                                View Digital Invoice
                            </button>
                            <button
                                onClick={() => navigate('/my-bookings')}
                                className="w-full bg-white/5 border border-[#003049]/10 text-[#003049] font-black uppercase tracking-[0.4em] py-6 rounded-[2rem] hover:bg-[#003049]/5 transition-all text-[10px]"
                            >
                                Go to My Bookings
                            </button>
                        </div>
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
                        <div className="bg-[#003049] border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl">
                            <h3 className="text-[10px] font-black text-white/40 mb-10 uppercase tracking-[0.5em] text-center md:text-left">Select Payment Architecture</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                {/* Debit or Credit Card */}
                                <div
                                    onClick={() => setSelectedGateway('stripe')}
                                    className={`relative p-8 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-5 ${selectedGateway === 'stripe' ? 'border-white bg-white/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white shadow-sm">
                                            <CreditCard size={28} strokeWidth={1.5} />
                                        </div>
                                        {selectedGateway === 'stripe' && (
                                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                                                <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-[#003049] -rotate-45 -mt-0.5" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white tracking-tight leading-none">Debit or Credit Card</h4>
                                        <div className="flex gap-2 mt-3 opacity-40">
                                            <div className="w-8 h-5 bg-white/10 rounded-sm flex items-center justify-center text-[6px] font-black text-white italic border border-white/10">VISA</div>
                                            <div className="w-8 h-5 bg-white/10 rounded-sm flex items-center justify-center text-[6px] font-black text-white italic border border-white/10">MC</div>
                                        </div>
                                    </div>

                                    <div className={`mt-6 space-y-4 pt-6 border-t border-white/10 ${selectedGateway === 'stripe' ? 'animate-in fade-in slide-in-from-top-4' : 'hidden'}`} onClick={(e) => e.stopPropagation()}>
                                        <div className="space-y-4">
                                            <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-inner">
                                                <input 
                                                    type="text" 
                                                    placeholder="Card Number (12 digits only)" 
                                                    value={cardNumberVal}
                                                    onChange={(e) => setCardNumberVal(e.target.value.replace(/\D/g, '').slice(0, 12))}
                                                    className="w-full bg-transparent border-none outline-none text-[#003049] placeholder:text-[#003049]/30 font-medium"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-inner">
                                                    <input 
                                                        type="text" 
                                                        placeholder="MM / YY" 
                                                        value={cardExpiryVal}
                                                        onChange={(e) => setCardExpiryVal(e.target.value.replace(/[^\d/]/g, '').slice(0, 5))}
                                                        className="w-full bg-transparent border-none outline-none text-[#003049] placeholder:text-[#003049]/30 font-medium"
                                                    />
                                                </div>
                                                <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-inner">
                                                    <input 
                                                        type="text" 
                                                        placeholder="CVC" 
                                                        value={cardCvcVal}
                                                        onChange={(e) => setCardCvcVal(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                        className="w-full bg-transparent border-none outline-none text-[#003049] placeholder:text-[#003049]/30 font-medium"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-white/30 uppercase tracking-widest text-center">Encrypted PCI-DSS Node</p>
                                    </div>
                                </div>

                                {/* Razorpay */}
                                <div
                                    onClick={() => setSelectedGateway('razorpay')}
                                    className={`relative p-8 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-5 ${selectedGateway === 'razorpay' ? 'border-white bg-white/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white shadow-sm">
                                            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M18.8 1l-6.8 11h6.8l-7.8 11 2-11h-6.2l7.2-11h-4l1-1h9z" /></svg>
                                        </div>
                                        {selectedGateway === 'razorpay' && (
                                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                                                <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-[#003049] -rotate-45 -mt-0.5" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white tracking-tight leading-none uppercase">Razorpay</h4>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
                                            <span className="w-4 h-4 bg-white/10 border border-white/20 rounded-sm flex items-center justify-center text-white text-[8px] font-black">R</span>
                                            SECURE UI CHECKOUT
                                        </p>
                                    </div>
                                </div>

                                {/* UPI */}
                                <div
                                    onClick={() => setSelectedGateway('upi')}
                                    className={`relative p-8 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-5 ${selectedGateway === 'upi' ? 'border-white bg-white/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="w-14 h-14 rounded-2xl bg-[#008CBA] flex items-center justify-center text-white shadow-lg overflow-hidden">
                                            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17 2H7C5.89 2 5 2.89 5 4V20C5 21.11 5.89 22 7 22H17C18.11 22 19 21.11 19 20V4C19 2.89 18.11 2 17 2M17 18H7V6H17V18M12 19C11.45 19 11 18.55 11 18C11 17.45 11.45 17 12 17C12.55 17 13 17.45 13 18C13 18.55 12.55 19 12 19Z" /></svg>
                                        </div>
                                        {selectedGateway === 'upi' && (
                                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                                                <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-[#003049] -rotate-45 -mt-0.5" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white tracking-tight leading-none uppercase">UPI</h4>
                                        <div className="flex items-center gap-3 mt-3">
                                            <div className="flex -space-x-1 opacity-60">
                                                <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[7px] font-black text-white">G</div>
                                                <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[7px] font-black text-white">P</div>
                                            </div>
                                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">INSTANT PAY</p>
                                        </div>
                                    </div>

                                    <div className={`mt-6 space-y-6 pt-6 border-t border-white/10 ${selectedGateway === 'upi' ? 'animate-in fade-in slide-in-from-top-4' : 'hidden'}`} onClick={(e) => e.stopPropagation()}>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setActiveBrand('gpay')}
                                                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${activeBrand === 'gpay' ? 'border-white bg-white/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                                            >
                                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#003049] font-black text-lg">G</div>
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">Google Pay</span>
                                            </button>
                                            <button
                                                onClick={() => setActiveBrand('phonepe')}
                                                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${activeBrand === 'phonepe' ? 'border-white bg-white/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                                            >
                                                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-black text-lg">P</div>
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">PhonePe</span>
                                            </button>
                                        </div>

                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Enter UPI ID (e.g. user@bank)"
                                                value={upiId}
                                                onChange={(e) => setUpiId(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-white/40 transition-all font-mono shadow-inner"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Net Banking */}
                                <div
                                    onClick={() => setSelectedGateway('netbanking')}
                                    className={`relative p-8 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-5 ${selectedGateway === 'netbanking' ? 'border-white bg-white/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white shadow-sm">
                                            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-none stroke-current" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M3 10h18" /><path d="M5 6l7-3 7 3" /><path d="M4 10v11" /><path d="M20 10v11" /><path d="M8 14v3" /><path d="M12 14v3" /><path d="M16 14v3" /></svg>
                                        </div>
                                        {selectedGateway === 'netbanking' && (
                                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                                                <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-[#003049] -rotate-45 -mt-0.5" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white tracking-tight leading-none uppercase">Net Banking</h4>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-3">ALL MAJOR BANKS</p>
                                    </div>
                                </div>
                            </div>

                        {/* Status Messaging */}
                        <div className="mt-8">
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
                                className="w-full bg-white hover:bg-white/90 text-[#003049] font-black uppercase tracking-[0.5em] py-8 rounded-[2.5rem] shadow-2xl transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 text-xs"
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payment;
