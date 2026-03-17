"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, LayoutDashboard, Search, Bookmark } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">X</span>
          </div>
          <span className="text-xl font-bold text-gray-900">
            Xovix <span className="text-primary">Business Finder</span>
          </span>
        </Link>

        {/* Nav Links — only when logged in */}
        {user && (
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-1.5 text-sm font-semibold text-gray-600 hover:text-primary transition-colors">
              <Search className="w-4 h-4" />
              <span>Search</span>
            </Link>
            <Link href="/dashboard" className="flex items-center space-x-1.5 text-sm font-semibold text-gray-600 hover:text-primary transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link href="/leads" className="flex items-center space-x-1.5 text-sm font-semibold text-gray-600 hover:text-primary transition-colors">
              <Bookmark className="w-4 h-4" />
              <span>Saved Leads</span>
            </Link>
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {!user ? (
            <>
              <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-primary transition-colors">
                Login
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200">
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-700">{user}</span>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
