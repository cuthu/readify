/**
 * @fileOverview A service for managing users using Upstash KV.
 */

import { Redis } from '@upstash/redis';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { User, CreateUser, UpdateUser } from '@/types/user';

// Initialize the Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const USERS_KEY = 'users';

/**
 * Retrieves all users.
 * @returns A promise that resolves to an array of users.
 */
export async function getUsers(): Promise<User[]> {
  const userMap = await redis.get<Record<string, User>>(USERS_KEY);
  if (!userMap) {
    return [];
  }
  return Object.values(userMap);
}

/**
 * Retrieves a single user by their email.
 * @param email - The email of the user to retrieve.
 * @returns A promise that resolves to the user or null if not found.
 */
export async function getUserByEmail(email: string): Promise<User | null> {
    const users = await getUsers();
    return users.find(user => user.email === email) || null;
}


/**
 * Retrieves a single user by their ID.
 * @param id - The ID of the user to retrieve.
 * @returns A promise that resolves to the user or null if not found.
 */
export async function getUserById(id: string): Promise<User | null> {
    const userMap = await redis.get<Record<string, User>>(USERS_KEY);
    return userMap?.[id] || null;
}


/**
 * Adds a new user, hashing their password.
 * @param user - The user data to add (with a plain text password).
 * @returns A promise that resolves to the newly created user.
 */
export async function addUser(user: CreateUser): Promise<User> {
  const newId = randomUUID();
  const hashedPassword = await bcrypt.hash(user.password, 10);
  
  const newUser: User = { 
    ...user, 
    id: newId, 
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  };

  const userMap = await redis.get<Record<string, User>>(USERS_KEY) || {};
  userMap[newId] = newUser;
  await redis.set(USERS_KEY, userMap);

  return newUser;
}

/**
 * Updates an existing user's data.
 * @param id - The ID of the user to update.
 * @param data - The partial user data to update.
 * @returns A promise that resolves to the updated user or null if not found.
 */
export async function updateUser(id: string, data: UpdateUser): Promise<User | null> {
    const userMap = await redis.get<Record<string, User>>(USERS_KEY);
    if (!userMap || !userMap[id]) {
        return null;
    }

    const updatedUser = { ...userMap[id], ...data };

    if (data.password) {
        updatedUser.password = await bcrypt.hash(data.password, 10);
    }
    
    userMap[id] = updatedUser;
    await redis.set(USERS_KEY, userMap);

    return updatedUser;
}

/**
 * Deletes a user by their ID.
 * @param id - The ID of the user to delete.
 * @returns A promise that resolves when the user is deleted.
 */
export async function deleteUser(id: string): Promise<void> {
  const userMap = await redis.get<Record<string, User>>(USERS_KEY);
  if (userMap && userMap[id]) {
    delete userMap[id];
    await redis.set(USERS_KEY, userMap);
  }
}
