import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertRoomBookingSchema,
  insertSpaBookingSchema,
  insertRestaurantBookingSchema,
  updateBookingStatusSchema,
  BookingStatus
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { 
  sendRoomBookingConfirmation, 
  sendSpaBookingConfirmation, 
  sendRestaurantBookingConfirmation 
} from "./email-service";
import { setupAuth } from "./auth";

// Auth middleware for protected routes
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
};

// Admin role middleware
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user?.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Admin access required" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // API Routes - User Bookings
  app.get('/api/my/room-bookings', isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const roomBookings = await storage.getUserRoomBookings(req.user.id);
      res.json(roomBookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch room bookings" });
    }
  });
  
  app.get('/api/my/spa-bookings', isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const spaBookings = await storage.getUserSpaBookings(req.user.id);
      res.json(spaBookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch spa bookings" });
    }
  });
  
  app.get('/api/my/restaurant-bookings', isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const restaurantBookings = await storage.getUserRestaurantBookings(req.user.id);
      res.json(restaurantBookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restaurant bookings" });
    }
  });
  
  // Admin Routes
  app.get('/api/admin/users', isAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  app.get('/api/admin/bookings', isAdmin, async (req: Request, res: Response) => {
    try {
      const roomBookings = await storage.getRoomBookings();
      const spaBookings = await storage.getSpaBookings();
      const restaurantBookings = await storage.getRestaurantBookings();
      
      // Get necessary related data
      const users = await storage.getAllUsers();
      const roomTypeList = await storage.getRoomTypes();
      const serviceList = await storage.getSpaServices();
      
      // Transform bookings into a unified format for the admin dashboard
      const allBookings = [
        ...roomBookings.map(booking => {
          const roomType = roomTypeList.find(rt => rt.id === booking.roomTypeId);
          const user = booking.userId ? users.find(u => u.id === booking.userId) : null;
          
          return {
            id: booking.id,
            userId: booking.userId,
            bookingType: 'room',
            createdAt: booking.createdAt?.toISOString(),
            status: booking.status,
            userFullName: user?.fullName || booking.guestName,
            userEmail: user?.email || booking.guestEmail,
            userPhone: user?.phone || booking.guestPhone || '',
            roomTypeName: roomType?.name || 'Unknown Room',
            checkInDate: booking.checkInDate.toISOString(),
            checkOutDate: booking.checkOutDate.toISOString(),
            adults: booking.adults,
            children: booking.children,
            totalPrice: booking.totalPrice
          };
        }),
        ...spaBookings.map(booking => {
          const service = serviceList.find(s => s.id === booking.serviceId);
          const user = booking.userId ? users.find(u => u.id === booking.userId) : null;
          
          return {
            id: booking.id,
            userId: booking.userId,
            bookingType: 'spa',
            createdAt: booking.createdAt?.toISOString(),
            status: booking.status,
            userFullName: user?.fullName || booking.guestName,
            userEmail: user?.email || booking.guestEmail,
            userPhone: user?.phone || booking.guestPhone || '',
            serviceName: service?.name || 'Unknown Service',
            appointmentDate: booking.date.toISOString(),
            appointmentTime: booking.time,
            price: booking.totalPrice
          };
        }),
        ...restaurantBookings.map(booking => {
          const user = booking.userId ? users.find(u => u.id === booking.userId) : null;
          
          return {
            id: booking.id,
            userId: booking.userId,
            bookingType: 'restaurant',
            createdAt: booking.createdAt?.toISOString(),
            status: booking.status,
            userFullName: user?.fullName || booking.guestName,
            userEmail: user?.email || booking.guestEmail,
            userPhone: user?.phone || booking.guestPhone || '',
            reservationDate: booking.date.toISOString(),
            reservationTime: booking.time,
            partySize: booking.partySize,
            mealPeriod: booking.mealPeriod
          };
        })
      ];
      
      res.json(allBookings);
    } catch (error) {
      console.error('Error getting all bookings:', error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });
  // API routes
  app.get('/api/room-types', async (req: Request, res: Response) => {
    try {
      const roomTypes = await storage.getRoomTypes();
      res.json(roomTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch room types" });
    }
  });

  app.get('/api/room-types/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const roomType = await storage.getRoomTypeById(id);
      
      if (!roomType) {
        return res.status(404).json({ message: "Room type not found" });
      }
      
      res.json(roomType);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch room type" });
    }
  });

  app.post('/api/room-bookings', async (req: Request, res: Response) => {
    try {
      const result = insertRoomBookingSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const roomBookingData = result.data;
      
      // Check room availability
      const isAvailable = await storage.checkRoomAvailability(
        roomBookingData.roomTypeId,
        new Date(roomBookingData.checkInDate),
        new Date(roomBookingData.checkOutDate)
      );
      
      if (!isAvailable) {
        return res.status(409).json({ message: "Room not available for the selected dates" });
      }
      
      // If user is authenticated, associate booking with their account
      if (req.isAuthenticated() && req.user) {
        roomBookingData.userId = req.user.id;
      }
      
      const booking = await storage.createRoomBooking(roomBookingData);
      
      // Get room type details for email
      const roomType = await storage.getRoomTypeById(roomBookingData.roomTypeId);
      
      if (roomType) {
        // Send confirmation email
        sendRoomBookingConfirmation(
          roomBookingData.guestEmail,
          roomBookingData.guestName,
          roomType.name,
          roomBookingData.checkInDate,
          roomBookingData.checkOutDate,
          roomBookingData.totalPrice
        ).catch(err => console.error('Failed to send room booking confirmation email:', err));
      }
      
      res.status(201).json(booking);
    } catch (error) {
      console.error('Room booking error:', error);
      res.status(500).json({ message: "Failed to create room booking" });
    }
  });

  app.get('/api/room-availability', async (req: Request, res: Response) => {
    try {
      const roomTypeId = parseInt(req.query.roomTypeId as string);
      const checkInDate = new Date(req.query.checkInDate as string);
      const checkOutDate = new Date(req.query.checkOutDate as string);
      
      if (isNaN(roomTypeId) || isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        return res.status(400).json({ message: "Invalid parameters" });
      }
      
      const isAvailable = await storage.checkRoomAvailability(roomTypeId, checkInDate, checkOutDate);
      res.json({ available: isAvailable });
    } catch (error) {
      res.status(500).json({ message: "Failed to check room availability" });
    }
  });

  app.get('/api/spa-services', async (req: Request, res: Response) => {
    try {
      const spaServices = await storage.getSpaServices();
      res.json(spaServices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch spa services" });
    }
  });

  app.get('/api/spa-services/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const spaService = await storage.getSpaServiceById(id);
      
      if (!spaService) {
        return res.status(404).json({ message: "Spa service not found" });
      }
      
      res.json(spaService);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch spa service" });
    }
  });

  app.post('/api/spa-bookings', async (req: Request, res: Response) => {
    try {
      const result = insertSpaBookingSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const spaBookingData = result.data;
      
      // Check spa availability
      const isAvailable = await storage.checkSpaAvailability(
        spaBookingData.serviceId,
        new Date(spaBookingData.date),
        spaBookingData.time
      );
      
      if (!isAvailable) {
        return res.status(409).json({ message: "Spa service not available for the selected date and time" });
      }
      
      // If user is authenticated, associate booking with their account
      if (req.isAuthenticated() && req.user) {
        spaBookingData.userId = req.user.id;
      }
      
      const booking = await storage.createSpaBooking(spaBookingData);
      
      // Get spa service details for email
      const spaService = await storage.getSpaServiceById(spaBookingData.serviceId);
      
      if (spaService) {
        // Send confirmation email
        sendSpaBookingConfirmation(
          spaBookingData.guestEmail,
          spaBookingData.guestName,
          spaService.name,
          spaBookingData.date,
          spaBookingData.time,
          spaBookingData.totalPrice
        ).catch(err => console.error('Failed to send spa booking confirmation email:', err));
      }
      
      res.status(201).json(booking);
    } catch (error) {
      console.error('Spa booking error:', error);
      res.status(500).json({ message: "Failed to create spa booking" });
    }
  });

  app.get('/api/spa-availability', async (req: Request, res: Response) => {
    try {
      const serviceId = parseInt(req.query.serviceId as string);
      const date = new Date(req.query.date as string);
      const time = req.query.time as string;
      
      if (isNaN(serviceId) || isNaN(date.getTime()) || !time) {
        return res.status(400).json({ message: "Invalid parameters" });
      }
      
      const isAvailable = await storage.checkSpaAvailability(serviceId, date, time);
      res.json({ available: isAvailable });
    } catch (error) {
      res.status(500).json({ message: "Failed to check spa availability" });
    }
  });

  app.get('/api/restaurant-menus', async (req: Request, res: Response) => {
    try {
      const restaurantMenus = await storage.getRestaurantMenus();
      res.json(restaurantMenus);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restaurant menus" });
    }
  });

  app.post('/api/restaurant-bookings', async (req: Request, res: Response) => {
    try {
      const result = insertRestaurantBookingSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const restaurantBookingData = result.data;
      
      // Check restaurant availability
      const isAvailable = await storage.checkRestaurantAvailability(
        new Date(restaurantBookingData.date),
        restaurantBookingData.time,
        restaurantBookingData.partySize,
        restaurantBookingData.mealPeriod
      );
      
      if (!isAvailable) {
        return res.status(409).json({ message: "Restaurant not available for the selected date, time, and party size" });
      }
      
      // If user is authenticated, associate booking with their account
      if (req.isAuthenticated() && req.user) {
        restaurantBookingData.userId = req.user.id;
      }
      
      const booking = await storage.createRestaurantBooking(restaurantBookingData);
      
      // Send confirmation email
      sendRestaurantBookingConfirmation(
        restaurantBookingData.guestEmail,
        restaurantBookingData.guestName,
        restaurantBookingData.date,
        restaurantBookingData.time,
        restaurantBookingData.partySize,
        restaurantBookingData.mealPeriod
      ).catch(err => console.error('Failed to send restaurant booking confirmation email:', err));
      
      res.status(201).json(booking);
    } catch (error) {
      console.error('Restaurant booking error:', error);
      res.status(500).json({ message: "Failed to create restaurant booking" });
    }
  });

  app.get('/api/restaurant-availability', async (req: Request, res: Response) => {
    try {
      const date = new Date(req.query.date as string);
      const time = req.query.time as string;
      const partySize = parseInt(req.query.partySize as string);
      const mealPeriod = req.query.mealPeriod as string;
      
      if (isNaN(date.getTime()) || !time || isNaN(partySize) || !mealPeriod) {
        return res.status(400).json({ message: "Invalid parameters" });
      }
      
      const isAvailable = await storage.checkRestaurantAvailability(date, time, partySize, mealPeriod);
      res.json({ available: isAvailable });
    } catch (error) {
      res.status(500).json({ message: "Failed to check restaurant availability" });
    }
  });
  
  // Admin booking status update endpoints
  app.patch('/api/admin/room-bookings/:id/status', isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = updateBookingStatusSchema.parse(req.body);
      
      const updatedBooking = await storage.updateRoomBookingStatus(parseInt(id), status);
      if (!updatedBooking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      res.json(updatedBooking);
    } catch (error) {
      console.error('Error updating room booking status:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid status value', errors: error.errors });
      }
      res.status(500).json({ message: 'Error updating booking status' });
    }
  });

  app.patch('/api/admin/spa-bookings/:id/status', isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = updateBookingStatusSchema.parse(req.body);
      
      const updatedBooking = await storage.updateSpaBookingStatus(parseInt(id), status);
      if (!updatedBooking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      res.json(updatedBooking);
    } catch (error) {
      console.error('Error updating spa booking status:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid status value', errors: error.errors });
      }
      res.status(500).json({ message: 'Error updating booking status' });
    }
  });

  app.patch('/api/admin/restaurant-bookings/:id/status', isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = updateBookingStatusSchema.parse(req.body);
      
      const updatedBooking = await storage.updateRestaurantBookingStatus(parseInt(id), status);
      if (!updatedBooking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      res.json(updatedBooking);
    } catch (error) {
      console.error('Error updating restaurant booking status:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid status value', errors: error.errors });
      }
      res.status(500).json({ message: 'Error updating booking status' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
