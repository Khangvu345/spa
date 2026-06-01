// State + logic cho Quản lý khách hàng.
import { useCallback, useState } from 'react';
import { message } from 'antd';
import * as api from '@/services/Customers/api';
import { DEFAULT_PAGE_SIZE } from '@/services/Customers/constant';

export default () => {
	const [list, setList] = useState<CustomerMgmt.ICustomer[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [query, setQuery] = useState<CustomerMgmt.IQuery>({
		page: 1,
		limit: DEFAULT_PAGE_SIZE,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	const fetch = useCallback(async (override?: Partial<CustomerMgmt.IQuery>) => {
		setLoading(true);
		try {
			const next = { ...query, ...(override ?? {}) };
			setQuery(next);
			const res = await api.getCustomers(next);
			setList(res.data.data ?? []);
			setTotal(res.data.meta?.total ?? 0);
		} catch (e: any) {
			message.error(e?.response?.data?.message || 'Không tải được danh sách khách hàng');
		} finally {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const create = useCallback(async (payload: CustomerMgmt.ICreatePayload) => {
		await api.createCustomer(payload);
		message.success('Tạo khách hàng thành công');
		await fetch({ page: 1 });
	}, [fetch]);

	const update = useCallback(async (id: string, payload: CustomerMgmt.IUpdatePayload) => {
		await api.updateCustomer(id, payload);
		message.success('Cập nhật thành công');
		await fetch();
	}, [fetch]);

	const toggleActive = useCallback(async (c: CustomerMgmt.ICustomer) => {
		await api.toggleCustomerActive(c.id);
		message.success(c.isActive ? 'Đã ngưng khách hàng' : 'Đã kích hoạt lại');
		await fetch();
	}, [fetch]);

	return { list, total, loading, query, fetch, create, update, toggleActive };
};
