// State + logic cho Quản lý vật liệu.
import { useCallback, useState } from 'react';
import { message } from 'antd';
import * as api from '@/services/Materials/api';
import * as supplierApi from '@/services/Suppliers/api';
import { DEFAULT_PAGE_SIZE } from '@/services/Materials/constant';

export default () => {
	const [list, setList] = useState<MaterialMgmt.IMaterial[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [suppliers, setSuppliers] = useState<SupplierMgmt.ISupplier[]>([]);
	const [query, setQuery] = useState<MaterialMgmt.IQuery>({
		page: 1,
		limit: DEFAULT_PAGE_SIZE,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	const fetch = useCallback(async (override?: Partial<MaterialMgmt.IQuery>) => {
		setLoading(true);
		try {
			const next = { ...query, ...(override ?? {}) };
			setQuery(next);
			const res = await api.getMaterials(next);
			setList(res.data.data ?? []);
			setTotal(res.data.meta?.total ?? 0);
		} catch (e: any) {
			message.error(e?.response?.data?.message || 'Không tải được danh sách vật liệu');
		} finally {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchSuppliers = useCallback(async () => {
		try {
			const res = await supplierApi.getSuppliers({ isActive: true, limit: 100 });
			setSuppliers(res.data.data ?? []);
		} catch (e: any) {
			message.error('Không tải được danh sách nhà cung cấp');
		}
	}, []);

	const create = useCallback(async (payload: MaterialMgmt.ICreatePayload) => {
		await api.createMaterial(payload);
		message.success('Tạo vật liệu thành công');
		await fetch({ page: 1 });
	}, [fetch]);

	const update = useCallback(async (id: string, payload: MaterialMgmt.IUpdatePayload) => {
		await api.updateMaterial(id, payload);
		message.success('Cập nhật thành công');
		await fetch();
	}, [fetch]);

	const toggleActive = useCallback(
		async (m: MaterialMgmt.IMaterial) => {
			await api.updateMaterial(m.id, { isActive: !m.isActive });
			message.success(m.isActive ? 'Đã ngưng sử dụng' : 'Đã kích hoạt');
			await fetch();
		},
		[fetch],
	);

	return { list, total, loading, suppliers, query, fetch, fetchSuppliers, create, update, toggleActive };
};
