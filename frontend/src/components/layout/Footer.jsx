import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#FAACBF] text-gray-900 pt-20 pb-10 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Col */}
          <div className="md:col-span-1">
            <Link to="/" className="text-3xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-3 group">
               <div className="w-10 h-10 overflow-hidden rounded-xl bg-white/10 p-1 group-hover:scale-110 transition-transform duration-300">
                 <img src="/logo.png" alt="Navan Logo" className="w-full h-full object-contain filter brightness-0 invert" />
               </div>
               Navan
            </Link>
            <p className="text-gray-900 text-sm leading-relaxed pr-4">
              Experience the pinnacle of luxury and comfort. We curate the world's most extraordinary hotel experiences for the discerning traveler.
            </p>
          </div>

          {/* Links Col 1 */}
          <div>
            <h3 className="text-gray-900 font-bold tracking-wider uppercase mb-6 text-sm">Destinations</h3>
            <ul className="space-y-4 text-sm text-gray-900">
              <li><Link to="/hotels" className="hover:text-gray-900 transition">Paris, France</Link></li>
              <li><Link to="/hotels" className="hover:text-gray-900 transition">Bali, Indonesia</Link></li>
              <li><Link to="/hotels" className="hover:text-gray-900 transition">Maldives</Link></li>
              <li><Link to="/hotels" className="hover:text-gray-900 transition">Dubai, UAE</Link></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h3 className="text-gray-900 font-bold tracking-wider uppercase mb-6 text-sm">Company</h3>
            <ul className="space-y-4 text-sm text-gray-900">
              <li><Link to="/about" className="hover:text-gray-900 transition">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-gray-900 transition">Careers</Link></li>
              <li><Link to="/press" className="hover:text-gray-900 transition">Press Center</Link></li>
              <li><Link to="/contact" className="hover:text-gray-900 transition">Contact</Link></li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div>
            <h3 className="text-gray-900 font-bold tracking-wider uppercase mb-6 text-sm">Newsletter</h3>
            <p className="text-gray-900 text-sm mb-4">Subscribe for exclusive offers and luxury travel inspiration.</p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-gray-800 border-gray-700 text-gray-900 px-4 py-2 w-full focus:outline-none focus:border-[#FE81D4] rounded-l-md"
              />
              <button className="bg-[#FE81D4] hover:bg-[#FE81D4] text-gray-900 px-4 py-2 font-bold transition rounded-r-md">
                →
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-900">
          <p>&copy; {new Date().getFullYear()} Navan. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0 flex-wrap justify-center md:justify-end">
            <Link to="/privacy" className="hover:text-gray-900 transition">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-900 transition">Terms of Service</Link>
            <Link to="/sitemap" className="hover:text-gray-900 transition">Sitemap</Link>
            <span className="text-gray-700">|</span>
            <Link to="/manager/login" className="hover:text-gray-900 transition">Manager Portal</Link>
            <Link to="/admin/login" className="hover:text-gray-900 transition">Admin Console</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
