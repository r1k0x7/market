import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: Users, label: 'Total Pengguna', value: stats?.totalUsers || 0, color: 'bg-blue-500', trend: '+12%' },
    { icon: Package, label: 'Total Produk', value: stats?.totalProducts || 0, color: 'bg-purple-500', trend: '+8%' },
    { icon: ShoppingCart, label: 'Total Pesanan', value: stats?.totalOrders || 0, color: 'bg-orange-500', trend: '+24%' },
    { icon: DollarSign, label: 'Total Pendapatan', value: `Rp ${(stats?.totalRevenue || 0).toLocaleString('id-ID')}`, color: 'bg-green-500', trend: '+18%' }
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-2xl"></div>
            ))
          : statCards.map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <span className="inline-flex items-center text-xs font-medium text-green-600 mt-2">
                      <TrendingUp className="w-3 h-3 mr-1" /> {stat.trend}
                    </span>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Aktivitas Terbaru</h2>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-12 rounded-xl"></div>
              ))}
            </div>
          ) : stats?.recentOrders?.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada aktivitas</p>
          ) : (
            <div className="space-y-3">
              {stats?.recentOrders?.map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${order.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                      <ShoppingCart className={`w-5 h-5 ${order.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order #{order.id.slice(-6)}</p>
                      <p className="text-xs text-gray-500">{order.userName} • {new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">Rp {order.total.toLocaleString('id-ID')}</p>
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${order.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Peringatan</h2>
            <div className="space-y-3">
              {stats?.pendingOrders > 0 && (
                <div className="flex items-center p-3 bg-yellow-50 rounded-xl">
                  <Clock className="w-5 h-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">{stats.pendingOrders} pesanan menunggu</p>
                    <p className="text-xs text-yellow-600">Perlu diproses segera</p>
                  </div>
                </div>
              )}
              {stats?.lowStockProducts > 0 && (
                <div className="flex items-center p-3 bg-red-50 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-red-800">{stats.lowStockProducts} produk stok rendah</p>
                    <p className="text-xs text-red-600">Perlu restock</p>
                  </div>
                </div>
              )}
              {(!stats?.pendingOrders && !stats?.lowStockProducts) && (
                <p className="text-gray-500 text-sm text-center py-4">Tidak ada peringatan</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hari Ini</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pesanan Baru</span>
                <span className="text-lg font-bold text-gray-900">{stats?.todayOrders || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pendapatan</span>
                <span className="text-lg font-bold text-teal-600">Rp {(stats?.todayRevenue || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pengguna Baru</span>
                <span className="text-lg font-bold text-gray-900">{stats?.newUsersToday || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;