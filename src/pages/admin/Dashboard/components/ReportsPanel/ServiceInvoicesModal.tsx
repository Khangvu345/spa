import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Table, message } from 'antd';
import moment from 'moment';
import * as reportsApi from '@/services/Reports/api';
import { formatPrice } from '@/services/admin/Dashboard/constant';

type Props = {
	open: boolean;
	serviceId: string;
	serviceName: string;
	fromDate: string;
	toDate: string;
	onClose: () => void;
};

// Drill-down RP-06: chi tiết hoá đơn của 1 dịch vụ trong kỳ (paginate).
const ServiceInvoicesModal: React.FC<Props> = ({ open, serviceId, serviceName, fromDate, toDate, onClose }) => {
	const [loading, setLoading] = useState(false);
	const [rows, setRows] = useState<ReportMgmt.IServiceInvoiceRow[]>([]);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [total, setTotal] = useState(0);

	const fetch = useCallback(
		async (p: number, l: number) => {
			setLoading(true);
			try {
				const res = await reportsApi.getServiceInvoices({ serviceId, fromDate, toDate, page: p, limit: l });
				setRows(res.items);
				setTotal(res.meta.total);
			} catch (e: any) {
				message.error(e?.response?.data?.message || 'Không tải được chi tiết hoá đơn');
			} finally {
				setLoading(false);
			}
		},
		[serviceId, fromDate, toDate],
	);

	useEffect(() => {
		if (open && serviceId) {
			setPage(1);
			fetch(1, limit);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, serviceId, fromDate, toDate]);

	const columns = [
		{ title: 'Mã HĐ', dataIndex: 'invoiceCode', key: 'invoiceCode', width: 140 },
		{ title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName' },
		{
			title: 'Thanh toán',
			dataIndex: 'paidAt',
			key: 'paidAt',
			width: 160,
			render: (v: string) => (v ? moment(v).format('DD/MM/YYYY HH:mm') : '—'),
		},
		{ title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', align: 'right' as const, width: 90 },
		{
			title: 'Thành tiền',
			dataIndex: 'subtotal',
			key: 'subtotal',
			align: 'right' as const,
			width: 140,
			render: (v: number) => formatPrice(v),
		},
	];

	return (
		<Modal
			visible={open}
			title={`Hoá đơn dịch vụ: ${serviceName}`}
			onCancel={onClose}
			footer={null}
			width={760}
			className='reports-invoices-modal'
			destroyOnClose
		>
			<Table
				rowKey={(r) => `${r.invoiceId}-${r.serviceName}`}
				loading={loading}
				dataSource={rows}
				columns={columns}
				size='small'
				scroll={{ x: 660 }}
				pagination={{
					current: page,
					pageSize: limit,
					total,
					showSizeChanger: true,
					onChange: (p, l) => {
						setPage(p);
						setLimit(l);
						fetch(p, l);
					},
				}}
			/>
		</Modal>
	);
};

export default ServiceInvoicesModal;
