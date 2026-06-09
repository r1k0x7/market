import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, UserCheck, UserX, Shield, ShoppingBag, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', '20');
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      const res = await axios.get(`/admin/users?${params.toString()}`);
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Gagal memuat pengguna');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      await axios.put(`/admin/users/${id}/status`, { isActive: !currentStatus });
      toast.success(`User ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
      fetchUsers();
    } catch (err) {
      toast.error('Gagal memperbarui status');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4 text-purple-500" />;
      case 'seller': return <Briefcase className="w-4 h-4 text-blue-500" />;
      default: return <ShoppingBag className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role) => {
    const map = {
      admin: 'bg-purple-50 text-purple-700',
      seller: 'bg-blue-50 text-blue-700',
      buyer: 'bg-gray-50 text-gray-700'
    };
    return map[role] || 'bg-gray-50 text-gray-700';
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex space-x-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
              placeholder="Cari pengguna..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button onClick={fetchUsers} className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors">
            Cari
          </button>
        </div>
        <div className="flex space-x-2">
          {['', 'buyer', 'seller', 'admin'].map(role => (
            <button
              key={role}
              onClick={() => { setRoleFilter(role); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${roleFilter === role ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {role === '' ? 'Semua' : role === 'buyer' ? 'Pembeli' : role === 'seller' ? 'Penjual' : 'Admin'}
            </button>
          ))}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pengguna</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bergabung</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img src={user.avatar} alt="" className="w-10 h-10 rounded-full bg-gray-200" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1 capitalize">{user.role === 'buyer' ? 'Pembeli' : user.role === 'seller' ? 'Penjual' : 'Admin'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {user.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => toggleUserStatus(user.id, user.isActive)}
                          className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                        >
                          {user.isActive ? <><UserX className="w-3.5 h-3.5 mr-1" /> Nonaktifkan</> : <><UserCheck className="w-3.5 h-3.5 mr-1" /> Aktifkan</>}
                        </button>
                      )}
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
    </div>
  );
};

export default Users;