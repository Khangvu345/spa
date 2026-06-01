import { Rate } from 'antd';

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  rating: number;
  avatarGradient: string;
}

function TestimonialCard({ quote, name, role, rating, avatarGradient }: TestimonialCardProps) {
  return (
    <div className="clay-card clay-card-hover flex-1 flex flex-col gap-5" style={{ padding: 36 }}>
      <Rate
        disabled
        defaultValue={rating}
        style={{ color: '#c47070', fontSize: 20 }}
      />
      <p
        className="text-base leading-relaxed"
        style={{
          fontFamily: 'DM Sans, sans-serif',
          color: 'var(--clay-foreground)',
          fontWeight: 500,
          margin: 0,
          minHeight: 96,
        }}
      >
        &ldquo;{quote}&rdquo;
      </p>
      <div
        className="h-px w-full"
        style={{ background: 'rgba(196, 112, 112, 0.12)' }}
      />
      <div className="flex items-center gap-4">
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: 48,
            height: 48,
            background: avatarGradient,
            color: '#ffffff',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 800,
            fontSize: 16,
            boxShadow:
              '8px 8px 16px rgba(196, 112, 112, 0.3), -4px -4px 10px rgba(255, 255, 255, 0.7), inset 2px 2px 4px rgba(255, 255, 255, 0.3)',
          }}
        >
          {name
            .split(' ')
            .slice(-2)
            .map((w) => w[0])
            .join('')}
        </div>
        <div className="flex flex-col gap-0.5">
          <span
            className="text-sm font-extrabold"
            style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--clay-foreground)' }}
          >
            {name}
          </span>
          <span
            className="text-xs"
            style={{
              fontFamily: 'DM Sans, sans-serif',
              color: 'var(--clay-muted)',
              fontWeight: 500,
            }}
          >
            {role}
          </span>
        </div>
      </div>
    </div>
  );
}

const testimonials: TestimonialCardProps[] = [
  {
    quote:
      'Trải nghiệm spa tuyệt vời nhất mà tôi từng có. Massage tinh dầu thật sự tuyệt diệu. Tôi cảm thấy hoàn toàn được tái tạo sau đó.',
    name: 'Nguyễn Minh Anh',
    role: 'Khách hàng thân thiết',
    rating: 5,
    avatarGradient: 'linear-gradient(135deg, #d98b8b 0%, #c47070 100%)',
  },
  {
    quote:
      'Tôi đã đến đây 2 năm và chất lượng không bao giờ giảm. Đá nóng trị liệu là dịch vụ yêu thích của tôi — thư giãn tuyệt đối mỗi lần.',
    name: 'Trần Thị Hương',
    role: 'Thành viên VIP',
    rating: 5,
    avatarGradient: 'linear-gradient(135deg, #E2C2C2 0%, #d98b8b 100%)',
  },
  {
    quote:
      'Ngay từ khi bước vào, tôi đã cảm thấy được chào đón. Liệu trình chăm sóc da mặt đã thay đổi hoàn toàn làn da của tôi. Nhân viên vô cùng chuyên nghiệp và tận tâm.',
    name: 'Lê Văn Đức',
    role: 'Khách lần đầu',
    rating: 5,
    avatarGradient: 'linear-gradient(135deg, #e9b8b8 0%, #b85f5f 100%)',
  },
];

export function Testimonials() {
  return (
    <section className="relative px-6 sm:px-12 lg:px-20 py-24 flex flex-col items-center gap-14">
      <div className="flex flex-col items-center gap-4 text-center max-w-2xl">
        <span
          className="text-xs font-bold uppercase tracking-[0.4em]"
          style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--clay-accent)' }}
        >
          Cảm nhận khách hàng
        </span>
        <h2
          className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight"
          style={{
            fontFamily: 'Nunito, sans-serif',
            color: 'var(--clay-foreground)',
            lineHeight: 1.1,
          }}
        >
          Khách Hàng Nói Gì
        </h2>
        <p
          className="text-base sm:text-lg leading-relaxed"
          style={{
            fontFamily: 'DM Sans, sans-serif',
            color: 'var(--clay-muted)',
            fontWeight: 500,
          }}
        >
          Những trải nghiệm thực tế từ khách hàng thân yêu của chúng tôi
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-[1240px]">
        {testimonials.map((t) => (
          <TestimonialCard key={t.name} {...t} />
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
