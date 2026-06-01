import './styles.less';

export default function LoginHero() {
  return (
    <div
      className="relative hidden lg:flex lg:w-1/2 min-h-screen items-center justify-center p-12"
    >
      <div
        className="relative w-full h-full max-w-[640px] overflow-hidden flex items-center justify-center"
        style={{
          borderRadius: 60,
          boxShadow:
            '30px 30px 60px #e3d2d2, -30px -30px 60px #ffffff, inset 10px 10px 20px rgba(196, 112, 112, 0.05), inset -10px -10px 20px rgba(255, 255, 255, 0.8)',
        }}
      >
        <img
          src={require('@/assets/landingPage-img/hero-background.png')}
          alt="Luna Spa"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(160deg, rgba(255, 249, 249, 0.5) 0%, rgba(217, 139, 139, 0.6) 50%, rgba(196, 112, 112, 0.85) 100%)',
          }}
        />

        {/* Floating decorative orbs */}
        <div
          className="absolute top-[10%] left-[10%] rounded-full animate-clay-float-slow"
          style={{
            width: 110,
            height: 110,
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(226,194,194,0.7) 100%)',
            boxShadow:
              '20px 20px 40px rgba(196, 112, 112, 0.25), -10px -10px 24px rgba(255, 255, 255, 0.7)',
          }}
        />
        <div
          className="absolute bottom-[15%] right-[12%] rounded-full animate-clay-float"
          style={{
            width: 140,
            height: 140,
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(217,139,139,0.6) 100%)',
            boxShadow:
              '24px 24px 48px rgba(196, 112, 112, 0.3), -12px -12px 28px rgba(255, 255, 255, 0.7)',
            animationDelay: '2s',
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-7 px-10 text-center">
          <img
            src="/spalogo.png"
            alt="Luna Spa Logo"
            className="rounded-full object-cover"
            style={{
              width: 96,
              height: 96,
              boxShadow:
                '12px 12px 28px rgba(74, 63, 63, 0.3), -8px -8px 20px rgba(255, 255, 255, 0.5)',
            }}
          />
          <h1
            className="login-hero__title"
            style={{ color: '#FFFFFF', textShadow: '0 6px 30px rgba(74, 63, 63, 0.4)' }}
          >
            Chào Mừng<br />Trở Lại
          </h1>
          <p
            className="text-lg"
            style={{
              fontFamily: 'DM Sans, sans-serif',
              color: 'rgba(255,255,255,0.95)',
              fontWeight: 500,
              textShadow: '0 2px 12px rgba(74, 63, 63, 0.3)',
            }}
          >
            Nơi bình yên bắt đầu
          </p>
          <div
            className="rounded-full"
            style={{ width: 72, height: 6, background: 'rgba(255, 255, 255, 0.85)' }}
          />
          <p
            className="text-sm max-w-[360px] leading-relaxed"
            style={{
              fontFamily: 'DM Sans, sans-serif',
              color: 'rgba(255,255,255,0.85)',
              fontWeight: 500,
              textShadow: '0 2px 10px rgba(74, 63, 63, 0.3)',
            }}
          >
            Hệ thống quản lý Luna Spa dành cho nhân viên và quản lý nội bộ
          </p>
        </div>
      </div>
    </div>
  );
}
