import { Card, CardContent } from "@/components/ui/card";

interface Testimonial {
  id: number;
  content: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    content: "The attention to detail at Azure Haven is remarkable. From the moment we arrived until our departure, every aspect of our stay was perfect. The spa treatments were exceptional.",
    name: "Sarah M.",
    location: "New York, USA",
    avatar: "https://randomuser.me/api/portraits/women/43.jpg",
    rating: 5
  },
  {
    id: 2,
    content: "The restaurant at Azure Haven is a culinary destination on its own. The tasting menu was an unforgettable experience, and the sommelier's wine pairings were perfect.",
    name: "James T.",
    location: "London, UK",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5
  },
  {
    id: 3,
    content: "We booked the Ocean View Suite for our anniversary, and it exceeded all expectations. The spa package was the perfect addition to make our celebration truly special.",
    name: "Elena R.",
    location: "Milan, Italy",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl md:text-4xl text-[#123C69] mb-4">Guest Experiences</h2>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          What our guests have to say about their stays and experiences at Azure Haven.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="bg-white rounded-lg shadow-md p-6">
            <CardContent className="p-0">
              <div className="flex text-[#E1B16A] mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <i key={i} className="ri-star-fill"></i>
                ))}
              </div>
              <p className="text-neutral-600 mb-4">
                "{testimonial.content}"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-neutral-500">{testimonial.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
