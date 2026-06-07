import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import '@/pages/loginPage/components/styles.less';
import { history, useModel } from 'umi';
import { changePassword } from '@/services/Auth/api';
import { AUTH_TOKEN_KEY, DEFAULT_HOME_BY_ROLE } from '@/services/Auth/constant';

// Trang đổi mật khẩu — dùng cho cả flow ép đổi lần đầu (mustChangePassword)
// và đổi mật khẩu chủ động. Giao diện tạm dùng token màu theo design Pencil
// (--accent-deep, --bg-primary…) để đồng bộ với LoginForm.

export default function ChangePasswordPage() {
	const { refreshMe, currentUser } = useModel('auth') as any;
	const { initialState, setInitialState } = useModel('@@initialState') as any;
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [err, setErr] = useState('');
	const [loading, setLoading] = useState(false);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErr('');
		if (newPassword.length < 8) {
			setErr('Mật khẩu mới phải có ít nhất 8 ký tự');
			return;
		}
		if (newPassword !== confirm) {
			setErr('Xác nhận mật khẩu không khớp');
			return;
		}
		setLoading(true);
		try {
			const res = await changePassword({ currentPassword, newPassword });
			localStorage.setItem(AUTH_TOKEN_KEY, res.data.accessToken);
			const user = await refreshMe();
			await setInitialState({ ...(initialState ?? {}), currentUser: user });
			const home = DEFAULT_HOME_BY_ROLE[(user?.role ?? currentUser?.role) as Auth.TStaffRole] ?? '/';
			history.replace(home);
		} catch (e: any) {
			setErr(e?.response?.data?.message || 'Đổi mật khẩu thất bại');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className='min-h-screen flex items-center justify-center px-4'
			style={{ backgroundColor: 'var(--bg-primary)', fontFamily: 'Inter, sans-serif' }}
		>
			<form onSubmit={onSubmit} className='w-full max-w-[420px] flex flex-col gap-5'>
				<div className='flex flex-col items-center gap-2 text-center'>
					<h2 className='text-2xl font-bold' style={{ color: 'var(--text-primary)' }}>
						Đổi mật khẩu
					</h2>
					<p className='text-sm' style={{ color: 'var(--text-secondary)' }}>
						{currentUser?.mustChangePassword
							? 'Vui lòng đặt mật khẩu mới trước khi tiếp tục sử dụng hệ thống'
							: 'Cập nhật mật khẩu để bảo mật tài khoản'}
					</p>
				</div>

				<Field label='Mật khẩu hiện tại' value={currentPassword} onChange={setCurrentPassword} />
				<Field label='Mật khẩu mới' value={newPassword} onChange={setNewPassword} />
				<Field label='Xác nhận mật khẩu mới' value={confirm} onChange={setConfirm} />

				{err && (
					<div className='rounded-[10px] px-4 py-3 text-[13px]' style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
						{err}
					</div>
				)}

				<button
					type='submit'
					disabled={loading}
					className='login-form__submit w-full flex items-center justify-center'
				>
					{loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
				</button>
			</form>
		</div>
	);
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
	const [show, setShow] = useState(false);
	return (
		<div className='flex flex-col gap-1.5'>
			<label className='text-[13px] font-medium' style={{ color: 'var(--text-primary)' }}>
				{label}
			</label>
			<div className='relative'>
				<input
					type={show ? 'text' : 'password'}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className='login-form__input login-form__input--with-icon w-full text-sm outline-none'
				/>
				<button
					type='button'
					onClick={() => setShow(!show)}
					aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
					className='login-form__eye'
				>
					{show ? <EyeOff size={18} /> : <Eye size={18} />}
				</button>
			</div>
		</div>
	);
}
