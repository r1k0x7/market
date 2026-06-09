import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { CreditCard, Truck, MapPin, ChevronRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'transfer'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    try {
      const items = cart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      await axios.post('/orders', {
        items,
        shippingAddress: `${formData.fullName}, ${formData.phone}, ${formData.address}, ${formData.city}, ${formData.postalCode}`,
        paymentMethod: formData.paymentMethod,
        notes: ''
      });

      clearCart();
      toast.success('Pesanan berhasil dibuat!');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Pengiriman', icon: MapPin },
    { number: 2, title: 'Pembayaran', icon: CreditCard },
    { number: 3, title: 'Konfirmasi', icon: Check }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Progress */}
      <div className="flex items-center justify-between mb-10">
        {steps.map((s, i) => (
          <div key={s.number} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= s.number ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'} font-semibold text-sm transition-colors`}>
              <s.icon className="w-5 h-5" />
            </div>
            <span className={`ml-2 text-sm font-medium hidden sm:block ${step >= s.number ? 'text-teal-600' : 'text-gray-400'}`}>{s.title}</span>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${step > s.number ? 'bg-teal-600' : 'bg-gray-200'}`}></div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 animate-fade-in">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Informasi Pengiriman</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500" placeholder="Nama penerima" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500" placeholder="0812xxxxxxx" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} required rows="3" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 resize-none" placeholder="Jl. Contoh No. 123, RT/RW" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
                      <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500" placeholder="Jakarta" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pos</label>
                      <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500" placeholder="12345" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 animate-fade-in">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Metode Pembayaran</h2>
                <div className="space-y-3">
                  {[
                    { id: 'transfer', name: 'Transfer Bank', desc: 'BCA, Mandiri, BNI' },
                    { id: 'cod', name: 'Bayar di Tempat (COD)', desc: 'Bayar saat barang sampai' },
                    { id: 'ewallet', name: 'E-Wallet', desc: 'GoPay, OVO, DANA' }
                  ].map(method => (
                    <label key={method.id} className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.paymentMethod === method.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="paymentMethod" value={method.id} checked={formData.paymentMethod === method.id} onChange={handleChange} className="w-4 h-4 text-teal-600" />
                      <div className="ml-4">
                        <p className="font-medium text-gray-900">{method.name}</p>
                        <p className="text-sm text-gray-500">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 animate-fade-in">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Konfirmasi Pesanan</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-medium text-gray-900 mb-2">Alamat Pengiriman</h3>
                    <p className="text-sm text-gray-600">{formData.fullName}</p>
                    <p className="text-sm text-gray-600">{formData.phone}</p>
                    <p className="text-sm text-gray-600">{formData.address}, {formData.city}, {formData.postalCode}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-medium text-gray-900 mb-2">Metode Pembayaran</h3>
                    <p className="text-sm text-gray-600 capitalize">{formData.paymentMethod === 'transfer' ? 'Transfer Bank' : formData.paymentMethod === 'cod' ? 'Bayar di Tempat' : 'E-Wallet'}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-6">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                  Kembali
                </button>
              )}
              <button type="submit" disabled={loading} className={`px-6 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 ${step === 1 ? 'ml-auto' : ''}`}>
                {loading ? 'Memproses...' : step === 3 ? 'Buat Pesanan' : 'Lanjutkan'} <ChevronRight className="inline w-4 h-4 ml-1" />
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {cart.items.map(item => (
                <div key={item.productId} className="flex items-center space-x-3">
                  <img src={item.product?.images?.[0]} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.product?.name}</p>
                    <p className="text-xs text-gray-500">{item.quantity} x Rp {item.product?.price?.toLocaleString('id-ID')}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Rp {(item.product?.price * item.quantity)?.toLocaleString('id-ID')}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">Rp {cart.total?.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ongkir</span>
                <span className="font-medium text-teal-600">Gratis</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-teal-600">Rp {cart.total?.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;