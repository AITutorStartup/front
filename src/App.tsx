import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Theory from "./pages/Theory";
import Practice from "./pages/Practice";
import NotFound from "./pages/NotFound";
import Register from "./pages/auth/Register"; 
import Login from "./pages/auth/Login";  
import Welcome from "./pages/Welcome";    
import { SidebarProvider } from "./context/SidebarContext";

const queryClient = new QueryClient();

const App = () => (
  <SidebarProvider>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/app" element={<Index />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/theory" element={<Theory />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/register" element={<Register />} /> 
          <Route path="/login" element={<Login />} />       
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </SidebarProvider>
);

export default App;
