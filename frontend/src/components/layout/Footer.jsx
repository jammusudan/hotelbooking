import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-20 pb-10 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Col */}
          <div className="md:col-span-1">
            <Link to="/" className="text-3xl font-serif font-bold text-gold-500 mb-6 flex items-center gap-3 group">
               <div className="w-10 h-10 overflow-hidden rounded-xl bg-white/10 p-1 group-hover:scale-110 transition-transform duration-300">
                 <img src="/logo.png" alt="Navan Logo" className="w-full h-full object-contain filter brightness-0 invert" />
               </div>
               Navan
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed pr-4">
              Experience the pinnacle of luxury and comfort. We curate the world's most extraordinary hotel experiences for the discerning traveler.
            </p>
          </div>

          {/* Links Col 1 */}
          <div>
            <h3 className="text-white font-bold tracking-wider uppercase mb-6 text-sm">Destinations</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/hotels" className="hover:text-gold-500 transition">Paris, France</Link></li>
              <li><Link to="/hotels" className="hover:text-gold-500 transition">Bali, Indonesia</Link></li>
              <li><Link to="/hotels" className="hover:text-gold-500 transition">Maldives</Link></li>
              <li><Link to="/hotels" className="hover:text-gold-500 transition">Dubai, UAE</Link></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h3 className="text-white font-bold tracking-wider uppercase mb-6 text-sm">Company</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-gold-500 transition">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-gold-500 transition">Careers</Link></li>
              <li><Link to="/press" className="hover:text-gold-500 transition">Press Center</Link></li>
              <li><Link to="/contact" className="hover:text-gold-500 transition">Contact</Link></li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div>
            <h3 className="text-white font-bold tracking-wider uppercase mb-6 text-sm">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">Subscribe for exclusive offers and luxury travel inspiration.</p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-gray-800 border-gray-700 text-white px-4 py-2 w-full focus:outline-none focus:border-gold-500 rounded-l-md"
              />
              <button className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 font-bold transition rounded-r-md">
                →
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Navan. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition">Terms of Service</Link>
            <Link to="/sitemap" className="hover:text-white transition">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
