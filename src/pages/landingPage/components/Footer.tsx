import { MapPin, Phone, Mail, Clock3 } from "lucide-react";

export function Footer() {
  return (
    <footer
      id="contact"
      className="flex flex-col gap-[52px] px-[120px] pt-[72px] pb-10"
      style={{ backgroundColor: "#2D2424", fontFamily: "DM Sans, sans-serif" }}
    >
      <div className="flex gap-16">
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/spalogo.png"
              alt="Luna Spa"
              className="w-11 h-11 rounded-full object-cover"
              style={{ boxShadow: "6px 6px 14px rgba(0, 0, 0, 0.35)" }}
            />
            <span
              className="text-lg font-black"
              style={{ fontFamily: "Nunito, sans-serif", color: "#FFFFFF" }}
            >
              Luna Spa
            </span>
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "rgba(255, 255, 255, 0.65)", fontWeight: 500 }}
          >
            Nơi bình yên và sắc đẹp của bạn. Chúng tôi kết hợp phương pháp chữa lành
            truyền thống với kỹ thuật chăm sóc sức khỏe hiện đại.
          </p>
          <div className="flex gap-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46L20 4"/></svg>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-base font-extrabold" style={{ fontFamily: "Nunito, sans-serif", color: "#FFFFFF" }}>
            Liên kết nhanh
          </h4>
          {["Trang chủ", "Giới thiệu", "Dịch vụ", "Đặt lịch", "Liên hệ"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm transition-colors"
              style={{
                fontFamily: "DM Sans, sans-serif",
                color: "rgba(255, 255, 255, 0.65)",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--clay-accent-alt)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.65)")}
            >
              {link}
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-base font-extrabold" style={{ fontFamily: "Nunito, sans-serif", color: "#FFFFFF" }}>
            Dịch vụ
          </h4>
          {["Massage Trị Liệu", "Chăm Sóc Da Mặt", "Tẩy Tế Bào Chết", "Liệu Pháp Tinh Dầu", "Đá Nóng Trị Liệu"].map((svc) => (
            <a
              key={svc}
              href="#"
              className="text-sm transition-colors"
              style={{
                fontFamily: "DM Sans, sans-serif",
                color: "rgba(255, 255, 255, 0.65)",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--clay-accent-alt)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.65)")}
            >
              {svc}
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-base font-extrabold" style={{ fontFamily: "Nunito, sans-serif", color: "#FFFFFF" }}>
            Liên hệ
          </h4>
          <ContactItem icon={<MapPin size={16} />} text="122 Hoàng Quốc Việt, Cầu Giấy, Hà Nội" />
          <ContactItem icon={<Phone size={16} />} text="+84 24 1234 5678" />
          <ContactItem icon={<Mail size={16} />} text="luna.spa@gmail.com" />
          <ContactItem icon={<Clock3 size={16} />} text="Thứ 2 - CN: 9:00 - 21:00" />
        </div>
      </div>

      <div className="h-px w-full" style={{ background: "rgba(255, 255, 255, 0.1)" }} />

      <div className="flex items-center justify-between">
        <span className="text-[13px]" style={{ color: "rgba(255, 255, 255, 0.55)", fontWeight: 500 }}>
          © 2026 Luna Spa. Bản quyền thuộc về Luna Spa.
        </span>
        <div className="flex gap-6">
          <a
            href="#"
            className="text-[13px] font-bold transition-colors"
            style={{ fontFamily: "Nunito, sans-serif", color: "rgba(255, 255, 255, 0.65)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--clay-accent-alt)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.65)")}
          >
            Chính sách bảo mật
          </a>
          <a
            href="#"
            className="text-[13px] font-bold transition-colors"
            style={{ fontFamily: "Nunito, sans-serif", color: "rgba(255, 255, 255, 0.65)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--clay-accent-alt)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.65)")}
          >
            Điều khoản dịch vụ
          </a>
        </div>
      </div>
    </footer>
  );
}

function ContactItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: "var(--clay-accent-alt)" }}>{icon}</span>
      <span
        className="text-sm"
        style={{
          fontFamily: "DM Sans, sans-serif",
          color: "rgba(255, 255, 255, 0.65)",
          fontWeight: 500,
        }}
      >
        {text}
      </span>
    </div>
  );
}

export default Footer;
