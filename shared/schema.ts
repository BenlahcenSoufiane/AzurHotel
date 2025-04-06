import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  email: text("email"),
  phone: text("phone"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  phone: true,
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
});

export const insertRoomBookingSchema = createInsertSchema(roomBookings).pick({
  roomTypeId: true,
  guestName: true,
  guestEmail: true,
  guestPhone: true,
  checkInDate: true,
  checkOutDate: true,
  adults: true,
  children: true,
  specialRequests: true,
  totalPrice: true,
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
});

export const insertSpaBookingSchema = createInsertSchema(spaBookings).pick({
  serviceId: true,
  guestName: true,
  guestEmail: true,
  guestPhone: true,
  date: true,
  time: true,
  participants: true,
  specialRequests: true,
  totalPrice: true,
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
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  guestPhone: text("guest_phone"),
  date: timestamp("date").notNull(),
  time: text("time").notNull(),
  partySize: integer("party_size").notNull(),
  mealPeriod: text("meal_period").notNull(), // breakfast, lunch, or dinner
  specialRequests: text("special_requests"),
  status: text("status").default("confirmed"),
});

export const insertRestaurantBookingSchema = createInsertSchema(restaurantBookings).pick({
  guestName: true,
  guestEmail: true,
  guestPhone: true,
  date: true,
  time: true,
  partySize: true,
  mealPeriod: true,
  specialRequests: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type RoomType = typeof roomTypes.$inferSelect;
export type InsertRoomType = z.infer<typeof insertRoomTypeSchema>;

export type RoomBooking = typeof roomBookings.$inferSelect;
export type InsertRoomBooking = z.infer<typeof insertRoomBookingSchema>;

export type SpaService = typeof spaServices.$inferSelect;
export type InsertSpaService = z.infer<typeof insertSpaServiceSchema>;

export type SpaBooking = typeof spaBookings.$inferSelect;
export type InsertSpaBooking = z.infer<typeof insertSpaBookingSchema>;

export type RestaurantMenu = typeof restaurantMenus.$inferSelect;
export type InsertRestaurantMenu = z.infer<typeof insertRestaurantMenuSchema>;

export type RestaurantBooking = typeof restaurantBookings.$inferSelect;
export type InsertRestaurantBooking = z.infer<typeof insertRestaurantBookingSchema>;
