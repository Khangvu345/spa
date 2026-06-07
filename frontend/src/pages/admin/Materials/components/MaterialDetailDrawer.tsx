// Drawer chi tiết vật liệu — thông tin + tab Lịch sử kho.
import { useEffect, useState } from 'react';
import { Modal, Tabs, Tag, Empty, Table, Spin, Descriptions } from 'antd';
import moment from 'moment';
import { History, Info, Sparkles } from 'lucide-react';
import './MaterialDetailDrawer.less';
import * as ledgerApi from '@/services/StockLedger/api';
import * as bomApi from '@/services/Bom/api';
import {
	TRANSACTION_TYPE_OPTIONS,
	REFERENCE_TYPE_LABEL,
} from '@/services/StockLedger/constant';
import { MATERIAL_TYPE_OPTIONS, fmtQty } from '@/services/Materials/constant';

type Props = {
	open: boolean;
	material: MaterialMgmt.IMaterial | null;
	onClose: () => void;
};

const fmtVnd = (v?: number | null) => (v != null ? `${v.toLocaleString('vi-VN')}đ` : '—');

export default function MaterialDetailDrawer({ open, material, onClose }: Props) {
	const [history, setHistory] = useState<StockLedger.ILedgerEntry[]>([]);
	const [loadingHistory, setLoadingHistory] = useState(false);
	const [boms, setBoms] = useState<BomMgmt.IBom[]>([]);
	const [loadingBom, setLoadingBom] = useState(false);
	const [activeTab, setActiveTab] = useState('info');

	useEffect(() => {
		if (!open || !material) return;
		setActiveTab('info');
	}, [open, material]);

	useEffect(() => {
		if (!open || !material || activeTab !== 'history') return;
		setLoadingHistory(true);
		ledgerApi
			.getLedgerByMaterial(material.id, { limit: 100, sortBy: 'createdAt', sortOrder: 'desc' })
			.then((r) => setHistory(r.items))
			.catch(() => setHistory([]))
			.finally(() => setLoadingHistory(false));
	}, [open, material, activeTab]);

	useEffect(() => {
		if (!open || !material || activeTab !== 'services') return;
		setLoadingBom(true);
		bomApi
			.getBomsByMaterial(material.id)
			.then((r) => setBoms(r.data ?? []))
			.catch(() => setBoms([]))
			.finally(() => setLoadingBom(false));
	}, [open, material, activeTab]);

	if (!material) return null;

	const typeOpt = MATERIAL_TYPE_OPTIONS.find((t) => t.value === material.type);
	const low = material.stockQuantity <= material.reorderLevel;

	return (
		<Modal
			title={
				<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
					<span style={{ fontWeight: 600 }}>{material.name}</span>
					<code style={{ fontSize: 12, color: '#6B7280' }}>{material.code}</code>
				</div>
			}
			width={720}
			centered
			footer={null}
			onCancel={onClose}
			visible={open}
			bodyStyle={{ padding: 0 }}
			className='material-detail-modal'
		>
			<Tabs activeKey={activeTab} onChange={setActiveTab} style={{ padding: '0 24px' }}>
				<Tabs.TabPane
					key='info'
					tab={
						<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
							<Info size={14} /> Thông tin
						</span>
					}
				>
					<Descriptions column={{ xs: 1, sm: 2 }} bordered size='small' labelStyle={{ width: 140 }}>
						<Descriptions.Item label='Mã'>
							<code>{material.code}</code>
						</Descriptions.Item>
						<Descriptions.Item label='Tên'>{material.name}</Descriptions.Item>
						<Descriptions.Item label='Loại'>
							<Tag color={typeOpt?.color}>{typeOpt?.label ?? material.type}</Tag>
						</Descriptions.Item>
						<Descriptions.Item label='Đơn vị'>{material.unit}</Descriptions.Item>
						<Descriptions.Item label='Tồn kho'>
							<strong style={{ color: low ? '#DC2626' : '#059669' }}>
								{fmtQty(material.stockQuantity)} {material.unit}
							</strong>
						</Descriptions.Item>
						<Descriptions.Item label='Tối thiểu'>
							{fmtQty(material.reorderLevel)} {material.unit}
						</Descriptions.Item>
						<Descriptions.Item label='Giá nhập'>{fmtVnd(material.unitPrice)}</Descriptions.Item>
						<Descriptions.Item label='Dự kiến sử dụng'>
							{material.expectedUsesPerUnit || '—'} lần / {material.unit}
						</Descriptions.Item>
						<Descriptions.Item label='Nhà cung cấp' span={2}>
							{material.supplier?.name || '—'}
						</Descriptions.Item>
						<Descriptions.Item label='Trạng thái' span={2}>
							<Tag color={material.isActive ? '#059669' : '#DC2626'}>
								{material.isActive ? 'Đang sử dụng' : 'Ngưng'}
							</Tag>
						</Descriptions.Item>
						{material.description && (
							<Descriptions.Item label='Mô tả' span={2}>
								<div style={{ whiteSpace: 'pre-wrap' }}>{material.description}</div>
							</Descriptions.Item>
						)}
					</Descriptions>
				</Tabs.TabPane>

				<Tabs.TabPane
					key='history'
					tab={
						<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
							<History size={14} /> Lịch sử kho
						</span>
					}
				>
					<Spin spinning={loadingHistory}>
						{history.length === 0 ? (
							<Empty
								description='Chưa có giao dịch nào'
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								style={{ padding: 32 }}
							/>
						) : (
							<Table
								rowKey='id'
								size='small'
								dataSource={history}
								pagination={{ pageSize: 20 }}
								columns={[
									{
										title: 'Thời gian',
										dataIndex: 'createdAt',
										width: 130,
										render: (v: string) => moment(v).format('DD/MM HH:mm'),
									},
									{
										title: 'Loại',
										dataIndex: 'transactionType',
										width: 120,
										render: (v: StockLedger.TTransactionType) => {
											const opt = TRANSACTION_TYPE_OPTIONS.find((t) => t.value === v);
											return <Tag color={opt?.color}>{opt?.label ?? v}</Tag>;
										},
									},
									{
										title: 'SL',
										dataIndex: 'quantityChange',
										width: 80,
										align: 'center' as const,
										render: (v: number) => (
											<span style={{ color: v >= 0 ? '#059669' : '#DC2626', fontWeight: 600 }}>
												{v >= 0 ? '+' : ''}
												{fmtQty(v)}
											</span>
										),
									},
									{
										title: 'Sau GD',
										dataIndex: 'stockAfter',
										width: 80,
										align: 'center' as const,
										render: (v: number) => <strong>{fmtQty(v)}</strong>,
									},
									{
										title: 'Người',
										dataIndex: 'performedByName',
										width: 130,
										ellipsis: true,
									},
									{
										title: 'Lý do',
										dataIndex: 'reason',
										ellipsis: true,
										render: (v: string, r: StockLedger.ILedgerEntry) => (
											<span>
												{v || '—'}
												{r.referenceType && (
													<Tag style={{ marginLeft: 4 }} color='#E5E7EB'>
														{REFERENCE_TYPE_LABEL[r.referenceType]}
													</Tag>
												)}
											</span>
										),
									},
								]}
							/>
						)}
					</Spin>
				</Tabs.TabPane>

				<Tabs.TabPane
					key='services'
					tab={
						<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
							<Sparkles size={14} /> Dịch vụ dùng
						</span>
					}
				>
					<Spin spinning={loadingBom}>
						{boms.length === 0 ? (
							<Empty
								description='Vật liệu này chưa nằm trong BOM dịch vụ nào'
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								style={{ padding: 32 }}
							/>
						) : (
							<Table
								rowKey='id'
								size='small'
								dataSource={boms}
								pagination={false}
								columns={[
									{
										title: 'Dịch vụ',
										dataIndex: ['service', 'name'],
										render: (_: any, r: BomMgmt.IBom) => r.service?.name || '—',
									},
									{
										title: 'Định mức',
										dataIndex: 'quantity',
										width: 110,
										align: 'center' as const,
										render: (v: number) => (
											<span>
												<strong>{v}</strong> {material.unit} / lần
											</span>
										),
									},
									{
										title: 'Trạng thái',
										dataIndex: 'isActive',
										width: 110,
										align: 'center' as const,
										render: (v: boolean) => (
											<Tag color={v ? '#059669' : '#9CA3AF'}>{v ? 'Active' : 'Ngưng'}</Tag>
										),
									},
								]}
							/>
						)}
					</Spin>
				</Tabs.TabPane>
			</Tabs>
		</Modal>
	);
}
