
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface User {
  id: string;
  fullName: string;
  role: "citizen" | "admin" | "department";
  phonenumber?: string;
  email?: string;
  department?: string;
  adminAccessCode?: string;
  designation?: string;
  employeeId?: string;
  place?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  sendOtp: (phonenumber: string) => Promise<{ success: boolean; role?: string; message?: string }>;
  verifyOtp: (phonenumber: string, otp: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  updateUserProfile: (updatedData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("auth_user");

      if (!token || !storedUser) {
        return;
      }

      const parsed = JSON.parse(storedUser);
      const role = parsed.role;
      const userId = parsed.id;

      let endpoint = "";
      if (role === "admin") {
        endpoint = `admin/profile/${userId}`;
      } else if (role === "citizen") {
        endpoint = `citizen/profile/`;
      } else if (role === "department") {
        endpoint = `department/profile`;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok) {
        const updatedUser = { ...parsed, ...result, role };
        setUser(updatedUser);
        localStorage.setItem("auth_user", JSON.stringify(updatedUser));
      } else if (response.status === 404) {
        // If profile not found (e.g., after database reset), clear auth data
        console.warn("Profile not found - clearing authentication data");
        logout();
      } else {
        console.error("Failed to fetch profile:", result.message);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken && storedUser && storedUser !== "undefined") {
      try {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        fetchProfile().finally(() => {
          setIsLoading(false);
        });
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        logout();
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const sendOtp = async (phonenumber: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phonenumber }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Send OTP Error:", error);
      return { success: false, message: "Network error" };
    }
  };

  const verifyOtp = async (phonenumber: string, otp: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phonenumber, otp }),
      });

      const result = await response.json();

      if (!response.ok || !result.token || !result.user) {
        console.error("Invalid verify response:", result);
        return false;
      }

      const authUser: User = {
        id: result.user.id,
        fullName: result.user.fullName || "User",
        role: result.user.role,
        phonenumber: result.user.phonenumber || "",
        email: result.user.email || "",
        department: result.user.department || "",
        adminAccessCode: result.user.adminAccessCode || "",
        designation: result.user.designation || "",
        employeeId: result.user.employeeId || "",
        place: result.user.place || "",
      };

      setToken(result.token);
      setUser(authUser);

      localStorage.setItem("auth_token", result.token);
      localStorage.setItem("auth_user", JSON.stringify(authUser));

      return true;
    } catch (error) {
      console.error("Verify OTP Error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (updatedData: Partial<User>) => {
    setIsLoading(true);
    try {
      if (!token || !user) throw new Error("User is not authenticated");
      const userId = user.id;

      let endpoint = "";
      if (user.role === "admin") {
        endpoint = `admin/${userId}`;
      } else if (user.role === "citizen") {
        endpoint = `citizen/${userId}`;
      } else if (user.role === "department") {
        endpoint = `department/${userId}`;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Profile update failed");
      }

      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      localStorage.setItem("auth_user", JSON.stringify(newUser));

      return result;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        sendOtp,
        verifyOtp,
        logout,
        updateUserProfile,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
