import { z } from 'zod';

// Define the UserRole schema
export const UserRoleSchema = z.enum(['Admin', 'Editor', 'User']);
export type UserRole = z.infer<typeof UserRoleSchema>;

// Define the main User schema, representing a user in the database
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  password: z.string().describe("The user's hashed password."),
  role: UserRoleSchema,
  createdAt: z.string().datetime(),
});
export type User = z.infer<typeof UserSchema>;

// Schema for creating a new user (omits id and createdAt)
export const CreateUserSchema = UserSchema.omit({ id: true, createdAt: true });
export type CreateUser = z.infer<typeof CreateUserSchema>;

// Schema for updating a user (all fields are optional)
export const UpdateUserSchema = CreateUserSchema.partial();
export type UpdateUser = z.infer<typeof UpdateUserSchema>;


// Schema for changing a password
export const ChangePasswordSchema = z.object({
    userId: z.string(),
    oldPassword: z.string(),
    newPassword: z.string(),
});
export type ChangePassword = z.infer<typeof ChangePasswordSchema>;
