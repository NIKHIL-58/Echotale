import { BookOpen, Compass, Home, Library, Bookmark, History, User, Settings, Bell, Headphones, Crown } from 'lucide-react';

export const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/stories/story-1', label: 'Stories', icon: BookOpen },
  { href: '/explore?type=audiobooks', label: 'Audiobooks', icon: Headphones },
  { href: '/explore?type=podcasts', label: 'Podcasts', icon: Bell },
  { href: '/library', label: 'My Library', icon: Library },
  { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { href: '/history', label: 'History', icon: History },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/premium', label: 'Go Premium', icon: Crown }
];

export const categories = ['Adventure', 'Romance', 'Mystery', 'Sci-Fi', 'Motivation', 'Fantasy'];
