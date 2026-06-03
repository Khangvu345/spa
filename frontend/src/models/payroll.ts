// State + logic cho Bảng lương (Payroll).
import { useCallback, useState } from 'react';
import { message } from 'antd';
import * as api from '@/services/Payroll/api';
import { DEFAULT_PAGE_SIZE } from '@/services/Payroll/constant';

export default () => {
	const now = new Date();

	const [list, setList] = useState<PayrollMgmt.IPayroll[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [query, setQuery] = useState<PayrollMgmt.IQuery>({
		page: 1,
		limit: DEFAULT_PAGE_SIZE,
		periodYear: now.getFullYear(),
		periodMonth: now.getMonth() + 1,
		sortBy: 'finalizedAt',
		sortOrder: 'desc',
	});

	const fetch = useCallback(async (override?: Partial<PayrollMgmt.IQuery>) => {
		setLoading(true);
		try {
			const next = { ...query, ...(override ?? {}) };
			setQuery(next);
			const res = await api.getPayrolls(next);
			setList(res.items);
			setTotal(res.meta.total);
		} catch (e: any) {
			message.error(e?.response?.data?.message || 'Không tải được danh sách phiếu lương');
		} finally {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query]);

	const wrapAction = useCallback(
		async <T,>(fn: () => Promise<T>, successMsg: string, failMsg: string): Promise<T | null> => {
			setSubmitting(true);
			try {
				const r = await fn();
				if (successMsg) message.success(successMsg);
				return r;
			} catch (e: any) {
				const msg = e?.response?.data?.error?.message || e?.response?.data?.message;
				message.error(Array.isArray(msg) ? msg.join(', ') : msg || failMsg);
				return null;
			} finally {
				setSubmitting(false);
			}
		},
		[],
	);

	const preview = useCallback(
		(params: PayrollMgmt.IPreviewParams) =>
			wrapAction(async () => (await api.previewPayroll(params)).data, '', 'Không tính được lương xem trước'),
		[wrapAction],
	);

	const finalize = useCallback(
		(payload: PayrollMgmt.IFinalizePayload) =>
			wrapAction(
				async () => (await api.finalizePayroll(payload)).data,
				'Đã chốt phiếu lương',
				'Chốt lương thất bại',
			),
		[wrapAction],
	);

	const finalizeBatch = useCallback(
		(payload: PayrollMgmt.IFinalizeBatchPayload) =>
			wrapAction(
				async () => (await api.finalizeBatchPayroll(payload)).data,
				'',
				'Chốt lương hàng loạt thất bại',
			),
		[wrapAction],
	);

	const loadDetail = useCallback(
		(id: string) =>
			wrapAction(async () => (await api.getPayroll(id)).data, '', 'Không tải được chi tiết phiếu lương'),
		[wrapAction],
	);

	const markPaid = useCallback(
		(id: string) =>
			wrapAction(async () => (await api.markPaidPayroll(id)).data, 'Đã ghi nhận chi lương', 'Ghi nhận chi lương thất bại'),
		[wrapAction],
	);

	const cancel = useCallback(
		(id: string, reason: string) =>
			wrapAction(async () => (await api.cancelPayroll(id, reason)).data, 'Đã huỷ phiếu lương', 'Huỷ phiếu lương thất bại'),
		[wrapAction],
	);

	const exportPdf = useCallback(
		(id: string, payrollCode?: string) =>
			wrapAction(() => api.exportPayrollPdf(id, payrollCode), '', 'Xuất PDF thất bại'),
		[wrapAction],
	);

	return {
		list,
		total,
		loading,
		submitting,
		query,
		fetch,
		preview,
		finalize,
		finalizeBatch,
		loadDetail,
		markPaid,
		cancel,
		exportPdf,
	};
};
