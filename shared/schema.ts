import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  role: text("role").default("user"), // user or admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema for user registration
export const registerUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(["user", "admin"]).optional().default("user"),
});

// Schema for user login
export const loginUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
});

// Room Types schema
export const roomTypes = pgTable("room_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  capacity: integer("capacity").notNull(),
  size: integer("size"), // in square meters
  amenities: text("amenities").array(),
  imageUrl: text("image_url"),
});

export const insertRoomTypeSchema = createInsertSchema(roomTypes).pick({
  name: true,
  description: true,
  price: true,
  capacity: true,
  size: true,
  amenities: true,
  imageUrl: true,
});

// Room Bookings schema
export const roomBookings = pgTable("room_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // References users table, can be null for guest bookings
  roomTypeId: integer("room_type_id").notNull(),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  guestPhone: text("guest_phone"),
  checkInDate: timestamp("check_in_date").notNull(),
  checkOutDate: timestamp("check_out_date").notNull(),
  adults: integer("adults").notNull(),
  children: integer("children").default(0),
  specialRequests: text("special_requests"),
  totalPrice: integer("total_price").notNull(),
  status: text("status").default("confirmed"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Custom Room Booking Schema with string date handling
export const insertRoomBookingSchema = z.object({
  userId: z.number().int().positive().optional(),
  roomTypeId: z.number().int().positive(),
  guestName: z.string().min(2),
  guestEmail: z.string().email(),
  guestPhone: z.string().optional(),
  checkInDate: z.string(), // Accept ISO string
  checkOutDate: z.string(), // Accept ISO string
  adults: z.number().int().positive(),
  children: z.number().int().nonnegative().default(0),
  specialRequests: z.string().optional(),
  totalPrice: z.number().int().positive(),
});

// Spa Services schema
export const spaServices = pgTable("spa_services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  duration: integer("duration").notNull(), // in minutes
  price: integer("price").notNull(),
  imageUrl: text("image_url"),
});

export const insertSpaServiceSchema = createInsertSchema(spaServices).pick({
  name: true,
  description: true,
  duration: true,
  price: true,
  imageUrl: true,
});

// Spa Bookings schema
export const spaBookings = pgTable("spa_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // References users table, can be null for guest bookings
  serviceId: integer("service_id").notNull(),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  guestPhone: text("guest_phone"),
  date: timestamp("date").notNull(),
  time: text("time").notNull(),
  participants: integer("participants").default(1),
  specialRequests: text("special_requests"),
  totalPrice: integer("total_price").notNull(),
  status: text("status").default("confirmed"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Custom Spa Booking Schema with string date handling
export const insertSpaBookingSchema = z.object({
  userId: z.number().int().positive().optional(),
  serviceId: z.number().int().positive(),
  guestName: z.string().min(2),
  guestEmail: z.string().email(),
  guestPhone: z.string().optional(),
  date: z.string(), // Accept ISO string
  time: z.string(),
  participants: z.number().int().positive(),
  specialRequests: z.string().optional(),
  totalPrice: z.number().int().positive(),
});

// Restaurant Menu Items schema
export const restaurantMenus = pgTable("restaurant_menus", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  imageUrl: text("image_url"),
});

export const insertRestaurantMenuSchema = createInsertSchema(restaurantMenus).pick({
  name: true,
  description: true,
  price: true,
  imageUrl: true,
});

// Restaurant Bookings schema
export const restaurantBookings = pgTable("restaurant_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // References users table, can be null for guest bookings
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  guestPhone: text("guest_phone"),
  date: timestamp("date").notNull(),
  time: text("time").notNull(),
  partySize: integer("party_size").notNull(),
  mealPeriod: text("meal_period").notNull(), // breakfast, lunch, or dinner
  specialRequests: text("special_requests"),
  status: text("status").default("confirmed"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Custom Restaurant Booking Schema with string date handling
export const insertRestaurantBookingSchema = z.object({
  userId: z.number().int().positive().optional(),
  guestName: z.string().min(2),
  guestEmail: z.string().email(),
  guestPhone: z.string().optional(),
  date: z.string(), // Accept ISO string
  time: z.string(),
  partySize: z.number().int().positive(),
  mealPeriod: z.string(),
  specialRequests: z.string().optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type RoomType = typeof roomTypes.$inferSelect;
export type InsertRoomType = z.infer<typeof insertRoomTypeSchema>;

export type RoomBooking = typeof roomBookings.$inferSelect;
export type InsertRoomBooking = z.infer<typeof insertRoomBookingSchema>;

// Booking status enum and schema for status updates
export const BookingStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CHECKED_IN: "checked-in",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type BookingStatusType = typeof BookingStatus[keyof typeof BookingStatus];

export const updateBookingStatusSchema = z.object({
  status: z.enum([
    BookingStatus.PENDING,
    BookingStatus.CONFIRMED,
    BookingStatus.CHECKED_IN, 
    BookingStatus.COMPLETED,
    BookingStatus.CANCELLED
  ]),
});

export type SpaService = typeof spaServices.$inferSelect;
export type InsertSpaService = z.infer<typeof insertSpaServiceSchema>;

export type SpaBooking = typeof spaBookings.$inferSelect;
export type InsertSpaBooking = z.infer<typeof insertSpaBookingSchema>;

export type RestaurantMenu = typeof restaurantMenus.$inferSelect;
export type InsertRestaurantMenu = z.infer<typeof insertRestaurantMenuSchema>;

export type RestaurantBooking = typeof restaurantBookings.$inferSelect;
export type InsertRestaurantBooking = z.infer<typeof insertRestaurantBookingSchema>;

// Define relations between tables
export const usersRelations = relations(users, ({ many }) => ({
  roomBookings: many(roomBookings),
  spaBookings: many(spaBookings),
  restaurantBookings: many(restaurantBookings),
}));

export const roomTypesRelations = relations(roomTypes, ({ many }) => ({
  bookings: many(roomBookings),
}));

export const roomBookingsRelations = relations(roomBookings, ({ one }) => ({
  user: one(users, {
    fields: [roomBookings.userId],
    references: [users.id],
  }),
  roomType: one(roomTypes, {
    fields: [roomBookings.roomTypeId],
    references: [roomTypes.id],
  }),
}));

export const spaServicesRelations = relations(spaServices, ({ many }) => ({
  bookings: many(spaBookings),
}));

export const spaBookingsRelations = relations(spaBookings, ({ one }) => ({
  user: one(users, {
    fields: [spaBookings.userId],
    references: [users.id],
  }),
  service: one(spaServices, {
    fields: [spaBookings.serviceId],
    references: [spaServices.id],
  }),
}));

export const restaurantMenusRelations = relations(restaurantMenus, ({ many }) => ({
  // No direct relation in current schema
}));

export const restaurantBookingsRelations = relations(restaurantBookings, ({ one }) => ({
  user: one(users, {
    fields: [restaurantBookings.userId],
    references: [users.id],
  }),
}));
