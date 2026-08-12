import NewsPopup from "./components/NewsPopup";
import "@/App.css";
import { Footer } from "./components/Footer";
import Rules from "./pages/Rules";
import Legal from "./pages/Legal";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { SettingsProvider } from "./context/SettingsContext";
import { Navbar } from "./components/Navbar";
import { ScrollToTop } from "./components/ScrollToTop";
import { ApplyWidget } from "./components/ApplyWidget";
import Home from "./pages/Home";
import Tournament from "./pages/Tournament";
import Matches from "./pages/Matches";
import Rankings from "./pages/Rankings";
import Developer from "./pages/Developer";
import History from "./pages/History";
import Gallery from "./pages/Gallery";
import Login from "./pages/Login";
import Admin from "./pages/Admin";

const ScrollTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const Protected = ({ children }) => {
  const { isAdmin, ready } = useAuth();
  if (!ready) return <div className="min-h-screen flex items-center justify-center text-zinc-500">Loading...</div>;
  return isAdmin ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <LanguageProvider>
          <SettingsProvider>
            <AuthProvider>
              <ScrollTop />
              <Navbar />
              <main className="pt-0">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/tournament" element={<Tournament />} />
                  <Route path="/matches" element={<Matches />} />
                  <Route path="/rankings" element={<Rankings />} />
                  <Route path="/developer" element={<Developer />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/rules" element={<Rules />} />
                  <Route path="/legal" element={<Legal />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin" element={<Protected><Admin /></Protected>} />
                </Routes>
              </main>
              <Footer />
              <ApplyWidget />
              <ScrollToTop />
              <Toaster theme="dark" position="top-center" richColors />
              <NewsPopup />
            </AuthProvider>
          </SettingsProvider>
        </LanguageProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
