import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertRoomBookingSchema,
  insertSpaBookingSchema,
  insertRestaurantBookingSchema
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
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
      
      const booking = await storage.createRoomBooking(roomBookingData);
      res.status(201).json(booking);
    } catch (error) {
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
      
      const booking = await storage.createSpaBooking(spaBookingData);
      res.status(201).json(booking);
    } catch (error) {
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
      
      const booking = await storage.createRestaurantBooking(restaurantBookingData);
      res.status(201).json(booking);
    } catch (error) {
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

  const httpServer = createServer(app);

  return httpServer;
}
