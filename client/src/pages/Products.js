import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, SlidersHorizontal, Star, ChevronDown, X } from 'lucide-react';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page')) || 1
  });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      params.append('sort', filters.sort);
      params.append('page', filters.page);
      params.append('limit', '12');

      const res = await axios.get(`/products?${params.toString()}`);
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', minPrice: '', maxPrice: '', sort: 'newest', page: 1 });
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Semua Produk</h1>
          <p className="text-gray-500 text-sm mt-1">{pagination.total || 0} produk ditemukan</p>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filter
          </button>

          <div className="relative">
            <select 
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="appearance-none px-4 py-2 pr-10 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <option value="newest">Terbaru</option>
              <option value="price-asc">Harga: Rendah ke Tinggi</option>
              <option value="price-desc">Harga: Tinggi ke Rendah</option>
              <option value="popular">Paling Populer</option>
            </select>
            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {(filters.search || filters.category || filters.minPrice || filters.maxPrice) && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-sm text-gray-500">Filter aktif:</span>
          {filters.search && (
            <span className="inline-flex items-center px-3 py-1 bg-teal-50 text-teal-700 text-xs rounded-full">
              Pencarian: {filters.search} <button onClick={() => updateFilter('search', '')} className="ml-1"><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.category && (
            <span className="inline-flex items-center px-3 py-1 bg-teal-50 text-teal-700 text-xs rounded-full">
              Kategori: {categories.find(c => c.slug === filters.category)?.name} 
              <button onClick={() => updateFilter('category', '')} className="ml-1"><X className="w-3 h-3" /></button>
            </span>
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <span className="inline-flex items-center px-3 py-1 bg-teal-50 text-teal-700 text-xs rounded-full">
              Harga: Rp {filters.minPrice || '0'} - Rp {filters.maxPrice || '∞'}
              <button onClick={() => { updateFilter('minPrice', ''); updateFilter('maxPrice', ''); }} className="ml-1"><X className="w-3 h-3" /></button>
            </span>
          )}
          <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 font-medium">Hapus semua</button>
        </div>
      )}

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        {showFilters && (
          <div className="w-64 flex-shrink-0 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Filter Produk</h3>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Pencarian</label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    placeholder="Cari produk..."
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <div className="space-y-2">
                  <button
                    onClick={() => updateFilter('category', '')}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!filters.category ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    Semua Kategori
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => updateFilter('category', cat.slug)}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.category === cat.slug ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <span className="mr-2">{cat.icon}</span>{cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rentang Harga</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    placeholder="Min"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    placeholder="Max"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <button onClick={clearFilters} className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                Reset Filter
              </button>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  <div className="skeleton h-48 w-full"></div>
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-4 w-3/4"></div>
                    <div className="skeleton h-4 w-1/2"></div>
                    <div className="skeleton h-6 w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Produk tidak ditemukan</h3>
              <p className="text-gray-500 mt-1">Coba ubah filter atau kata kunci pencarian</p>
              <button onClick={clearFilters} className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors">
                Reset Filter
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-10 space-x-2">
                  <button
                    onClick={() => updateFilter('page', Math.max(1, filters.page - 1))}
                    disabled={!pagination.hasPrev}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Sebelumnya
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-600">
                    Halaman {pagination.page} dari {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => updateFilter('page', Math.min(pagination.totalPages, filters.page + 1))}
                    disabled={!pagination.hasNext}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Selanjutnya
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product }) => (
  <Link to={`/products/${product.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    <div className="relative overflow-hidden aspect-square">
      <img 
        src={product.images[0]} 
        alt={product.name} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        onError={(e) => { e.target.src = `https://via.placeholder.com/400x400?text=${encodeURIComponent(product.name)}`; }}
      />
      {product.stock < 10 && product.stock > 0 && (
        <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">Stok Terbatas</span>
      )}
    </div>
    <div className="p-4">
      <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-teal-600 transition-colors">{product.name}</h3>
      <div className="flex items-center mb-2">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.avgRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
          ))}
        </div>
        <span className="text-xs text-gray-500 ml-1">({product.reviewCount || 0})</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-teal-600">Rp {product.price.toLocaleString('id-ID')}</span>
        <span className="text-xs text-gray-400">{product.sold || 0} terjual</span>
      </div>
    </div>
  </Link>
);

export default Products;