import { useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { signIn, signUp } from "./services/auth";

import Home from "./pages/Home";
import ITSupport from "./pages/ITSupport";
import SoftwareEngineering from "./pages/SoftwareEngineering";
import CloudSystems from "./pages/CloudSystems";
import Networking from "./pages/Networking";
import CCTV from "./pages/CCTV";
import WiFi from "./pages/WiFi";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

function App() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const services = [
    { icon: "🛠️", title: "IT Support", link: "/it-support" },
    { icon: "💻", title: "Software Engineering", link: "/software-engineering" },
    { icon: "☁️", title: "Cloud Systems", link: "/cloud-systems" },
    { icon: "🌐", title: "Network Infrastructure", link: "/networking" },
    { icon: "📹", title: "CCTV & Security", link: "/cctv" },
    { icon: "📶", title: "WiFi Installation", link: "/wifi" },
  ];

  const [wifiType, setWifiType] = useState("home");
  const [rooms, setRooms] = useState(1);
  const [cctvCameras, setCctvCameras] = useState(0);

  const wifiPrice = wifiType === "home" ? 1500 : 2500;
  const roomPrice = rooms * 500;
  const cctvPrice = cctvCameras * 650;
  const estimatedTotal = wifiPrice + roomPrice + cctvPrice;

  const goToSection = (id) => {
    setMenuOpen(false);
    navigate("/");

    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleAuth = async () => {
    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    if (isLogin) {
      const { error } = await signIn(email, password);

      if (error) {
        alert(error.message);
      } else {
        alert("Logged in!");
        setAuthOpen(false);
        setEmail("");
        setPassword("");
      }
    } else {
      const { error } = await signUp(email, password);

      if (error) {
        alert(error.message);
      } else {
        alert("Account created! Check your email.");
        setIsLogin(true);
      }
    }
  };

  return (
    <>
      <header className="navbar">
        <Link to="/" className="logo">
          <img src="/images/logo-clean.png" alt="MKETICS Logo" />
        </Link>

        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          <button onClick={() => goToSection("home")}>Home</button>
          <button onClick={() => goToSection("services")}>Services</button>
          <button onClick={() => goToSection("calculator")}>Pricing</button>
          <button onClick={() => goToSection("booking")}>Booking</button>
          <button onClick={() => goToSection("quote")}>Quote</button>
          <button onClick={() => goToSection("contact")}>Contact</button>
        </nav>

<button
  className="mobile-login-link"
  onClick={() => {
    setMenuOpen(false);
    setAuthOpen(true);
  }}
>
  Customer Login
</button>

        <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>
      </header>

      <main className="main-container">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                services={services}
                estimatedTotal={estimatedTotal}
                wifiType={wifiType}
                setWifiType={setWifiType}
                rooms={rooms}
                setRooms={setRooms}
                cctvCameras={cctvCameras}
                setCctvCameras={setCctvCameras}
              />
            }
          />

          <Route path="/it-support" element={<ITSupport />} />
          <Route path="/software-engineering" element={<SoftwareEngineering />} />
          <Route path="/cloud-systems" element={<CloudSystems />} />
          <Route path="/networking" element={<Networking />} />
          <Route path="/cctv" element={<CCTV />} />
          <Route path="/wifi" element={<WiFi />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>

      <a
        href="https://wa.me/27722864367"
        className="whatsapp-float"
        target="_blank"
        rel="noreferrer"
      >
        💬
      </a>

      <footer className="footer">
        © 2026 MKETICS | Smart Solutions. Stronger Future.
      </footer>

      {authOpen && (
        <div className="auth-overlay">
          <div className="auth-modal">
            <button className="auth-close" onClick={() => setAuthOpen(false)}>
              ×
            </button>

            <h2>{isLogin ? "Customer Login" : "Create Account"}</h2>
            <p>
              {isLogin
                ? "Login to track your quotes and bookings."
                : "Create an account to manage your MKETICS requests."}
            </p>

            <form className="auth-form">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button type="button" className="btn primary" onClick={handleAuth}>
                {isLogin ? "Login" : "Register"}
              </button>

              <button
                type="button"
                className="btn secondary"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Create Account" : "Back to Login"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default App;