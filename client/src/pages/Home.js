import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, TrendingUp, Shield, Truck, Headphones, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);

  const banners = [
    {
      title: 'Diskon Spesial 50%',
      subtitle: 'Untuk produk elektronik pilihan',
      bg: 'from-teal-600 to-teal-800',
      image: 'https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?w=800'
    },
    {
      title: 'Fashion Terbaru',
      subtitle: 'Tampil stylish dengan koleksi 2026',
      bg: 'from-purple-600 to-purple-800',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'
    },
    {
      title: 'Gratis Ongkir',
      subtitle: 'Untuk pembelian di atas Rp 200.000',
      bg: 'from-orange-500 to-orange-700',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800'
    }
  ];

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get('/products?limit=8&sort=popular'),
        axios.get('/categories')
      ]);
      setProducts(productsRes.data.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Banner */}
      <section className="relative h-96 sm:h-[500px] overflow-hidden">
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${index === currentBanner ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${banner.bg} opacity-90`}></div>
            <img src={banner.image} alt={banner.title} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
              <div className="max-w-xl text-white">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">{banner.title}</h1>
                <p className="text-lg sm:text-xl text-white/90 mb-8">{banner.subtitle}</p>
                <Link to="/products" className="inline-flex items-center px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                  Belanja Sekarang <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        ))}

        <button onClick={() => setCurrentBanner(prev => (prev - 1 + banners.length) % banners.length)} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button onClick={() => setCurrentBanner(prev => (prev + 1) % banners.length)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentBanner ? 'bg-white w-8' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Gratis Ongkir', desc: 'Minimal Rp 200rb' },
              { icon: Shield, title: 'Garansi', desc: '30 hari pengembalian' },
              { icon: TrendingUp, title: 'Harga Terbaik', desc: 'Harga kompetitif' },
              { icon: Headphones, title: '24/7 Support', desc: 'Siap membantu' }
            ].map((feature, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{feature.title}</h3>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Kategori Populer</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group"
              >
                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="font-medium text-gray-900 text-sm text-center">{cat.name}</span>
                <span className="text-xs text-gray-500 mt-1">{cat.productCount} produk</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Produk Populer</h2>
            <Link to="/products" className="text-teal-600 font-medium hover:text-teal-700 flex items-center text-sm">
              Lihat Semua <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const ProductCard = ({ product }) => {
  return (
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
        {product.stock === 0 && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-gray-800 text-white text-xs font-bold rounded-lg">Habis</span>
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
};

export default Home;