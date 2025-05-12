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
    return await db.select().from(users);
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
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.username, username));
    return admin || undefined;
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
    const adminExists = await this.getAdmin("admin");
    if (!adminExists) {
      await this.createAdmin({
        username: "admin",
        password: "password" // In a real app, this would be hashed
      });
      console.log("Created default admin user");
    }
  }
}

export const storage = new DatabaseStorage();
