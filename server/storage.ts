import { users, admins, type User, type InsertUser, type Admin, type InsertAdmin } from "@shared/schema";
import { db } from "./db";
import { eq, or, ilike } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  searchUsers(query: string): Promise<User[]>;
  getAdmin(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    console.log("Getting all users from database...");
    try {
      const allUsers = await db.select().from(users);
      console.log(`Retrieved ${allUsers.length} users from database:`, allUsers);
      return allUsers;
    } catch (error) {
      console.error("Error retrieving all users:", error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });
    return result.length > 0;
  }

  async searchUsers(query: string): Promise<User[]> {
    if (!query.trim()) {
      return this.getAllUsers();
    }
    
    const searchPattern = `%${query}%`;
    return await db
      .select()
      .from(users)
      .where(
        or(
          ilike(users.name, searchPattern),
          ilike(users.email, searchPattern),
          ilike(users.mobile, searchPattern),
          ilike(users.address, searchPattern)
        )
      );
  }

  async getAdmin(username: string): Promise<Admin | undefined> {
    console.log(`Looking for admin with username: ${username}`);
    try {
      const allAdmins = await db.select().from(admins);
      console.log(`Found ${allAdmins.length} total admin accounts`);
      
      const [admin] = await db
        .select()
        .from(admins)
        .where(eq(admins.username, username));
      
      console.log(`Admin lookup result:`, admin || 'No admin found');
      return admin || undefined;
    } catch (error) {
      console.error(`Error finding admin (${username}):`, error);
      throw error;
    }
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const [admin] = await db
      .insert(admins)
      .values(insertAdmin)
      .returning();
    return admin;
  }

  // Initialize the database with default admin user if it doesn't exist
  async initialize(): Promise<void> {
    console.log("Initializing database...");
    try {
      console.log("Checking if admin user exists...");
      const adminExists = await this.getAdmin("admin");
      console.log("Admin check result:", adminExists);
      
      if (!adminExists) {
        console.log("Creating default admin user...");
        const admin = await this.createAdmin({
          username: "admin",
          password: "password" // In a real app, this would be hashed
        });
        console.log("Created default admin user:", admin);
      } else {
        console.log("Default admin user already exists");
      }
    } catch (error) {
      console.error("Error during database initialization:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
