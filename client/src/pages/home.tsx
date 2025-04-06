import HeroSection from "@/components/hero-section";
import BookingTabs from "@/components/booking-tabs";
import RoomSelection from "@/components/room-selection";
import SpaServices from "@/components/spa-services";
import RestaurantSection from "@/components/restaurant-section";
import Testimonials from "@/components/testimonials";
import ContactSection from "@/components/contact-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <BookingTabs />
      <RoomSelection />
      <SpaServices />
      <RestaurantSection />
      <Testimonials />
      <ContactSection />
    </>
  );
}
