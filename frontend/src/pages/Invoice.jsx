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
        <div className="min-h-screen flex items-center justify-center bg-[#EDF7BD]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-transparent"></div>
        </div>
    );

    if (!invoice) return null;

    return (
        <div className="min-h-screen bg-[#EDF7BD] py-12 md:py-24 px-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-transparent/5 blur-[150px] pointer-events-none"></div>
            
            {/* Action Bar */}
            <div className="max-w-4xl mx-auto mb-8 md:mb-12 flex flex-col sm:flex-row items-center justify-between gap-6 print:hidden">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-3 text-black hover:text-black transition-all group self-start sm:self-auto"
                >
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-black/10 flex items-center justify-center group-hover:border-transparent/50 group-hover:bg-black/5 transition-all text-black">
                       <ArrowLeft size={14} className="md:size-4" />
                    </div>
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em]">Back to Folio</span>
                </button>
                
                <button 
                    onClick={handlePrint}
                    className="w-full sm:w-auto flex items-center justify-center gap-4 px-8 py-4 md:px-10 md:py-5 bg-transparent text-black border border-black/10 rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-[0.4em] hover:bg-black/5 transition-all shadow-lg active:scale-95"
                >
                    <Printer size={14} className="md:size-4" />
                    Print Settlement
                </button>
            </div>

            {/* Invoice Document */}
            <div className="max-w-4xl mx-auto bg-[#003049] text-white p-6 sm:p-12 md:p-24 shadow-2xl rounded-[2rem] md:rounded-[3rem] border border-white/10 relative overflow-hidden print:shadow-none print:p-0 print:bg-white print:text-black">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-transparent to-transparent opacity-50"></div>
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between gap-10 md:gap-16 mb-16 md:mb-24 relative z-10">
                    <div className="animate-in fade-in slide-in-from-left duration-1000">
                        <div className="flex items-center gap-4 mb-4 md:mb-6">
                            <div className="w-10 h-10 md:w-12 md:h-12 overflow-hidden rounded-xl bg-white/10 p-1 border border-white/10 shadow-inner">
                                <img src="/logo.png" alt="Navan Logo" className="w-full h-full object-contain" />
                            </div>
                            <h1 className="text-2xl md:text-4xl font-serif font-black uppercase tracking-tighter italic">Navan</h1>
                        </div>
                        <p className="text-[9px] md:text-[10px] font-black text-white/60 uppercase tracking-[0.5em] mb-8 md:mb-12">Official Invoice</p>
                        
                        <div className="space-y-2 text-sm">
                            <p className="font-serif italic text-white text-base md:text-lg uppercase font-black">{invoice.hotel.name}</p>
                            <p className="text-white font-medium opacity-80 text-xs md:text-sm">{invoice.hotel.address}</p>
                            <p className="text-white font-medium opacity-80 text-xs md:text-sm">{invoice.hotel.city}, {invoice.hotel.country}</p>
                        </div>
                    </div>
                    
                    <div className="md:text-right animate-in fade-in slide-in-from-right duration-1000">
                        <div className="mb-8 md:mb-12">
                            <p className="text-[8px] md:text-[9px] font-black text-white/60 uppercase tracking-[0.4em] mb-2 md:mb-3">Folio Identifier</p>
                            <p className="text-xl md:text-2xl font-serif font-black tracking-widest text-white">#{invoice.invoiceNumber}</p>
                        </div>
                        <div>
                            <p className="text-[8px] md:text-[9px] font-black text-white/60 uppercase tracking-[0.4em] mb-2 md:mb-3">Issuance Date</p>
                            <p className="font-serif italic font-black text-white text-sm md:text-base">{new Date(invoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 mb-16 md:mb-24 py-10 md:py-16 border-y border-white/5 relative z-10">
                    <div className="space-y-4 md:space-y-6">
                        <p className="text-[8px] md:text-[9px] font-black text-white/60 uppercase tracking-[0.4em]">Customer Credentials</p>
                        <div>
                           <p className="text-xl md:text-2xl font-serif font-black uppercase italic mb-1 md:mb-2 tracking-tight">{invoice.guest.name}</p>
                           <p className="text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest">{invoice.guest.email}</p>
                        </div>
                    </div>
                    <div className="md:text-right space-y-4 md:space-y-6">
                        <p className="text-[8px] md:text-[9px] font-black text-white/60 uppercase tracking-[0.4em]">Reservation Summary</p>
                        <div>
                           <p className="text-xl md:text-2xl font-serif font-black uppercase italic mb-1 md:mb-2 tracking-tight">{invoice.roomType} Suite</p>
                           <p className="text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest">{invoice.nights} Nights of Excellence</p>
                        </div>
                    </div>
                </div>

                {/* Table for Desktop, Cards for Mobile */}
                <div className="mb-16 md:mb-24 relative z-10">
                    {/* Desktop Table */}
                    <table className="hidden md:table w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-6 text-[9px] font-black uppercase tracking-[0.4em] text-white">Description of Service</th>
                                <th className="text-right py-6 text-[9px] font-black uppercase tracking-[0.4em] text-white">Timeline</th>
                                <th className="text-right py-6 text-[9px] font-black uppercase tracking-[0.4em] text-white">Settlement</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-white/5">
                                <td className="py-10">
                                    <p className="font-serif font-black uppercase italic text-lg mb-1 tracking-tight">Luxury Chamber Rental</p>
                                    <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Premium Allocation & Reservation Protocol</p>
                                </td>
                                <td className="text-right py-10 font-serif italic font-black text-white">
                                    {new Date(invoice.checkIn).toLocaleDateString()} — {new Date(invoice.checkOut).toLocaleDateString()}
                                </td>
                                <td className="text-right py-10 font-serif font-black text-2xl text-white">
                                    ₹{invoice.totalAmount.toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="2" className="text-right pt-16 pb-3 text-[9px] font-black text-white uppercase tracking-[0.5em]">Total Folio Settlement</td>
                                <td className="text-right pt-16 pb-3 text-5xl font-serif font-black italic tracking-tighter">₹{invoice.totalAmount.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td colSpan="2" className="text-right text-[10px] font-black text-white/60 uppercase tracking-[0.5em] italic">Current Status</td>
                                <td className="text-right text-[10px] font-black text-white uppercase tracking-[0.5em] italic">{invoice.status}</td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Mobile View */}
                    <div className="md:hidden space-y-10">
                        <div className="pb-8 border-b border-white/10">
                            <p className="text-[8px] font-black text-white/60 uppercase tracking-[0.4em] mb-4">Service Description</p>
                            <p className="font-serif font-black uppercase italic text-lg mb-1 tracking-tight">Luxury Chamber Rental</p>
                            <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-6">Premium Allocation & Reservation Protocol</p>
                            
                            <div className="flex justify-between items-end gap-4">
                                <div>
                                    <p className="text-[8px] font-black text-white/60 uppercase tracking-[0.4em] mb-2">Timeline</p>
                                    <p className="font-serif italic font-black text-white text-sm">
                                        {new Date(invoice.checkIn).toLocaleDateString()} — {new Date(invoice.checkOut).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-white/60 uppercase tracking-[0.4em] mb-2">Settlement</p>
                                    <p className="font-serif font-black text-2xl text-white">₹{invoice.totalAmount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 space-y-6">
                            <div className="flex justify-between items-center text-right">
                                <p className="text-[8px] font-black text-white/60 uppercase tracking-[0.5em]">Total Settlement</p>
                                <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em] italic leading-tight">Current Status: {invoice.status}</p>
                            </div>
                            <p className="text-4xl text-right font-serif font-black italic tracking-tighter">₹{invoice.totalAmount.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Footer / Security */}
                <div className="bg-white/5 p-8 md:p-12 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 md:gap-10 relative z-10">
                    <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 text-white w-full">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/10 flex items-center justify-center text-white shrink-0">
                           <ShieldCheck size={24} className="md:size-8" />
                        </div>
                        <div className="overflow-hidden w-full">
                            <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.5em] text-white/60 mb-2">Secure Transaction Anchor</p>
                            <p className="text-[10px] md:text-xs font-mono break-all opacity-60">ID: {invoice.transactionId}</p>
                        </div>
                    </div>
                </div>

                <div className="text-center pt-10 md:pt-16 border-t border-white/5 mt-12 md:mt-20 opacity-40">
                    <p className="text-[8px] md:text-[9px] font-bold text-white uppercase tracking-[0.5em] leading-relaxed italic">
                        Deepest gratitude for selecting the Navan Protocol.<br className="hidden md:block"/>
                        This folio remains our official bond of fulfillment.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Invoice;
