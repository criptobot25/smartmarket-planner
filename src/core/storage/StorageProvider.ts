/**
 * PASSO 38 - Cloud-Ready Storage Provider
 * 
 * Abstraction layer for data persistence:
 * - LocalStorage for offline/demo mode
 * - Cloud sync interface (Future: Firebase, Supabase, custom backend)
 * - User-specific data isolation
 */

import { WeeklyPlan } from "../models/WeeklyPlan";
import { User } from "../../models/User";
import { getCurrentUser } from "../auth/AuthProvider";

// ============================================================================
// Storage Types
// ============================================================================

export interface StorageKey {
  userId: string;
  dataType: "weeklyPlan" | "preferences" | "customFoods" | "shoppingLists";
  id?: string;
}

export interface StorageOptions {
  userId?: string;
  syncToCloud?: boolean;
}

export interface StorageMetadata {
  createdAt: Date;
  updatedAt: Date;
  syncedAt?: Date;
  version: number;
}

export interface StoredData<T> {
  data: T;
  metadata: StorageMetadata;
}

/**
 * Wrapper for WeeklyPlan with user context for storage.
 * WeeklyPlan itself remains pure (no userId, no premiumStatus).
 * Storage layer adds user association.
 */
export interface StoredPlan {
  userId: string;
  plan: WeeklyPlan;
  metadata?: StorageMetadata; // Optional for backward compatibility
}

// ============================================================================
// Storage Provider Interface
// ============================================================================

export interface IStorageProvider {
  // Weekly Plans
  saveWeeklyPlan(plan: WeeklyPlan, options?: StorageOptions): Promise<void>;
  getWeeklyPlan(planId: string, options?: StorageOptions): Promise<WeeklyPlan | null>;
  getAllWeeklyPlans(options?: StorageOptions): Promise<WeeklyPlan[]>;
  deleteWeeklyPlan(planId: string, options?: StorageOptions): Promise<void>;
  
  // StoredPlan Methods (Type-Safe User Association)
  saveStoredPlan(storedPlan: StoredPlan): Promise<void>;
  getStoredPlan(planId: string, userId: string): Promise<StoredPlan | null>;
  getAllStoredPlans(userId: string): Promise<StoredPlan[]>;
  
  // Generic storage
  save<T>(key: StorageKey, data: T): Promise<void>;
  get<T>(key: StorageKey): Promise<T | null>;
  delete(key: StorageKey): Promise<void>;
  list(userId: string, dataType: string): Promise<string[]>;
  
  // Sync
  syncToCloud(userId: string): Promise<void>;
  syncFromCloud(userId: string): Promise<void>;
  
  // Utilities
  clear(userId: string): Promise<void>;
  getUserDataSize(userId: string): Promise<number>;
}

// ============================================================================
// Local Storage Provider (localStorage-based)
// ============================================================================

export class LocalStorageProvider implements IStorageProvider {
  private static readonly PREFIX = "nutripilot_data_";
  private static readonly LEGACY_PREFIX = "smartmarket_data_";

  // ========================================================================
  // Weekly Plans
  // ========================================================================

  async saveWeeklyPlan(plan: WeeklyPlan, options?: StorageOptions): Promise<void> {
    const user = await this.getUserOrThrow(options);
    
    const key: StorageKey = {
      userId: user.id,
      dataType: "weeklyPlan",
      id: plan.id || this.generateId()
    };

    // Ensure plan has ID
    if (!plan.id) {
      plan.id = key.id!;
    }

    await this.save(key, plan);
  }

  async getWeeklyPlan(planId: string, options?: StorageOptions): Promise<WeeklyPlan | null> {
    const user = await this.getUserOrThrow(options);
    
    const key: StorageKey = {
      userId: user.id,
      dataType: "weeklyPlan",
      id: planId
    };

    return this.get<WeeklyPlan>(key);
  }

