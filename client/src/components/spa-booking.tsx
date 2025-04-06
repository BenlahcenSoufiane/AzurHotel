import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
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
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate, generateAvailableTimeSlots, calculateServiceFee } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SpaService } from "@shared/schema";
import { format } from "date-fns";

const formSchema = z.object({
  serviceId: z.number().min(1, "Please select a spa service"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  date: z.date({
    required_error: "Date is required",
  }),
  time: z.string().min(1, "Time is required"),
  participants: z.number().min(1, "At least 1 participant is required"),
  specialRequests: z.string().optional(),
});

export default function SpaBooking({ serviceId = undefined }: { serviceId?: number }) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const { data: spaServices, isLoading: servicesLoading } = useQuery<SpaService[]>({
    queryKey: ['/api/spa-services'],
  });

  const selectedService = spaServices?.find(s => s.id === serviceId) || spaServices?.[0];
  
  const availableTimeSlots = generateAvailableTimeSlots('spa', selectedDate);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceId: serviceId || 0,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      participants: 1,
      time: "",
      specialRequests: "",
      date: undefined,
    },
  });

  // Update form value when date changes
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      form.setValue("date", date);
    }
  };

  const bookingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const fullName = `${data.firstName} ${data.lastName}`;
      const service = spaServices?.find(s => s.id === data.serviceId);
      
      if (!service) {
        throw new Error("Service not found");
      }
      
      const totalPrice = service.price * data.participants;
      
      const bookingData = {
        serviceId: data.serviceId,
        guestName: fullName,
        guestEmail: data.email,
        guestPhone: data.phone,
        date: data.date.toISOString(),
        time: data.time,
        participants: data.participants,
        specialRequests: data.specialRequests,
        totalPrice
      };
      
      return apiRequest('POST', '/api/spa-bookings', bookingData);
    },
    onSuccess: () => {
      toast({
        title: "Booking Confirmed!",
        description: "Your spa treatment has been successfully booked. Check your email for details.",
      });
      form.reset();
      setSelectedDate(undefined);
      queryClient.invalidateQueries({ queryKey: ['/api/spa-bookings'] });
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    bookingMutation.mutate(data);
  };

  if (!spaServices && servicesLoading) {
    return (
      <div className="text-center py-8">
        <p>Loading booking form...</p>
      </div>
    );
  }

  // Calculate summary information
  const selectedSpaService = spaServices?.find(s => s.id === form.watch('serviceId'));
  const participants = form.watch('participants');
  const treatmentPrice = (selectedSpaService?.price || 0) * participants;
  const serviceFee = calculateServiceFee(treatmentPrice);
  const totalPrice = treatmentPrice + serviceFee;

  return (
    <section className="bg-neutral-50 py-16" id="spa-booking-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl text-[#123C69] mb-4">Reserve Your Spa Treatment</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Select your preferred treatment, date, and time for a rejuvenating spa experience.
          </p>
        </div>
        
        <Card className="bg-white rounded-xl shadow-lg">
          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="mb-6">
                      <h3 className="font-serif text-xl text-[#123C69] mb-4">Select Date & Time</h3>
                      
                      <FormField
                        control={form.control}
                        name="serviceId"
                        render={({ field }) => (
                          <FormItem className="mb-6">
                            <FormLabel>Treatment</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              defaultValue={field.value.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a treatment" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {spaServices?.map((service) => (
                                  <SelectItem key={service.id} value={service.id.toString()}>
                                    {service.name} ({service.duration} min, ${service.price})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="bg-neutral-50 rounded-lg p-4 mb-6">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateChange}
                          className="rounded-md border"
                        />
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="font-serif text-xl text-[#123C69] mb-4">Available Time Slots</h3>
                        <FormField
                          control={form.control}
                          name="time"
                          render={({ field }) => (
                            <FormItem>
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {availableTimeSlots.map((timeSlot) => (
                                  <div
                                    key={timeSlot}
                                    className={`
                                      time-slot py-2 px-3 border rounded-md text-center cursor-pointer
                                      ${field.value === timeSlot 
                                        ? 'border-[#123C69] bg-[#123C69]/5' 
                                        : 'border-neutral-200 hover:border-[#123C69]'
                                      }
                                    `}
                                    onClick={() => field.onChange(timeSlot)}
                                  >
                                    {timeSlot}
                                  </div>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <h3 className="font-serif text-xl text-[#123C69] mb-4">Your Information</h3>
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
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input type="tel" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="participants"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Participants</FormLabel>
                              <Select
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                defaultValue={field.value.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Number of participants" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {[1, 2, 3, 4, 5].map((num) => (
                                    <SelectItem key={num} value={num.toString()}>
                                      {num} {num === 1 ? 'Person' : 'People'}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="specialRequests"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Special Requests</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Allergies, preferences, etc." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-50 rounded-xl p-6">
                    <h3 className="font-serif text-xl text-[#123C69] mb-4">Booking Summary</h3>
                    
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-neutral-600">Treatment</span>
                        <span className="font-medium">{selectedSpaService?.name || "Not selected"}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-neutral-600">Date</span>
                        <span className="font-medium">
                          {selectedDate ? formatDate(selectedDate) : "Not selected"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-neutral-600">Time</span>
                        <span className="font-medium">{form.watch('time') || "Not selected"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-600">Duration</span>
                        <span className="font-medium">{selectedSpaService?.duration || 0} minutes</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-b border-neutral-200 py-4 mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-neutral-600">Treatment Price</span>
                        <span className="font-medium">
                          {formatCurrency(selectedSpaService?.price || 0)} × {participants} {participants === 1 ? 'person' : 'people'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-neutral-600">Service Fee</span>
                        <span className="font-medium">{formatCurrency(serviceFee)}</span>
                      </div>
                      <div className="flex justify-between items-center font-medium">
                        <span>Total</span>
                        <span className="text-xl text-[#123C69]">{formatCurrency(totalPrice)}</span>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#123C69] hover:bg-[#123C69]/90 text-white py-3 rounded-md transition-colors mb-4"
                      disabled={bookingMutation.isPending}
                    >
                      {bookingMutation.isPending ? "Processing..." : "Confirm Spa Booking"}
                    </Button>
                    <p className="text-xs text-neutral-500 text-center">
                      Please arrive 15 minutes before your scheduled appointment time.
                    </p>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
