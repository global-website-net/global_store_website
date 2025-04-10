import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  password: string;
  accessKey: string;
  createdAt: Date;
}

// In-memory storage for users
let users: User[] = [];

// Generate a random access key
function generateAccessKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 16; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export function createUserAccount(userData: Omit<User, 'id' | 'accessKey' | 'createdAt'>): User {
  const newUser: User = {
    ...userData,
    id: Math.random().toString(36).substr(2, 9),
    accessKey: generateAccessKey(),
    createdAt: new Date()
  };
  
  users.push(newUser);
  return newUser;
}

export function getUserByEmail(email: string): User | undefined {
  return users.find(user => user.email === email);
}

export function getUserByAccessKey(accessKey: string): User | undefined {
  return users.find(user => user.accessKey === accessKey);
}

export function getAllUsers(): User[] {
  return users;
} 