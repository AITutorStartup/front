import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./features/chat/pages/Index";
import Theory from "./features/chat/pages/Theory";
import Practice from "./features/chat/pages/Practice";
import NotFound from "./pages/NotFound";
import Register from "./features/auth/pages/Register";
import Login from "./features/auth/pages/Login";
import VerifyEmail from "./features/auth/pages/VerifyEmail";
import Welcome from "./pages/landing/Welcome";
import Profile from "./features/chat/pages/Profile";
import ForgotPassword from "./features/auth/pages/ForgotPassword";
import ResetPassword from "./features/auth/pages/ResetPassword";
import StudyDashboard from "./features/study/pages/StudyDashboard";
import Leaderboard from "./features/leaderboard/pages/Leaderboard";
import { SidebarProvider } from "./context/SidebarContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { AuthProvider } from "./features/auth/AuthContext";
import { XpProvider } from "./features/xp/xpStore";

const queryClient = new QueryClient();

const App = () => (
  <SidebarProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <XpProvider>
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
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/about-study"
              element={
                <ProtectedRoute>
                  <StudyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
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
        </XpProvider>
      </AuthProvider>
    </QueryClientProvider>
  </SidebarProvider>
);

export default App;
