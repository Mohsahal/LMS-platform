import { Skeleton } from "@/components/ui/skeleton";
import { initialSignInFormData, initialSignUpFormData } from "@/config";
import { checkAuthService, loginService, registerService } from "@/services";
import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import validator from "validator";
import { useToast } from "@/hooks/use-toast";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const { toast } = useToast();
  const [signInFormData, setSignInFormData] = useState(initialSignInFormData);
  const [signUpFormData, setSignUpFormData] = useState(initialSignUpFormData);
  const [auth, setAuth] = useState({
    authenticate: false,
    user: null,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("signin");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  async function handleRegisterUser(event) {
    event.preventDefault();
    // Client-side validation
    const { userName, userEmail, password } = signUpFormData || {};
    if (!userName || userName.trim().length < 3) {
      toast({ title: "Invalid name", description: "Name must be at least 3 characters" });
      return;
    }
    if (!validator.isEmail(userEmail || "")) {
      toast({ title: "Invalid email", description: "Please enter a valid email address" });
      return;
    }
    if (!validator.isStrongPassword(password || "", { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1 })) {
      toast({ title: "Weak password", description: "Include upper, lower, number, min length 8" });
      return;
    }
    setIsRegistering(true);
    
    try {
      const data = await registerService(signUpFormData);
      
      if (data.success) {
        // Registration successful
        setRegistrationSuccess(true);
        
        // Clear the signup form
        setSignUpFormData(initialSignUpFormData);
        
        // Switch to login tab
        setActiveTab("signin");
        
        toast({ title: "Registration successful", description: "Please sign in" });
        
        // Reset success state after a delay
        setTimeout(() => {
          setRegistrationSuccess(false);
        }, 5000);
      } else {
        console.error("❌ Registration failed:", data.message);
        toast({ title: "Registration failed", description: data.message || "Please try again" });
      }
    } catch (error) {
      console.error("❌ Registration error:", error);
      const message = error?.response?.data?.message || error?.message || "Registration failed";
      toast({ title: "Registration error", description: message });
    } finally {
      setIsRegistering(false);
    }
  }

  async function handleLoginUser(event) {
    event.preventDefault();
    // Client-side validation
    const { userEmail, password } = signInFormData || {};
    if (!validator.isEmail(userEmail || "")) {
      toast({ title: "Invalid email", description: "Please enter a valid email" });
      return;
    }
    if (!password || password.length < 6) {
      toast({ title: "Invalid password", description: "Please enter your password" });
      return;
    }
    try {
      const data = await loginService(signInFormData);
      console.log("Login response:", data);

      if (data.success) {
        // Store token in session storage
        localStorage.setItem(
          "accessToken",
          JSON.stringify(data.data.accessToken)
        );
        
        // Update auth state
        setAuth({
          authenticate: true,
          user: data.data.user,
        });

        // Clear form data
        setSignInFormData(initialSignInFormData);
        
        console.log("✅ Login successful! User:", data.data.user);
        
        // Redirect based on user role
        if (data.data.user.role === "instructor") {
          window.location.href = "/instructor";
        } else {
          window.location.href = "/";
        }
      } else {
        console.error("❌ Login failed:", data.message);
        toast({ title: "Login failed", description: data.message || "Check your credentials" });
        setAuth({
          authenticate: false,
          user: null,
        });
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      const message = error?.response?.data?.message || error?.message || "Login failed";
      toast({ title: "Login error", description: message });
      setAuth({
        authenticate: false,
        user: null,
      });
    }
  }

  //check auth user

  async function checkAuthUser() {
    try {
      // Check if there's a token in sessionStorage
      const token = localStorage.getItem("accessToken");
      console.log("Token in sessionStorage:", token);
      
      if (!token) {
        console.log("No token found, user not authenticated");
        setAuth({
          authenticate: false,
          user: null,
        });
        setLoading(false);
        return;
      }

      const data = await checkAuthService();
      console.log("CheckAuth response:", data);
      
      if (data.success) {
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
        setLoading(false);
      } else {
        if (data.message) toast({ title: "Auth check failed", description: data.message });
        setAuth({
          authenticate: false,
          user: null,
        });
        setLoading(false);
      }
    } catch (error) {
      console.log("CheckAuth error:", error);
      const message = error?.response?.data?.message || error?.message || "Auth check error";
      toast({ title: "Auth error", description: message });
      setAuth({
        authenticate: false,
        user: null,
      });
      setLoading(false);
    }
  }

  function resetCredentials() {
    setAuth({
      authenticate: false,
      user: null,
    });
  }

  function logout() {
    // Clear session storage
    localStorage.removeItem("accessToken");
    
    // Reset auth state
    setAuth({
      authenticate: false,
      user: null,
    });
    
    // Clear form data
    setSignInFormData(initialSignInFormData);
    setSignUpFormData(initialSignUpFormData);
    
    // Reset other states
    setActiveTab("signin");
    setRegistrationSuccess(false);
    setIsRegistering(false);
    
    // Redirect to auth page
    window.location.href = "/auth";
    
    console.log("✅ Logout successful");
  }

  function handleTabChange(value) {
    setActiveTab(value);
    // Clear success message when manually switching tabs
    if (registrationSuccess) {
      setRegistrationSuccess(false);
    }
  }

  useEffect(() => {
    checkAuthUser();
  }, []);

  console.log(auth, "gf");

  return (
    <AuthContext.Provider
      value={{
        signInFormData,
        setSignInFormData,
        signUpFormData,
        setSignUpFormData,
        handleRegisterUser,
        handleLoginUser,
        auth,
        resetCredentials,
        activeTab,
        handleTabChange,
        registrationSuccess,
        isRegistering,
        logout,
        loading,
      }}
    >
      {loading ? <Skeleton /> : children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
