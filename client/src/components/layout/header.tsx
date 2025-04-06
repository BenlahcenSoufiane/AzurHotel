import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface NavLink {
  href: string;
  label: string;
  onClick?: () => void;
}

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    closeMobileMenu();
  };

  const navLinks: NavLink[] = [
    { href: "/", label: "Home" },
    { href: "#rooms", label: "Rooms" },
    { href: "#spa", label: "Spa" },
    { href: "#restaurant", label: "Restaurant" },
    { href: "#contact", label: "Contact" },
  ];

  // Additional links based on auth status
  const authLinks: NavLink[] = user 
    ? [
        ...(user.role === 'admin' ? [{ href: "/admin/dashboard", label: "Admin Dashboard" }] : []),
        { href: "#", label: "Logout", onClick: handleLogout }
      ]
    : [
        { href: "/auth", label: "Login/Register" }
      ];

  return (
    <header className="bg-white shadow-sm fixed w-full z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-[#123C69] rounded-full flex items-center justify-center">
            <span className="text-white font-serif text-xl">A</span>
          </div>
          <span className="font-serif text-xl text-[#123C69]">Azure Haven</span>
        </Link>
        
        <nav className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "text-neutral-700 hover:text-[#123C69] transition-colors",
                location === link.href && "text-[#123C69] font-medium"
              )}
            >
              {link.label}
            </Link>
          ))}
          {authLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "text-neutral-700 hover:text-[#123C69] transition-colors",
                location === link.href && "text-[#123C69] font-medium"
              )}
              onClick={link.onClick}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center space-x-4">
          <Link href="/hotel-booking" className="hidden md:inline-block">
            <Button className="bg-[#123C69] hover:bg-[#123C69]/90 text-white">
              Book Now
            </Button>
          </Link>
          <button
            className="md:hidden text-neutral-700"
            aria-label="Menu"
            onClick={toggleMobileMenu}
          >
            <i className="ri-menu-line text-2xl"></i>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={cn(
        "md:hidden bg-white shadow-lg absolute w-full",
        isMobileMenuOpen ? "block" : "hidden"
      )}>
        <div className="container mx-auto px-4 py-4">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-neutral-700 hover:text-[#123C69] transition-colors py-2 border-b border-neutral-200"
                onClick={closeMobileMenu}
              >
                {link.label}
              </Link>
            ))}
            {authLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-neutral-700 hover:text-[#123C69] transition-colors py-2 border-b border-neutral-200"
                onClick={(e) => {
                  if (link.onClick) {
                    e.preventDefault();
                    link.onClick();
                  } else {
                    closeMobileMenu();
                  }
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/hotel-booking" onClick={closeMobileMenu}>
              <Button className="bg-[#123C69] hover:bg-[#123C69]/90 text-white w-full">
                Book Now
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
