import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Package, DollarSign, ShoppingCart, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalSold: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('/products/seller/my-products');
      setProducts(res.data);

      const totalSold = res.data.reduce((sum, p) => sum + (p.sold || 0), 0);
      const totalRevenue = res.data.reduce((sum, p) => sum + ((p.sold || 0) * p.price), 0);
      setStats({ totalProducts: res.data.length, totalSold, totalRevenue });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    try {
      await axios.delete(`/products/${id}`);
      toast.success('Produk dihapus');
      fetchData();
    } catch (err) {
      toast.error('Gagal menghapus produk');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Penjual</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola produk dan pantau penjualan Anda</p>
        </div>
        <Link to="/sell" className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Tambah Produk
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Package, label: 'Total Produk', value: stats.totalProducts, color: 'bg-blue-50 text-blue-600' },
          { icon: ShoppingCart, label: 'Terjual', value: stats.totalSold, color: 'bg-purple-50 text-purple-600' },
          { icon: DollarSign, label: 'Pendapatan', value: `Rp ${stats.totalRevenue.toLocaleString('id-ID')}`, color: 'bg-green-50 text-green-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-6 flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Produk Saya</h2>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-xl"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Belum ada produk</h3>
            <p className="text-gray-500 text-sm mt-1">Mulai jual produk pertama Anda</p>
            <Link to="/sell" className="inline-block mt-4 px-6 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors">
              Jual Produk
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Terjual</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img src={product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" onError={(e) => { e.target.src = `https://via.placeholder.com/40x40?text=${encodeURIComponent(product.name)}`; }} />
                        <span className="font-medium text-gray-900 text-sm">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">Rp {product.price.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.stock}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.sold || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${product.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {product.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link to={`/products/${product.id}`} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => deleteProduct(product.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;