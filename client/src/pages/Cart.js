import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center animate-fade-in">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Keranjang Kosong</h2>
        <p className="text-gray-500 mb-8">Yuk, tambahkan produk ke keranjang Anda</p>
        <Link to="/products" className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors">
          Belanja Sekarang <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Keranjang Belanja</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.productId} className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 flex items-center space-x-4">
              <img 
                src={item.product?.images?.[0]} 
                alt={item.product?.name} 
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-gray-100 flex-shrink-0"
                onError={(e) => { e.target.src = `https://via.placeholder.com/100x100?text=${encodeURIComponent(item.product?.name || '')}`; }}
              />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.productId}`} className="font-medium text-gray-900 hover:text-teal-600 transition-colors line-clamp-2">
                  {item.product?.name}
                </Link>
                <p className="text-teal-600 font-semibold mt-1">Rp {item.product?.price?.toLocaleString('id-ID')}</p>
                <p className="text-xs text-gray-500 mt-1">Stok: {item.product?.stock}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center border border-gray-200 rounded-xl">
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="p-2 hover:bg-gray-50 rounded-l-xl transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 font-medium min-w-[2rem] text-center text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="p-2 hover:bg-gray-50 rounded-r-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={() => removeFromCart(item.productId)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          <button 
            onClick={() => { clearCart(); toast.success('Keranjang dikosongkan'); }}
            className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
          >
            Kosongkan Keranjang
          </button>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Ringkasan Belanja</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Item</span>
                <span className="font-medium">{cart.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">Rp {cart.total?.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ongkir</span>
                <span className="font-medium text-teal-600">Gratis</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-teal-600">Rp {cart.total?.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors shadow-sm"
            >
              Lanjut ke Checkout
            </button>

            <Link to="/products" className="block text-center mt-4 text-sm text-teal-600 hover:text-teal-700 font-medium">
              Lanjutkan Belanja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;