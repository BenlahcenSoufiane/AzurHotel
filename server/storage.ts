import { 
  users, User, InsertUser,
  roomTypes, RoomType, InsertRoomType,
  roomBookings, RoomBooking, InsertRoomBooking,
  spaServices, SpaService, InsertSpaService,
  spaBookings, SpaBooking, InsertSpaBooking,
  restaurantMenus, RestaurantMenu, InsertRestaurantMenu,
  restaurantBookings, RestaurantBooking, InsertRestaurantBooking
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, between, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Interface for storage operations
export interface IStorage {
  // Session store
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // User Bookings operations
  getUserRoomBookings(userId: number): Promise<RoomBooking[]>;
  getUserSpaBookings(userId: number): Promise<SpaBooking[]>;
  getUserRestaurantBookings(userId: number): Promise<RestaurantBooking[]>;

  // Room Types operations
  getRoomTypes(): Promise<RoomType[]>;
  getRoomTypeById(id: number): Promise<RoomType | undefined>;
  createRoomType(roomType: InsertRoomType): Promise<RoomType>;

  // Room Bookings operations
  getRoomBookings(): Promise<RoomBooking[]>;
  getRoomBookingById(id: number): Promise<RoomBooking | undefined>;
  createRoomBooking(booking: InsertRoomBooking): Promise<RoomBooking>;
  checkRoomAvailability(roomTypeId: number, checkInDate: Date, checkOutDate: Date): Promise<boolean>;

  // Spa Services operations
  getSpaServices(): Promise<SpaService[]>;
  getSpaServiceById(id: number): Promise<SpaService | undefined>;
  createSpaService(service: InsertSpaService): Promise<SpaService>;

  // Spa Bookings operations
  getSpaBookings(): Promise<SpaBooking[]>;
  getSpaBookingById(id: number): Promise<SpaBooking | undefined>;
  createSpaBooking(booking: InsertSpaBooking): Promise<SpaBooking>;
  checkSpaAvailability(serviceId: number, date: Date, time: string): Promise<boolean>;

  // Restaurant Menu operations
  getRestaurantMenus(): Promise<RestaurantMenu[]>;
  getRestaurantMenuById(id: number): Promise<RestaurantMenu | undefined>;
  createRestaurantMenu(menu: InsertRestaurantMenu): Promise<RestaurantMenu>;

  // Restaurant Bookings operations
  getRestaurantBookings(): Promise<RestaurantBooking[]>;
  getRestaurantBookingById(id: number): Promise<RestaurantBooking | undefined>;
  createRestaurantBooking(booking: InsertRestaurantBooking): Promise<RestaurantBooking>;
  checkRestaurantAvailability(date: Date, time: string, partySize: number, mealPeriod: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Session store
  sessionStore: session.Store;
  
  constructor() {
    const PostgresStore = connectPg(session);
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  async getUserRoomBookings(userId: number): Promise<RoomBooking[]> {
    return await db.select()
      .from(roomBookings)
      .where(eq(roomBookings.userId, userId))
      .orderBy(sql`${roomBookings.checkInDate} DESC`);
  }
  
  async getUserSpaBookings(userId: number): Promise<SpaBooking[]> {
    return await db.select()
      .from(spaBookings)
      .where(eq(spaBookings.userId, userId))
      .orderBy(sql`${spaBookings.date} DESC`);
  }
  
  async getUserRestaurantBookings(userId: number): Promise<RestaurantBooking[]> {
    return await db.select()
      .from(restaurantBookings)
      .where(eq(restaurantBookings.userId, userId))
      .orderBy(sql`${restaurantBookings.date} DESC`);
  }

  // Room Types operations
  async getRoomTypes(): Promise<RoomType[]> {
    return await db.select().from(roomTypes);
  }

  async getRoomTypeById(id: number): Promise<RoomType | undefined> {
    const [roomType] = await db.select().from(roomTypes).where(eq(roomTypes.id, id));
    return roomType || undefined;
  }

  async createRoomType(roomType: InsertRoomType): Promise<RoomType> {
    const [createdRoomType] = await db.insert(roomTypes).values(roomType).returning();
    return createdRoomType;
  }

  // Room Bookings operations
  async getRoomBookings(): Promise<RoomBooking[]> {
    return await db.select().from(roomBookings);
  }

  async getRoomBookingById(id: number): Promise<RoomBooking | undefined> {
    const [booking] = await db.select().from(roomBookings).where(eq(roomBookings.id, id));
    return booking || undefined;
  }

  async createRoomBooking(booking: InsertRoomBooking): Promise<RoomBooking> {
    // Convert ISO strings to Date objects for the database
    const bookingWithDates = {
      ...booking,
      checkInDate: new Date(booking.checkInDate),
      checkOutDate: new Date(booking.checkOutDate),
      status: "confirmed" as const
    };
    
    const [createdBooking] = await db.insert(roomBookings).values(bookingWithDates).returning();
    return createdBooking;
  }

  async checkRoomAvailability(roomTypeId: number, checkInDate: Date, checkOutDate: Date): Promise<boolean> {
    // Get the room type to verify it exists
    const roomType = await this.getRoomTypeById(roomTypeId);
    if (!roomType) return false;

    // Find overlapping bookings for this room type
    const overlappingBookings = await db.select().from(roomBookings)
      .where(
        and(
          eq(roomBookings.roomTypeId, roomTypeId),
          or(
            // New booking starts during an existing booking
            and(
              sql`${roomBookings.checkInDate} <= ${checkInDate}`,
              sql`${roomBookings.checkOutDate} > ${checkInDate}`
            ),
            // New booking ends during an existing booking
            and(
              sql`${roomBookings.checkInDate} < ${checkOutDate}`,
              sql`${roomBookings.checkOutDate} >= ${checkOutDate}`
            ),
            // New booking contains an existing booking
            and(
              sql`${roomBookings.checkInDate} >= ${checkInDate}`,
              sql`${roomBookings.checkOutDate} <= ${checkOutDate}`
            )
          )
        )
      );

    // Assume we have 3 rooms of each type
    return overlappingBookings.length < 3;
  }

  // Spa Services operations
  async getSpaServices(): Promise<SpaService[]> {
    return await db.select().from(spaServices);
  }

  async getSpaServiceById(id: number): Promise<SpaService | undefined> {
    const [service] = await db.select().from(spaServices).where(eq(spaServices.id, id));
    return service || undefined;
  }

  async createSpaService(service: InsertSpaService): Promise<SpaService> {
    const [createdService] = await db.insert(spaServices).values(service).returning();
    return createdService;
  }

  // Spa Bookings operations
  async getSpaBookings(): Promise<SpaBooking[]> {
    return await db.select().from(spaBookings);
  }

  async getSpaBookingById(id: number): Promise<SpaBooking | undefined> {
    const [booking] = await db.select().from(spaBookings).where(eq(spaBookings.id, id));
    return booking || undefined;
  }

  async createSpaBooking(booking: InsertSpaBooking): Promise<SpaBooking> {
    // Convert ISO string to Date object for the database
    const bookingWithDate = {
      ...booking,
      date: new Date(booking.date),
      status: "confirmed" as const
    };
    
    const [createdBooking] = await db.insert(spaBookings).values(bookingWithDate).returning();
    return createdBooking;
  }

  async checkSpaAvailability(serviceId: number, date: Date, time: string): Promise<boolean> {
    // Get the service to verify it exists
    const service = await this.getSpaServiceById(serviceId);
    if (!service) return false;

    // Find bookings for this service at the same date and time
    const sameTimeBookings = await db.select().from(spaBookings)
      .where(
        and(
          eq(spaBookings.serviceId, serviceId),
          sql`DATE(${spaBookings.date}) = DATE(${date})`,
          eq(spaBookings.time, time)
        )
      );

    // Assume we can handle 3 concurrent sessions for each service
    return sameTimeBookings.length < 3;
  }

  // Restaurant Menu operations
  async getRestaurantMenus(): Promise<RestaurantMenu[]> {
    return await db.select().from(restaurantMenus);
  }

  async getRestaurantMenuById(id: number): Promise<RestaurantMenu | undefined> {
    const [menu] = await db.select().from(restaurantMenus).where(eq(restaurantMenus.id, id));
    return menu || undefined;
  }

  async createRestaurantMenu(menu: InsertRestaurantMenu): Promise<RestaurantMenu> {
    const [createdMenu] = await db.insert(restaurantMenus).values(menu).returning();
    return createdMenu;
  }

  // Restaurant Bookings operations
  async getRestaurantBookings(): Promise<RestaurantBooking[]> {
    return await db.select().from(restaurantBookings);
  }

  async getRestaurantBookingById(id: number): Promise<RestaurantBooking | undefined> {
    const [booking] = await db.select().from(restaurantBookings).where(eq(restaurantBookings.id, id));
    return booking || undefined;
  }

  async createRestaurantBooking(booking: InsertRestaurantBooking): Promise<RestaurantBooking> {
    // Convert ISO string to Date object for the database
    const bookingWithDate = {
      ...booking,
      date: new Date(booking.date),
      status: "confirmed" as const
    };
    
    const [createdBooking] = await db.insert(restaurantBookings).values(bookingWithDate).returning();
    return createdBooking;
  }

  async checkRestaurantAvailability(date: Date, time: string, partySize: number, mealPeriod: string): Promise<boolean> {
    // Find bookings for the same date, time, and meal period
    const sameTimeBookings = await db.select().from(restaurantBookings)
      .where(
        and(
          sql`DATE(${restaurantBookings.date}) = DATE(${date})`,
          eq(restaurantBookings.time, time),
          eq(restaurantBookings.mealPeriod, mealPeriod)
        )
      );

    // Calculate total seats taken in this time slot
    const totalSeats = sameTimeBookings.reduce((sum, booking) => sum + booking.partySize, 0);

    // Assume the restaurant can seat 50 people at once
    return totalSeats + partySize <= 50;
  }

  // Initialize the database with sample data
  async initializeData() {
    // Check if data already exists
    const existingRoomTypes = await this.getRoomTypes();
    if (existingRoomTypes.length > 0) {
      return; // Data already initialized
    }

    // Initialize room types
    const deluxeRoom: InsertRoomType = {
      name: "Deluxe Room",
      description: "Elegant and spacious room featuring premium amenities, a luxury bathroom, and breathtaking city views.",
      price: 299,
      capacity: 2,
      size: 45,
      amenities: ["Wi-Fi", "TV", "24-hour service"],
      imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    };
    await this.createRoomType(deluxeRoom);

    const executiveSuite: InsertRoomType = {
      name: "Executive Suite",
      description: "Luxurious suite with separate living area, premium furnishings, and exclusive access to the Executive Lounge.",
      price: 499,
      capacity: 3,
      size: 75,
      amenities: ["Wi-Fi", "TV", "24-hour service", "Mini Bar"],
      imageUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    };
    await this.createRoomType(executiveSuite);

    const oceanViewSuite: InsertRoomType = {
      name: "Ocean View Suite",
      description: "Premier suite featuring panoramic ocean views, luxury amenities, and a private balcony perfect for sunset watching.",
      price: 699,
      capacity: 4,
      size: 90,
      amenities: ["Wi-Fi", "TV", "24-hour service", "Mini Bar", "Balcony"],
      imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    };
    await this.createRoomType(oceanViewSuite);

    // Initialize spa services
    const swedishMassage: InsertSpaService = {
      name: "Swedish Massage",
      description: "A classic relaxation massage using long, flowing strokes to reduce tension, improve circulation, and induce a deep sense of tranquility.",
      duration: 60,
      price: 120,
      imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    };
    await this.createSpaService(swedishMassage);

    const luxuryFacial: InsertSpaService = {
      name: "Luxury Facial",
      description: "This rejuvenating treatment combines premium skincare products with expert techniques to cleanse, exfoliate, and nourish your skin.",
      duration: 75,
      price: 150,
      imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    };
    await this.createSpaService(luxuryFacial);

    const hotStoneMassage: InsertSpaService = {
      name: "Hot Stone Therapy",
      description: "Smooth, heated basalt stones are placed on key points of the body, melting away tension while skilled hands massage tired muscles.",
      duration: 90,
      price: 180,
      imageUrl: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    };
    await this.createSpaService(hotStoneMassage);

    // Initialize restaurant menus
    const signatureMenu: InsertRestaurantMenu = {
      name: "Signature Menu",
      description: "A curated tasting experience featuring our chef's most celebrated creations, paired with fine wines.",
      price: 120,
      imageUrl: "https://images.unsplash.com/photo-1600891964092-4316c288032e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    };
    await this.createRestaurantMenu(signatureMenu);

    const seafoodCollection: InsertRestaurantMenu = {
      name: "Seafood Collection",
      description: "Fresh, sustainable seafood prepared with innovative techniques and complemented by seasonal ingredients.",
      price: 95,
      imageUrl: "https://images.unsplash.com/photo-1543353071-873f17a7a088?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    };
    await this.createRestaurantMenu(seafoodCollection);

    const vegetarianJourney: InsertRestaurantMenu = {
      name: "Vegetarian Journey",
      description: "A creative exploration of plant-based cuisine, showcasing the depth and versatility of vegetarian cooking.",
      price: 85,
      imageUrl: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    };
    await this.createRestaurantMenu(vegetarianJourney);
  }
}

// Create a storage instance and initialize it
export const storage = new DatabaseStorage();
// Initialize the database with sample data - but don't block the server startup
(async () => {
  try {
    await (storage as DatabaseStorage).initializeData();
    console.log("Database initialized with sample data");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
})();
