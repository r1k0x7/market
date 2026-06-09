import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Camera, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Profil berhasil diperbarui');
    } catch (err) {
      toast.error('Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Profil Saya</h1>

      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <img 
              src={user?.avatar} 
              alt={user?.name} 
              className="w-24 h-24 rounded-full bg-gray-200 object-cover"
            />
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-teal-700 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-4">{user?.name}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span className="mt-2 px-3 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full capitalize">
            {user?.role === 'admin' ? 'Administrator' : user?.role === 'seller' ? 'Penjual' : 'Pembeli'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="0812xxxxxxx"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows="3"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                placeholder="Alamat lengkap Anda"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;