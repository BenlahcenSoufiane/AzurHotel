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
import { formatDate, generateAvailableTimeSlots } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

const formSchema = z.object({
  guestName: z.string().min(2, "Full name is required"),
  guestEmail: z.string().email("Invalid email address"),
  guestPhone: z.string().optional(),
  date: z.date({
    required_error: "Date is required",
  }),
  time: z.string().min(1, "Time is required"),
  partySize: z.number().min(1, "Party size is required"),
  mealPeriod: z.string().min(1, "Meal period is required"),
  specialRequests: z.string().optional(),
});

const mealPeriods = [
  { value: "breakfast", label: "Breakfast (7:00 AM - 10:30 AM)" },
  { value: "lunch", label: "Lunch (12:00 PM - 2:30 PM)" },
  { value: "dinner", label: "Dinner (6:00 PM - 10:00 PM)" },
];

const partySizes = [
  { value: 1, label: "1 Person" },
  { value: 2, label: "2 People" },
  { value: 3, label: "3 People" },
  { value: 4, label: "4 People" },
  { value: 5, label: "5 People" },
  { value: 6, label: "6 People" },
  { value: 7, label: "7-8 People" },
  { value: 9, label: "Large Party (9+)" },
];

export default function RestaurantBooking() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedMealPeriod, setSelectedMealPeriod] = useState<string>("dinner");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      partySize: 2,
      mealPeriod: "dinner",
      time: "",
      specialRequests: "",
      date: undefined,
    },
  });

  // Generate time slots based on selected meal period
  const availableTimeSlots = generateAvailableTimeSlots('restaurant', selectedDate);
  const filteredTimeSlots = availableTimeSlots.filter(slot => {
    const hour = parseInt(slot.split(':')[0]);
    const isPM = slot.includes('PM');
    const convertedHour = isPM && hour !== 12 ? hour + 12 : (hour === 12 && !isPM ? 0 : hour);
    
    if (selectedMealPeriod === 'breakfast') {
      return convertedHour >= 7 && convertedHour < 11;
    } else if (selectedMealPeriod === 'lunch') {
      return convertedHour >= 12 && convertedHour < 15;
    } else if (selectedMealPeriod === 'dinner') {
      return convertedHour >= 18 && convertedHour < 22;
    }
    return true;
  });

  // Update form value when date changes
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      form.setValue("date", date);
    }
  };

  // Update meal period and clear time selection when meal period changes
  const handleMealPeriodChange = (value: string) => {
    setSelectedMealPeriod(value);
    form.setValue("mealPeriod", value);
    form.setValue("time", "");
  };

  const bookingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const bookingData = {
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        date: data.date.toISOString(),
        time: data.time,
        partySize: data.partySize,
        mealPeriod: data.mealPeriod,
        specialRequests: data.specialRequests,
      };
      
      return apiRequest('POST', '/api/restaurant-bookings', bookingData);
    },
    onSuccess: () => {
      toast({
        title: "Reservation Confirmed!",
        description: "Your table has been successfully reserved. Check your email for details.",
      });
      form.reset();
      setSelectedDate(undefined);
      queryClient.invalidateQueries({ queryKey: ['/api/restaurant-bookings'] });
    },
    onError: (error) => {
      toast({
        title: "Reservation Failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    bookingMutation.mutate(data);
  };

  // Format the meal period label for display
  const getMealPeriodLabel = (value: string) => {
    return mealPeriods.find(mp => mp.value === value)?.label || value;
  };

  return (
    <section className="bg-neutral-50 py-16" id="restaurant-booking-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl text-[#123C69] mb-4">Reserve Your Table</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Secure your dining experience at our renowned restaurant with just a few clicks.
          </p>
        </div>
        
        <Card className="bg-white rounded-xl shadow-lg">
          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="mb-6">
                      <h3 className="font-serif text-xl text-[#123C69] mb-4">Select Date & Party Size</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <FormField
                          control={form.control}
                          name="mealPeriod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meal Period</FormLabel>
                              <Select
                                onValueChange={handleMealPeriodChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select meal period" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {mealPeriods.map((period) => (
                                    <SelectItem key={period.value} value={period.value}>
                                      {period.label}
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
                          name="partySize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Party Size</FormLabel>
                              <Select
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                defaultValue={field.value.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select party size" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {partySizes.map((size) => (
                                    <SelectItem key={size.value} value={size.value.toString()}>
                                      {size.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="bg-neutral-50 rounded-lg p-4 mb-6">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateChange}
                          className="rounded-md border"
                          disabled={{ before: new Date() }}
                        />
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="font-serif text-xl text-[#123C69] mb-4">Available Times</h3>
                        <FormField
                          control={form.control}
                          name="time"
                          render={({ field }) => (
                            <FormItem>
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {filteredTimeSlots.map((timeSlot) => (
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
                      
                      <h3 className="font-serif text-xl text-[#123C69] mb-4">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="guestName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="guestEmail"
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
                          name="guestPhone"
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
                          name="specialRequests"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Special Requests</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Allergies, special occasions, etc." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-50 rounded-xl p-6">
                    <h3 className="font-serif text-xl text-[#123C69] mb-4">Reservation Summary</h3>
                    
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-neutral-600">Restaurant</span>
                        <span className="font-medium">Azure Restaurant</span>
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
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-neutral-600">Party Size</span>
                        <span className="font-medium">
                          {form.watch('partySize')} {form.watch('partySize') === 1 ? 'Person' : 'People'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-600">Meal Period</span>
                        <span className="font-medium">{getMealPeriodLabel(form.watch('mealPeriod')).split(' ')[0]}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-neutral-200 pt-4 mb-6">
                      <p className="text-sm text-neutral-600 mb-4">
                        Please note that we hold reservations for 15 minutes past the scheduled time. Cancellations should be made at least 4 hours in advance.
                      </p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#AC8A6D] hover:bg-[#AC8A6D]/90 text-white py-3 rounded-md transition-colors mb-4"
                      disabled={bookingMutation.isPending}
                    >
                      {bookingMutation.isPending ? "Processing..." : "Confirm Reservation"}
                    </Button>
                    <p className="text-xs text-neutral-500 text-center">
                      A confirmation email will be sent with your reservation details.
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
