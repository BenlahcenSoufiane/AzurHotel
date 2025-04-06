import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-[#123C69] text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-[#123C69] font-serif text-xl">A</span>
              </div>
              <span className="font-serif text-xl">Azure Haven</span>
            </div>
            <p className="text-white/80 mb-6">
              A luxury destination offering exceptional accommodations, spa experiences, and fine dining in a breathtaking setting.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <i className="ri-facebook-fill text-lg"></i>
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <i className="ri-instagram-line text-lg"></i>
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <i className="ri-twitter-x-line text-lg"></i>
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <i className="ri-pinterest-line text-lg"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-serif text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-white/80 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/#rooms" className="text-white/80 hover:text-white transition-colors">Accommodations</Link></li>
              <li><Link href="/#spa" className="text-white/80 hover:text-white transition-colors">Spa & Wellness</Link></li>
              <li><Link href="/#restaurant" className="text-white/80 hover:text-white transition-colors">Dining</Link></li>
              <li><Link href="/" className="text-white/80 hover:text-white transition-colors">Special Offers</Link></li>
              <li><Link href="/#contact" className="text-white/80 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-serif text-lg mb-6">Our Services</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Room Service</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Concierge</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Airport Transfer</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Wellness Center</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Event Spaces</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Business Center</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-serif text-lg mb-6">Newsletter</h3>
            <p className="text-white/80 mb-4">
              Subscribe to our newsletter for special offers, latest updates, and exclusive content.
            </p>
            <form className="mb-4">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="px-4 py-2 rounded-l-md w-full focus:outline-none text-neutral-800"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#AC8A6D] hover:bg-[#AC8A6D]/90 text-white px-4 py-2 rounded-r-md transition-colors"
                >
                  <i className="ri-send-plane-fill"></i>
                </button>
              </div>
            </form>
            <p className="text-white/60 text-sm">
              We respect your privacy and never share your information.
            </p>
          </div>
        </div>
        
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Azure Haven Hotel & Spa. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-white/60 text-sm hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-white/60 text-sm hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-white/60 text-sm hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
