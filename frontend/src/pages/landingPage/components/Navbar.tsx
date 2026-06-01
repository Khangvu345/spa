import React, { useEffect, useState } from "react";

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Trang chủ", href: "/" },
    { label: "Giới thiệu", href: "#about" },
    { label: "Dịch vụ", href: "#services" },
    { label: "Liên hệ", href: "#contact" },
    { label: "Đánh giá", href: "/#feedback" },
    { label: "Nhận xét", href: "/feedback" },
  ];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const isLandingPage = window.location.pathname === "/";

    if (href.startsWith("#")) {
      e.preventDefault();
      if (isLandingPage) {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = "/" + href;
      }
    } else if (href.startsWith("/#")) {
      e.preventDefault();
      const hash = href.replace("/", "");
      if (isLandingPage) {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = href;
      }
    }
  };

  return (
    <nav
      className="flex items-center justify-between border-b"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: "16px 80px",
        fontFamily: "Nunito, sans-serif",
        backgroundColor: scrolled ? "rgba(255,255,255,0.85)" : "rgba(255, 255, 255, 0.65)",
        borderColor: "transparent",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: scrolled
          ? "0 4px 24px rgba(180, 150, 150, 0.18)"
          : "none",
        transition: "all 0.3s ease",
      }}
    >
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = "/"}>
        <img
          src="/spalogo.png"
          alt="Luna Spa Logo"
          className="w-[48px] h-[48px] rounded-full object-cover"
          style={{
            boxShadow: "6px 6px 12px rgba(196, 112, 112, 0.22), -4px -4px 10px rgba(255, 255, 255, 0.85)",
          }}
        />
        <span
          className="text-[20px] font-black"
          style={{ fontFamily: "Nunito, sans-serif", color: "var(--clay-foreground)" }}
        >
          Luna Spa
        </span>
      </div>

      <div className="flex items-center gap-8">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={(e) => handleClick(e, link.href)}
            className="text-[14px] font-bold tracking-wide cursor-pointer transition-colors"
            style={{ fontFamily: "Nunito, sans-serif", color: "var(--clay-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--clay-accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--clay-muted)")}
          >
            {link.label}
          </a>
        ))}
      </div>

      <button
        className="px-8 py-3 font-bold cursor-pointer transition-all"
        style={{
          borderRadius: 20,
          background: "linear-gradient(135deg, #d98b8b 0%, #c47070 100%)",
          color: "#FFFFFF",
          fontFamily: "Nunito, sans-serif",
          fontSize: 14,
          border: "none",
          boxShadow:
            "8px 8px 18px rgba(196, 112, 112, 0.32), -4px -4px 12px rgba(255, 255, 255, 0.5), inset 2px 2px 4px rgba(255, 255, 255, 0.4), inset -2px -2px 4px rgba(0, 0, 0, 0.08)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
        onClick={() => {
          if (window.location.pathname === "/") {
            const el = document.querySelector("#booking");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          } else {
            window.location.href = "/#booking";
          }
        }}
      >
        Đặt lịch
      </button>
    </nav>
  );
};

export default Navbar;
