import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="relative h-[80vh] bg-gray-200 overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80" 
        alt="Luxury hotel lobby" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="container mx-auto px-4 absolute inset-0 flex flex-col justify-center">
        <div className="max-w-lg">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-4">Azure Haven Hotel & Spa</h1>
          <p className="text-white/90 text-lg mb-8">Experience luxury defined. Award-winning accommodations, spa services, and dining.</p>
          <Link href="/hotel-booking">
            <Button className="bg-[#AC8A6D] hover:bg-[#AC8A6D]/90 text-white px-6 py-3 rounded-md text-lg transition-colors inline-flex items-center space-x-2">
              <span>Book Your Stay</span>
              <i className="ri-arrow-right-line"></i>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
