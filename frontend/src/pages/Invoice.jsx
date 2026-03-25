import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { Printer, Download, ArrowLeft, ShieldCheck, Award, Box } from 'lucide-react';

const Invoice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const { data } = await api.get(`/payments/invoice/${id}`);
                setInvoice(data);
            } catch (error) {
                console.error(error);
                navigate('/my-bookings');
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id, navigate]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#7FB77E]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#0B2D72]"></div>
        </div>
    );

    if (!invoice) return null;

    return (
        <div className="min-h-screen bg-[#7FB77E] py-24 px-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0B2D72]/5 blur-[150px] pointer-events-none"></div>
            
            {/* Action Bar */}
            <div className="max-w-4xl mx-auto mb-12 flex items-center justify-between print:hidden">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-3 text-black hover:text-black transition-all group"
                >
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#0B2D72]/50 group-hover:bg-[#7FB77E]/5 transition-all">
                       <ArrowLeft size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Back to Folio</span>
                </button>
                
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-4 px-10 py-5 bg-[#0B2D72] text-black rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] hover:bg-[#7FB77E] transition-all shadow-xl shadow-[#0B2D72]/10 active:scale-95"
                >
                    <Printer size={16} />
                    Print Settlement
                </button>
            </div>

            {/* Invoice Document */}
            <div className="max-w-4xl mx-auto bg-[#7FB77E] text-black p-12 md:p-24 shadow-2xl rounded-[3rem] border border-white/5 relative overflow-hidden print:shadow-none print:p-0 print:bg-[#7FB77E] print:text-black">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#0B2D72] to-transparent opacity-50"></div>
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between gap-16 mb-24 relative z-10">
                    <div className="animate-in fade-in slide-in-from-left duration-1000">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 overflow-hidden rounded-xl bg-[#7FB77E]/5 p-1 border border-white/10 shadow-inner">
                                <img src="/logo.png" alt="Navan Logo" className="w-full h-full object-contain" />
                            </div>
                            <h1 className="text-4xl font-serif font-black uppercase tracking-tighter italic">Navan</h1>
                        </div>
                        <p className="text-[10px] font-black text-black uppercase tracking-[0.5em] mb-12">Official Invoice</p>
                        
                        <div className="space-y-2 text-sm">
                            <p className="font-serif italic text-black text-lg uppercase font-black">{invoice.hotel.name}</p>
                            <p className="text-black font-medium opacity-80">{invoice.hotel.address}</p>
                            <p className="text-black font-medium opacity-80">{invoice.hotel.city}, {invoice.hotel.country}</p>
                        </div>
                    </div>
                    
                    <div className="md:text-right animate-in fade-in slide-in-from-right duration-1000">
                        <div className="mb-12">
                            <p className="text-[9px] font-black text-black uppercase tracking-[0.4em] mb-3">Folio Identifier</p>
                            <p className="text-2xl font-serif font-black tracking-widest text-black">#{invoice.invoiceNumber}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-black uppercase tracking-[0.4em] mb-3">Issuance Date</p>
                            <p className="font-serif italic font-black text-black">{new Date(invoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-24 py-16 border-y border-white/5 relative z-10">
                    <div className="space-y-6">
                        <p className="text-[9px] font-black text-black uppercase tracking-[0.4em]">Customer Credentials</p>
                        <div>
                           <p className="text-2xl font-serif font-black uppercase italic mb-2 tracking-tight">{invoice.guest.name}</p>
                           <p className="text-black text-[10px] font-black uppercase tracking-widest">{invoice.guest.email}</p>
                        </div>
                    </div>
                    <div className="md:text-right space-y-6">
                        <p className="text-[9px] font-black text-black uppercase tracking-[0.4em]">Reservation Summary</p>
                        <div>
                           <p className="text-2xl font-serif font-black uppercase italic mb-2 tracking-tight">{invoice.roomType} Suite</p>
                           <p className="text-black text-[10px] font-black uppercase tracking-widest">{invoice.nights} Nights of Excellence</p>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <table className="w-full mb-24 relative z-10">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left py-6 text-[9px] font-black uppercase tracking-[0.4em] text-black">Description of Service</th>
                            <th className="text-right py-6 text-[9px] font-black uppercase tracking-[0.4em] text-black">Timeline</th>
                            <th className="text-right py-6 text-[9px] font-black uppercase tracking-[0.4em] text-black">Settlement</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-white/5">
                            <td className="py-10">
                                <p className="font-serif font-black uppercase italic text-lg mb-1 tracking-tight">Luxury Chamber Rental</p>
                                <p className="text-[9px] font-black text-black uppercase tracking-widest">Premium Allocation & Reservation Protocol</p>
                            </td>
                            <td className="text-right py-10 font-serif italic font-black text-black">
                                {new Date(invoice.checkIn).toLocaleDateString()} — {new Date(invoice.checkOut).toLocaleDateString()}
                            </td>
                            <td className="text-right py-10 font-serif font-black text-2xl text-black">
                                ₹{invoice.totalAmount.toLocaleString()}
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="2" className="text-right pt-16 pb-3 text-[9px] font-black text-black uppercase tracking-[0.5em]">Total Folio Settlement</td>
                            <td className="text-right pt-16 pb-3 text-5xl font-serif font-black italic tracking-tighter">₹{invoice.totalAmount.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td colSpan="2" className="text-right text-[10px] font-black text-black uppercase tracking-[0.5em] italic">Current Status</td>
                            <td className="text-right text-[10px] font-black text-black uppercase tracking-[0.5em] italic">{invoice.status}</td>
                        </tr>
                    </tfoot>
                </table>

                {/* Footer / Security */}
                <div className="bg-[#7FB77E]/5 p-12 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                    <div className="flex items-center gap-6 text-black">
                        <div className="w-16 h-16 rounded-full border border-[#0B2D72]/20 flex items-center justify-center text-black">
                           <ShieldCheck size={32} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-black mb-2">Secure Transaction Anchor</p>
                            <p className="text-xs font-mono break-all opacity-60">ID: {invoice.transactionId}</p>
                        </div>
                    </div>
                </div>

                <div className="text-center pt-16 border-t border-white/5 mt-20 opacity-40">
                    <p className="text-[9px] font-bold text-black uppercase tracking-[0.5em] leading-relaxed italic">
                        Deepest gratitude for selecting the Navan Protocol.<br/>
                        This folio remains our official bond of fulfillment.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Invoice;
