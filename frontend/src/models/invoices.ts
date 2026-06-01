// State + logic cho Hoá đơn.
import { useCallback, useState } from 'react';
import { message } from 'antd';
import * as api from '@/services/Invoices/api';
import { DEFAULT_PAGE_SIZE } from '@/services/Invoices/constant';

export default () => {
	const [list, setList] = useState<InvoiceMgmt.IInvoice[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [detail, setDetail] = useState<InvoiceMgmt.IInvoice | null>(null);
	const [query, setQuery] = useState<InvoiceMgmt.IQuery>({
		page: 1,
		limit: DEFAULT_PAGE_SIZE,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	const fetch = useCallback(async (override?: Partial<InvoiceMgmt.IQuery>) => {
		setLoading(true);
		try {
			const next = { ...query, ...(override ?? {}) };
			setQuery(next);
			const res = await api.getInvoices(next);
			setList(res.items);
			setTotal(res.meta.total);
		} catch (e: any) {
			message.error(e?.response?.data?.message || 'Không tải được danh sách hoá đơn');
		} finally {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const loadDetail = useCallback(async (id: string) => {
		setLoading(true);
		try {
			const res = await api.getInvoice(id);
			setDetail(res.data);
			return res.data;
		} catch (e: any) {
			message.error(e?.response?.data?.message || 'Không tải được hoá đơn');
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	const wrapAction = useCallback(
		async <T,>(fn: () => Promise<T>, successMsg: string, failMsg: string) => {
			setSubmitting(true);
			try {
				const r = await fn();
				message.success(successMsg);
				return r;
			} catch (e: any) {
				const msg = e?.response?.data?.message;
				message.error(Array.isArray(msg) ? msg.join(', ') : msg || failMsg);
				return null;
			} finally {
				setSubmitting(false);
			}
		},
		[],
	);

	const create = useCallback(
		(payload: InvoiceMgmt.ICreatePayload) =>
			wrapAction(() => api.createInvoice(payload), 'Tạo hoá đơn thành công', 'Tạo hoá đơn thất bại'),
		[wrapAction],
	);

	const update = useCallback(
		(id: string, payload: InvoiceMgmt.IUpdatePayload) =>
			wrapAction(() => api.updateInvoice(id, payload), 'Cập nhật thành công', 'Cập nhật thất bại'),
		[wrapAction],
	);

	const finalize = useCallback(
		(id: string) =>
			wrapAction(() => api.finalizeInvoice(id), 'Đã chốt hoá đơn', 'Chốt hoá đơn thất bại'),
		[wrapAction],
	);

	const markPaid = useCallback(
		(id: string, payload: InvoiceMgmt.IMarkPaidPayload = {}) =>
			wrapAction(
				() => api.markPaidInvoice(id, payload),
				'Đã ghi nhận thanh toán',
				'Ghi nhận thanh toán thất bại',
			),
		[wrapAction],
	);

	const cancel = useCallback(
		(id: string, reason: string) =>
			wrapAction(() => api.cancelInvoice(id, reason), 'Đã huỷ hoá đơn', 'Huỷ hoá đơn thất bại'),
		[wrapAction],
	);

	return {
		list,
		total,
		loading,
		submitting,
		detail,
		query,
		fetch,
		loadDetail,
		setDetail,
		create,
		update,
		finalize,
		markPaid,
		cancel,
	};
};
