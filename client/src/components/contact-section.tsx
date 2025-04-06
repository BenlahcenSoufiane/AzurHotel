import { useState } from "react";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters").max(500, "Message cannot exceed 500 characters"),
});

export default function ContactSection() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: ""
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Message Sent!",
        description: "Thank you for your message. Our team will get back to you shortly.",
      });
      form.reset();
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section id="contact" className="bg-neutral-50 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl text-[#123C69] mb-4">Contact Us</h2>
            <p className="text-neutral-600 mb-8">
              Have questions about your reservation or special requests? Our concierge team is available 24/7 to assist you.
            </p>
            
            <div className="mb-8">
              <div className="flex items-start mb-4">
                <i className="ri-map-pin-line text-xl text-[#AC8A6D] mt-1 mr-4"></i>
                <div>
                  <h3 className="font-medium mb-1">Location</h3>
                  <p className="text-neutral-600">123 Oceanfront Drive, Azure Bay, CA 90210</p>
                </div>
              </div>
              
              <div className="flex items-start mb-4">
                <i className="ri-phone-line text-xl text-[#AC8A6D] mt-1 mr-4"></i>
                <div>
                  <h3 className="font-medium mb-1">Phone</h3>
                  <p className="text-neutral-600">Reservations: +1 (800) 123-4567</p>
                  <p className="text-neutral-600">Spa Bookings: +1 (800) 123-4568</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <i className="ri-mail-line text-xl text-[#AC8A6D] mt-1 mr-4"></i>
                <div>
                  <h3 className="font-medium mb-1">Email</h3>
                  <p className="text-neutral-600">reservations@azurehaven.com</p>
                  <p className="text-neutral-600">concierge@azurehaven.com</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-[#123C69] text-white flex items-center justify-center hover:bg-[#123C69]/90 transition-colors">
                <i className="ri-facebook-fill"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#123C69] text-white flex items-center justify-center hover:bg-[#123C69]/90 transition-colors">
                <i className="ri-instagram-line"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#123C69] text-white flex items-center justify-center hover:bg-[#123C69]/90 transition-colors">
                <i className="ri-twitter-x-line"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#123C69] text-white flex items-center justify-center hover:bg-[#123C69]/90 transition-colors">
                <i className="ri-pinterest-line"></i>
              </a>
            </div>
          </div>
          
          <Card className="bg-white rounded-xl shadow-lg">
            <CardContent className="p-6 md:p-8">
              <h3 className="font-serif text-xl text-[#123C69] mb-6">Send Us a Message</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                            <SelectItem value="Room Reservation">Room Reservation</SelectItem>
                            <SelectItem value="Spa Appointment">Spa Appointment</SelectItem>
                            <SelectItem value="Restaurant Reservation">Restaurant Reservation</SelectItem>
                            <SelectItem value="Special Event">Special Event</SelectItem>
                            <SelectItem value="Feedback">Feedback</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea rows={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#123C69] hover:bg-[#123C69]/90 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
