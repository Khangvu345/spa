import React from "react";

export const AboutSection: React.FC = () => {
  return (
    <section
      id="about"
      className="flex flex-row items-center gap-20"
      style={{
        padding: "100px 80px",
        fontFamily: "DM Sans, sans-serif",
        backgroundColor: "var(--clay-canvas)",
      }}
    >
      <img
        src={require("@/assets/landingPage-img/about-image.png")}
        alt="Về Luna Spa"
        className="w-[560px] h-[440px] object-cover flex-shrink-0"
        style={{
          borderRadius: 32,
          boxShadow:
            "20px 20px 40px rgba(180, 150, 150, 0.28), -12px -12px 28px rgba(255, 255, 255, 0.95)",
        }}
      />
      <div className="flex flex-col gap-5">
        <span
          className="text-[13px] tracking-widest font-bold"
          style={{ fontFamily: "Nunito, sans-serif", color: "var(--clay-accent)" }}
        >
          — Về chúng tôi
        </span>
        <h2
          className="text-[44px] font-black tracking-tight"
          style={{ fontFamily: "Nunito, sans-serif", color: "var(--clay-foreground)" }}
        >
          Về Luna Spa
        </h2>
        <p
          className="text-[16px] leading-relaxed"
          style={{
            fontFamily: "DM Sans, sans-serif",
            color: "var(--clay-muted)",
            fontWeight: 500,
          }}
        >
          Được thành lập với niềm đam mê chăm sóc sức khỏe toàn diện, Luna Spa
          là nơi lý tưởng dành cho những ai tìm kiếm sự thư giãn và tái tạo năng lượng.
          Đội ngũ chuyên gia trị liệu của chúng tôi kết hợp phương pháp chữa lành
          truyền thống với kỹ thuật hiện đại để mang đến trải nghiệm nuôi dưỡng cả thể chất lẫn tâm hồn.
        </p>
        <p
          className="text-[16px] leading-relaxed"
          style={{
            fontFamily: "DM Sans, sans-serif",
            color: "var(--clay-muted)",
            fontWeight: 500,
          }}
        >
          Mọi chi tiết tại Luna Spa đều được chăm chút tỉ mỉ — từ các sản phẩm
          hữu cơ được tuyển chọn kỹ lưỡng đến không gian phòng trị liệu yên tĩnh,
          lung linh ánh nến. Chúng tôi tin rằng vẻ đẹp đích thực bắt đầu từ sự
          bình yên nội tại, và sứ mệnh của chúng tôi là giúp bạn tìm thấy điều đó.
        </p>
        <div
          className="w-[60px] h-[6px] rounded-full mt-2"
          style={{ background: "linear-gradient(90deg, #d98b8b, #c47070)" }}
        />
      </div>
    </section>
  );
};

export default AboutSection;
