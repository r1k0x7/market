import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload, Plus, X, Tag, DollarSign, Package, FileText, Image } from 'lucide-react';
import toast from 'react-hot-toast';

const SellProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'elektronik',
    condition: 'new'
  });

  const categories = [
    { value: 'elektronik', label: '💻 Elektronik' },
    { value: 'fashion', label: '👕 Fashion' },
    { value: 'makanan', label: '🍔 Makanan' },
    { value: 'rumah-tangga', label: '🏠 Rumah Tangga' },
    { value: 'olahraga', label: '⚽ Olahraga' },
    { value: 'kesehatan', label: '💊 Kesehatan' }
  ];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error('Maksimal 5 gambar');
      return;
    }
    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      images.forEach(img => data.append('images', img));

      await axios.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Produk berhasil ditambahkan!');
      navigate('/seller/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan produk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Jual Produk</h1>
      <p className="text-gray-500 mb-8">Tambahkan produk baru ke toko Anda</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Foto Produk (Maks. 5)</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-colors">
                <Plus className="w-8 h-8 text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">Tambah</span>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
          <div className="relative">
            <Tag className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              placeholder="Nama produk Anda"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <div className="relative">
            <FileText className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="4"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
              placeholder="Deskripsikan produk Anda..."
            />
          </div>
        </div>

        {/* Price & Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                min="0"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="100000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
            <div className="relative">
              <Package className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
                min="0"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="10"
              />
            </div>
          </div>
        </div>

        {/* Category & Condition */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi</label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            >
              <option value="new">Baru</option>
              <option value="used">Bekas</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          <Upload className="w-5 h-5 mr-2" />
          {loading ? 'Mengunggah...' : 'Jual Produk'}
        </button>
      </form>
    </div>
  );
};

export default SellProduct;