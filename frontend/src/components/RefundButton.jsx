import { useState } from 'react';
import { api } from '../context/AuthContext';

const RefundButton = ({ bookingId, onRefundSuccess }) => {
    const [loading, setLoading] = useState(false);

    const handleRefund = async () => {
        if (!window.confirm('Are you sure you want to process a refund for this settlement? This action is irreversible.')) return;

        setLoading(true);
        try {
            const { data } = await api.post(`/payments/refund/${bookingId}`);
            alert('Refund successfully processed through the secure corridor.');
            if (onRefundSuccess) onRefundSuccess(data);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Refund operation failed. Please check clearing logs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleRefund}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-gray-900 transition-all disabled:opacity-50 italic"
        >
            {loading ? 'Processing...' : 'Void & Refund'}
        </button>
    );
};

export default RefundButton;
