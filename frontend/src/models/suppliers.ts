// State + logic cho Quản lý nhà cung cấp.
import { useCallback, useState } from 'react';
import { message } from 'antd';
import * as api from '@/services/Suppliers/api';
import { DEFAULT_PAGE_SIZE } from '@/services/Suppliers/constant';

export default () => {
	const [list, setList] = useState<SupplierMgmt.ISupplier[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [query, setQuery] = useState<SupplierMgmt.IQuery>({
		page: 1,
		limit: DEFAULT_PAGE_SIZE,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	const fetch = useCallback(async (override?: Partial<SupplierMgmt.IQuery>) => {
		setLoading(true);
		try {
			const next = { ...query, ...(override ?? {}) };
			setQuery(next);
			const res = await api.getSuppliers(next);
			setList(res.data.data ?? []);
			setTotal(res.data.meta?.total ?? 0);
		} catch (e: any) {
			message.error(e?.response?.data?.message || 'Không tải được danh sách nhà cung cấp');
		} finally {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const create = useCallback(async (payload: SupplierMgmt.ICreatePayload) => {
		await api.createSupplier(payload);
		message.success('Tạo nhà cung cấp thành công');
		await fetch({ page: 1 });
	}, [fetch]);

	const update = useCallback(async (id: string, payload: SupplierMgmt.IUpdatePayload) => {
		await api.updateSupplier(id, payload);
		message.success('Cập nhật thành công');
		await fetch();
	}, [fetch]);

	const toggleActive = useCallback(
		async (s: SupplierMgmt.ISupplier) => {
			await api.updateSupplier(s.id, { isActive: !s.isActive });
			message.success(s.isActive ? 'Đã ngưng hợp tác' : 'Đã kích hoạt hợp tác');
			await fetch();
		},
		[fetch],
	);

	return { list, total, loading, query, fetch, create, update, toggleActive };
};
