import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { RestaurantMenu } from "@shared/schema";

export default function RestaurantSection() {
  const { data: restaurantMenus, isLoading, error } = useQuery<RestaurantMenu[]>({
    queryKey: ['/api/restaurant-menus'],
  });

  if (error) {
    return (
      <section id="restaurant" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl text-[#123C69] mb-4">Fine Dining</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            We're sorry, but there was an error loading our restaurant information. Please try again later.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="restaurant" className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl md:text-4xl text-[#123C69] mb-4">Fine Dining</h2>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Experience exquisite cuisine at our award-winning restaurant with panoramic views and an elegant atmosphere.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12">
        <div>
          <h3 className="font-serif text-2xl text-[#123C69] mb-4">Azure Restaurant</h3>
          <p className="text-neutral-600 mb-4">
            Our signature restaurant offers a sophisticated dining experience with a menu that celebrates local ingredients and international culinary techniques. Our expert chefs craft seasonal dishes that delight the senses and create unforgettable memories.
          </p>
          <div className="flex flex-wrap mb-6">
            <div className="flex items-center mr-6 mb-3">
              <i className="ri-time-line text-[#AC8A6D] mr-2"></i>
              <span className="text-neutral-600">Breakfast: 7:00 AM - 10:30 AM</span>
            </div>
            <div className="flex items-center mr-6 mb-3">
              <i className="ri-time-line text-[#AC8A6D] mr-2"></i>
              <span className="text-neutral-600">Lunch: 12:00 PM - 2:30 PM</span>
            </div>
            <div className="flex items-center mb-3">
              <i className="ri-time-line text-[#AC8A6D] mr-2"></i>
              <span className="text-neutral-600">Dinner: 6:00 PM - 10:00 PM</span>
            </div>
          </div>
          <Link href="/restaurant-booking">
            <Button className="bg-[#AC8A6D] hover:bg-[#AC8A6D]/90 text-white px-6 py-3">
              Reserve a Table
            </Button>
          </Link>
        </div>
        <div className="rounded-lg overflow-hidden h-96">
          <img 
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
            alt="Azure Restaurant" 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {isLoading ? (
          // Loading skeleton
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-12 w-full mb-4" />
                <Skeleton className="h-6 w-1/3" />
              </CardContent>
            </Card>
          ))
        ) : (
          restaurantMenus?.map((menu) => (
            <Card key={menu.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48">
                <img src={menu.imageUrl} alt={menu.name} className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-6">
                <h3 className="font-serif text-xl text-[#123C69] mb-2">{menu.name}</h3>
                <p className="text-neutral-600 text-sm mb-4">
                  {menu.description}
                </p>
                <span className="text-[#AC8A6D] font-medium">
                  {formatCurrency(menu.price)} per person
                </span>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
