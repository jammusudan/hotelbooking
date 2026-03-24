import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchManagerRooms, fetchManagerHotels } from '../../store/slices/managerSlice';
import { api } from '../../context/AuthContext';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Bed, 
  Users, 
  IndianRupee,
  Layers,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';

const Rooms = () => {
  const dispatch = useDispatch();
  const { rooms, hotels, loading } = useSelector((state) => state.manager);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    hotelId: '',
    type: 'Single',
    pricePerNight: '',
    capacity: 1,
    adults: 1,
    children: 0,
    count: 1,
    amenities: '',
    images: [''],
    isMaintenance: false
  });

  useEffect(() => {
    dispatch(fetchManagerRooms());
    dispatch(fetchManagerHotels());
  }, [dispatch]);

  const handleOpenModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        hotelId: room.hotelId._id,
        type: room.type,
        pricePerNight: room.pricePerNight,
        capacity: room.capacity,
        adults: room.adults || 1,
        children: room.children || 0,
        count: room.count,
        amenities: room.amenities.join(', '),
        images: room.images.length > 0 ? room.images : [''],
        isMaintenance: room.isMaintenance || false
      });
    } else {
      setEditingRoom(null);
      setFormData({
        hotelId: hotels.length > 0 ? hotels[0]._id : '',
        type: 'Single',
        pricePerNight: '',
        capacity: 1,
        adults: 1,
        children: 0,
        count: 1,
        amenities: '',
        images: [''],
        isMaintenance: false
      });
    }
    setIsModalOpen(true);
  };

  const handleAddImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const handleRemoveImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const payload = {
        ...formData,
        capacity: parseInt(formData.adults) + parseInt(formData.children),
        amenities: formData.amenities.split(',').map(s => s.trim()).filter(s => s !== ''),
        images: formData.images.filter(img => img.trim() !== ''),
      };

      if (editingRoom) {
        await api.put(`/manager/rooms/${editingRoom._id}`, payload);
      } else {
        await api.post('/manager/rooms', payload);
      }
      
      dispatch(fetchManagerRooms());
      setIsModalOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this room category?')) {
      try {
        await api.delete(`/manager/rooms/${id}`);
        dispatch(fetchManagerRooms());
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting room');
      }
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-serif font-black text-white tracking-tighter uppercase italic">Room Management</h1>
          <div className="h-1.5 w-24 bg-gold-500 mt-4 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)]"></div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-6">Pricing strategy and room availability management.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          disabled={hotels.length === 0}
          className="flex items-center justify-center gap-3 bg-gold-500 text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all shadow-lg shadow-gold-500/20 active:scale-95 group disabled:opacity-30"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span>Add New Room</span>
        </button>
      </header>

      {hotels.length === 0 && !loading && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-[2.5rem] p-8 flex items-start gap-6 animate-in slide-in-from-top-4">
          <AlertCircle className="w-8 h-8 text-amber-500 flex-shrink-0 shadow-lg" />
          <div>
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest">No Hotels Found</h3>
            <p className="text-xs text-amber-500/80 mt-1 font-bold italic leading-relaxed">No hotels detected in your account. You must add a hotel before configuring room inventory.</p>
          </div>
        </div>
      )}

      {loading && rooms.length === 0 ? (
        <div className="flex items-center justify-center py-32 bg-[#111114] rounded-[3rem] border border-gray-800/50 border-dashed">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-gold-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {rooms.map((room) => (
            <div key={room._id} className="bg-[#111114] rounded-[2.5rem] p-8 border border-gray-800/50 hover:border-gold-500/30 transition-all group relative flex flex-col shadow-2xl">
              <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-800/50">
                <div className="p-4 bg-gold-500/10 text-gold-500 rounded-2xl border border-gold-500/20 shadow-inner group-hover:scale-110 transition-transform">
                  <Bed className="w-7 h-7" />
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleOpenModal(room)}
                    className="p-3 bg-gray-900 text-gray-400 hover:text-gold-500 hover:bg-gray-800 rounded-xl transition-all border border-gray-800"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(room._id)}
                    className="p-3 bg-red-500/10 text-red-500/50 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-8 flex-1">
                <h3 className="font-serif font-black text-white text-2xl uppercase italic tracking-tighter flex items-center gap-3">
                  {room.type} Suite
                  {room.isMaintenance && (
                    <span className="bg-red-500/20 text-red-500 text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-red-500/30">Maintenance</span>
                  )}
                </h3>
                <p className="text-[10px] text-gold-500/70 font-black uppercase tracking-[0.2em] mt-2 italic">{room.hotelId?.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-10 pb-8 border-b border-gray-800/50">
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">Rate Tier</p>
                  <div className="flex items-center gap-2 text-white font-serif font-black text-xl">
                    <IndianRupee className="w-4 h-4 text-gold-500" />
                    <span>{room.pricePerNight.toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">Occupancy</p>
                  <div className="flex items-center gap-2 text-gray-300 font-black text-xs uppercase tracking-tighter">
                    <Users className="w-4 h-4 text-gold-500/50" />
                    <span>{room.adults || 1} ADULTS, {room.children || 0} KIDS</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">Inventory</p>
                  <div className="flex items-center gap-2 text-gray-300 font-black text-base uppercase tracking-tighter">
                    <Layers className="w-4 h-4 text-gold-500/50" />
                    <span>{room.count} UNITS</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 mt-auto">
                {room.amenities.map(a => (
                  <span key={a} className="bg-gray-900/50 text-gray-500 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-800 group-hover:border-gold-500/20 transition-colors">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-[#111114] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3rem] border border-gray-800 shadow-2xl p-10 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-serif font-black text-white italic tracking-tighter uppercase">
                {editingRoom ? 'Edit Room Category' : 'Add New Room Category'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2.5 bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all border border-gray-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Select Hotel</label>
                  <select 
                    required 
                    className="w-full px-6 py-4 bg-gray-900/50 border border-gray-800 rounded-2xl focus:border-gold-500/50 outline-none font-bold text-white transition-all shadow-inner appearance-none cursor-pointer"
                    value={formData.hotelId}
                    onChange={(e) => setFormData({ ...formData, hotelId: e.target.value })}
                  >
                    {hotels.map(h => (
                      <option key={h._id} value={h._id} className="bg-[#111114]">{h.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Room Type</label>
                  <select 
                    required 
                    className="w-full px-6 py-4 bg-gray-900/50 border border-gray-800 rounded-2xl focus:border-gold-500/50 outline-none font-bold text-white transition-all shadow-inner appearance-none cursor-pointer"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Single" className="bg-[#111114]">Single</option>
                    <option value="Double" className="bg-[#111114]">Double</option>
                    <option value="Suite" className="bg-[#111114]">Suite</option>
                    <option value="Deluxe" className="bg-[#111114]">Deluxe</option>
                    <option value="Family" className="bg-[#111114]">Family</option>
                    <option value="Penthouse" className="bg-[#111114]">Penthouse</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Nightly Rate (₹)</label>
                  <input 
                    type="number"
                    required 
                    placeholder="0"
                    className="w-full px-6 py-4 bg-gray-900/50 border border-gray-800 rounded-2xl focus:border-gold-500/50 outline-none font-bold text-white transition-all shadow-inner placeholder:text-gray-700"
                    value={formData.pricePerNight}
                    onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Adults</label>
                  <input 
                    type="number"
                    required 
                    min="1"
                    className="w-full px-6 py-4 bg-gray-900/50 border border-gray-800 rounded-2xl focus:border-gold-500/50 outline-none font-bold text-white transition-all shadow-inner placeholder:text-gray-700"
                    value={formData.adults}
                    onChange={(e) => setFormData({ ...formData, adults: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Children</label>
                  <input 
                    type="number"
                    required 
                    min="0"
                    className="w-full px-6 py-4 bg-gray-900/50 border border-gray-800 rounded-2xl focus:border-gold-500/50 outline-none font-bold text-white transition-all shadow-inner placeholder:text-gray-700"
                    value={formData.children}
                    onChange={(e) => setFormData({ ...formData, children: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Room Count</label>
                  <input 
                    type="number"
                    required 
                    placeholder="1"
                    className="w-full px-6 py-4 bg-gray-900/50 border border-gray-800 rounded-2xl focus:border-gold-500/50 outline-none font-bold text-white transition-all shadow-inner placeholder:text-gray-700"
                    value={formData.count}
                    onChange={(e) => setFormData({ ...formData, count: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Room Amenities</label>
                <input 
                  placeholder="Atmosphere Control, Smart Mirror, Vaulted Ceilings..."
                  className="w-full px-6 py-4 bg-gray-900/50 border border-gray-800 rounded-2xl focus:border-gold-500/50 outline-none font-bold text-white transition-all shadow-inner placeholder:text-gray-700 font-mono tracking-tighter"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-4 bg-gray-900/30 p-6 rounded-2xl border border-gray-800 transition-colors hover:border-red-500/30 group">
                <input 
                  type="checkbox" 
                  id="maintenance" 
                  className="w-6 h-6 border-gray-800 bg-gray-900 rounded-lg checked:bg-gold-500 checked:border-gold-500 appearance-none cursor-pointer transition-all flex items-center justify-center after:content-[''] after:hidden checked:after:block after:w-2 after:h-4 after:border-r-2 after:border-b-2 after:border-black after:rotate-45"
                  checked={formData.isMaintenance}
                  onChange={(e) => setFormData({ ...formData, isMaintenance: e.target.checked })}
                />
                <label htmlFor="maintenance" className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] cursor-pointer select-none group-hover:text-red-500 transition-colors">Mark for Maintenance (Disable Inventory)</label>
              </div>

              <button 
                type="submit" 
                disabled={submitLoading}
                className="w-full py-5 bg-gold-500 text-black rounded-2xl font-black uppercase tracking-[0.3em] shadow-2xl shadow-gold-500/20 hover:bg-white active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-4 text-sm mt-8 border border-white/10"
              >
                {submitLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Room Details'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
