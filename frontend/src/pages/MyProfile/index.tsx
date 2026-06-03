// Hồ sơ của tôi — page tự xem profile + đổi mật khẩu.
import { useState } from 'react';
import { Tabs, Descriptions, Tag, Avatar, Form, Input, Button, message } from 'antd';
import { useModel } from 'umi';
import moment from 'moment';
import { User } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { changePassword } from '@/services/Auth/api';
import { AUTH_TOKEN_KEY } from '@/services/Auth/constant';

const ROLE_LABEL: Record<Auth.TStaffRole, { label: string; color: string }> = {
	ADMIN: { label: 'Quản trị', color: '#c47070' },
	OPERATOR: { label: 'Vận hành', color: '#7e6a8a' },
	STAFF: { label: 'Nhân viên', color: '#6b8e6f' },
};

const WORK_STATUS_LABEL: Record<Auth.TWorkStatus, { label: string; color: string }> = {
	ACTIVE: { label: 'Đang làm', color: '#6b8e6f' },
	ON_LEAVE: { label: 'Tạm nghỉ', color: '#d4805b' },
	RESIGNED: { label: 'Đã nghỉ', color: '#948683' },
};

const ACCOUNT_STATUS_LABEL: Record<Auth.TAccountStatus, { label: string; color: string }> = {
	ACTIVE: { label: 'Hoạt động', color: '#6b8e6f' },
	LOCKED: { label: 'Đã khoá', color: '#b85c5c' },
	DELETED: { label: 'Đã xoá', color: '#948683' },
};

const initials = (name?: string) =>
	(name || 'A')
		.split(' ')
		.filter(Boolean)
		.slice(-2)
		.map((w) => w[0]?.toUpperCase())
		.join('') || '?';

