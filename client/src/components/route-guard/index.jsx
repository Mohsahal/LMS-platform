import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function RouteGuard({ children, requireAuth = true, allowedRoles = [] }) {
  const { auth, loading } = useContext(AuthContext);
  const location = useLocation();

  console.log("RouteGuard:", { 
    pathname: location.pathname, 
    requireAuth, 
    allowedRoles, 
    auth: auth.authenticate, 
    userRole: auth.user?.role,
    loading 
  });

  // Show loading skeleton while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-full max-w-md h-96" />
      </div>
    );
  }

  // If route requires authentication but user is not authenticated
  if (requireAuth && !auth.authenticate) {
    // Redirect to login page with return URL
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If route doesn't require authentication but user is authenticated
  if (!requireAuth && auth.authenticate) {
    // Redirect to appropriate dashboard based on role
    if (auth.user?.role === "instructor") {
      return <Navigate to="/instructor" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // If route has role restrictions
  if (allowedRoles.length > 0 && auth.user?.role && !allowedRoles.includes(auth.user.role)) {
    // Redirect to unauthorized page or home
    return <Navigate to="/unauthorized" replace />;
  }

  // If all checks pass, render the protected content
  return children;
}

// Specific route guards for different user types
export function StudentRouteGuard({ children }) {
  return (
    <RouteGuard requireAuth={true} allowedRoles={["user", "student"]}>
      {children}
    </RouteGuard>
  );
}

export function InstructorRouteGuard({ children }) {
  return (
    <RouteGuard requireAuth={true} allowedRoles={["instructor"]}>
      {children}
    </RouteGuard>
  );
}

export function PublicRouteGuard({ children }) {
  return (
    <RouteGuard requireAuth={false}>
      {children}
    </RouteGuard>
  );
}
