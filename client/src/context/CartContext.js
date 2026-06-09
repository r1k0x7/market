import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [cartCount, setCartCount] = useState(0);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('/cart');
      setCart(res.data);
      setCartCount(res.data.items.reduce((sum, item) => sum + item.quantity, 0));
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId, quantity = 1) => {
    try {
      await axios.post('/cart/add', { productId, quantity });
      await fetchCart();
      toast.success('Ditambahkan ke keranjang!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan ke keranjang');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await axios.put(`/cart/update/${productId}`, { quantity });
      await fetchCart();
    } catch (err) {
      toast.error('Gagal memperbarui keranjang');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`/cart/remove/${productId}`);
      await fetchCart();
      toast.success('Item dihapus dari keranjang');
    } catch (err) {
      toast.error('Gagal menghapus item');
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete('/cart/clear');
      setCart({ items: [], total: 0 });
      setCartCount(0);
    } catch (err) {
      toast.error('Gagal mengosongkan keranjang');
    }
  };

  return (
    <CartContext.Provider value={{ cart, cartCount, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};