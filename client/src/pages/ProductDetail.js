import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Minus, Plus, ChevronLeft, User, ThumbsUp } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`/products/${id}`);
      setProduct(res.data);
      setSelectedImage(0);
    } catch (err) {
      toast.error('Produk tidak ditemukan');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/login');
      return;
    }
    addToCart(product.id, quantity);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      return;
    }
    try {
      await axios.post('/reviews', {
        productId: product.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      toast.success('Review berhasil ditambahkan');
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: '' });
      fetchProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan review');
    }
  };

  const helpfulReview = async (reviewId) => {
    try {
      await axios.post(`/reviews/${reviewId}/helpful`);
      toast.success('Terima kasih atas feedback Anda');
      fetchProduct();
    } catch (err) {
      toast.error('Gagal');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="skeleton aspect-square rounded-2xl"></div>
          <div className="space-y-4">
            <div className="skeleton h-8 w-3/4"></div>
            <div className="skeleton h-6 w-1/4"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-2/3"></div>
            <div className="skeleton h-12 w-1/3 mt-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ChevronLeft className="w-5 h-5 mr-1" /> Kembali
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
            <img 
              src={product.images[selectedImage]} 
              alt={product.name} 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = `https://via.placeholder.com/600x600?text=${encodeURIComponent(product.name)}`; }}
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto scrollbar-hide">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-teal-500' : 'border-transparent hover:border-gray-300'}`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full capitalize">
              {product.category}
            </span>
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <Heart className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <Share2 className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

          <div className="flex items-center mb-6">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.round(product.avgRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">{product.avgRating || 0} ({product.reviewCount || 0} ulasan)</span>
            <span className="mx-3 text-gray-300">|</span>
            <span className="text-sm text-gray-500">{product.sold || 0} terjual</span>
          </div>

          <div className="mb-6">
            <span className="text-3xl font-bold text-teal-600">Rp {product.price.toLocaleString('id-ID')}</span>
            {product.stock < 10 && product.stock > 0 && (
              <span className="ml-3 text-sm text-red-500 font-medium">Stok tersisa {product.stock}</span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed mb-8">{product.description || 'Tidak ada deskripsi'}</p>

          {/* Seller Info */}
          {product.seller && (
            <div className="flex items-center p-4 bg-gray-50 rounded-2xl mb-8">
              <img src={product.seller.avatar} alt={product.seller.name} className="w-12 h-12 rounded-full bg-gray-200" />
              <div className="ml-3">
                <p className="font-medium text-gray-900">{product.seller.name}</p>
                <p className="text-xs text-gray-500">Penjual</p>
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="flex items-center border border-gray-200 rounded-xl">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-gray-50 rounded-l-xl transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="p-3 hover:bg-gray-50 rounded-r-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Truck, text: 'Pengiriman Cepat' },
              { icon: Shield, text: 'Garansi 30 Hari' },
              { icon: RotateCcw, text: 'Bisa Dikembalikan' }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl">
                <feature.icon className="w-5 h-5 text-teal-600 mb-1" />
                <span className="text-xs text-gray-600">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Ulasan Pembeli</h2>
          {user && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              {showReviewForm ? 'Batal' : 'Tulis Ulasan'}
            </button>
          )}
        </div>

        {showReviewForm && (
          <form onSubmit={submitReview} className="bg-white rounded-2xl shadow-sm p-6 mb-8 animate-fade-in">
            <h3 className="font-semibold text-gray-900 mb-4">Tulis Ulasan Anda</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className="p-1"
                  >
                    <Star className={`w-8 h-8 ${star <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ulasan</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                rows="4"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                placeholder="Bagaimana pengalaman Anda dengan produk ini?"
                required
              />
            </div>
            <button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors">
              Kirim Ulasan
            </button>
          </form>
        )}

        {product.reviews?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-gray-500">Belum ada ulasan untuk produk ini</p>
          </div>
        ) : (
          <div className="space-y-4">
            {product.reviews?.map(review => (
              <div key={review.id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <img src={review.userAvatar} alt={review.userName} className="w-10 h-10 rounded-full bg-gray-200" />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{review.userName}</p>
                      <div className="flex items-center mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                        <span className="text-xs text-gray-400 ml-2">{new Date(review.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                <button 
                  onClick={() => helpfulReview(review.id)}
                  className="flex items-center mt-3 text-sm text-gray-500 hover:text-teal-600 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4 mr-1" /> Membantu ({review.helpful || 0})
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;