// Modal xác thực OTP email cho luồng đặt lịch landing page.
// BE: mã 6 chữ số, hiệu lực 10 phút, tối đa 3 lần, cooldown gửi lại 120s.
import { useEffect, useState } from 'react';
import { Modal, Input, Button, Alert } from 'antd';
import { ShieldCheck, Mail, RotateCw } from 'lucide-react';

type VerifyResult = { ok: boolean; error: string; closed?: boolean };
type ResendResult = { ok: boolean; error: string };

type Props = {
	open: boolean;
	email?: string;
	verifying?: boolean;
	resending?: boolean;
	onVerify: (code: string) => Promise<VerifyResult>;
	onResend: () => Promise<ResendResult>;
	onClose: () => void;
};

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 120;

// Che email: giữ 2 ký tự đầu + *** + phần domain.
function maskEmail(email?: string): string {
	if (!email) return '';
	const [name, domain] = email.split('@');
	if (!domain) return email;
	const head = name.slice(0, 2);
	return `${head}${'*'.repeat(Math.max(name.length - 2, 1))}@${domain}`;
}

export default function OtpModal({ open, email, verifying, resending, onVerify, onResend, onClose }: Props) {
	const [code, setCode] = useState('');
	const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
	const [otpError, setOtpError] = useState('');

	// Mở modal: reset mã + bắt đầu đếm ngược cooldown gửi lại.
	useEffect(() => {
		if (open) {
			setCode('');
			setCooldown(RESEND_COOLDOWN);
			setOtpError('');
		}
	}, [open]);

	useEffect(() => {
		if (!open || cooldown <= 0) return;
		const t = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
		return () => clearInterval(t);
	}, [open, cooldown]);

	const handleVerify = async () => {
		setOtpError('');
		const r = await onVerify(code);
		if (!r.ok) {
			setCode(''); // sai mã → xoá để nhập lại
			// closed = booking đã bị huỷ → modal tự đóng, lỗi hiện ở ngoài form. Còn lại báo ngay trong modal.
			if (!r.closed) setOtpError(r.error);
		}
	};

	const handleResend = async () => {
		setOtpError('');
		const r = await onResend();
		if (r.ok) {
			setCode('');
			setCooldown(RESEND_COOLDOWN);
		} else {
			setOtpError(r.error);
		}
	};

	return (
		<Modal
			visible={open}
			centered
			width={440}
			footer={null}
			maskClosable={false}
			onCancel={onClose}
			title={
				<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
					<ShieldCheck size={20} color='var(--clay-accent)' />
					Xác thực email
				</span>
			}
		>
			<div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: 'DM Sans, sans-serif' }}>
				<div
					style={{
						display: 'flex',
						gap: 12,
						alignItems: 'flex-start',
						padding: 14,
						borderRadius: 16,
						background: 'rgba(196, 112, 112, 0.06)',
					}}
				>
					<Mail size={18} color='var(--clay-accent)' style={{ marginTop: 2, flexShrink: 0 }} />
					<div style={{ fontSize: 14, color: 'var(--clay-foreground)', lineHeight: 1.5 }}>
						Mã OTP gồm <strong>{OTP_LENGTH} chữ số</strong> đã được gửi đến{' '}
						<strong>{maskEmail(email)}</strong>. Mã có hiệu lực trong 10 phút.
					</div>
				</div>

				{otpError && (
					<Alert
						type='error'
						showIcon
						closable
						message={otpError}
						onClose={() => setOtpError('')}
						style={{ borderRadius: 12 }}
					/>
				)}

				<Input
					value={code}
					autoFocus
					inputMode='numeric'
					maxLength={OTP_LENGTH}
					placeholder='______'
					onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH))}
					onPressEnter={() => code.length === OTP_LENGTH && handleVerify()}
					style={{
						textAlign: 'center',
						fontSize: 26,
						fontWeight: 700,
						letterSpacing: 14,
						fontFamily: 'Nunito, sans-serif',
						color: 'var(--clay-foreground)',
					}}
				/>

				<Button
					type='primary'
					block
					loading={verifying}
					disabled={code.length !== OTP_LENGTH}
					onClick={handleVerify}
				>
					Xác nhận đặt lịch
				</Button>

				<div style={{ textAlign: 'center', fontSize: 13, color: 'var(--clay-muted)' }}>
					Chưa nhận được mã?{' '}
					{cooldown > 0 ? (
						<span>
							Gửi lại sau <strong>{cooldown}s</strong>
						</span>
					) : (
						<Button
							type='link'
							size='small'
							loading={resending}
							onClick={handleResend}
							icon={<RotateCw size={13} />}
							style={{ padding: 0, height: 'auto' }}
						>
							Gửi lại mã
						</Button>
					)}
				</div>
			</div>
		</Modal>
	);
}
