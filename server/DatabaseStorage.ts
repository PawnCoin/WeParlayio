import { 
  users, 
  User, 
  InsertUser,
  UpsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Implementation of the database storage using Drizzle ORM
export class DatabaseStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Since we've migrated to Replit auth, we'll use email instead of username
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user || undefined;
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }
  
  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  async updateUserBalance(userId: string, amount: number): Promise<User> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const [updatedUser] = await db
      .update(users)
      .set({ 
        balance: (user.balance || 1000) + amount,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser;
  }
  
  async updateYahooIntegration(
    userId: string, 
    token: string, 
    refreshToken: string, 
    expiry: Date
  ): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        yahooIntegrationToken: token,
        yahooIntegrationRefreshToken: refreshToken,
        yahooIntegrationExpiry: expiry,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser;
  }
}