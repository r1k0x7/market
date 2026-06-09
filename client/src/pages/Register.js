import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, User, Mail, Lock, Eye, EyeOff, ArrowRight, ShoppingBag, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'buyer' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.role);
      toast.success('Registrasi berhasil!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Buat Akun</h1>
            <p className="text-gray-500 mt-1">Bergabung dengan TokoKita</p>
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
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Nama Anda"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Minimal 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Daftar Sebagai</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'buyer' })}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${formData.role === 'buyer' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <ShoppingBag className={`w-6 h-6 mb-2 ${formData.role === 'buyer' ? 'text-teal-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${formData.role === 'buyer' ? 'text-teal-700' : 'text-gray-600'}`}>Pembeli</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'seller' })}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${formData.role === 'seller' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <Briefcase className={`w-6 h-6 mb-2 ${formData.role === 'seller' ? 'text-teal-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${formData.role === 'seller' ? 'text-teal-700' : 'text-gray-600'}`}>Penjual</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? 'Memuat...' : <><span>Daftar</span> <ArrowRight className="ml-2 w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-teal-600 font-semibold hover:text-teal-700">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;