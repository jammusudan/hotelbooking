import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchManagerHotels } from '../../store/slices/managerSlice';
import { api } from '../../context/AuthContext';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Image as ImageIcon, 
  MapPin, 
  Star,
  X,
  Loader2
} from 'lucide-react';
import { getHotelImage } from '../../utils/imageHelper';

const Hotels = () => {
  const dispatch = useDispatch();
  const { hotels, loading } = useSelector((state) => state.manager);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    country: '',
    amenities: '',
    images: [''],
  });

  useEffect(() => {
    dispatch(fetchManagerHotels());
  }, [dispatch]);

  const handleOpenModal = (hotel = null) => {
    if (hotel) {
      setEditingHotel(hotel);
      setFormData({
        name: hotel.name,
        description: hotel.description,
        address: hotel.address,
        city: hotel.city,
        country: hotel.country,
        amenities: hotel.amenities.join(', '),
        images: hotel.images.length > 0 ? hotel.images : [''],
      });
    } else {
      setEditingHotel(null);
      setFormData({
        name: '',
        description: '',
        address: '',
        city: '',
        country: '',
        amenities: '',
        images: [''],
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
        amenities: formData.amenities.split(',').map(s => s.trim()).filter(s => s !== ''),
        images: formData.images.filter(img => img.trim() !== ''),
      };

      if (editingHotel) {
        await api.put(`/manager/hotels/${editingHotel._id}`, payload);
      } else {
        await api.post('/manager/hotels', payload);
      }
      
      dispatch(fetchManagerHotels());
      setIsModalOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this hotel? All associated rooms will also be deleted.')) {
      try {
        await api.delete(`/manager/hotels/${id}`);
        dispatch(fetchManagerHotels());
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting hotel');
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-serif font-black text-black tracking-tighter uppercase italic">Hotel Portfolio</h1>
          <div className="h-1.5 w-24 bg-transparent mt-4 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)]"></div>
          <p className="text-[10px] font-black text-black uppercase tracking-[0.3em] mt-6">Manage and curate your verified properties.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-3 bg-transparent text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#EDF7BD] hover:text-black transition-all shadow-lg shadow-transparent/20 active:scale-95 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span>Add New Hotel</span>
        </button>
      </header>

      {loading && hotels.length === 0 ? (
        <div className="flex items-center justify-center py-32 bg-transparent rounded-[3rem] border border-gray-800/50 border-dashed">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {hotels.map((hotel) => (
            <div key={hotel._id} className="bg-transparent rounded-[2.5rem] overflow-hidden border border-gray-800/50 hover:border-transparent/30 transition-all group relative flex flex-col">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={getHotelImage(hotel)} 
                  alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[20%] group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent opacity-80"></div>
                
                <div className="absolute top-6 right-6 flex gap-2">
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-xl backdrop-blur-md ${
                    hotel.isApproved 
                    ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                  }`}>
                    {hotel.isApproved ? 'Verified Hotel' : 'Awaiting Approval'}
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-1 text-black mb-2">
                    <Star className="w-3.5 h-3.5 fill-current shadow-lg" />
                    <span className="text-xs font-black tracking-tighter">{hotel.rating || 'N/A'} RATING</span>
                  </div>
                  <h3 className="text-2xl font-serif font-black text-black italic tracking-tighter uppercase">{hotel.name}</h3>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-black text-[10px] font-black uppercase tracking-widest mb-6 border-b border-gray-800 pb-4">
                  <MapPin className="w-3.5 h-3.5 text-black" />
                  <span className="truncate">{hotel.city}, {hotel.country}</span>
                </div>

                <p className="text-black text-xs line-clamp-3 italic leading-relaxed mb-8 flex-1">
                  "{hotel.description}"
                </p>

                <div className="mt-auto grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleOpenModal(hotel)}
                    className="flex items-center justify-center gap-2 py-3.5 bg-gray-800/30 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-transparent hover:text-black transition-all border border-gray-700/50"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(hotel._id)}
                    className="flex items-center justify-center gap-2 py-3.5 border border-red-500/20 text-red-500/70 hover:bg-red-500 hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    De-list
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hotel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#EDF7BD]/60 backdrop-blur-xl" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-transparent w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3rem] border border-gray-800 shadow-2xl p-10 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-serif font-black text-black italic tracking-tighter uppercase">
                {editingHotel ? 'Edit Hotel Details' : 'Add New Hotel'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2.5 bg-[#EDF7BD] text-black hover:text-black hover:bg-gray-800 rounded-xl transition-all border border-gray-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-black uppercase tracking-[0.3em] ml-2">Hotel Name</label>
                  <input 
                    required 
                    placeholder="e.g. Royal Grand Conservatory"
                    className="w-full px-6 py-4 bg-[#EDF7BD]/50 border border-gray-800 rounded-2xl focus:border-transparent/50 outline-none font-bold text-black transition-all shadow-inner placeholder:text-black"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-black uppercase tracking-[0.3em] ml-2">City</label>
                  <input 
                    required 
                    placeholder="e.g. Monte Carlo"
                    className="w-full px-6 py-4 bg-[#EDF7BD]/50 border border-gray-800 rounded-2xl focus:border-transparent/50 outline-none font-bold text-black transition-all shadow-inner placeholder:text-black"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-black uppercase tracking-[0.3em] ml-2">Description</label>
                <textarea 
                  required 
                  rows="4"
                  className="w-full px-6 py-4 bg-[#EDF7BD]/50 border border-gray-800 rounded-2xl focus:border-transparent/50 outline-none font-bold text-black transition-all shadow-inner placeholder:text-black resize-none italic"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the architectural significance and luxury allure..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-black uppercase tracking-[0.3em] ml-2">Address</label>
                  <input 
                    required 
                    className="w-full px-6 py-4 bg-[#EDF7BD]/50 border border-gray-800 rounded-2xl focus:border-transparent/50 outline-none font-bold text-black transition-all shadow-inner placeholder:text-black"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-black uppercase tracking-[0.3em] ml-2">Country</label>
                  <input 
                    required 
                    className="w-full px-6 py-4 bg-[#EDF7BD]/50 border border-gray-800 rounded-2xl focus:border-transparent/50 outline-none font-bold text-black transition-all shadow-inner placeholder:text-black"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-black uppercase tracking-[0.3em] ml-2">Hotel Amenities</label>
                <input 
                  placeholder="Private Grotto, Michelin Star Kitchen, Helipad..."
                  className="w-full px-6 py-4 bg-[#EDF7BD]/50 border border-gray-800 rounded-2xl focus:border-transparent/50 outline-none font-bold text-black transition-all shadow-inner placeholder:text-black font-mono tracking-tighter"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                />
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <label className="text-[10px] font-black text-black uppercase tracking-[0.3em] ml-2 font-serif">Visual Assets (Gallery)</label>
                  <button 
                    type="button" 
                    onClick={handleAddImageField}
                    className="text-[10px] font-black text-black hover:text-black uppercase tracking-widest flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Image URL
                  </button>
                </div>
                {formData.images.map((img, idx) => (
                  <div key={idx} className="flex gap-4 animate-in slide-in-from-left-4 duration-300">
                    <div className="relative flex-1">
                      <ImageIcon className="absolute left-6 top-5 w-4 h-4 text-black" />
                      <input 
                        className="w-full pl-14 pr-6 py-4 bg-[#EDF7BD]/50 border border-gray-800 rounded-2xl focus:border-transparent/50 outline-none font-bold text-black transition-all text-sm placeholder:text-black"
                        placeholder="https://lux-vault.com/property-shot-1.jpg"
                        value={img}
                        onChange={(e) => handleImageChange(idx, e.target.value)}
                      />
                    </div>
                    {formData.images.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveImageField(idx)}
                        className="p-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-black rounded-2xl transition-all border border-red-500/20 shadow-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button 
                type="submit" 
                disabled={submitLoading}
                className="w-full py-5 bg-transparent text-black rounded-2xl font-black uppercase tracking-[0.3em] shadow-2xl shadow-transparent/20 hover:bg-[#EDF7BD] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-4 text-sm mt-8 border border-white/10"
              >
                {submitLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Hotel Details'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hotels;
