import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Eye, Ban, CheckCircle, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [moderateModal, setModerateModal] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/admin/products?page=${page}&search=${search}`);
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  const moderateProduct = async (id, status, reason = '') => {
    try {
      await axios.put(`/admin/products/${id}/moderate`, { status, reason });
      toast.success(`Produk ${status === 'active' ? 'diaktifkan' : 'dinonaktifkan'}`);
      setModerateModal(null);
      fetchProducts();
    } catch (err) {
      toast.error('Gagal memoderasi produk');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari produk..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penjual</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img src={product.images?.[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" onError={(e) => { e.target.src = `https://via.placeholder.com/40x40?text=${encodeURIComponent(product.name)}`; }} />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.sellerName}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Rp {product.price?.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${product.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {product.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <a href={`http://localhost:3000/products/${product.id}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </a>
                        {product.status === 'active' ? (
                          <button onClick={() => setModerateModal(product)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Nonaktifkan">
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => moderateProduct(product.id, 'active')} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Aktifkan">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex justify-center p-4 space-x-2 border-t border-gray-100">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={!pagination.hasPrev} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm disabled:opacity-50">Sebelumnya</button>
            <span className="px-4 py-2 text-sm text-gray-600">Halaman {pagination.page} dari {pagination.totalPages}</span>
            <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={!pagination.hasNext} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm disabled:opacity-50">Selanjutnya</button>
          </div>
        )}
      </div>

      {/* Moderate Modal */}
      {moderateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-fade-in">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Nonaktifkan Produk</h3>
            </div>
            <p className="text-gray-600 mb-4">Apakah Anda yakin ingin menonaktifkan produk "{moderateModal.name}"?</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setModerateModal(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Batal</button>
              <button onClick={() => moderateProduct(moderateModal.id, 'inactive', 'Dinonaktifkan oleh admin')} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">Nonaktifkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;