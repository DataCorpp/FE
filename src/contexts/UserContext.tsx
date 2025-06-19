import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { authApi } from "@/lib/api"; // Import authApi
import { ApiResponse } from "@/lib/api"; // Add this import

export type UserRole = "manufacturer" | "brand" | "retailer";

// Role-specific settings interfaces
interface ManufacturerSettings {
  productionCapacity: number;
  certifications: string[];
  preferredCategories: string[];
  minimumOrderValue: number;
}

interface BrandSettings {
  marketSegments: string[];
  brandValues: string[];
  targetDemographics: string[];
  productCategories: string[];
}

interface RetailerSettings {
  storeLocations: number;
  averageOrderValue: number;
  customerBase: string[];
  preferredCategories: string[];
}

// User profile interface
interface UserData {
  id: string;
  name: string;
  email: string;
  companyName: string;
  role: UserRole;
  profileComplete: boolean;
  createdAt: string;
  lastLogin: string;
  notifications: number;
  avatar?: string; // URL to avatar image
  image?: string; // Alternative URL to user image
  profilePic?: string; // URL to profile picture
  status: "online" | "away" | "busy"; // User's online status
  emailVerified?: boolean; // Flag indicating if email is verified
  // Additional profile information
  phone?: string;
  website?: string;
  address?: string;
  description?: string;
  // Role-specific settings based on user role
  manufacturerSettings?: ManufacturerSettings;
  brandSettings?: BrandSettings;
  retailerSettings?: RetailerSettings;
}

// Define a type for profile update data
type ProfileUpdateData = Partial<Omit<UserData, 'id' | 'createdAt'>>;

// Define a type for registration response data
export interface RegistrationResponse {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  token: string;
  verificationCode?: string;
}

