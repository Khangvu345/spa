// State + logic cho Quản lý dịch vụ.
import { useCallback, useState } from 'react';
import { message } from 'antd';
import * as api from '@/services/Services/api';
import { DEFAULT_PAGE_SIZE } from '@/services/Services/constant';

export default () => {
	const [list, setList] = useState<SvcMgmt.IService[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [query, setQuery] = useState<SvcMgmt.IQuery>({
		page: 1,
		limit: DEFAULT_PAGE_SIZE,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	const fetch = useCallback(async (override?: Partial<SvcMgmt.IQuery>) => {
		setLoading(true);
		try {
			const next = { ...query, ...(override ?? {}) };
			setQuery(next);
			const res = await api.getServices(next);
			setList(res.data.data ?? []);
			setTotal(res.data.meta?.total ?? 0);
		} catch (e: any) {
			message.error(e?.response?.data?.message || 'Không tải được danh sách dịch vụ');
		} finally {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const create = useCallback(async (payload: SvcMgmt.ICreatePayload) => {
		await api.createService(payload);
		message.success('Tạo dịch vụ thành công');
		await fetch({ page: 1 });
	}, [fetch]);

	const update = useCallback(async (id: string, payload: SvcMgmt.IUpdatePayload) => {
		await api.updateService(id, payload);
		message.success('Cập nhật thành công');
		await fetch();
	}, [fetch]);

	const toggleActive = useCallback(
		async (svc: SvcMgmt.IService) => {
			await api.updateService(svc.id, { isActive: !svc.isActive });
			message.success(svc.isActive ? 'Đã tạm ngưng dịch vụ' : 'Đã kích hoạt dịch vụ');
			await fetch();
		},
		[fetch],
	);

	return { list, total, loading, query, fetch, create, update, toggleActive };
};
