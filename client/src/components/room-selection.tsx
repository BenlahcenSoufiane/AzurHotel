import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { RoomType } from "@shared/schema";

export default function RoomSelection() {
  const { data: roomTypes, isLoading, error } = useQuery<RoomType[]>({
    queryKey: ['/api/room-types'],
  });

  if (error) {
    return (
      <section id="rooms" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl text-[#123C69] mb-4">Luxurious Accommodations</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            We're sorry, but there was an error loading our room types. Please try again later.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="rooms" className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl md:text-4xl text-[#123C69] mb-4">Luxurious Accommodations</h2>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Choose from our selection of elegantly appointed rooms and suites, each designed with your comfort in mind.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          // Loading skeleton
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-60 w-full" />
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <div className="flex text-neutral-600 text-sm mb-4">
                  <Skeleton className="h-4 w-20 mr-4" />
                  <Skeleton className="h-4 w-20 mr-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-12 w-full mb-4" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2" />
                    <Skeleton className="h-4 w-4 mr-2" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          roomTypes?.map((room) => (
            <Card key={room.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="relative h-60">
                <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-[#123C69] text-white px-3 py-1 rounded-full text-sm">
                  From {formatCurrency(room.price)}/night
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="font-serif text-xl text-[#123C69] mb-2">{room.name}</h3>
                <div className="flex text-neutral-600 text-sm mb-4">
                  <span className="flex items-center mr-4"><i className="ri-user-line mr-1"></i> {room.capacity} Guests</span>
                  <span className="flex items-center mr-4"><i className="ri-hotel-bed-line mr-1"></i> King Bed</span>
                  <span className="flex items-center"><i className="ri-ruler-line mr-1"></i> {room.size} m²</span>
                </div>
                <p className="text-neutral-600 text-sm mb-4">
                  {room.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {room.amenities?.map((amenity, index) => (
                      <i key={index} className={`${
                        amenity === "Wi-Fi" ? "ri-wifi-line" :
                        amenity === "TV" ? "ri-tv-line" :
                        amenity === "24-hour service" ? "ri-24-hours-line" :
                        amenity === "Mini Bar" ? "ri-goblet-line" :
                        amenity === "Balcony" ? "ri-windy-line" : 
                        "ri-checkbox-circle-line"
                      } text-neutral-500 mr-2`}></i>
                    ))}
                  </div>
                  <Link href={`/hotel-booking?room=${room.id}`}>
                    <Button variant="link" className="text-[#123C69] hover:text-[#123C69]/80 font-medium flex items-center">
                      Book Now <i className="ri-arrow-right-line ml-1"></i>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      <div className="mt-10 text-center">
        <Button
          variant="outline"
          className="border-[#123C69] text-[#123C69] hover:bg-[#123C69] hover:text-white px-6 py-3"
        >
          View All Accommodations
        </Button>
      </div>
    </section>
  );
}
