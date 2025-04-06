import { useEffect } from "react";
import { useLocation } from "wouter";
import SpaBooking from "@/components/spa-booking";

export default function SpaBookingPage() {
  const [location] = useLocation();
  
  // Extract serviceId from query params if provided
  const params = new URLSearchParams(location.split("?")[1]);
  const serviceId = params.get("service") ? parseInt(params.get("service") as string) : undefined;
  
  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="pt-8">
      <SpaBooking serviceId={serviceId} />
    </div>
  );
}