  async getAllWeeklyPlans(options?: StorageOptions): Promise<WeeklyPlan[]> {
    const user = await this.getUserOrThrow(options);
    
    const planIds = await this.list(user.id, "weeklyPlan");
    const plans: WeeklyPlan[] = [];

    for (const planId of planIds) {
      const plan = await this.getWeeklyPlan(planId, { userId: user.id });
      if (plan) {
        plans.push(plan);
      }
    }

    return plans.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });
  }

  async deleteWeeklyPlan(planId: string, options?: StorageOptions): Promise<void> {
    const user = await this.getUserOrThrow(options);
    
    const key: StorageKey = {
      userId: user.id,
      dataType: "weeklyPlan",
      id: planId
    };

    await this.delete(key);
  }

  // ========================================================================
  // StoredPlan Helpers (Type-Safe User Association)
  // ========================================================================

  /**
   * Save a WeeklyPlan with explicit user association via StoredPlan wrapper.
   * This is the preferred method for clarity about data ownership.
   */
  async saveStoredPlan(storedPlan: StoredPlan): Promise<void> {
    await this.saveWeeklyPlan(storedPlan.plan, { userId: storedPlan.userId });
  }

  /**
   * Get a WeeklyPlan and wrap it with user context as StoredPlan.
   */
  async getStoredPlan(planId: string, userId: string): Promise<StoredPlan | null> {
    const plan = await this.getWeeklyPlan(planId, { userId });
    if (!plan) return null;

    return {
      userId,
      plan,
    };
  }

  /**
   * Get all plans for a user as StoredPlan objects.
   */
  async getAllStoredPlans(userId: string): Promise<StoredPlan[]> {
    const plans = await this.getAllWeeklyPlans({ userId });
    return plans.map(plan => ({
      userId,
      plan,
    }));
  }

  // ========================================================================
  // Generic Storage
  // ========================================================================

  async save<T>(key: StorageKey, data: T): Promise<void> {
    const storageKey = this.buildStorageKey(key);
    
    const storedData: StoredData<T> = {
      data,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    };

    // Check if existing
    const existing = this.getFromLocalStorageWithFallback<T>(storageKey);
    if (existing) {
      storedData.metadata.createdAt = existing.metadata.createdAt;
      storedData.metadata.version = existing.metadata.version + 1;
    }

    this.saveToLocalStorage(storageKey, storedData);
  }

  async get<T>(key: StorageKey): Promise<T | null> {
    const storageKey = this.buildStorageKey(key);
    const stored = this.getFromLocalStorageWithFallback<T>(storageKey);
    if (!stored) return null;
    
    // Restore Date objects for WeeklyPlan
    if (key.dataType === "weeklyPlan" && stored.data) {
      const plan = stored.data as any;
      if (plan.createdAt) plan.createdAt = new Date(plan.createdAt);
    }
    
    return stored.data;
  }

  async delete(key: StorageKey): Promise<void> {
    const storageKey = this.buildStorageKey(key);
    localStorage.removeItem(storageKey);
    const legacyStorageKey = this.buildLegacyStorageKey(key);
    localStorage.removeItem(legacyStorageKey);
  }

  async list(userId: string, dataType: string): Promise<string[]> {
    const currentPrefix = this.buildStorageKey({ userId, dataType: dataType as any });
    const legacyPrefix = this.buildLegacyStorageKey({ userId, dataType: dataType as any });
    const ids = new Set<string>();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(currentPrefix) || key.startsWith(legacyPrefix))) {
        // Extract ID from key
        const parts = key.split("_");
        const id = parts[parts.length - 1];
        if (id && id !== dataType) {
          ids.add(id);
        }
      }
    }

    return Array.from(ids);
  }

  // ========================================================================
  // Cloud Sync (Stub - for future implementation)
  // ========================================================================

  async syncToCloud(_userId: string): Promise<void> {
    console.log(`[LocalStorage] Cloud sync not yet implemented for user ${_userId}`);
    // Future: Upload all user data to cloud backend
  }

  async syncFromCloud(_userId: string): Promise<void> {
    console.log(`[LocalStorage] Cloud sync not yet implemented for user ${_userId}`);
    // Future: Download and merge user data from cloud
  }

  // ========================================================================
  // Utilities
  // ========================================================================

  async clear(userId: string): Promise<void> {
    const prefix = `${LocalStorageProvider.PREFIX}${userId}_`;
    const legacyPrefix = `${LocalStorageProvider.LEGACY_PREFIX}${userId}_`;
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(prefix) || key.startsWith(legacyPrefix))) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  async getUserDataSize(userId: string): Promise<number> {
    const prefix = `${LocalStorageProvider.PREFIX}${userId}_`;
    const legacyPrefix = `${LocalStorageProvider.LEGACY_PREFIX}${userId}_`;
    let totalSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(prefix) || key.startsWith(legacyPrefix))) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }
    }

    return totalSize;
  }

  // ========================================================================
  // Helper Methods
  // ========================================================================

  private buildStorageKey(key: StorageKey): string {
    let storageKey = `${LocalStorageProvider.PREFIX}${key.userId}_${key.dataType}`;
    if (key.id) {
      storageKey += `_${key.id}`;
    }
    return storageKey;
  }

  private buildLegacyStorageKey(key: StorageKey): string {
    let storageKey = `${LocalStorageProvider.LEGACY_PREFIX}${key.userId}_${key.dataType}`;
    if (key.id) {
      storageKey += `_${key.id}`;
    }
    return storageKey;
  }

  private saveToLocalStorage<T>(key: string, data: StoredData<T>): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
      throw new Error("Storage quota exceeded");
    }
  }

  private getFromLocalStorage<T>(key: string): StoredData<T> | null {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;

      const parsed = JSON.parse(data);
      
      // Restore Date objects
      if (parsed.metadata) {
        parsed.metadata.createdAt = new Date(parsed.metadata.createdAt);
        parsed.metadata.updatedAt = new Date(parsed.metadata.updatedAt);
        if (parsed.metadata.syncedAt) {
          parsed.metadata.syncedAt = new Date(parsed.metadata.syncedAt);
        }
      }

      return parsed;
    } catch (error) {
      console.error("Failed to read from localStorage:", error);
      return null;
    }
  }

  private getFromLocalStorageWithFallback<T>(key: string): StoredData<T> | null {
    const current = this.getFromLocalStorage<T>(key);
    if (current) {
      return current;
    }

    const legacyKey = key.replace(LocalStorageProvider.PREFIX, LocalStorageProvider.LEGACY_PREFIX);
    return this.getFromLocalStorage<T>(legacyKey);
  }

  private async getUserOrThrow(options?: StorageOptions): Promise<User> {
    let user: User | null = null;

    if (options?.userId) {
      // Mock user from userId
      user = {
        id: options.userId,
        email: "mock@user.com",
        createdAt: new Date(),
        lastLoginAt: new Date()
      };
    } else {
      user = await getCurrentUser();
    }

    if (!user) {
      throw new Error("No authenticated user. Please log in first.");
    }

    return user;
  }

  private generateId(): string {
    return `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // For testing
  clearAllData(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(LocalStorageProvider.PREFIX) || key.startsWith(LocalStorageProvider.LEGACY_PREFIX))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

// ============================================================================
// Cloud Storage Provider (Future: Firebase, Supabase, etc.)
// ============================================================================

export class CloudStorageProvider implements IStorageProvider {
  // Reserved for future cloud API implementation
  private _apiUrl: string;
  private localCache: LocalStorageProvider;

  constructor(apiUrl: string = "https://api.smartmarket.com") {
    this._apiUrl = apiUrl;
    this.localCache = new LocalStorageProvider();
  }

  async saveWeeklyPlan(plan: WeeklyPlan, options?: StorageOptions): Promise<void> {
    console.warn("[CloudStorage] Cloud storage not yet implemented, using local cache");
    return this.localCache.saveWeeklyPlan(plan, options);
  }

  async getWeeklyPlan(planId: string, options?: StorageOptions): Promise<WeeklyPlan | null> {
    console.warn("[CloudStorage] Cloud storage not yet implemented, using local cache");
    return this.localCache.getWeeklyPlan(planId, options);
  }

  async getAllWeeklyPlans(options?: StorageOptions): Promise<WeeklyPlan[]> {
    console.warn("[CloudStorage] Cloud storage not yet implemented, using local cache");
    return this.localCache.getAllWeeklyPlans(options);
  }

  async deleteWeeklyPlan(planId: string, options?: StorageOptions): Promise<void> {
    console.warn("[CloudStorage] Cloud storage not yet implemented, using local cache");
    return this.localCache.deleteWeeklyPlan(planId, options);
  }

  // StoredPlan Methods
  async saveStoredPlan(storedPlan: StoredPlan): Promise<void> {
    console.warn("[CloudStorage] Cloud storage not yet implemented, using local cache");
    return this.localCache.saveStoredPlan(storedPlan);
  }

  async getStoredPlan(planId: string, userId: string): Promise<StoredPlan | null> {
    console.warn("[CloudStorage] Cloud storage not yet implemented, using local cache");
    return this.localCache.getStoredPlan(planId, userId);
  }

  async getAllStoredPlans(userId: string): Promise<StoredPlan[]> {
    console.warn("[CloudStorage] Cloud storage not yet implemented, using local cache");
    return this.localCache.getAllStoredPlans(userId);
  }

  async save<T>(key: StorageKey, data: T): Promise<void> {
    return this.localCache.save(key, data);
  }

  async get<T>(key: StorageKey): Promise<T | null> {
    return this.localCache.get(key);
  }

  async delete(key: StorageKey): Promise<void> {
    return this.localCache.delete(key);
  }

  async list(userId: string, dataType: string): Promise<string[]> {
    return this.localCache.list(userId, dataType);
  }

  async syncToCloud(_userId: string): Promise<void> {
    console.warn("[CloudStorage] Cloud sync not yet implemented");
    // Future: POST to cloud API
  }

  async syncFromCloud(_userId: string): Promise<void> {
    console.warn("[CloudStorage] Cloud sync not yet implemented");
    // Future: GET from cloud API
  }

  async clear(userId: string): Promise<void> {
    return this.localCache.clear(userId);
  }

  async getUserDataSize(userId: string): Promise<number> {
    return this.localCache.getUserDataSize(userId);
  }
}

// ============================================================================
// Singleton Pattern
// ============================================================================

let storageProviderInstance: IStorageProvider = new LocalStorageProvider();

export function getStorageProvider(): IStorageProvider {
  return storageProviderInstance;
}

export function setStorageProvider(provider: IStorageProvider): void {
  storageProviderInstance = provider;
}

export function resetStorageProvider(): void {
  storageProviderInstance = new LocalStorageProvider();
}

// ============================================================================
// Helper Functions
// ============================================================================

export async function saveUserWeeklyPlan(plan: WeeklyPlan): Promise<void> {
  return getStorageProvider().saveWeeklyPlan(plan);
}

export async function getUserWeeklyPlan(planId: string): Promise<WeeklyPlan | null> {
  return getStorageProvider().getWeeklyPlan(planId);
}

export async function getAllUserWeeklyPlans(): Promise<WeeklyPlan[]> {
  return getStorageProvider().getAllWeeklyPlans();
}

export async function deleteUserWeeklyPlan(planId: string): Promise<void> {
  return getStorageProvider().deleteWeeklyPlan(planId);
}
