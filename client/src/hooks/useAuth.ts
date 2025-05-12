import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { AuthState, LoginCredentials, Admin } from "@/lib/types";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  // Check session on initial load
  const { data: sessionData, isLoading } = useQuery({
    queryKey: ["/api/session"],
    onSuccess: (data) => {
      setAuthState({
        isAuthenticated: data.isAuthenticated,
        user: data.user || null,
        isLoading: false,
      });
    },
    onError: () => {
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (data) => {
      setAuthState({
        isAuthenticated: true,
        user: data.user as Admin,
        isLoading: false,
      });
      setLocation("/admin");
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/logout");
      return await res.json();
    },
    onSuccess: () => {
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
      setLocation("/login");
    },
  });

  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
  };

  return React.createElement(AuthContext.Provider, 
    { value: contextValue },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
