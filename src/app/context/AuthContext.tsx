import { createContext, use, type ReactNode } from "react";

interface AuthContextValue {
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const context = use(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => (
  <AuthContext value={{ isAuthenticated: true }}>{children}</AuthContext>
);
