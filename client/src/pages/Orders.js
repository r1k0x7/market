import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/orders/my-orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing': return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped': return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    const map = {
      pending: 'Menunggu Konfirmasi',
      processing: 'Diproses',
      shipped: 'Dikirim',
      delivered: 'Selesai',
      cancelled: 'Dibatalkan'
    };
    return map[status] || status;
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Pesanan Saya</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Belum ada pesanan</h3>
          <p className="text-gray-500 mt-1">Yuk, mulai belanja!</p>
          <Link to="/products" className="inline-block mt-4 px-6 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors">
            Belanja Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Order #{order.id.slice(-6)}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1.5">{getStatusText(order.status)}</span>
                  </span>
                </div>

                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-gray-100" onError={(e) => { e.target.src = `https://via.placeholder.com/64x64?text=${encodeURIComponent(item.name)}`; }} />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</p>
                      </div>
                      <p className="font-medium text-gray-900 text-sm">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500">Total Pembayaran</p>
                    <p className="text-lg font-bold text-teal-600">Rp {order.total.toLocaleString('id-ID')}</p>
                  </div>
                  {order.trackingNumber && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">No. Resi</p>
                      <p className="text-sm font-medium text-gray-900">{order.trackingNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;