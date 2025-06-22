import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { authApi, api } from "@/lib/api"; // Import authApi and api
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
  verificationCode?: string;
}

interface UserContextType {
  role: UserRole;
  isAuthenticated: boolean;
  user: UserData | null;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (token: string, email: string, name: string, picture?: string) => Promise<{ isNewUser: boolean }>;
  updateUserFromSession: (userData: Record<string, unknown>) => void;
  register: (userData: Omit<UserData, "id" | "profileComplete" | "createdAt" | "lastLogin" | "notifications"> & { password: string }) => Promise<RegistrationResponse>;
  logout: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);



  // Check session on app load
  useEffect(() => {
    authApi.getCurrentUser()
      .then(res => {
        const responseData = res.data as Record<string, unknown>;
        const userData: UserData = {
          id: responseData._id as string,
          name: responseData.name as string,
          email: responseData.email as string,
          companyName: (responseData.companyName as string) || "Demo Company",
          role: responseData.role as UserRole,
          profileComplete: (responseData.profileComplete as boolean) || false,
          createdAt: (responseData.createdAt as string) || new Date().toISOString(),
          lastLogin: (responseData.lastLogin as string) || new Date().toISOString(),
          notifications: (responseData.notifications as number) || 0,
          avatar: (responseData.avatar as string) || "",
          status: (responseData.status as "online" | "away" | "busy") || "online",
          emailVerified: true,
          phone: responseData.phone as string,
          website: responseData.website as string,
          address: responseData.address as string,
          description: responseData.description as string,
          manufacturerSettings: responseData.manufacturerSettings as ManufacturerSettings,
          brandSettings: responseData.brandSettings as BrandSettings,
          retailerSettings: responseData.retailerSettings as RetailerSettings,
        };
        setUser(userData);
        setRole(userData.role);
        setIsAuthenticated(true);
        setIsLoading(false);
      })
      .catch(() => {
        setUser(null);
        setRole("manufacturer");
        setIsAuthenticated(false);
        setIsLoading(false);
      });
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // Tránh gọi login nếu password rỗng (có thể từ Google login)
    if (!password || password.trim() === '') {
      console.warn('Login skipped: empty password provided');
      return;
    }

    try {
      // First, authenticate with credentials
      await authApi.login(email, password);
      
      // Then get user data
      const response = await authApi.getCurrentUser();
      
      if (!response.data || !response.data._id) {
        throw new Error("Failed to get user data after login");
      }
      
      // Convert API response to UserData format  
      const responseData = response.data as Record<string, unknown>;
      const userData: UserData = {
        id: responseData._id as string,
        name: responseData.name as string,
        email: responseData.email as string,
        companyName: (responseData.companyName as string) || "Demo Company",
        role: responseData.role as UserRole,
        profileComplete: (responseData.profileComplete as boolean) || false,
        createdAt: (responseData.createdAt as string) || new Date().toISOString(),
        lastLogin: (responseData.lastLogin as string) || new Date().toISOString(),
        notifications: (responseData.notifications as number) || 0,
        avatar: (responseData.avatar as string) || "",
        status: (responseData.status as "online" | "away" | "busy") || "online",
        emailVerified: true,
        phone: responseData.phone as string,
        website: responseData.website as string,
        address: responseData.address as string,
        description: responseData.description as string,
        manufacturerSettings: responseData.manufacturerSettings as ManufacturerSettings,
        brandSettings: responseData.brandSettings as BrandSettings,
        retailerSettings: responseData.retailerSettings as RetailerSettings,
      };
      
      setUser(userData);
      setRole(userData.role);
      setIsAuthenticated(true);
      
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const googleLogin = async (token: string, email: string, name: string, picture?: string): Promise<{ isNewUser: boolean }> => {
    try {
      // Call Google login API endpoint
      const response = await api.post('/users/google-login', {
        token,
        email,
        name,
        picture
      });

      if (!response.data || !response.data._id) {
        throw new Error("Google login failed");
      }

      // Extract isNewUser flag
      const { isNewUser, ...userData } = response.data;

      // Get updated user data from session
      const userResponse = await authApi.getCurrentUser();
      
      if (!userResponse.data || !userResponse.data._id) {
        throw new Error("Failed to get user data after Google login");
      }

      // Convert API response to UserData format
      const responseData = userResponse.data as Record<string, unknown>;
      const userDataFormatted: UserData = {
        id: responseData._id as string,
        name: responseData.name as string,
        email: responseData.email as string,
        companyName: (responseData.companyName as string) || "Demo Company",
        role: responseData.role as UserRole,
        profileComplete: (responseData.profileComplete as boolean) || false,
        createdAt: (responseData.createdAt as string) || new Date().toISOString(),
        lastLogin: (responseData.lastLogin as string) || new Date().toISOString(),
        notifications: (responseData.notifications as number) || 0,
        avatar: (responseData.avatar as string) || picture || "",
        status: (responseData.status as "online" | "away" | "busy") || "online",
        emailVerified: true,
        phone: responseData.phone as string,
        website: responseData.website as string,
        address: responseData.address as string,
        description: responseData.description as string,
        manufacturerSettings: responseData.manufacturerSettings as ManufacturerSettings,
        brandSettings: responseData.brandSettings as BrandSettings,
        retailerSettings: responseData.retailerSettings as RetailerSettings,
      };

      setUser(userDataFormatted);
      setRole(userDataFormatted.role);
      setIsAuthenticated(true);

      return { isNewUser: Boolean(isNewUser) };

    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  const updateUserFromSession = (userData: Record<string, unknown>): void => {
    // Convert API response to UserData format
    const userDataFormatted: UserData = {
      id: userData._id as string,
      name: userData.name as string,
      email: userData.email as string,
      companyName: (userData.companyName as string) || "Demo Company",
      role: userData.role as UserRole,
      profileComplete: (userData.profileComplete as boolean) || false,
      createdAt: (userData.createdAt as string) || new Date().toISOString(),
      lastLogin: (userData.lastLogin as string) || new Date().toISOString(),
      notifications: (userData.notifications as number) || 0,
      avatar: (userData.avatar as string) || "",
      status: (userData.status as "online" | "away" | "busy") || "online",
      emailVerified: true,
      phone: userData.phone as string,
      website: userData.website as string,
      address: userData.address as string,
      description: userData.description as string,
      manufacturerSettings: userData.manufacturerSettings as ManufacturerSettings,
      brandSettings: userData.brandSettings as BrandSettings,
      retailerSettings: userData.retailerSettings as RetailerSettings,
    };

    setUser(userDataFormatted);
    setRole(userDataFormatted.role);
    setIsAuthenticated(true);
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
      
      // Update state
      setUser(newUser);
      setRole(newUser.role);
      setIsAuthenticated(true);
      
      console.log('✅ Registration successful');
      console.log('- User ID:', newUser.id);
      console.log('- User role:', newUser.role);
      
      // Return the response data (including any verificationCode for dev mode)
      return response.data as RegistrationResponse;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call logout API to destroy session
      await authApi.logout();
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with logout even if API call fails
    } finally {
      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      setRole("manufacturer");
      console.log('✅ Logout successful');
    }
  };

  const switchRole = (newRole: UserRole): void => {
    if (user) {
      // Update user with new role
      const updatedUser = {
        ...user,
        role: newRole
      };
      
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
        
        // Update local user state
        const updatedUser = {
          ...user,
          [settingsKey]: updatedSettings
        };
        
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
        
        // Update state
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

  // Show loading state while checking session
  if (isLoading) {
    return (
      <UserContext.Provider 
        value={{ 
          role,
          isAuthenticated: false, 
          user: null, 
          login,
          googleLogin,
          updateUserFromSession,
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
  }

  return (
    <UserContext.Provider 
      value={{ 
        role,
        isAuthenticated, 
        user, 
        login,
        googleLogin,
        updateUserFromSession,
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
