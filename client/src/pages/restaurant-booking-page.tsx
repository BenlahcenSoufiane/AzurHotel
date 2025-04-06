import { useEffect } from "react";
import RestaurantBooking from "@/components/restaurant-booking";

export default function RestaurantBookingPage() {
  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="pt-8">
      <RestaurantBooking />
    </div>
  );
}
