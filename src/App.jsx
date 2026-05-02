import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import ITSupport from "./pages/ITSupport";
import SoftwareEngineering from "./pages/SoftwareEngineering";
import CloudSystems from "./pages/CloudSystems";
import Networking from "./pages/Networking";
import CCTV from "./pages/CCTV";
import WiFi from "./pages/WiFi";
import "./App.css";

function App() {
  const services = [
    {
      icon: "🛠️",
      title: "IT Support",
      link: "/it-support",
      text: "On-site and remote technical support for businesses and homes.",
    },
    {
      icon: "💻",
      title: "Software Engineering",
      link: "/software-engineering",
      text: "Modern websites, web apps, and full business systems.",
    },
    {
      icon: "☁️",
      title: "Cloud Systems",
      link: "/cloud-systems",
      text: "Cloud storage, hosting, and business system deployment.",
    },
    {
      icon: "🌐",
      title: "Network Infrastructure",
      link: "/networking",
      text: "Routers, switches, structured cabling, and enterprise network setup.",
    },
    {
      icon: "📹",
      title: "CCTV & Security",
      link: "/cctv",
      text: "Smart surveillance systems with remote monitoring and cloud backup.",
    },
    {
      icon: "📶",
      title: "WiFi Installation",
      link: "/wifi",
      text: "High-speed home and business WiFi setup with coverage optimization.",
    },
  ];

  const [wifiType, setWifiType] = useState("home");
  const [rooms, setRooms] = useState(1);
  const [cctvCameras, setCctvCameras] = useState(0);

  const wifiPrice = wifiType === "home" ? 1500 : 2500;
  const roomPrice = rooms * 500;
  const cctvPrice = cctvCameras * 650;
  const estimatedTotal = wifiPrice + roomPrice + cctvPrice;

  return (
    <>
      <header className="navbar">
        <Link to="/">
          <img src="/images/logo-clean.png" alt="MKETICS Logo" />
        </Link>

        <nav>
          <Link to="/">Home</Link>
          <Link to="/">Services</Link>
          <Link to="/">Pricing</Link>
          <Link to="/">Booking</Link>
          <Link to="/">Quote</Link>
          <Link to="/">Contact</Link>
        </nav>
      </header>

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
      </Routes>

      <a
        href="https://wa.me/27722864367"
        className="whatsapp-float"
        target="_blank"
        rel="noreferrer"
      >
        💬
      </a>

      <footer>© 2026 MKETICS | Smart Solutions. Stronger Future.</footer>
    </>
  );
}

export default App;