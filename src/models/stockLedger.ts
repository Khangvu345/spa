// State + logic cho Sổ kho.
import { useCallback, useState } from 'react';
import { message } from 'antd';
import * as api from '@/services/StockLedger/api';
import { DEFAULT_PAGE_SIZE } from '@/services/StockLedger/constant';

export default () => {
	const [list, setList] = useState<StockLedger.ILedgerEntry[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [lowStock, setLowStock] = useState<StockLedger.ILowStockItem[]>([]);
	const [summary, setSummary] = useState<StockLedger.ISummary | null>(null);
	const [query, setQuery] = useState<StockLedger.IQuery>({
		page: 1,
		limit: DEFAULT_PAGE_SIZE,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	const fetch = useCallback(async (override?: Partial<StockLedger.IQuery>) => {
		setLoading(true);
		try {
			const next = { ...query, ...(override ?? {}) };
			setQuery(next);
			const res = await api.getLedger(next);
			setList(res.items);
			setTotal(res.meta.total);
		} catch (e: any) {
			message.error(e?.response?.data?.message || 'Không tải được lịch sử kho');
		} finally {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchByMaterial = useCallback(async (materialId: string, override?: Partial<StockLedger.IQuery>) => {
		setLoading(true);
		try {
			const res = await api.getLedgerByMaterial(materialId, {
				page: 1,
				limit: 50,
				sortBy: 'createdAt',
				sortOrder: 'desc',
				...(override ?? {}),
			});
			setList(res.items);
			setTotal(res.meta.total);
		} catch (e: any) {
			message.error(e?.response?.data?.message || 'Không tải được lịch sử vật liệu');
		} finally {
			setLoading(false);
		}
	}, []);

	const fetchLowStock = useCallback(async () => {
		try {
			const res = await api.getLowStock();
			setLowStock(res.data ?? []);
		} catch (e: any) {
			message.error(e?.response?.data?.message || 'Không tải được danh sách tồn thấp');
		}
	}, []);

	const fetchSummary = useCallback(async (fromDate?: string, toDate?: string) => {
		try {
			const res = await api.getSummary(fromDate, toDate);
			setSummary(res.data ?? null);
		} catch (e: any) {
			message.error(e?.response?.data?.message || 'Không tải được tổng kết kho');
		}
	}, []);

	const stockIn = useCallback(
		async (payload: StockLedger.IStockInPayload) => {
			setSubmitting(true);
			try {
				await api.stockIn(payload);
				message.success('Nhập kho thành công');
				return true;
			} catch (e: any) {
				const msg = e?.response?.data?.message;
				message.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Nhập kho thất bại');
				return false;
			} finally {
				setSubmitting(false);
			}
		},
		[],
	);

	const stockOut = useCallback(
		async (payload: StockLedger.IStockOutManualPayload) => {
			setSubmitting(true);
			try {
				await api.stockOutManual(payload);
				message.success('Xuất kho thành công');
				return true;
			} catch (e: any) {
				const msg = e?.response?.data?.message;
				message.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Xuất kho thất bại');
				return false;
			} finally {
				setSubmitting(false);
			}
		},
		[],
	);

	return {
		list,
		total,
		loading,
		submitting,
		lowStock,
		summary,
		query,
		fetch,
		fetchByMaterial,
		fetchLowStock,
		fetchSummary,
		stockIn,
		stockOut,
	};
};
