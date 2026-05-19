import { createContext, useState, ReactNode, useContext, useEffect } from "react";
import { getUserProfile } from "../services/userService";
import { logout as logoutService } from "../services/authService";
import { useNavigate, useLocation } from "react-router-dom";
import { useLoader } from "./LoaderContext";

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean; // Added to prevent flickering/premature redirects
    checkAuth: () => Promise<void>;
    logout: () => void;
}
interface User {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin"; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const { isLoading, setIsLoading } = useLoader(); // Start as loading
    const navigate = useNavigate();

    // !!null is false, !!{obj} is true. This works perfectly.
    const isAuthenticated = !!user;

    const checkAuth = async () => {
        setIsLoading(true);
        try {
            const userData = await getUserProfile();
            // Assuming your backend returns data directly or in a .data wrapper
            if (userData) {
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch (error) {
            setUser(null);
            // Only redirect if they are trying to access a protected page
            // Otherwise, let them stay on the landing/login page
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const logout = async () => {
        try {
            await logoutService().then((res) => {
                if (res.status === 200) {
                    cookieStore.delete("token");
                    setUser(null);
                    navigate("/");
                }  
            }).catch((err) => {
                console.error("Error logging out:", err);
            });
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, isLoading, checkAuth, logout }}>
            {!isLoading && children} 
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};