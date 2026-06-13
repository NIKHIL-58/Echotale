'use client';
import { create } from 'zustand';
export const useUiStore = create<{sidebarOpen:boolean; toggleSidebar:()=>void}>((set)=>({ sidebarOpen:false, toggleSidebar:()=>set((s)=>({sidebarOpen:!s.sidebarOpen})) }));
