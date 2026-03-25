import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, AuthContext } from '../context/AuthContext';

const Payment = () => {
    const { id } = useParams(); // Booking ID
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('idle'); // idle, processing, success, failed
    const [errorMessage, setErrorMessage] = useState('');
    const [paymentStep, setPaymentStep] = useState('overview'); // overview, details
    const [billingDetails, setBillingDetails] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const { data } = await api.get(`/bookings/${id}`);
                setBooking(data);
                
                if (data.status !== 'Pending') {
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

    const handlePayment = async () => {
        setStatus('processing');
        setErrorMessage('');
        
        try {
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
                        setErrorMessage('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: billingDetails.name,
                    email: billingDetails.email,
                    contact: billingDetails.phone
                },
                theme: {
                    color: "#d4af37" 
                },
                modal: {
                    ondismiss: function(){
                        setStatus('idle');
                    }
                }
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
            rzp1.on('payment.failed', function (response){
                setStatus('failed');
                setErrorMessage(response.error.description);
            });
            rzp1.open();

        } catch (error) {
            setStatus('failed');
            setErrorMessage('Initialization of secure payment failed.');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#EDF7BD]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-transparent"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#EDF7BD] flex items-center justify-center p-6 pt-24 pb-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>
            
            <div className="max-w-2xl w-full relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-transparent to-transparent rounded-[3rem] blur opacity-25"></div>
                
                <div className="relative bg-[#003049] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
                    <div className="h-2 w-full bg-gradient-to-r from-transparent via-transparent to-transparent"></div>

                    <div className="p-8 md:p-12">
                        <div className="text-center mb-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white mb-4 block">Secure Payment Gateway</span>
                            <h2 className="text-4xl md:text-5xl font-serif font-black text-white uppercase tracking-tighter leading-none italic mb-4">Payment</h2>
                            <div className="flex items-center justify-center gap-2 text-white">
                                <span className="text-lg">🔒</span>
                                <span className="text-[10px] uppercase font-black tracking-widest">Secure Encrypted Connection</span>
                            </div>
                        </div>

                        {status === 'success' ? (
                            <div className="py-12 text-center animate-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
                                    <span className="text-4xl">✓</span>
                                </div>
                                <h3 className="text-2xl font-serif font-black text-white uppercase tracking-tighter mb-2">Payment Successful</h3>
                                <p className="text-xs font-black text-white uppercase tracking-widest">Redirecting to your bookings...</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {paymentStep === 'overview' ? (
                                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-inner mb-8">
                                            <div className="space-y-6">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest block">Hotel</span>
                                                    <strong className="text-lg font-black text-white uppercase tracking-[0.1em]">{booking.hotelId?.name}</strong>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest block">Room Type</span>
                                                    <strong className="text-sm font-black text-white uppercase">{booking.roomId?.type} SUITE</strong>
                                                </div>
                                            </div>
                                            <div className="space-y-6 md:text-right">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest block">Total Amount</span>
                                                    <strong className="text-4xl font-serif font-black text-white leading-none">₹{booking.totalAmount}</strong>
                                                </div>
                                                <p className="text-[10px] font-black text-white uppercase tracking-widest">Inclusive of Taxes</p>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => setPaymentStep('details')}
                                            className="w-full group relative flex items-center justify-center gap-4 py-6 bg-white/10 text-white font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-transparent hover:text-white transition-all transform active:scale-[0.98]"
                                        >
                                            <span className="absolute left-8 text-xl group-hover:scale-125 transition-transform">⚔️</span>
                                            Proceed to Payment
                                        </button>
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-left-8 duration-500 space-y-6">
                                        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-inner">
                                            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center justify-between">
                                                Billing & Security 
                                                <button onClick={() => setPaymentStep('overview')} className="text-white hover:text-white transition-colors">Back</button>
                                            </h3>
                                            
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-white uppercase tracking-widest ml-1">Cardholder Name</label>
                                                    <input 
                                                        type="text"
                                                        value={billingDetails.name}
                                                        onChange={(e) => setBillingDetails({...billingDetails, name: e.target.value})}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-transparent/50 outline-none transition-all font-black uppercase"
                                                        placeholder="Full Name as on Card"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-white uppercase tracking-widest ml-1">Contact Phone</label>
                                                        <input 
                                                            type="tel"
                                                            value={billingDetails.phone}
                                                            onChange={(e) => setBillingDetails({...billingDetails, phone: e.target.value})}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-transparent/50 outline-none transition-all font-black"
                                                            placeholder="+91..."
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-white uppercase tracking-widest ml-1">Email</label>
                                                        <input 
                                                            type="email"
                                                            value={billingDetails.email}
                                                            onChange={(e) => setBillingDetails({...billingDetails, email: e.target.value})}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-transparent/50 outline-none transition-all font-black"
                                                            placeholder="your@email.com"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {status === 'failed' && (
                                            <div className="p-8 bg-red-950/20 border border-red-500/20 rounded-[2rem] text-center animate-in zoom-in-95">
                                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                                                    <span className="text-2xl text-red-500">⚠</span>
                                                </div>
                                                <h3 className="text-sm font-black text-red-500 uppercase tracking-[0.2em] mb-2 font-serif italic">Transaction Failed</h3>
                                                <p className="text-[10px] font-black text-red-400/80 uppercase tracking-widest mb-6 leading-relaxed">
                                                    {errorMessage || 'Payment was unsuccessful. Please check your network or bank details.'}
                                                </p>
                                                <button 
                                                    onClick={() => { setStatus('idle'); setErrorMessage(''); }}
                                                    className="px-6 py-2 bg-white/10/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 hover:text-white transition-all"
                                                >
                                                    Retry Payment
                                                </button>
                                            </div>
                                        )}

                                        <button 
                                            onClick={handlePayment} 
                                            disabled={status === 'processing' || !billingDetails.name || !billingDetails.phone}
                                            className="w-full group relative flex items-center justify-center gap-4 py-6 bg-transparent text-white font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-transparent transition-all transform active:scale-[0.98] disabled:opacity-50"
                                        >
                                            <span className="absolute left-8 text-xl group-hover:scale-125 transition-transform">{status === 'processing' ? '⏳' : '🛡️'}</span>
                                            {status === 'processing' ? 'Authorizing...' : 'Execute Transaction'}
                                        </button>
                                    </div>
                                )}
                                
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-white uppercase tracking-[0.3em] leading-relaxed">
                                        By paying, you acknowledge the terms of service.<br/>
                                        Payments processed via Razorpay secure networks.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Visual Security Elements */}
                <div className="mt-8 flex justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                    <div className="flex items-center gap-2">
                        <span className="text-sm">🏢</span>
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">ISO 27001</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm">💳</span>
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">PCI DSS</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm">🛡️</span>
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">RSA 4096</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
