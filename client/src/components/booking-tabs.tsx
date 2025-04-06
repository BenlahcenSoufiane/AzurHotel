import { useState } from "react";
import { Link } from "wouter";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type TabType = "hotel" | "spa" | "restaurant";

export default function BookingTabs() {
  const [activeTab, setActiveTab] = useState<TabType>("hotel");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [spaDate, setSpaDate] = useState<Date | undefined>(undefined);
  const [restaurantDate, setRestaurantDate] = useState<Date | undefined>(undefined);
  
  // Hotel form state
  const [guests, setGuests] = useState("2 Adults");
  const [roomType, setRoomType] = useState("All Room Types");
  
  // Spa form state
  const [serviceType, setServiceType] = useState("All Services");
  const [participants, setParticipants] = useState("1 Person");
  
  // Restaurant form state
  const [mealPeriod, setMealPeriod] = useState("Dinner (6:00 PM - 10:00 PM)");
  const [partySize, setPartySize] = useState("2 People");

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden -mt-16 relative z-10">
        <div className="flex flex-wrap">
          <button
            id="tab-hotel"
            className={cn(
              "tab-btn flex-grow py-4 px-6 font-medium text-center transition-colors",
              activeTab === "hotel" 
                ? "bg-[#123C69] text-white" 
                : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
            )}
            onClick={() => setActiveTab("hotel")}
          >
            <i className="ri-hotel-bed-line mr-2"></i> Hotel
          </button>
          <button
            id="tab-spa"
            className={cn(
              "tab-btn flex-grow py-4 px-6 font-medium text-center transition-colors",
              activeTab === "spa" 
                ? "bg-[#123C69] text-white" 
                : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
            )}
            onClick={() => setActiveTab("spa")}
          >
            <i className="ri-spa-line mr-2"></i> Spa
          </button>
          <button
            id="tab-restaurant"
            className={cn(
              "tab-btn flex-grow py-4 px-6 font-medium text-center transition-colors",
              activeTab === "restaurant" 
                ? "bg-[#123C69] text-white" 
                : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
            )}
            onClick={() => setActiveTab("restaurant")}
          >
            <i className="ri-restaurant-line mr-2"></i> Restaurant
          </button>
        </div>
        
        {/* Hotel Booking Form */}
        <div className={cn("tab-content p-6", activeTab !== "hotel" && "hidden")}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="block text-sm font-medium text-neutral-700 mb-1">Check In - Check Out</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full px-4 py-2 flex items-center justify-between text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM d, yyyy")
                      )
                    ) : (
                      "Select dates"
                    )}
                    <CalendarIcon className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="block text-sm font-medium text-neutral-700 mb-1">Guests</Label>
              <Select defaultValue={guests} onValueChange={setGuests}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select guests" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 Adult">1 Adult</SelectItem>
                  <SelectItem value="2 Adults">2 Adults</SelectItem>
                  <SelectItem value="2 Adults, 1 Child">2 Adults, 1 Child</SelectItem>
                  <SelectItem value="2 Adults, 2 Children">2 Adults, 2 Children</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium text-neutral-700 mb-1">Room Type</Label>
              <Select defaultValue={roomType} onValueChange={setRoomType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Room Types">All Room Types</SelectItem>
                  <SelectItem value="Deluxe Room">Deluxe Room</SelectItem>
                  <SelectItem value="Executive Suite">Executive Suite</SelectItem>
                  <SelectItem value="Ocean View Suite">Ocean View Suite</SelectItem>
                  <SelectItem value="Presidential Suite">Presidential Suite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Link href="/hotel-booking">
              <Button className="bg-[#123C69] hover:bg-[#123C69]/90 text-white">
                Check Availability
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Spa Booking Form */}
        <div className={cn("tab-content p-6", activeTab !== "spa" && "hidden")}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="block text-sm font-medium text-neutral-700 mb-1">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full px-4 py-2 flex items-center justify-between text-left font-normal",
                      !spaDate && "text-muted-foreground"
                    )}
                  >
                    {spaDate ? format(spaDate, "MMM d, yyyy") : "Select date"}
                    <CalendarIcon className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="single"
                    selected={spaDate}
                    onSelect={setSpaDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="block text-sm font-medium text-neutral-700 mb-1">Service Type</Label>
              <Select defaultValue={serviceType} onValueChange={setServiceType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Services">All Services</SelectItem>
                  <SelectItem value="Massage Therapy">Massage Therapy</SelectItem>
                  <SelectItem value="Facial Treatment">Facial Treatment</SelectItem>
                  <SelectItem value="Body Scrub">Body Scrub</SelectItem>
                  <SelectItem value="Hot Stone Therapy">Hot Stone Therapy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium text-neutral-700 mb-1">Participants</Label>
              <Select defaultValue={participants} onValueChange={setParticipants}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select participants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 Person">1 Person</SelectItem>
                  <SelectItem value="2 People (Couples)">2 People (Couples)</SelectItem>
                  <SelectItem value="Small Group (3-5)">Small Group (3-5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Link href="/spa-booking">
              <Button className="bg-[#123C69] hover:bg-[#123C69]/90 text-white">
                Check Availability
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Restaurant Booking Form */}
        <div className={cn("tab-content p-6", activeTab !== "restaurant" && "hidden")}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="block text-sm font-medium text-neutral-700 mb-1">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full px-4 py-2 flex items-center justify-between text-left font-normal",
                      !restaurantDate && "text-muted-foreground"
                    )}
                  >
                    {restaurantDate ? format(restaurantDate, "MMM d, yyyy") : "Select date"}
                    <CalendarIcon className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="single"
                    selected={restaurantDate}
                    onSelect={setRestaurantDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="block text-sm font-medium text-neutral-700 mb-1">Time</Label>
              <Select defaultValue={mealPeriod} onValueChange={setMealPeriod}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Breakfast (7:00 AM - 10:30 AM)">Breakfast (7:00 AM - 10:30 AM)</SelectItem>
                  <SelectItem value="Lunch (12:00 PM - 2:30 PM)">Lunch (12:00 PM - 2:30 PM)</SelectItem>
                  <SelectItem value="Dinner (6:00 PM - 10:00 PM)">Dinner (6:00 PM - 10:00 PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium text-neutral-700 mb-1">Party Size</Label>
              <Select defaultValue={partySize} onValueChange={setPartySize}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select party size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 Person">1 Person</SelectItem>
                  <SelectItem value="2 People">2 People</SelectItem>
                  <SelectItem value="3 People">3 People</SelectItem>
                  <SelectItem value="4 People">4 People</SelectItem>
                  <SelectItem value="5-8 People">5-8 People</SelectItem>
                  <SelectItem value="Large Party (9+)">Large Party (9+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Link href="/restaurant-booking">
              <Button className="bg-[#123C69] hover:bg-[#123C69]/90 text-white">
                Check Availability
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
