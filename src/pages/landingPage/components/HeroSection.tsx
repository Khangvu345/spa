import React from "react";
import heroBackground from "@/assets/landingPage-img/hero-background.png";

export const HeroSection: React.FC = () => {
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <section
      className="relative w-full h-[700px] flex items-center justify-center"
      style={{ fontFamily: "DM Sans, sans-serif" }}
    >
      <img
        src={heroBackground}
        alt="Ảnh nền"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(217, 139, 139, 0.55) 50%, rgba(196, 112, 112, 0.85) 100%)",
        }}
      />
      <div className="relative z-10 flex flex-col items-center text-center gap-6">
        <h1
          className="text-[60px] font-black tracking-tight leading-tight"
          style={{
            fontFamily: "Nunito, sans-serif",
            color: "#FFFFFF",
            textShadow: "0 6px 30px rgba(74, 63, 63, 0.35)",
          }}
        >
          Khám Phá Sự Bình Yên
        </h1>
        <p
          className="text-[17px] max-w-[700px] leading-relaxed"
          style={{
            fontFamily: "DM Sans, sans-serif",
            color: "rgba(255,255,255,0.92)",
            fontWeight: 500,
            textShadow: "0 2px 16px rgba(74, 63, 63, 0.3)",
          }}
        >
          Thoát khỏi nhịp sống hối hả và đắm mình trong thế giới thanh tịnh.
          Luna Spa mang đến các liệu trình cá nhân hóa giúp tái tạo cơ thể,
          thư giãn tâm trí và phục hồi tinh thần của bạn.
        </p>
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={() => scrollToId("booking")}
            className="px-10 py-[18px] font-bold cursor-pointer transition-all"
            style={{
              borderRadius: 22,
              background: "#ffffff",
              color: "#c47070",
              fontFamily: "Nunito, sans-serif",
              fontSize: 16,
              border: "none",
              boxShadow:
                "12px 12px 24px rgba(74, 63, 63, 0.25), -8px -8px 16px rgba(255, 255, 255, 0.4), inset 4px 4px 8px rgba(255, 255, 255, 0.6)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
          >
            Đặt lịch hẹn
          </button>
          <button
            onClick={() => scrollToId("services")}
            className="px-10 py-[18px] font-bold cursor-pointer transition-all"
            style={{
              borderRadius: 22,
              background: "rgba(255, 255, 255, 0.18)",
              color: "#FFFFFF",
              fontFamily: "Nunito, sans-serif",
              fontSize: 16,
              border: "2px solid rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(12px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.18)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Xem dịch vụ
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