interface UserContextType {
  role: UserRole;
  isAuthenticated: boolean;
  user: UserData | null;
  login: (email: string, password: string, role?: UserRole, useSession?: boolean) => Promise<void>;
  register: (userData: Omit<UserData, "id" | "profileComplete" | "createdAt" | "lastLogin" | "notifications"> & { password: string }) => Promise<RegistrationResponse>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  updateUserProfile: (updatedData: Partial<UserData>) => Promise<void>;
  updateRoleSettings: <T extends ManufacturerSettings | BrandSettings | RetailerSettings>(settings: Partial<T>) => void;
  updateUserStatus: (status: "online" | "away" | "busy") => void;
  updateUserAvatar: (avatarUrl: string) => void;
  verifyEmail: (email: string, verificationCode: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<ApiResponse>;
  updateProfile: (profileData: ProfileUpdateData) => Promise<void>;
  updateUserRole: (newRole: UserRole) => Promise<void>;
  updateRoleSettingsInDb: <T extends ManufacturerSettings | BrandSettings | RetailerSettings>(settings: Partial<T>) => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [role, setRole] = useState<UserRole>("manufacturer");

  // Check if user is already logged in from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setRole(userData.role);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string, selectedRole?: UserRole, useSession: boolean = false): Promise<void> => {
    try {
      // Make an actual API call to authenticate
      let response;
      
      if (password === "" && useSession) {
        // OAuth login case - use the session data from backend
        // console.log("OAuth login flow - checking current user from session");
        response = await authApi.getCurrentUser();
      } else {
        // Normal login with password
        response = await authApi.login(email, password, useSession);
      }
      
      if (!response.data || !response.data._id) {
        throw new Error(response.data?.message || "Login failed");
      }
      
      // Get the role from the API response
      const roleFromApi = response.data.role as UserRole;
      
      // Create role-specific settings based on the role from API
      let roleSpecificSettings = {};
      
      if (roleFromApi === "manufacturer") {
        roleSpecificSettings = {
          manufacturerSettings: {
            productionCapacity: 50000,
            certifications: ["ISO 9001", "Organic", "Fair Trade"],
            preferredCategories: ["Food", "Beverage", "Personal Care"],
            minimumOrderValue: 10000
          }
        };
      } else if (roleFromApi === "brand") {
        roleSpecificSettings = {
          brandSettings: {
            marketSegments: ["Health-conscious", "Eco-friendly", "Premium"],
            brandValues: ["Sustainability", "Quality", "Innovation"],
            targetDemographics: ["Millennials", "Gen Z", "Health enthusiasts"],
            productCategories: ["Organic Foods", "Wellness", "Eco-friendly products"]
          }
        };
      } else if (roleFromApi === "retailer") {
        roleSpecificSettings = {
          retailerSettings: {
            storeLocations: 12,
            averageOrderValue: 75,
            customerBase: ["Urban professionals", "Health-conscious families", "Millennials"],
            preferredCategories: ["Organic", "Local", "Sustainable", "Health food"]
          }
        };
      }
      
      // Convert API status to UserData status if needed
      let userStatus: "online" | "away" | "busy" = "online";
      if (response.data.status === "online" || response.data.status === "away" || response.data.status === "busy") {
        userStatus = response.data.status as "online" | "away" | "busy";
      }
      
      // Access response data safely
      const responseData = response.data as Record<string, unknown>;
      
      // Create user data from API response
      const userData: UserData = {
        id: responseData._id as string,
        name: responseData.name as string,
        email: responseData.email as string,
        companyName: (responseData.companyName as string) || "Demo Company",
        role: roleFromApi,
        profileComplete: (responseData.profileComplete as boolean) || false,
        createdAt: (responseData.createdAt as string) || new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        notifications: (responseData.notifications as number) || Math.floor(Math.random() * 10),
        avatar: (responseData.avatar as string) || "",
        status: userStatus,
        ...roleSpecificSettings
      };
      
      // Store the token in localStorage only if not using session
      if (responseData.token && !useSession) {
        localStorage.setItem("auth_token", responseData.token as string);
      }
      
      // Save to localStorage for persistence
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setRole(roleFromApi);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (userData: Omit<UserData, "id" | "profileComplete" | "createdAt" | "lastLogin" | "notifications"> & { password: string }): Promise<RegistrationResponse> => {
    try {
      // Use authApi to register the user with the backend
      const response = await authApi.register({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        company: userData.companyName || undefined,
        phone: userData.phone || undefined
      });
      
      // Check if response has data with _id, which indicates a successful registration
      if (!response.data || !response.data._id) {
        throw new Error(response.data?.message || "Registration failed");
      }
      
      // Create user object from response
      const newUser: UserData = {
        id: response.data._id || Math.random().toString(36).substr(2, 9),
        name: userData.name,
        email: userData.email,
        companyName: userData.companyName || "",
        role: userData.role,
        profileComplete: false,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        notifications: 0,
        avatar: "", 
        status: "online",
        emailVerified: false
      };
      
      // Store the token in localStorage
      if (response.data.token) {
        localStorage.setItem("auth_token", response.data.token);
      }
      
      // Save user to localStorage
      localStorage.setItem("user", JSON.stringify(newUser));
      
      // Update state
      setUser(newUser);
      setRole(newUser.role);
      setIsAuthenticated(true);
      
      // Return the response data (including any verificationCode for dev mode)
      return response.data as RegistrationResponse;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = (): void => {
    // Clear local storage
    localStorage.removeItem("user");
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
  };

  const switchRole = (newRole: UserRole): void => {
    if (user) {
      // Update user with new role
      const updatedUser = {
        ...user,
        role: newRole
      };
      
      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
      setRole(newRole);
    }
  };

  const updateUserProfile = async (updatedData: Partial<UserData>): Promise<void> => {
    if (user) {
      try {
        // Call API to update the user's profile in the database
        const response = await authApi.updateProfile(updatedData);
        
        if (!response.data.success && response.data.message) {
          throw new Error(response.data.message);
        }
        
        // Update user with new profile data
        const updatedUser = {
          ...user,
          ...updatedData,
        };
        
        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        // Update state
        setUser(updatedUser);
        
        console.log("User profile updated in the database");
      } catch (error) {
        console.error("Profile update error:", error);
        throw error;
      }
    }
  };

  const updateRoleSettings = <T extends ManufacturerSettings | BrandSettings | RetailerSettings>(settings: Partial<T>): void => {
    if (user) {
      let updatedUser;
      let settingsKey: string;
      
      // Update appropriate settings based on role
      if (role === "manufacturer" && user.manufacturerSettings) {
        updatedUser = {
          ...user,
          manufacturerSettings: {
            ...user.manufacturerSettings,
            ...settings
          }
        };
        settingsKey = "manufacturerSettings";
      } else if (role === "brand" && user.brandSettings) {
        updatedUser = {
          ...user,
          brandSettings: {
            ...user.brandSettings,
            ...settings
          }
        };
        settingsKey = "brandSettings";
      } else if (role === "retailer" && user.retailerSettings) {
        updatedUser = {
          ...user,
          retailerSettings: {
            ...user.retailerSettings,
            ...settings
          }
        };
        settingsKey = "retailerSettings";
      } else {
        // If settings don't exist yet, create them
        settingsKey = `${role}Settings` as keyof UserData;
        updatedUser = {
          ...user,
          [settingsKey]: settings
        };
      }
      
      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
      
      // Update in database (fire and forget)
      try {
        // Create a payload with the role-specific settings under the appropriate key
        const payload = {
          [settingsKey]: updatedUser[settingsKey as keyof UserData]
        };
        
        authApi.updateProfile(payload)
          .then(response => {
            if (!response.data.success) {
              console.error("Failed to save role settings in database:", response.data.message);
            } else {
              console.log(`${settingsKey} updated in database`);
            }
          })
          .catch(error => {
            console.error("Error updating role settings in database:", error);
          });
      } catch (error) {
        console.error("Error preparing role settings update:", error);
      }
    }
  };

  // Add a dedicated async function for updating role settings with await
  const updateRoleSettingsInDb = async <T extends ManufacturerSettings | BrandSettings | RetailerSettings>(settings: Partial<T>): Promise<void> => {
    if (user) {
      try {
        let settingsKey: string;
        let updatedSettings: Record<string, unknown> = {};
        
        // Prepare settings based on role
        if (role === "manufacturer") {
          settingsKey = "manufacturerSettings";
          updatedSettings = {
            ...user.manufacturerSettings,
            ...settings
          };
        } else if (role === "brand") {
          settingsKey = "brandSettings";
          updatedSettings = {
            ...user.brandSettings,
            ...settings
          };
        } else if (role === "retailer") {
          settingsKey = "retailerSettings";
          updatedSettings = {
            ...user.retailerSettings,
            ...settings
          };
        } else {
          throw new Error("Invalid role type");
        }
        
        // Update in the database
        const response = await authApi.updateProfile({
          [settingsKey]: updatedSettings
        });
        
        if (!response.data.success && response.data.message) {
          throw new Error(response.data.message);
        }
        
        // Update local user state and localStorage
        const updatedUser = {
          ...user,
          [settingsKey]: updatedSettings
        };
        
        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        // Update state
        setUser(updatedUser);
        
        console.log(`${settingsKey} updated successfully in database`);
      } catch (error) {
        console.error("Role settings update error:", error);
        throw error;
      }
    } else {
      throw new Error("No user is logged in");
    }
  };

  const updateUserStatus = (status: "online" | "away" | "busy"): void => {
    if (user) {
      // Update user status
      const updatedUser = {
        ...user,
        status: status
      };
      
      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
    }
  };

  const updateUserAvatar = (avatarUrl: string): void => {
    if (user) {
      // Update user avatar
      const updatedUser = {
        ...user,
        avatar: avatarUrl
      };
      
      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
    }
  };

  const verifyEmail = async (email: string, verificationCode: string): Promise<void> => {
    try {
      const response = await authApi.verifyEmail(email, verificationCode);
      
      if (!response.data.success && response.data.message) {
        throw new Error(response.data.message);
      }
      
      if (user) {
        // Update user to mark email as verified
        const updatedUser: UserData = {
          ...user,
          emailVerified: true,
          status: "online"
        };
        
        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        // Update state
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("Email verification error:", error);
      throw error;
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      const response = await authApi.resendVerificationEmail(email);
      
      if (!response.data.success && response.data.message) {
        throw new Error(response.data.message);
      }
      
      // Return response data to access verificationCode in development mode
      return response.data;
    } catch (error) {
      console.error("Resend verification email error:", error);
      throw error;
    }
  };

  const updateProfile = async (profileData: ProfileUpdateData): Promise<void> => {
    try {
      // Make a real API call to update the user's profile in the database
      const response = await authApi.updateProfile(profileData);
      
      if (!response.data.success && response.data.message) {
        throw new Error(response.data.message);
      }
      
      if (user) {
        // Update user with the new profile data
        const updatedUser: UserData = {
          ...user,
          ...profileData,
          profileComplete: profileData.profileComplete ?? user.profileComplete,
        };
        
        // Save to localStorage with lastUpdated timestamp
        const userWithMeta = {
          ...updatedUser,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem("user", JSON.stringify(userWithMeta));
        
        // Update state with type-safe user object
        setUser(updatedUser);
        
        // If role was updated, update the role state as well
        if (profileData.role && profileData.role !== user.role) {
          setRole(profileData.role);
        }
      }
      
      console.log("Profile updated successfully in database");
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  };

  const updateUserRole = async (newRole: UserRole): Promise<void> => {
    if (user) {
      try {
        // Call API to update the user's role in the database
        const response = await authApi.updateProfile({ role: newRole });
        
        if (!response.data.success && response.data.message) {
          throw new Error(response.data.message);
        }
        
        // Update user with new role
        const updatedUser = {
          ...user,
          role: newRole
        };
        
        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        // Update state
        setUser(updatedUser);
        setRole(newRole);
        
        console.log(`User role updated to ${newRole} in the database`);
      } catch (error) {
        console.error("Role update error:", error);
        throw error;
      }
    } else {
      throw new Error("No user is logged in");
    }
  };

  return (
    <UserContext.Provider 
      value={{ 
        role,
        isAuthenticated, 
        user, 
        login, 
        register, 
        logout,
        switchRole,
        updateUserProfile,
        updateRoleSettings,
        updateUserStatus,
        updateUserAvatar,
        verifyEmail,
        resendVerificationEmail,
        updateProfile,
        updateUserRole,
        updateRoleSettingsInDb
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
