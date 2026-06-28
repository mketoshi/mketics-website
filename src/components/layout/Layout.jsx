import Header from "./Header";
import Footer from "./Footer";
import FloatingContactCTA from "../sections/FloatingContactCTA";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#020B1F] pb-20 text-white sm:pb-0">
      <Header />
      <main>{children}</main>
      <Footer />
      <FloatingContactCTA />
    </div>
  );
}