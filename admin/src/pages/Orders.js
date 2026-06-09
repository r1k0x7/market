import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Truck, CheckCircle, Clock, XCircle, Package, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', '20');
      if (statusFilter) params.append('status', statusFilter);
      const res = await axios.get(`/orders?${params.toString()}`);
      setOrders(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Gagal memuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/orders/${id}/status`, { status, trackingNumber: status === 'shipped' ? trackingNumber : undefined });
      toast.success('Status pesanan diperbarui');
      setSelectedOrder(null);
      setTrackingNumber('');
      fetchOrders();
    } catch (err) {
      toast.error('Gagal memperbarui status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing': return <Package className="w-4 h-4 text-blue-500" />;
      case 'shipped': return <Truck className="w-4 h-4 text-purple-500" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    const map = {
      pending: 'bg-yellow-50 text-yellow-700',
      processing: 'bg-blue-50 text-blue-700',
      shipped: 'bg-purple-50 text-purple-700',
      delivered: 'bg-green-50 text-green-700',
      cancelled: 'bg-red-50 text-red-700'
    };
    return map[status] || 'bg-gray-50 text-gray-700';
  };

  const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'pending', label: 'Menunggu' },
    { value: 'processing', label: 'Diproses' },
    { value: 'shipped', label: 'Dikirim' },
    { value: 'delivered', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' }
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pesanan..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pembeli</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 text-sm">#{order.id.slice(-6)}</p>
                      <p className="text-xs text-gray-500">{order.items.length} item</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.user?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Rp {order.total?.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 bg-teal-50 text-teal-700 text-xs font-medium rounded-lg hover:bg-teal-100 transition-colors"
                      >
                        Update
                      </button>
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

      {/* Update Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status Pesanan #{selectedOrder.id.slice(-6)}</h3>

            <div className="space-y-3 mb-6">
              {selectedOrder.status === 'pending' && (
                <button onClick={() => updateStatus(selectedOrder.id, 'processing')} className="w-full flex items-center p-4 border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition-colors text-left">
                  <Package className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Proses Pesanan</p>
                    <p className="text-xs text-gray-500">Tandai sedang diproses</p>
                  </div>
                </button>
              )}

              {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Nomor resi pengiriman"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
                  />
                  <button onClick={() => updateStatus(selectedOrder.id, 'shipped')} disabled={!trackingNumber} className="w-full flex items-center p-4 border-2 border-purple-200 rounded-xl hover:bg-purple-50 transition-colors text-left disabled:opacity-50">
                    <Truck className="w-5 h-5 text-purple-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Kirim Pesanan</p>
                      <p className="text-xs text-gray-500">Tandai sudah dikirim</p>
                    </div>
                  </button>
                </div>
              )}

              {selectedOrder.status === 'shipped' && (
                <button onClick={() => updateStatus(selectedOrder.id, 'delivered')} className="w-full flex items-center p-4 border-2 border-green-200 rounded-xl hover:bg-green-50 transition-colors text-left">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Pesanan Selesai</p>
                    <p className="text-xs text-gray-500">Tandai sudah diterima</p>
                  </div>
                </button>
              )}

              {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                <button onClick={() => updateStatus(selectedOrder.id, 'cancelled')} className="w-full flex items-center p-4 border-2 border-red-200 rounded-xl hover:bg-red-50 transition-colors text-left">
                  <XCircle className="w-5 h-5 text-red-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Batalkan Pesanan</p>
                    <p className="text-xs text-gray-500">Batalkan dan kembalikan stok</p>
                  </div>
                </button>
              )}
            </div>

            <button onClick={() => { setSelectedOrder(null); setTrackingNumber(''); }} className="w-full py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium">
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;