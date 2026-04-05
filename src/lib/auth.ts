import { generateId } from "./mock-data";

export interface User {
  email: string;
  anonId: string;
  createdAt: string;
}

export function getUser(): User | null {
  const stored = localStorage.getItem("ps4_user");
  if (stored) return JSON.parse(stored);
  return null;
}

export function login(email: string, _password: string): User {
  const existing = localStorage.getItem("ps4_users");
  const users: Record<string, User & { password: string }> = existing ? JSON.parse(existing) : {};
  
  const user = users[email];
  if (user) {
    const sessionUser = { email: user.email, anonId: user.anonId, createdAt: user.createdAt };
    localStorage.setItem("ps4_user", JSON.stringify(sessionUser));
    return sessionUser;
  }
  
  throw new Error("Invalid credentials");
}

export function signup(email: string, password: string): User {
  const existing = localStorage.getItem("ps4_users");
  const users: Record<string, User & { password: string }> = existing ? JSON.parse(existing) : {};
  
  if (users[email]) {
    throw new Error("Account already exists");
  }
  
  const anonId = generateId("anon");
  const user = { email, password, anonId, createdAt: new Date().toISOString().split("T")[0] };
  users[email] = user;
  localStorage.setItem("ps4_users", JSON.stringify(users));
  
  return { email, anonId, createdAt: user.createdAt };
}

export function logout() {
  localStorage.removeItem("ps4_user");
}
