import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, MoreHorizontal, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

// Booking status types
type BookingStatus = "pending" | "confirmed" | "checked-in" | "completed" | "cancelled";

// Generic booking interface with common fields
interface Booking {
  id: number;
  userId: number;
  createdAt: string;
  status: BookingStatus;
  userFullName: string;
  userEmail: string;
  userPhone: string;
  bookingType: "room" | "spa" | "restaurant";
}

// Specific booking types
interface RoomBooking extends Booking {
  bookingType: "room";
  roomTypeName: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  totalPrice: number;
}

interface SpaBooking extends Booking {
  bookingType: "spa";
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  price: number;
}

interface RestaurantBooking extends Booking {
  bookingType: "restaurant";
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  mealPeriod: string;
}

// Combined booking type
type AnyBooking = RoomBooking | SpaBooking | RestaurantBooking;

// Status badge component
function StatusBadge({ status }: { status: BookingStatus }) {
  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "checked-in":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Badge className={`${getStatusColor(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [bookingTypeFilter, setBookingTypeFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<AnyBooking | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  // Redirect if not admin
  if (user && user.role !== "admin") {
    navigate("/");
    toast({
      title: "Access Denied",
      description: "You don't have permission to access this page.",
      variant: "destructive",
    });
  }

  // Fetch all bookings
  const {
    data: bookings = [],
    isLoading,
    error,
  } = useQuery<AnyBooking[]>({
    queryKey: ["/api/admin/bookings"],
    enabled: !!user && user.role === "admin",
  });

  // Update booking status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      bookingId,
      bookingType,
      status,
    }: {
      bookingId: number;
      bookingType: string;
      status: BookingStatus;
    }) => {
      const res = await apiRequest(
        "PATCH",
        `/api/admin/${bookingType}-bookings/${bookingId}/status`,
        { status }
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({
        title: "Status Updated",
        description: "Booking status has been updated successfully.",
      });
      setIsStatusDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update booking status.",
        variant: "destructive",
      });
    },
  });

  // Filter bookings based on search and filters
  const filteredBookings = bookings
    .filter((booking) => 
      statusFilter === "all" || booking.status === statusFilter
    )
    .filter((booking) => 
      bookingTypeFilter === "all" || booking.bookingType === bookingTypeFilter
    )
    .filter((booking) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      
      return (
        booking.userFullName.toLowerCase().includes(searchLower) ||
        booking.userEmail.toLowerCase().includes(searchLower) ||
        booking.id.toString().includes(searchLower) ||
        booking.userPhone.toLowerCase().includes(searchLower)
      );
    });

  // Handle status update
  const handleUpdateStatus = (status: BookingStatus) => {
    if (selectedBooking) {
      updateStatusMutation.mutate({
        bookingId: selectedBooking.id,
        bookingType: selectedBooking.bookingType,
        status,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h3 className="text-xl font-semibold text-destructive">Error loading bookings</h3>
        <p className="text-muted-foreground">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Booking Management</CardTitle>
          <CardDescription>
            Manage all hotel, spa, and restaurant bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or booking ID..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="checked-in">Checked In</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={bookingTypeFilter}
              onValueChange={setBookingTypeFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Booking Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="room">Room</SelectItem>
                <SelectItem value="spa">Spa</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="room">Room</TabsTrigger>
              <TabsTrigger value="spa">Spa</TabsTrigger>
              <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No bookings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow key={`${booking.bookingType}-${booking.id}`}>
                        <TableCell className="font-medium">#{booking.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {booking.bookingType.charAt(0).toUpperCase() + booking.bookingType.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{booking.userFullName}</div>
                          <div className="text-sm text-muted-foreground">{booking.userEmail}</div>
                        </TableCell>
                        <TableCell>
                          {booking.bookingType === "room" ? (
                            <div>
                              <div>{formatDate(new Date((booking as RoomBooking).checkInDate))}</div>
                              <div className="text-sm text-muted-foreground">to {formatDate(new Date((booking as RoomBooking).checkOutDate))}</div>
                            </div>
                          ) : booking.bookingType === "spa" ? (
                            <div>
                              <div>{formatDate(new Date((booking as SpaBooking).appointmentDate))}</div>
                              <div className="text-sm text-muted-foreground">at {(booking as SpaBooking).appointmentTime}</div>
                            </div>
                          ) : (
                            <div>
                              <div>{formatDate(new Date((booking as RestaurantBooking).reservationDate))}</div>
                              <div className="text-sm text-muted-foreground">at {(booking as RestaurantBooking).reservationTime}</div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {booking.bookingType === "room" ? (
                            <div>
                              <div>{(booking as RoomBooking).roomTypeName}</div>
                              <div className="text-sm text-muted-foreground">
                                {(booking as RoomBooking).adults} adults, {(booking as RoomBooking).children} children
                              </div>
                            </div>
                          ) : booking.bookingType === "spa" ? (
                            <div>
                              <div>{(booking as SpaBooking).serviceName}</div>
                              <div className="text-sm text-muted-foreground">${(booking as SpaBooking).price.toFixed(2)}</div>
                            </div>
                          ) : (
                            <div>
                              <div>{(booking as RestaurantBooking).mealPeriod}</div>
                              <div className="text-sm text-muted-foreground">Party of {(booking as RestaurantBooking).partySize}</div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={booking.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setIsStatusDialogOpen(true);
                                }}
                              >
                                Update Status
                              </DropdownMenuItem>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Contact Guest</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            {/* Room Bookings Tab */}
            <TabsContent value="room" className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Room Type</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings
                    .filter((booking) => booking.bookingType === "room")
                    .length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No room bookings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings
                      .filter((booking) => booking.bookingType === "room")
                      .map((booking) => {
                        const roomBooking = booking as RoomBooking;
                        return (
                          <TableRow key={`room-${booking.id}`}>
                            <TableCell className="font-medium">#{booking.id}</TableCell>
                            <TableCell>
                              <div className="font-medium">{booking.userFullName}</div>
                              <div className="text-sm text-muted-foreground">{booking.userEmail}</div>
                            </TableCell>
                            <TableCell>{roomBooking.roomTypeName}</TableCell>
                            <TableCell>{formatDate(new Date(roomBooking.checkInDate))}</TableCell>
                            <TableCell>{formatDate(new Date(roomBooking.checkOutDate))}</TableCell>
                            <TableCell>{roomBooking.adults + roomBooking.children}</TableCell>
                            <TableCell>
                              <StatusBadge status={booking.status} />
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setIsStatusDialogOpen(true);
                                    }}
                                  >
                                    Update Status
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Contact Guest</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            {/* Spa Bookings Tab */}
            <TabsContent value="spa" className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings
                    .filter((booking) => booking.bookingType === "spa")
                    .length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No spa bookings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings
                      .filter((booking) => booking.bookingType === "spa")
                      .map((booking) => {
                        const spaBooking = booking as SpaBooking;
                        return (
                          <TableRow key={`spa-${booking.id}`}>
                            <TableCell className="font-medium">#{booking.id}</TableCell>
                            <TableCell>
                              <div className="font-medium">{booking.userFullName}</div>
                              <div className="text-sm text-muted-foreground">{booking.userEmail}</div>
                            </TableCell>
                            <TableCell>{spaBooking.serviceName}</TableCell>
                            <TableCell>{formatDate(new Date(spaBooking.appointmentDate))}</TableCell>
                            <TableCell>{spaBooking.appointmentTime}</TableCell>
                            <TableCell>${spaBooking.price.toFixed(2)}</TableCell>
                            <TableCell>
                              <StatusBadge status={booking.status} />
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setIsStatusDialogOpen(true);
                                    }}
                                  >
                                    Update Status
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Contact Guest</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            {/* Restaurant Bookings Tab */}
            <TabsContent value="restaurant" className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Party Size</TableHead>
                    <TableHead>Meal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings
                    .filter((booking) => booking.bookingType === "restaurant")
                    .length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No restaurant bookings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings
                      .filter((booking) => booking.bookingType === "restaurant")
                      .map((booking) => {
                        const restaurantBooking = booking as RestaurantBooking;
                        return (
                          <TableRow key={`restaurant-${booking.id}`}>
                            <TableCell className="font-medium">#{booking.id}</TableCell>
                            <TableCell>
                              <div className="font-medium">{booking.userFullName}</div>
                              <div className="text-sm text-muted-foreground">{booking.userEmail}</div>
                            </TableCell>
                            <TableCell>{formatDate(new Date(restaurantBooking.reservationDate))}</TableCell>
                            <TableCell>{restaurantBooking.reservationTime}</TableCell>
                            <TableCell>{restaurantBooking.partySize}</TableCell>
                            <TableCell>{restaurantBooking.mealPeriod}</TableCell>
                            <TableCell>
                              <StatusBadge status={booking.status} />
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setIsStatusDialogOpen(true);
                                    }}
                                  >
                                    Update Status
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Contact Guest</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Booking Status</AlertDialogTitle>
            <AlertDialogDescription>
              Change the status for booking #{selectedBooking?.id} for {selectedBooking?.userFullName}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button onClick={() => handleUpdateStatus("pending")} variant="outline">
              Pending
            </Button>
            <Button onClick={() => handleUpdateStatus("confirmed")} variant="outline">
              Confirmed
            </Button>
            <Button onClick={() => handleUpdateStatus("checked-in")} variant="outline">
              Checked In
            </Button>
            <Button onClick={() => handleUpdateStatus("completed")} variant="outline">
              Completed
            </Button>
            <Button 
              onClick={() => handleUpdateStatus("cancelled")} 
              variant="outline"
              className="col-span-2 bg-red-50 text-red-600 hover:bg-red-100"
            >
              Cancelled
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}