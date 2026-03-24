import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchManagerReviews } from '../../store/slices/managerSlice';
import { api } from '../../context/AuthContext';
import { 
  Star,
  MessageSquare,
  Hotel,
  User,
  Reply,
  Loader2,
  CheckCircle2,
  Clock,
  Send,
  X
} from 'lucide-react';

const Reviews = () => {
  const dispatch = useDispatch();
  const { reviews, loading } = useSelector((state) => state.manager);
  const [replyText, setReplyText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchManagerReviews());
  }, [dispatch]);

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) return;
    setSubmitLoading(true);
    try {
      await api.post('/manager/reviews/reply', { 
        reviewId, 
        managerResponse: replyText 
      });
      dispatch(fetchManagerReviews());
      setActiveReplyId(null);
      setReplyText('');
    } catch (error) {
      alert('Error sending reply');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 font-sans text-white">
      <header className="mb-12">
        <h1 className="text-4xl font-serif font-black text-white tracking-tighter uppercase italic">Legacy Testimonials</h1>
        <div className="h-1.5 w-24 bg-[#0B2D72] mt-4 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)]"></div>
        <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] mt-6">Protocol established: Reviewing patron feedback and aesthetic sentiment.</p>
      </header>

      {loading && reviews.length === 0 ? (
        <div className="flex items-center justify-center py-32 bg-[#111114] rounded-[3rem] border border-gray-800/50 border-dashed">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#0B2D72]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {reviews.map((review) => (
            <div key={review._id} className="bg-[#111114] rounded-[2.5rem] p-10 border border-gray-800/50 hover:border-[#0B2D72]/30 transition-all group relative flex flex-col shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0B2D72]/5 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:bg-[#0B2D72]/10"></div>
              
              <div className="mb-10 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#0AC4E0] border border-gray-800 flex items-center justify-center text-white font-black shadow-inner group-hover:scale-110 transition-transform">
                    {review.userId?.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-white text-lg italic tracking-tight uppercase">{review.userId?.name}</h3>
                    <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mt-1 italic">Verified Guest</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 ${i < review.rating ? 'fill-[#0B2D72] text-white' : 'text-gray-800 shadow-inner'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest italic">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mb-10 flex-1 relative">
                <div className="flex items-center gap-2 text-white/40 mb-4">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest italic">Guest Narrative</span>
                </div>
                <blockquote className="text-white text-sm leading-relaxed italic font-medium group-hover:text-white transition-colors">
                  "{review.comment}"
                </blockquote>

                {review.managerResponse && (
                  <div className="mt-8 bg-[#0B2D72]/5 p-6 rounded-2xl border border-[#0B2D72]/10 animate-in slide-in-from-top-4">
                    <div className="flex items-center gap-3 text-white mb-2">
                      <Reply className="w-3.5 h-3.5 rotate-180" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Protocol Response</span>
                    </div>
                    <p className="text-xs text-white italic font-medium leading-relaxed">{review.managerResponse}</p>
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-gray-800/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Hotel className="w-4 h-4 text-white/40 flex-shrink-0" />
                    <p className="text-[9px] font-black text-white uppercase tracking-widest group-hover:text-white/60 transition-colors truncate">{review.hotelId?.name}</p>
                  </div>
                  {!review.managerResponse && activeReplyId !== review._id && (
                    <button 
                      onClick={() => setActiveReplyId(review._id)}
                      className="text-[9px] font-black text-white hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2 bg-[#0B2D72]/10 px-4 py-2 rounded-xl border border-[#0B2D72]/10 hover:bg-[#0B2D72] hover:text-black"
                    >
                      <Reply className="w-3.5 h-3.5" /> Initialize Response
                    </button>
                  )}
                </div>

                {activeReplyId === review._id && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-white uppercase tracking-widest italic">Drafting Protocol</span>
                      <button onClick={() => setActiveReplyId(null)} className="text-white hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea 
                      className="w-full p-6 bg-[#0AC4E0]/50 border border-gray-800 rounded-2xl focus:border-[#0B2D72]/50 outline-none text-sm font-bold text-white transition-all shadow-inner placeholder:text-gray-800 resize-none italic"
                      placeholder="Address the patron's narrative..."
                      rows="3"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <button 
                        onClick={() => handleReply(review._id)}
                        disabled={submitLoading || !replyText.trim()}
                        className="flex items-center gap-3 bg-[#0B2D72] text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-30 shadow-lg shadow-[#0B2D72]/20"
                      >
                        {submitLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        Transmit Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {reviews.length === 0 && !loading && (
        <div className="text-center py-32 bg-[#111114] rounded-[3rem] border border-gray-800/50 border-dashed group">
          <MessageSquare className="w-16 h-16 text-gray-800 mx-auto mb-8 group-hover:text-white/20 transition-colors animate-pulse" />
          <p className="text-gray-600 font-bold uppercase tracking-[0.3em] text-[10px] italic">Telemetry null: No guest testimonials retrieved.</p>
        </div>
      )}
    </div>
  );
};

export default Reviews;