export default function MyProfilePage() {
	const { currentUser, refreshMe } = useModel('auth') as any;
	const { initialState, setInitialState } = useModel('@@initialState') as any;
	const user: Auth.IStaff | null = currentUser ?? initialState?.currentUser ?? null;

	const role = user ? ROLE_LABEL[user.role] : null;
	const work = user ? WORK_STATUS_LABEL[user.workStatus] : null;
	const acc = user ? ACCOUNT_STATUS_LABEL[user.accountStatus] : null;

	const [form] = Form.useForm();
	const [submitting, setSubmitting] = useState(false);

	const onChangePassword = async () => {
		const values = await form.validateFields();
		setSubmitting(true);
		try {
			const res = await changePassword({
				currentPassword: values.currentPassword,
				newPassword: values.newPassword,
			});
			localStorage.setItem(AUTH_TOKEN_KEY, res.data.accessToken);
			const refreshed = await refreshMe();
			await setInitialState({ ...(initialState ?? {}), currentUser: refreshed });
			form.resetFields();
			message.success('Đổi mật khẩu thành công');
		} catch (e: any) {
			message.error(e?.response?.data?.message || 'Đổi mật khẩu thất bại');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '24px 32px' }}>
			<PageHeader title='Hồ sơ của tôi' subtitle='Thông tin cá nhân và cài đặt tài khoản' />

			{user && (
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 16,
						padding: 24,
						background: '#fff5f5',
						borderRadius: 28,
						boxShadow:
							'0 6px 16px rgba(180, 130, 130, 0.18), 0 2px 4px rgba(180, 130, 130, 0.08)',
					}}
				>
					<Avatar
						size={80}
						style={{
							background: 'linear-gradient(135deg, #d98b8b 0%, #c47070 100%)',
							fontFamily: 'Nunito, sans-serif',
							fontSize: 28,
							fontWeight: 800,
							boxShadow:
								'0 6px 14px rgba(196, 112, 112, 0.28), -2px -2px 8px rgba(255, 255, 255, 0.8)',
						}}
						icon={!user.fullName ? <User /> : undefined}
					>
						{initials(user.fullName)}
					</Avatar>
					<div style={{ flex: 1 }}>
						<div
							style={{
								fontFamily: 'Nunito, sans-serif',
								fontSize: 22,
								fontWeight: 900,
								color: 'var(--clay-foreground)',
								letterSpacing: '-0.01em',
							}}
						>
							{user.fullName}
						</div>
						<div
							style={{
								fontFamily: 'DM Sans, sans-serif',
								fontSize: 13,
								fontWeight: 500,
								color: 'var(--clay-muted)',
								marginTop: 4,
							}}
						>
							{user.email} · {user.phone}
						</div>
						<div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
							{role && <Tag color={role.color}>{role.label}</Tag>}
							{work && <Tag color={work.color}>{work.label}</Tag>}
							{acc && <Tag color={acc.color}>{acc.label}</Tag>}
						</div>
					</div>
				</div>
			)}

			<div
				style={{
					background: '#fff5f5',
					borderRadius: 28,
					padding: 24,
					boxShadow:
						'0 6px 16px rgba(180, 130, 130, 0.18), 0 2px 4px rgba(180, 130, 130, 0.08)',
				}}
			>
				<Tabs defaultActiveKey='profile'>
					<Tabs.TabPane tab='Thông tin' key='profile'>
						{user && (
							<Descriptions
								column={2}
								size='small'
								bordered
								labelStyle={{
								width: 180,
								color: 'var(--clay-muted)',
								fontFamily: 'Nunito, sans-serif',
								fontWeight: 700,
							}}
							>
								<Descriptions.Item label='Mã NV'>
									<code>{user.id}</code>
								</Descriptions.Item>
								<Descriptions.Item label='Vai trò'>
									{role && <Tag color={role.color}>{role.label}</Tag>}
								</Descriptions.Item>
								<Descriptions.Item label='Họ tên'>{user.fullName}</Descriptions.Item>
								<Descriptions.Item label='Email'>{user.email}</Descriptions.Item>
								<Descriptions.Item label='SĐT'>{user.phone}</Descriptions.Item>
								<Descriptions.Item label='Lương cơ bản'>
									<strong style={{ color: 'var(--clay-accent)' }}>
										{user.baseSalary?.toLocaleString('vi-VN')} ₫
									</strong>
								</Descriptions.Item>
								<Descriptions.Item label='Trạng thái làm việc'>
									{work && <Tag color={work.color}>{work.label}</Tag>}
								</Descriptions.Item>
								<Descriptions.Item label='Trạng thái TK'>
									{acc && <Tag color={acc.color}>{acc.label}</Tag>}
								</Descriptions.Item>
								<Descriptions.Item label='Ngày bắt đầu' span={2}>
									{user.startedAt ? moment(user.startedAt).format('DD/MM/YYYY') : '—'}
								</Descriptions.Item>
							</Descriptions>
						)}
					</Tabs.TabPane>

					<Tabs.TabPane tab='Đổi mật khẩu' key='password'>
						<Form form={form} layout='vertical' style={{ maxWidth: 480 }}>
							<Form.Item
								name='currentPassword'
								label='Mật khẩu hiện tại'
								rules={[{ required: true, message: 'Nhập mật khẩu hiện tại' }]}
							>
								<Input.Password autoComplete='current-password' />
							</Form.Item>
							<Form.Item
								name='newPassword'
								label='Mật khẩu mới'
								rules={[
									{ required: true, message: 'Nhập mật khẩu mới' },
									{ min: 8, message: 'Tối thiểu 8 ký tự' },
								]}
							>
								<Input.Password autoComplete='new-password' />
							</Form.Item>
							<Form.Item
								name='confirm'
								label='Xác nhận mật khẩu mới'
								dependencies={['newPassword']}
								rules={[
									{ required: true, message: 'Xác nhận mật khẩu mới' },
									({ getFieldValue }) => ({
										validator(_, value) {
											if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
											return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
										},
									}),
								]}
							>
								<Input.Password autoComplete='new-password' />
							</Form.Item>
							<Form.Item>
								<Button type='primary' loading={submitting} onClick={onChangePassword}>
									Lưu mật khẩu
								</Button>
							</Form.Item>
						</Form>
					</Tabs.TabPane>
				</Tabs>
			</div>
		</div>
	);
}
