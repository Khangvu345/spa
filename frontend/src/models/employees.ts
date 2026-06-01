// State + logic cho Quản lý nhân viên.
import { useCallback, useState } from 'react';
import { message } from 'antd';
import * as api from '@/services/Employees/api';
import { DEFAULT_PAGE_SIZE } from '@/services/Employees/constant';

export default () => {
	const [list, setList] = useState<Employees.IEmployee[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [query, setQuery] = useState<Employees.IQuery>({
		page: 1,
		limit: DEFAULT_PAGE_SIZE,
		sortBy: 'startedAt',
		sortOrder: 'desc',
	});

	const fetch = useCallback(async (override?: Partial<Employees.IQuery>) => {
		setLoading(true);
		try {
			const next = { ...query, ...(override ?? {}) };
			setQuery(next);
			const res = await api.getEmployees(next);
			setList(res.data.data ?? []);
			setTotal(res.data.meta?.total ?? 0);
		} catch (e: any) {
			message.error(e?.response?.data?.message || 'Không tải được danh sách nhân viên');
		} finally {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const create = useCallback(async (payload: Employees.ICreatePayload) => {
		await api.createEmployee(payload);
		message.success('Tạo nhân viên thành công');
		await fetch({ page: 1 });
	}, [fetch]);

	const update = useCallback(async (id: string, payload: Employees.IUpdatePayload) => {
		await api.updateEmployee(id, payload);
		message.success('Cập nhật thành công');
		await fetch();
	}, [fetch]);

	const lock = useCallback(async (id: string) => {
		await api.lockEmployee(id);
		message.success('Đã khoá tài khoản');
		await fetch();
	}, [fetch]);

	const unlock = useCallback(async (id: string) => {
		await api.unlockEmployee(id);
		message.success('Đã mở khoá tài khoản');
		await fetch();
	}, [fetch]);

	const reset = useCallback(async (id: string) => {
		const res = await api.resetEmployeePassword(id);
		message.success('Đã reset mật khẩu' + (res.data?.defaultPassword ? `: ${res.data.defaultPassword}` : ''));
		await fetch();
	}, [fetch]);

	const remove = useCallback(async (id: string) => {
		try {
			await api.deleteEmployee(id);
			message.success('Đã xoá nhân viên');
			await fetch();
		} catch (e: any) {
			const msg = e?.response?.data?.error?.message
				|| e?.response?.data?.message
				|| 'Không xoá được nhân viên (yêu cầu đã khoá > 30 ngày)';
			message.error(Array.isArray(msg) ? msg.join(', ') : msg);
		}
	}, [fetch]);

	return { list, total, loading, query, fetch, create, update, lock, unlock, reset, remove };
};
