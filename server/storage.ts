import { 
  users, User, InsertUser,
  roomTypes, RoomType, InsertRoomType,
  roomBookings, RoomBooking, InsertRoomBooking,
  spaServices, SpaService, InsertSpaService,
  spaBookings, SpaBooking, InsertSpaBooking,
  restaurantMenus, RestaurantMenu, InsertRestaurantMenu,
  restaurantBookings, RestaurantBooking, InsertRestaurantBooking
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private roomTypes: Map<number, RoomType>;
  private roomBookings: Map<number, RoomBooking>;
  private spaServices: Map<number, SpaService>;
  private spaBookings: Map<number, SpaBooking>;
  private restaurantMenus: Map<number, RestaurantMenu>;
  private restaurantBookings: Map<number, RestaurantBooking>;

  private userId: number;
  private roomTypeId: number;
  private roomBookingId: number;
  private spaServiceId: number;
  private spaBookingId: number;
  private restaurantMenuId: number;
  private restaurantBookingId: number;

  constructor() {
    this.users = new Map();
    this.roomTypes = new Map();
    this.roomBookings = new Map();
    this.spaServices = new Map();
    this.spaBookings = new Map();
    this.restaurantMenus = new Map();
    this.restaurantBookings = new Map();

    this.userId = 1;
    this.roomTypeId = 1;
    this.roomBookingId = 1;
    this.spaServiceId = 1;
    this.spaBookingId = 1;
    this.restaurantMenuId = 1;
    this.restaurantBookingId = 1;

    // Add initial data
    this.initializeData();
  }

  private initializeData() {
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
    this.createRoomType(deluxeRoom);

    const executiveSuite: InsertRoomType = {
      name: "Executive Suite",
      description: "Luxurious suite with separate living area, premium furnishings, and exclusive access to the Executive Lounge.",
      price: 499,
      capacity: 3,
      size: 75,
      amenities: ["Wi-Fi", "TV", "24-hour service", "Mini Bar"],
      imageUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    };
    this.createRoomType(executiveSuite);

    const oceanViewSuite: InsertRoomType = {
      name: "Ocean View Suite",
      description: "Premier suite featuring panoramic ocean views, luxury amenities, and a private balcony perfect for sunset watching.",
      price: 699,
      capacity: 4,
      size: 90,
      amenities: ["Wi-Fi", "TV", "24-hour service", "Mini Bar", "Balcony"],
      imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    };
    this.createRoomType(oceanViewSuite);

    // Initialize spa services
    const swedishMassage: InsertSpaService = {
      name: "Swedish Massage",
      description: "A classic relaxation massage using long, flowing strokes to reduce tension, improve circulation, and induce a deep sense of tranquility.",
      duration: 60,
      price: 120,
      imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    };
    this.createSpaService(swedishMassage);

    const luxuryFacial: InsertSpaService = {
      name: "Luxury Facial",
      description: "This rejuvenating treatment combines premium skincare products with expert techniques to cleanse, exfoliate, and nourish your skin.",
      duration: 75,
      price: 150,
      imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    };
    this.createSpaService(luxuryFacial);

    const hotStoneMassage: InsertSpaService = {
      name: "Hot Stone Therapy",
      description: "Smooth, heated basalt stones are placed on key points of the body, melting away tension while skilled hands massage tired muscles.",
      duration: 90,
      price: 180,
      imageUrl: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    };
    this.createSpaService(hotStoneMassage);

    // Initialize restaurant menus
    const signatureMenu: InsertRestaurantMenu = {
      name: "Signature Menu",
      description: "A curated tasting experience featuring our chef's most celebrated creations, paired with fine wines.",
      price: 120,
      imageUrl: "https://images.unsplash.com/photo-1600891964092-4316c288032e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    };
    this.createRestaurantMenu(signatureMenu);

    const seafoodCollection: InsertRestaurantMenu = {
      name: "Seafood Collection",
      description: "Fresh, sustainable seafood prepared with innovative techniques and complemented by seasonal ingredients.",
      price: 95,
      imageUrl: "https://images.unsplash.com/photo-1543353071-873f17a7a088?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    };
    this.createRestaurantMenu(seafoodCollection);

    const vegetarianJourney: InsertRestaurantMenu = {
      name: "Vegetarian Journey",
      description: "A creative exploration of plant-based cuisine, showcasing the depth and versatility of vegetarian cooking.",
      price: 85,
      imageUrl: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    };
    this.createRestaurantMenu(vegetarianJourney);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Room Types operations
  async getRoomTypes(): Promise<RoomType[]> {
    return Array.from(this.roomTypes.values());
  }

  async getRoomTypeById(id: number): Promise<RoomType | undefined> {
    return this.roomTypes.get(id);
  }

  async createRoomType(roomType: InsertRoomType): Promise<RoomType> {
    const id = this.roomTypeId++;
    const newRoomType: RoomType = { ...roomType, id };
    this.roomTypes.set(id, newRoomType);
    return newRoomType;
  }

  // Room Bookings operations
  async getRoomBookings(): Promise<RoomBooking[]> {
    return Array.from(this.roomBookings.values());
  }

  async getRoomBookingById(id: number): Promise<RoomBooking | undefined> {
    return this.roomBookings.get(id);
  }

  async createRoomBooking(booking: InsertRoomBooking): Promise<RoomBooking> {
    const id = this.roomBookingId++;
    const newBooking: RoomBooking = { ...booking, id, status: "confirmed" };
    this.roomBookings.set(id, newBooking);
    return newBooking;
  }

  async checkRoomAvailability(roomTypeId: number, checkInDate: Date, checkOutDate: Date): Promise<boolean> {
    const bookings = Array.from(this.roomBookings.values()).filter(
      booking => booking.roomTypeId === roomTypeId
    );

    const roomType = await this.getRoomTypeById(roomTypeId);
    if (!roomType) return false;

    // Check if any existing booking overlaps with the requested dates
    const overlappingBookings = bookings.filter(booking => {
      const bookingCheckIn = new Date(booking.checkInDate);
      const bookingCheckOut = new Date(booking.checkOutDate);
      
      return (
        (checkInDate >= bookingCheckIn && checkInDate < bookingCheckOut) || 
        (checkOutDate > bookingCheckIn && checkOutDate <= bookingCheckOut) ||
        (checkInDate <= bookingCheckIn && checkOutDate >= bookingCheckOut)
      );
    });

    // For simplicity, we're assuming we have multiple rooms of each type
    // In a real system, you would check against actual inventory
    return overlappingBookings.length < 3; // Assume we have 3 rooms of each type
  }

  // Spa Services operations
  async getSpaServices(): Promise<SpaService[]> {
    return Array.from(this.spaServices.values());
  }

  async getSpaServiceById(id: number): Promise<SpaService | undefined> {
    return this.spaServices.get(id);
  }

  async createSpaService(service: InsertSpaService): Promise<SpaService> {
    const id = this.spaServiceId++;
    const newService: SpaService = { ...service, id };
    this.spaServices.set(id, newService);
    return newService;
  }

  // Spa Bookings operations
  async getSpaBookings(): Promise<SpaBooking[]> {
    return Array.from(this.spaBookings.values());
  }

  async getSpaBookingById(id: number): Promise<SpaBooking | undefined> {
    return this.spaBookings.get(id);
  }

  async createSpaBooking(booking: InsertSpaBooking): Promise<SpaBooking> {
    const id = this.spaBookingId++;
    const newBooking: SpaBooking = { ...booking, id, status: "confirmed" };
    this.spaBookings.set(id, newBooking);
    return newBooking;
  }

  async checkSpaAvailability(serviceId: number, date: Date, time: string): Promise<boolean> {
    const bookings = Array.from(this.spaBookings.values()).filter(
      booking => booking.serviceId === serviceId
    );

    // Convert the requested date to a string for comparison
    const dateStr = date.toISOString().split('T')[0];

    // Check if there are any bookings for the same service, date, and time
    const overlappingBookings = bookings.filter(booking => {
      const bookingDateStr = new Date(booking.date).toISOString().split('T')[0];
      return bookingDateStr === dateStr && booking.time === time;
    });

    // For simplicity, assume we can handle 3 concurrent sessions for each service
    return overlappingBookings.length < 3;
  }

  // Restaurant Menu operations
  async getRestaurantMenus(): Promise<RestaurantMenu[]> {
    return Array.from(this.restaurantMenus.values());
  }

  async getRestaurantMenuById(id: number): Promise<RestaurantMenu | undefined> {
    return this.restaurantMenus.get(id);
  }

  async createRestaurantMenu(menu: InsertRestaurantMenu): Promise<RestaurantMenu> {
    const id = this.restaurantMenuId++;
    const newMenu: RestaurantMenu = { ...menu, id };
    this.restaurantMenus.set(id, newMenu);
    return newMenu;
  }

  // Restaurant Bookings operations
  async getRestaurantBookings(): Promise<RestaurantBooking[]> {
    return Array.from(this.restaurantBookings.values());
  }

  async getRestaurantBookingById(id: number): Promise<RestaurantBooking | undefined> {
    return this.restaurantBookings.get(id);
  }

  async createRestaurantBooking(booking: InsertRestaurantBooking): Promise<RestaurantBooking> {
    const id = this.restaurantBookingId++;
    const newBooking: RestaurantBooking = { ...booking, id, status: "confirmed" };
    this.restaurantBookings.set(id, newBooking);
    return newBooking;
  }

  async checkRestaurantAvailability(date: Date, time: string, partySize: number, mealPeriod: string): Promise<boolean> {
    const bookings = Array.from(this.restaurantBookings.values());

    // Convert the requested date to a string for comparison
    const dateStr = date.toISOString().split('T')[0];

    // Check if there are any bookings for the same date, time, and meal period
    const overlappingBookings = bookings.filter(booking => {
      const bookingDateStr = new Date(booking.date).toISOString().split('T')[0];
      return bookingDateStr === dateStr && booking.time === time && booking.mealPeriod === mealPeriod;
    });

    // Calculate total seats taken in this time slot
    const totalSeats = overlappingBookings.reduce((sum, booking) => sum + booking.partySize, 0);

    // Assume the restaurant can seat 50 people at once
    return totalSeats + partySize <= 50;
  }
}

export const storage = new MemStorage();
