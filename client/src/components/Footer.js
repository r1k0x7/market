import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">TokoKita</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Marketplace terpercaya untuk belanja online dengan ribuan produk berkualitas dari penjual terbaik.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Menu</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-teal-400 transition-colors">Beranda</Link></li>
              <li><Link to="/products" className="hover:text-teal-400 transition-colors">Produk</Link></li>
              <li><Link to="/cart" className="hover:text-teal-400 transition-colors">Keranjang</Link></li>
              <li><Link to="/orders" className="hover:text-teal-400 transition-colors">Pesanan</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Bantuan</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-teal-400 transition-colors cursor-pointer">Cara Belanja</span></li>
              <li><span className="hover:text-teal-400 transition-colors cursor-pointer">Pengiriman</span></li>
              <li><span className="hover:text-teal-400 transition-colors cursor-pointer">Pengembalian</span></li>
              <li><span className="hover:text-teal-400 transition-colors cursor-pointer">FAQ</span></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Kontak</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-teal-500" />
                <span>support@tokokita.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-teal-500" />
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-teal-500 mt-0.5" />
                <span>Jakarta, Indonesia</span>
              </li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <Facebook className="w-5 h-5 hover:text-teal-400 cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 hover:text-teal-400 cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 hover:text-teal-400 cursor-pointer transition-colors" />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p> TokoKita Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;