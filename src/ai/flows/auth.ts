'use server';

/**
 * @fileOverview Manages user authentication.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getUserByEmail } from '@/services/user-service';
import bcrypt from 'bcryptjs';
import { UserSchema } from '@/types/user';

const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;


const LoginOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  // Omit password from the returned user object for security
  user: UserSchema.omit({ password: true, createdAt: true }).optional(),
});
export type LoginOutput = z.infer<typeof LoginOutputSchema>;


export async function login(input: LoginInput): Promise<LoginOutput> {
  return loginFlow(input);
}

const loginFlow = ai.defineFlow(
  {
    name: 'loginFlow',
    inputSchema: LoginInputSchema,
    outputSchema: LoginOutputSchema,
  },
  async ({ email, password }) => {
    const user = await getUserByEmail(email);

    if (!user) {
      return { success: false, message: 'Invalid email or password.' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { success: false, message: 'Invalid email or password.' };
    }
    
    // Don't send password hash to client
    const { password: _, ...userWithoutPassword } = user;

    return { 
        success: true, 
        message: 'Login successful!',
        user: userWithoutPassword,
    };
  }
);
