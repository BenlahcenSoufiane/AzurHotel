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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate, getDaysBetween } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RoomType } from "@shared/schema";
import { format } from "date-fns";

const formSchema = z.object({
  roomTypeId: z.number().min(1, "Please select a room type"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  checkInDate: z.date({
    required_error: "Check-in date is required",
  }),
  checkOutDate: z.date({
    required_error: "Check-out date is required",
  }),
  adults: z.number().min(1, "At least 1 adult is required"),
  children: z.number().default(0),
  specialRequests: z.string().optional(),
});

export default function HotelBooking({ roomTypeId = undefined }: { roomTypeId?: number }) {
  const { toast } = useToast();
  const [selectedDateRange, setSelectedDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const { data: roomTypes, isLoading: roomTypesLoading } = useQuery<RoomType[]>({
    queryKey: ['/api/room-types'],
  });

  const selectedRoomType = roomTypes?.find(rt => rt.id === roomTypeId) || roomTypes?.[0];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomTypeId: roomTypeId || 0,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      adults: 2,
      children: 0,
      specialRequests: "",
      checkInDate: selectedDateRange.from,
      checkOutDate: selectedDateRange.to,
    },
  });

  // Update form values when date range changes
  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setSelectedDateRange(range);
    
    if (range.from) {
      form.setValue("checkInDate", range.from);
    }
    
    if (range.to) {
      form.setValue("checkOutDate", range.to);
    }
  };

  const bookingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const fullName = `${data.firstName} ${data.lastName}`;
      const nights = getDaysBetween(data.checkInDate, data.checkOutDate);
      const roomType = roomTypes?.find(rt => rt.id === data.roomTypeId);
      
      if (!roomType) {
        throw new Error("Room type not found");
      }
      
      const totalPrice = roomType.price * nights;
      
      const bookingData = {
        roomTypeId: data.roomTypeId,
        guestName: fullName,
        guestEmail: data.email,
        guestPhone: data.phone,
        checkInDate: data.checkInDate.toISOString(),
        checkOutDate: data.checkOutDate.toISOString(),
        adults: data.adults,
        children: data.children,
        specialRequests: data.specialRequests,
        totalPrice
      };
      
      return apiRequest('POST', '/api/room-bookings', bookingData);
    },
    onSuccess: () => {
      toast({
        title: "Booking Confirmed!",
        description: "Your room has been successfully booked. Check your email for details.",
      });
      form.reset();
      setSelectedDateRange({ from: undefined, to: undefined });
      queryClient.invalidateQueries({ queryKey: ['/api/room-bookings'] });
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

  if (!roomTypes && roomTypesLoading) {
    return (
      <div className="text-center py-8">
        <p>Loading booking form...</p>
      </div>
    );
  }

  // Calculate summary information
  const selectedRoom = roomTypes?.find(rt => rt.id === form.watch('roomTypeId'));
  const checkInDate = form.watch('checkInDate');
  const checkOutDate = form.watch('checkOutDate');
  const nights = checkInDate && checkOutDate ? getDaysBetween(checkInDate, checkOutDate) : 0;
  const roomRate = selectedRoom?.price || 0;
  const totalPrice = roomRate * nights;
  const taxesAndFees = Math.round(totalPrice * 0.2); // 20% taxes and fees
  const grandTotal = totalPrice + taxesAndFees;

  return (
    <section className="bg-neutral-50 py-16" id="hotel-booking-calendar">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl text-[#123C69] mb-4">Make Your Reservation</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Select your dates, room preference, and complete your booking in just a few simple steps.
          </p>
        </div>
        
        <Card className="bg-white rounded-xl shadow-lg">
          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="mb-6">
                      <h3 className="font-serif text-xl text-[#123C69] mb-4">Select Dates</h3>
                      <div className="bg-neutral-50 rounded-lg p-4">
                        <Calendar
                          mode="range"
                          selected={selectedDateRange}
                          onSelect={handleDateRangeChange}
                          numberOfMonths={2}
                          className="rounded-md border"
                        />
                        <div className="mt-4 flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <span className="w-4 h-4 bg-[#123C69] rounded-full inline-block mr-2"></span>
                            <span className="text-neutral-600">Check-in</span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-4 h-4 bg-[#E1B16A] rounded-full inline-block mr-2"></span>
                            <span className="text-neutral-600">Check-out</span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-4 h-4 bg-neutral-300 rounded-full inline-block mr-2"></span>
                            <span className="text-neutral-600">Unavailable</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-serif text-xl text-[#123C69] mb-4">Guest Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <FormField
                          control={form.control}
                          name="roomTypeId"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Room Type</FormLabel>
                              <Select
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                defaultValue={field.value.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a room type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {roomTypes?.map((room) => (
                                    <SelectItem key={room.id} value={room.id.toString()}>
                                      {room.name} (${room.price}/night)
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
                          name="adults"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adults</FormLabel>
                              <Select
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                defaultValue={field.value.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Number of adults" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {[1, 2, 3, 4].map((num) => (
                                    <SelectItem key={num} value={num.toString()}>
                                      {num} {num === 1 ? 'Adult' : 'Adults'}
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
                          name="children"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Children</FormLabel>
                              <Select
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                defaultValue={field.value.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Number of children" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {[0, 1, 2, 3].map((num) => (
                                    <SelectItem key={num} value={num.toString()}>
                                      {num} {num === 1 ? 'Child' : 'Children'}
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
                            <FormItem className="md:col-span-2">
                              <FormLabel>Special Requests</FormLabel>
                              <FormControl>
                                <Textarea rows={3} {...field} />
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
                        <span className="text-neutral-600">Check-in</span>
                        <span className="font-medium">
                          {checkInDate ? formatDate(checkInDate) : "Not selected"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-neutral-600">Check-out</span>
                        <span className="font-medium">
                          {checkOutDate ? formatDate(checkOutDate) : "Not selected"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-neutral-600">Nights</span>
                        <span className="font-medium">{nights}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-neutral-600">Guests</span>
                        <span className="font-medium">
                          {form.watch('adults')} {form.watch('adults') === 1 ? 'Adult' : 'Adults'}
                          {form.watch('children') > 0 && `, ${form.watch('children')} ${form.watch('children') === 1 ? 'Child' : 'Children'}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-600">Room Type</span>
                        <span className="font-medium">{selectedRoom?.name || "Not selected"}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-b border-neutral-200 py-4 mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-neutral-600">Room Rate</span>
                        <span className="font-medium">{formatCurrency(roomRate)} × {nights} nights</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-neutral-600">Subtotal</span>
                        <span className="font-medium">{formatCurrency(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-neutral-600">Taxes & Fees</span>
                        <span className="font-medium">{formatCurrency(taxesAndFees)}</span>
                      </div>
                      <div className="flex justify-between items-center font-medium">
                        <span>Total</span>
                        <span className="text-xl text-[#123C69]">{formatCurrency(grandTotal)}</span>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#123C69] hover:bg-[#123C69]/90 text-white py-3 rounded-md transition-colors mb-4"
                      disabled={bookingMutation.isPending}
                    >
                      {bookingMutation.isPending ? "Processing..." : "Confirm Booking"}
                    </Button>
                    <p className="text-xs text-neutral-500 text-center">
                      By clicking "Confirm Booking", you agree to our terms and conditions and cancellation policy.
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
