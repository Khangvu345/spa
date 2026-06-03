import { useState } from 'react';
import { Eye, EyeOff, AlertTriangle, ShieldAlert } from 'lucide-react';
import { history, useModel } from 'umi';
import {
	DEFAULT_HOME_BY_ROLE,
	EAuthErrorCode,
	PATH_CHANGE_PASSWORD,
} from '@/services/Auth/constant';
import './styles.less';

type TAlert = {
	tone: 'error' | 'warning';
	title: string;
	description: string;
} | null;

export default function LoginForm() {
	const { login, loading } = useModel('auth') as {
		login: (p: Auth.ILoginPayload) => Promise<Auth.IAuthResponse>;
		loading: boolean;
	};
	const { initialState, setInitialState } = useModel('@@initialState') as {
		initialState: any;
		setInitialState: (s: any) => void;
	};

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [remember, setRemember] = useState(false);
	const [alert, setAlert] = useState<TAlert>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setAlert(null);

		if (!email || !password) {
			setAlert({
				tone: 'error',
				title: 'Thiếu thông tin',
				description: 'Vui lòng nhập đầy đủ email và mật khẩu',
			});
			return;
		}

		try {
			const res = await login({ email, password });
			// STAFF không có UI (xem docs/role-decision.md). Login thành công ở
			// BE nhưng FE chặn và tự logout.
			if (res.user.role === 'STAFF') {
				const { logout } = (await import('@/services/Auth/api')) as any;
				try {
					if (typeof logout === 'function') logout();
				} catch {}
				localStorage.removeItem('spa_access_token');
				localStorage.removeItem('spa_current_user');
				setAlert({
					tone: 'warning',
					title: 'Tài khoản không có quyền truy cập',
					description: 'Tài khoản nhân viên không được phép đăng nhập vào hệ thống quản lý.',
				});
				return;
			}
			// Cập nhật initialState để plugin-access nhận role mới ngay.
			await setInitialState({ ...(initialState ?? {}), currentUser: res.user });
			if (res.user.mustChangePassword) {
				history.replace(PATH_CHANGE_PASSWORD);
				return;
			}
			const home = DEFAULT_HOME_BY_ROLE[res.user.role] ?? '/';
			history.replace(home);
		} catch (err: any) {
			const code: string | undefined = err?.response?.data?.code;
			const msg: string | undefined = err?.response?.data?.message;

			// BE đang gộp chung "sai mật khẩu" và "tài khoản không active" vào cùng
			// 401 INVALID_CREDENTIALS để chống dò; ta đoán "khoá" qua message khi có.
			if (msg && (msg.toLowerCase().includes('khoá') || msg.toLowerCase().includes('khoa'))) {
				setAlert({
					tone: 'warning',
					title: 'Tài khoản đã bị khoá',
					description: 'Vui lòng liên hệ quản trị viên để mở khoá',
				});
				return;
			}

			if (code === EAuthErrorCode.INVALID_CREDENTIALS || err?.response?.status === 401) {
				setAlert({
					tone: 'error',
					title: 'Sai email hoặc mật khẩu',
					description: 'Vui lòng kiểm tra lại thông tin đăng nhập',
				});
				return;
			}

			setAlert({
				tone: 'error',
				title: 'Đăng nhập thất bại',
				description: msg || 'Đã có lỗi xảy ra, vui lòng thử lại',
			});
		}
	};

	return (
		<div
			className='w-full lg:w-1/2 min-h-screen flex items-center justify-center px-4 sm:px-6 py-10'
			style={{ backgroundColor: 'var(--clay-canvas)' }}
		>
			<form onSubmit={handleSubmit} className='w-full max-w-[420px] flex flex-col items-center gap-6'>
				<img
					src='/spalogo.png'
					alt='Luna Spa Logo'
					className='w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover'
					style={{
						boxShadow:
							'8px 8px 18px rgba(196, 112, 112, 0.25), -4px -4px 12px rgba(255, 255, 255, 0.9)',
					}}
				/>

				<div className='flex flex-col items-center gap-2 w-full text-center'>
					<h2 className='login-form__title'>Đăng Nhập</h2>
					<p
						className='text-sm'
						style={{
							fontFamily: 'DM Sans, sans-serif',
							color: 'var(--clay-muted)',
							fontWeight: 500,
						}}
					>
						Hệ thống quản lý nội bộ Luna Spa
					</p>
				</div>

				<div className='flex flex-col gap-4 w-full'>
					<div className='flex flex-col gap-2'>
						<label
							className='text-[13px] font-bold'
							style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--clay-foreground)' }}
						>
							Địa chỉ email
						</label>
						<input
							type='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder='your@email.com'
							className='login-form__input w-full text-sm outline-none'
						/>
					</div>

					<div className='flex flex-col gap-2'>
						<label
							className='text-[13px] font-bold'
							style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--clay-foreground)' }}
						>
							Mật khẩu
						</label>
						<div className='relative'>
							<input
								type={showPassword ? 'text' : 'password'}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder='••••••••'
								className='login-form__input login-form__input--with-icon w-full text-sm outline-none'
							/>
							<button
								type='button'
								onClick={() => setShowPassword(!showPassword)}
								aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
								className='login-form__eye'
							>
								{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
							</button>
						</div>
					</div>

					<div className='flex flex-wrap items-center justify-between gap-2'>
						<label className='flex items-center gap-2 cursor-pointer'>
							<input
								type='checkbox'
								checked={remember}
								onChange={(e) => setRemember(e.target.checked)}
								className='w-[18px] h-[18px] rounded accent-[var(--accent-deep)]'
							/>
							<span
								className='text-[13px]'
								style={{
									fontFamily: 'DM Sans, sans-serif',
									color: 'var(--clay-muted)',
									fontWeight: 500,
								}}
							>
								Ghi nhớ đăng nhập
							</span>
						</label>
						<a
							href='#'
							className='text-[13px] font-bold hover:opacity-80 transition-opacity'
							style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--clay-accent)' }}
						>
							Quên mật khẩu?
						</a>
					</div>
				</div>

				{alert?.tone === 'error' && (
					<div className='login-form__alert login-form__alert--error w-full flex items-start gap-2.5 rounded-[10px] px-4 py-3'>
						<AlertTriangle size={18} className='mt-0.5 flex-shrink-0' color='#EF4444' />
						<div className='flex flex-col gap-0.5'>
							<span className='text-[13px] font-semibold' style={{ color: '#DC2626' }}>
								{alert.title}
							</span>
							<span className='text-[12px]' style={{ color: '#EF4444' }}>
								{alert.description}
							</span>
						</div>
					</div>
				)}

				<button type='submit' disabled={loading} className='login-form__submit w-full flex items-center justify-center'>
					{loading ? (
						<div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
					) : (
						'Đăng Nhập'
					)}
				</button>

				{alert?.tone === 'warning' && (
					<div className='login-form__alert login-form__alert--warning w-full flex items-start gap-2.5 rounded-[10px] px-4 py-3'>
						<ShieldAlert size={18} className='mt-0.5 flex-shrink-0' color='#CA8A04' />
						<div className='flex flex-col gap-0.5'>
							<span className='text-[13px] font-semibold' style={{ color: '#92400E' }}>
								{alert.title}
							</span>
							<span className='text-[12px]' style={{ color: '#A16207' }}>
								{alert.description}
							</span>
						</div>
					</div>
				)}
			</form>
		</div>
	);
}
