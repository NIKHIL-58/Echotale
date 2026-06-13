'use client';
import { create } from 'zustand';
import type { User } from '@/types/user';
export const useAuthStore = create<{user: User | null; setUser: (user: User | null)=>void}>((set)=>({ user:null, setUser:(user)=>set({user}) }));
