"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Lock, User, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (!success) {
      setError("Invalid username or password. Please try again.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-white">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign In</h1>
          <p className="text-sm text-gray-500">Access the Xovix Business Finder</p>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium p-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-all"
            >
              Sign In
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs text-gray-400">
          Protected by Xovix Labs Security
        </p>
      </div>
    </div>
  );
}
