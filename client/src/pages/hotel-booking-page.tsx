import { useEffect } from "react";
import { useLocation } from "wouter";
import HotelBooking from "@/components/hotel-booking";

export default function HotelBookingPage() {
  const [location] = useLocation();
  
  // Extract roomTypeId from query params if provided
  const params = new URLSearchParams(location.split("?")[1]);
  const roomTypeId = params.get("room") ? parseInt(params.get("room") as string) : undefined;
  
  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="pt-8">
      <HotelBooking roomTypeId={roomTypeId} />
    </div>
  );
}
