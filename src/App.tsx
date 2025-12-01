import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/chat/Index";
import Theory from "./pages/chat/Theory";
import Practice from "./pages/chat/Practice";
import NotFound from "./pages/NotFound";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import VerifyEmail from "./pages/auth/VerifyEmail";
import Welcome from "./pages/landing/Welcome";
import Profile from "./pages/chat/Profile";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import { SidebarProvider } from "./context/SidebarContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <SidebarProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route path="/welcome" element={<Welcome />} />
            <Route
              path="/theory"
              element={
                <ProtectedRoute>
                  <Theory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/practice"
              element={
                <ProtectedRoute>
                  <Practice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/verify-email"
              element={
                <ProtectedRoute>
                  <VerifyEmail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </SidebarProvider>
);

export default App;
