
'use server';

/**
 * @fileOverview Manages users through a service layer, allowing for fetching, adding, deleting, and updating.
 * This connects to a real database (Upstash KV).
 */

import { ai } from '@/ai/genkit';
import { User, UserSchema, CreateUserSchema, UpdateUserSchema, ChangePasswordSchema } from '@/types/user';
import { z } from 'genkit';
import {
  getUsers as getUsersFromService,
  addUser as addUserToService,
  updateUser as updateUserInService,
  deleteUser as deleteUserFromService,
  getUserById as getUserByIdFromService, // Import new function
} from '@/services/user-service';
import bcrypt from 'bcryptjs';


// Exported functions for client-side use
export async function getUsers(): Promise<User[]> {
  return getUsersFlow();
}

export async function addUser(user: z.infer<typeof CreateUserSchema>): Promise<User> {
  return addUserFlow(user);
}

export async function updateUser(user: { id: string; data: z.infer<typeof UpdateUserSchema> }): Promise<User | null> {
    return updateUserFlow(user);
}

export async function deleteUser(id: string): Promise<{ success: boolean }> {
  return deleteUserFlow(id);
}

export async function changePassword(input: z.infer<typeof ChangePasswordSchema>): Promise<{ success: boolean; message: string }> {
    return changePasswordFlow(input);
}


// Genkit Flows
const getUsersFlow = ai.defineFlow(
  {
    name: 'getUsersFlow',
    outputSchema: z.array(UserSchema),
  },
  async () => {
    return getUsersFromService();
  }
);

const addUserFlow = ai.defineFlow(
  {
    name: 'addUserFlow',
    inputSchema: CreateUserSchema,
    outputSchema: UserSchema,
  },
  async (user) => {
    return addUserToService(user);
  }
);

const updateUserFlow = ai.defineFlow(
  {
    name: 'updateUserFlow',
    inputSchema: z.object({ id: z.string(), data: UpdateUserSchema }),
    outputSchema: UserSchema.nullable(),
  },
  async ({ id, data }) => {
    return updateUserInService(id, data);
  }
);

const deleteUserFlow = ai.defineFlow(
  {
    name: 'deleteUserFlow',
    inputSchema: z.string(),
    outputSchema: z.object({ success: z.boolean() }),
  },
  async (id) => {
    await deleteUserFromService(id);
    return { success: true };
  }
);

const changePasswordFlow = ai.defineFlow(
    {
        name: 'changePasswordFlow',
        inputSchema: ChangePasswordSchema,
        outputSchema: z.object({ success: z.boolean(), message: z.string() }),
    },
    async ({ userId, oldPassword, newPassword }) => {
        const user = await getUserByIdFromService(userId);
        if (!user) {
            return { success: false, message: 'User not found.' };
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return { success: false, message: 'Incorrect old password.' };
        }

        await updateUserInService(userId, { password: newPassword });

        return { success: true, message: 'Password updated successfully!' };
    }
);
