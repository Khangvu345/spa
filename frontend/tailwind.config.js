module.exports = {
	mode: 'jit',
	purge: ['./src/**/*.{ts,tsx,js,jsx}'],
	darkMode: false,
	theme: {
		extend: {
			colors: {
				// Legacy tokens (giữ tương thích code cũ)
				accent: {
					DEFAULT: 'var(--accent)',
					light: 'var(--accent-light)',
					dark: 'var(--accent-dark)',
					deep: 'var(--accent-deep)',
				},
				'bg-primary': 'var(--bg-primary)',
				'bg-secondary': 'var(--bg-secondary)',
				'bg-card': 'var(--bg-card)',
				'bg-dark': 'var(--bg-dark)',
				'txt-primary': 'var(--text-primary)',
				'txt-secondary': 'var(--text-secondary)',
				'txt-light': 'var(--text-light)',
				'txt-muted': 'var(--text-muted)',
				'border-spa': 'var(--border)',
				'border-spa-light': 'var(--border-light)',
				'border-spa-dark': 'var(--border-dark)',

				// Clay tokens — Warm Earth palette
				clay: {
					canvas: '#fff9f9',
					foreground: '#4A3F3F',
					muted: '#8C7A7A',
					accent: '#c47070',
					'accent-alt': '#d98b8b',
					tertiary: '#E2C2C2',
					cardBg: 'rgba(255, 255, 255, 0.7)',
					inputBg: '#f5e9e9',
					shadowColor: '#e3d2d2',
				},
			},
			fontFamily: {
				clay: ['Nunito', 'system-ui', 'sans-serif'],
				'clay-body': ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
			},
			borderRadius: {
				clay: '20px',
				'clay-md': '24px',
				'clay-lg': '32px',
				'clay-xl': '40px',
				'clay-2xl': '48px',
				'clay-3xl': '60px',
			},
			boxShadow: {
				// 4-layer Clay shadow stacks
				claySurface:
					'30px 30px 60px #e3d2d2, -30px -30px 60px #ffffff, inset 10px 10px 20px rgba(196, 112, 112, 0.05), inset -10px -10px 20px rgba(255, 255, 255, 0.8)',
				clayCard:
					'16px 16px 32px rgba(180, 150, 150, 0.2), -10px -10px 24px rgba(255, 255, 255, 0.9), inset 6px 6px 12px rgba(196, 112, 112, 0.03), inset -6px -6px 12px rgba(255, 255, 255, 1)',
				clayCardHover:
					'24px 24px 48px rgba(180, 150, 150, 0.28), -14px -14px 28px rgba(255, 255, 255, 1), inset 6px 6px 12px rgba(196, 112, 112, 0.04), inset -6px -6px 12px rgba(255, 255, 255, 1)',
				clayButton:
					'12px 12px 24px rgba(196, 112, 112, 0.3), -8px -8px 16px rgba(255, 255, 255, 0.4), inset 4px 4px 8px rgba(255, 255, 255, 0.4), inset -4px -4px 8px rgba(0, 0, 0, 0.1)',
				clayButtonHover:
					'18px 18px 36px rgba(196, 112, 112, 0.4), -10px -10px 20px rgba(255, 255, 255, 0.5), inset 4px 4px 8px rgba(255, 255, 255, 0.5), inset -4px -4px 8px rgba(0, 0, 0, 0.08)',
				clayPressed:
					'inset 10px 10px 20px #e3d4d4, inset -10px -10px 20px #ffffff',
				clayPressedSm:
					'inset 6px 6px 12px #e3d4d4, inset -6px -6px 12px #ffffff',
			},
			animation: {
				'clay-float': 'clay-float 8s ease-in-out infinite',
				'clay-float-delayed': 'clay-float-delayed 10s ease-in-out infinite',
				'clay-float-slow': 'clay-float-slow 12s ease-in-out infinite',
				'clay-breathe': 'clay-breathe 6s ease-in-out infinite',
			},
			keyframes: {
				'clay-float': {
					'0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
					'50%': { transform: 'translateY(-20px) rotate(2deg)' },
				},
				'clay-float-delayed': {
					'0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
					'50%': { transform: 'translateY(-15px) rotate(-2deg)' },
				},
				'clay-float-slow': {
					'0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
					'50%': { transform: 'translateY(-30px) rotate(5deg)' },
				},
				'clay-breathe': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.02)' },
				},
			},
		},
	},
	variants: {
		extend: {},
	},
	plugins: [],
	corePlugins: {
		preflight: false,
	},
};
