// State + logic cho ServiceOrders (phiếu DV). useModel hook.
import { useCallback, useState } from 'react';
import { message } from 'antd';
import * as api from '@/services/ServiceOrders/api';

const DEFAULT_QUERY: SvcOrderMgmt.IQuery = {
	page: 1,
	limit: 10,
	sortBy: 'createdAt',
	sortOrder: 'desc',
};

export default () => {
	const [list, setList] = useState<SvcOrderMgmt.IServiceOrder[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [query, setQuery] = useState<SvcOrderMgmt.IQuery>(DEFAULT_QUERY);
	const [detail, setDetail] = useState<SvcOrderMgmt.IServiceOrder | null>(null);
	const [detailLoading, setDetailLoading] = useState(false);

	const fetch = useCallback(async (patch: Partial<SvcOrderMgmt.IQuery> = {}) => {
		const next = { ...query, ...patch } as SvcOrderMgmt.IQuery;
		setQuery(next);
		setLoading(true);
		try {
			const res = await api.getServiceOrders(next);
			setList(res.items);
			setTotal(res.meta.total);
		} catch (e: any) {
			message.error(e?.response?.data?.error?.message || 'Không tải được danh sách phiếu');
		} finally {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query]);

	const loadDetail = useCallback(async (id: string) => {
		setDetailLoading(true);
		try {
			const res = await api.getServiceOrder(id);
			setDetail(res.data);
		} catch (e: any) {
			message.error(e?.response?.data?.error?.message || 'Không tải được phiếu');
		} finally {
			setDetailLoading(false);
		}
	}, []);

	const closeDetail = useCallback(() => setDetail(null), []);

	const handleError = (e: any, fallback: string) => {
		const msg = e?.response?.data?.error?.message || e?.response?.data?.message || fallback;
		message.error(msg);
	};

	const create = useCallback(async (payload: SvcOrderMgmt.ICreatePayload) => {
		try {
			const res = await api.createServiceOrder(payload);
			message.success(`Đã tạo phiếu ${res.data.orderCode}`);
			await fetch({ page: 1 });
			return res.data;
		} catch (e: any) {
			handleError(e, 'Không tạo được phiếu');
			throw e;
		}
	}, [fetch]);

	const updateOrder = useCallback(async (id: string, payload: SvcOrderMgmt.IUpdatePayload) => {
		try {
			const res = await api.updateServiceOrder(id, payload);
			message.success('Đã cập nhật phiếu');
			setDetail(res.data);
			await fetch();
			return res.data;
		} catch (e: any) {
			handleError(e, 'Không cập nhật được phiếu');
			throw e;
		}
	}, [fetch]);

	const addItem = useCallback(async (id: string, payload: SvcOrderMgmt.IAddItemPayload) => {
		try {
			const res = await api.addItem(id, payload);
			message.success('Đã thêm dịch vụ');
			setDetail(res.data);
			await fetch();
			return res.data;
		} catch (e: any) {
			handleError(e, 'Không thêm được dịch vụ');
			throw e;
		}
	}, [fetch]);

	const updateItem = useCallback(async (id: string, itemId: string, payload: SvcOrderMgmt.IUpdateItemPayload) => {
		try {
			const res = await api.updateItem(id, itemId, payload);
			message.success('Đã cập nhật dịch vụ');
			setDetail(res.data);
			await fetch();
		} catch (e: any) {
			handleError(e, 'Không cập nhật được dịch vụ');
			throw e;
		}
	}, [fetch]);

	const removeItem = useCallback(async (id: string, itemId: string) => {
		try {
			const res = await api.removeItem(id, itemId);
			message.success('Đã xoá dịch vụ');
			setDetail(res.data);
			await fetch();
		} catch (e: any) {
			handleError(e, 'Không xoá được dịch vụ');
			throw e;
		}
	}, [fetch]);

	const complete = useCallback(async (id: string) => {
		try {
			const res = await api.completeServiceOrder(id);
			message.success('Đã hoàn thành phiếu');
			setDetail(res.data);
			await fetch();
		} catch (e: any) {
			handleError(e, 'Không hoàn thành được phiếu');
			throw e;
		}
	}, [fetch]);

	const cancel = useCallback(async (id: string, reason: string) => {
		try {
			const res = await api.cancelServiceOrder(id, reason);
			message.success('Đã huỷ phiếu');
			setDetail(res.data);
			await fetch();
		} catch (e: any) {
			handleError(e, 'Không huỷ được phiếu');
			throw e;
		}
	}, [fetch]);

	return {
		list,
		total,
		loading,
		query,
		fetch,
		detail,
		detailLoading,
		loadDetail,
		closeDetail,
		create,
		updateOrder,
		addItem,
		updateItem,
		removeItem,
		complete,
		cancel,
	};
};
