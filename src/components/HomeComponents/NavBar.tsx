import { X, Menu } from "lucide-react";
import { useState,useEffect } from "react";
import { Link } from "react-router";
const navItems = [
  { label: "Home", id: "home" },
  { label: "Services", id: "services" },
  { label: "Care", id: "care" },
  { label: "Activities", id: "activities" },
  { label: "Get Started", id: "get-started" },
];
export default function HomeNavBar(){
const [activeSection, setActiveSection] = useState("home");
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const [isScrolled, setIsScrolled] = useState(false);

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
  setIsMobileMenuOpen(false);
};

useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 50);

    const sections = navItems.map((item) => document.getElementById(item.id));
    const scrollPosition = window.scrollY + 100;

    sections.forEach((section, index) => {
      if (section) {
        const offsetTop = section.offsetTop;
        const offsetHeight = section.offsetHeight;
        if (
          scrollPosition >= offsetTop &&
          scrollPosition < offsetTop + offsetHeight
        ) {
          setActiveSection(navItems[index].id);
        }
      }
    });
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-6 lg:px-10 py-4 flex items-center justify-between transition-all duration-300 ${
        isScrolled
          ? "bg-primary-dark/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center gap-3 text-white font-semibold text-xl lg:text-2xl">
        <div className="bg-white p-2 size-12 lg:size-16 flex items-center justify-center shadow-xl rounded-2xl lg:rounded-3xl">
          <img src="logo.png" alt="Rafiq logo" className="w-5 lg:w-7" />
        </div>
        <span>Rafiq</span>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden lg:flex items-center gap-8">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={`cursor-pointer font-medium text-base transition-all duration-300 relative group ${
              activeSection === item.id
                ? "text-white"
                : "text-white/70 hover:text-white"
            }`}
          >
            {item.label}
            <span
              className={`absolute -bottom-1 left-0 h-0.5 bg-green-400 transition-all duration-300 ${
                activeSection === item.id ? "w-full" : "w-0 group-hover:w-full"
              }`}
            />
          </button>
        ))}
      </nav>

      {/* Desktop CTA */}
      <div className="hidden lg:flex items-center gap-4">
        <Link
          to="/register"
          className="bg-white text-primary-dark font-semibold px-5 py-2.5 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg"
        >
          Sign Up
        </Link>
        <Link
          to="/login"
          className="bg-white text-primary-dark font-semibold px-5 py-2.5 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg"
        >
          Login
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden cursor-pointer text-white p-2 hover:bg-white/10 rounded-lg transition-all duration-300"
      >
        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-primary-dark/98 backdrop-blur-md shadow-xl border-t border-white/10">
          <nav className="flex flex-col p-6 gap-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-left font-medium cursor-pointer text-lg py-2 transition-colors ${
                  activeSection === item.id
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="border-t border-white/20 pt-4 mt-2 flex flex-col gap-3">
              <Link
                to="/register"
                className="bg-white text-primary-dark font-semibold text-center py-3 rounded-xl hover:scale-102 transition-all duration-300"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                className="bg-white text-primary-dark font-semibold text-center py-3 rounded-xl hover:scale-102 transition-all duration-300"
              >
                Login
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}