import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#020B1F] text-white">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}