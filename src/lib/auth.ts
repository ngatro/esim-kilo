import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(name: string, email: string, password: string) {
  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "user",
    },
  });
  return user;
}

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user;
}

export async function getUserById(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  return user;
}

export async function verifyLogin(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user) return null;
  
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) return null;
  
  return user;
}