import { users, type User, type InsertUser, type ShippingBarSettings, type InsertShippingBarSettings, type UpdateShippingBarSettings, shippingBarSettings, defaultShippingBarSettings } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Shipping bar settings methods
  getSettingsByInstanceId(instanceId: string): Promise<ShippingBarSettings | undefined>;
  createSettings(settings: InsertShippingBarSettings): Promise<ShippingBarSettings>;
  updateSettings(settings: UpdateShippingBarSettings): Promise<ShippingBarSettings | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private shippingBarSettings: Map<string, ShippingBarSettings>;
  currentId: number;
  currentSettingsId: number;

  constructor() {
    this.users = new Map();
    this.shippingBarSettings = new Map();
    this.currentId = 1;
    this.currentSettingsId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getSettingsByInstanceId(instanceId: string): Promise<ShippingBarSettings | undefined> {
    return this.shippingBarSettings.get(instanceId);
  }

  async createSettings(insertSettings: InsertShippingBarSettings): Promise<ShippingBarSettings> {
    const id = this.currentSettingsId++;
    const now = new Date().toISOString();
    
    const settings: ShippingBarSettings = {
      ...insertSettings,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    this.shippingBarSettings.set(insertSettings.instanceId, settings);
    return settings;
  }

  async updateSettings(updateSettings: UpdateShippingBarSettings): Promise<ShippingBarSettings | undefined> {
    const { instanceId, ...updates } = updateSettings;
    const existingSettings = this.shippingBarSettings.get(instanceId);
    
    if (!existingSettings) {
      return undefined;
    }
    
    const updatedSettings: ShippingBarSettings = {
      ...existingSettings,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    this.shippingBarSettings.set(instanceId, updatedSettings);
    return updatedSettings;
  }
}

export const storage = new MemStorage();
