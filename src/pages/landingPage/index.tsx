import { useEffect } from "react";
import "./styles.less";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { AboutSection } from "./components/AboutSection";
import { ServicesSection } from "./components/ServicesSection";
import { ReviewForm } from "./components/ReviewForm";
import { Testimonials } from "./components/Testimonials";
import { BookingSection } from "./components/BookingSection";
import { Footer } from "./components/Footer";

export function LandingPage() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, []);

  return (
    <div
      className="flex flex-col w-full min-h-screen"
      style={{ backgroundColor: "var(--clay-canvas)", fontFamily: "DM Sans, sans-serif", paddingTop: 80 }}
    >
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <ReviewForm />
      <Testimonials />
      <BookingSection />
      <Footer />
    </div>
  );
}

export default LandingPage;
