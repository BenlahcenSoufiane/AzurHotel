import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { SpaService } from "@shared/schema";

export default function SpaServices() {
  const { data: spaServices, isLoading, error } = useQuery<SpaService[]>({
    queryKey: ['/api/spa-services'],
  });

  if (error) {
    return (
      <section id="spa" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl text-[#123C69] mb-4">Spa & Wellness</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            We're sorry, but there was an error loading our spa services. Please try again later.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="spa" className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl md:text-4xl text-[#123C69] mb-4">Spa & Wellness</h2>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Indulge in a world of relaxation and rejuvenation with our premium spa services.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          // Loading skeleton
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-56 w-full" />
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-16 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          spaServices?.map((service) => (
            <Card key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="relative h-56">
                <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-[#AC8A6D] text-white px-3 py-1 rounded-full text-sm">
                  {service.duration} min | {formatCurrency(service.price)}
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="font-serif text-xl text-[#123C69] mb-2">{service.name}</h3>
                <p className="text-neutral-600 text-sm mb-4">
                  {service.description}
                </p>
                <Link href={`/spa-booking?service=${service.id}`}>
                  <Button className="bg-[#123C69] hover:bg-[#123C69]/90 text-white w-full">
                    Book Treatment
                  </Button>
                </Link>
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
          View All Spa Services
        </Button>
      </div>
    </section>
  );
}
