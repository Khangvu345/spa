// Inventory Dashboard — ADMIN. Khớp design Pencil frame A3orC9.
import { useEffect, useMemo, useState } from 'react';
import { Row, Col, Spin } from 'antd';
import { ArrowRight, AlertTriangle, ArrowUp, Package, TrendingUp, Wallet } from 'lucide-react';
import { history } from 'umi';
import PageHeader from '@/components/PageHeader';
import * as materialsApi from '@/services/Materials/api';
import { fmtQty } from '@/services/Materials/constant';
import * as ordersApi from '@/services/ServiceOrders/api';
import * as stockApi from '@/services/StockLedger/api';
import './style.less';

// Math.round chống sai số float (tồn kho lẻ × đơn giá có thể ra 2969999.9999…).
const fmtMoney = (v: number) => (v != null ? Math.round(v).toLocaleString('vi-VN') : 0);

export default function InventoryDashboardPage() {
	const [materials, setMaterials] = useState<MaterialMgmt.IMaterial[]>([]);
	const [orders, setOrders] = useState<SvcOrderMgmt.IServiceOrder[]>([]);
	const [lowStockItems, setLowStockItems] = useState<StockLedger.ILowStockItem[]>([]);
	const [outLedger, setOutLedger] = useState<StockLedger.ILedgerEntry[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				const last30 = new Date(today.getTime() - 30 * 86400000);

				const [mRes, oRes, lRes, ledgerRes] = await Promise.all([
					materialsApi.getMaterials({ page: 1, limit: 100 }),
					ordersApi.getServiceOrders({ page: 1, limit: 100, sortBy: 'createdAt', sortOrder: 'desc' }),
					stockApi.getLowStock(),
					stockApi.getLedger({
						transactionType: 'OUT_INVOICE',
						fromDate: last30.toISOString(),
						limit: 100,
						sortBy: 'createdAt',
						sortOrder: 'desc',
					}),
				]);
				setMaterials((mRes.data as any).data ?? []);
				setOrders(oRes.items ?? []);
				setLowStockItems(lRes.data ?? []);
				setOutLedger(ledgerRes.items ?? []);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const stats = useMemo(() => {
		const total = materials.length;
		const totalValue = materials.reduce((s, m) => s + m.stockQuantity * m.unitPrice, 0);

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// Tiêu thụ HÔM NAY — đếm số đơn vị vật liệu xuất theo invoice (BOM).
		let consumedTodayUnits = 0;
		const materialUsage = new Map<string, { name: string; count: number; unit: string }>();
		for (const e of outLedger) {
			const t = new Date(e.createdAt);
			if (t >= today) consumedTodayUnits += Math.abs(e.quantityChange);
			const cur = materialUsage.get(e.materialId) || {
				name: e.materialName,
				count: 0,
				unit: e.materialUnit,
			};
			cur.count += Math.abs(e.quantityChange);
			materialUsage.set(e.materialId, cur);
		}
		const topMaterials = Array.from(materialUsage.values())
			.sort((a, b) => b.count - a.count)
			.slice(0, 4);
		const maxMat = topMaterials[0]?.count || 1;

		return {
			total,
			lowStockCount: lowStockItems.length,
			lowStockItems: lowStockItems.slice(0, 4),
			totalValue,
			consumedToday: consumedTodayUnits,
			topMaterials,
			maxMat,
		};
	}, [materials, outLedger, lowStockItems]);

	const kpis = [
		{
			key: 'total',
			label: 'Tổng vật liệu',
			value: String(stats.total),
			icon: <Package size={22} color='#3B82F6' />,
			iconBg: '#EFF6FF',
			badgeText: '+' + Math.max(0, stats.total),
			badgeColor: '#10B981',
			badgeBg: '#ECFDF5',
			badgeIcon: <ArrowUp size={12} />,
		},
		{
			key: 'low',
			label: 'Sắp hết hàng',
			value: String(stats.lowStockCount),
			icon: <AlertTriangle size={22} color='#EF4444' />,
			iconBg: '#FEF2F2',
			badgeText: 'Cảnh báo',
			badgeColor: '#EF4444',
			badgeBg: '#FEF2F2',
		},
		{
			key: 'consumed',
			label: 'Đơn vị vật liệu tiêu thụ hôm nay',
			value: String(stats.consumedToday),
			icon: <TrendingUp size={22} color='#c47070' />,
			iconBg: '#FFF0F0',
			badgeText: '+' + stats.consumedToday,
			badgeColor: '#10B981',
			badgeBg: '#ECFDF5',
			badgeIcon: <ArrowUp size={12} />,
		},
		{
			key: 'value',
			label: 'Tổng giá trị kho',
			value: fmtMoney(stats.totalValue) + 'đ',
			icon: <Wallet size={22} color='#10B981' />,
			iconBg: '#ECFDF5',
			badgeText: 'Tồn',
			badgeColor: '#10B981',
			badgeBg: '#ECFDF5',
		},
	];

	const ALERT_PALETTE = [
		{ bg: '#FEF2F2', text: '#9A1B1B', btnBg: '#EF4444' },
		{ bg: '#FEF2F2', text: '#9A1B1B', btnBg: '#EF4444' },
		{ bg: '#FEF3C7', text: '#92400E', btnBg: '#D97706' },
		{ bg: '#FEF3C7', text: '#92400E', btnBg: '#D97706' },
	];

	return (
		<div className='inventory-dash'>
			<PageHeader
				title='Quản lý kho vật liệu'
				subtitle='Theo dõi tồn kho và tiêu thụ vật liệu'
			/>

			<Spin spinning={loading}>
				<div className='inventory-dash__body'>
					<Row gutter={[24, 24]}>
						{kpis.map((k) => (
							<Col xs={12} sm={12} lg={6} key={k.key}>
								<div className='inv-kpi'>
									<div className='inv-kpi__top'>
										<div className='inv-kpi__icon' style={{ background: k.iconBg }}>
											{k.icon}
										</div>
										<div
											className='inv-kpi__badge'
											style={{ color: k.badgeColor, background: k.badgeBg }}
										>
											{k.badgeIcon}
											<span>{k.badgeText}</span>
										</div>
									</div>
									<div className='inv-kpi__value'>{k.value}</div>
									<div className='inv-kpi__label'>{k.label}</div>
								</div>
							</Col>
						))}
					</Row>

					<Row gutter={[24, 24]} style={{ marginTop: 24 }}>
						<Col xs={24} lg={16}>
							<div className='inv-card'>
								<div className='inv-card__header'>
									<div className='inv-card__title'>
										<Package size={18} color='#c47070' />
										<span>Danh sách vật liệu</span>
									</div>
									<div className='inv-card__viewall' onClick={() => history.push('/vat-lieu')}>
										<span>Xem tất cả</span>
										<ArrowRight size={14} />
									</div>
								</div>

								<div className='inv-table'>
									<div className='inv-table__head'>
										<div className='col col-name'>Tên vật liệu</div>
										<div className='col col-unit'>Đơn vị</div>
										<div className='col col-stock'>Tồn kho</div>
										<div className='col col-min'>Tối thiểu</div>
										<div className='col col-status'>Trạng thái</div>
										<div className='col col-price'>Giá nhập</div>
									</div>
									{materials.slice(0, 6).map((m) => {
										const low = m.stockQuantity <= m.reorderLevel;
										return (
											<div className='inv-table__row' key={m.id}>
												<div className='col col-name'>{m.name}</div>
												<div className='col col-unit'>{m.unit}</div>
												<div
													className='col col-stock'
													style={{
														color: low ? '#EF4444' : '#111827',
														fontWeight: low ? 600 : 500,
													}}
												>
													{fmtQty(m.stockQuantity)}
												</div>
												<div className='col col-min'>{fmtQty(m.reorderLevel)}</div>
												<div className='col col-status'>
													<span
														className='status-pill'
														style={{
															color: low ? '#EF4444' : '#10B981',
															background: low ? '#FEF2F2' : '#ECFDF5',
														}}
													>
														{low ? 'Sắp hết' : 'Đủ hàng'}
													</span>
												</div>
												<div className='col col-price'>{fmtMoney(m.unitPrice)}đ</div>
											</div>
										);
									})}
									{materials.length === 0 && (
										<div style={{ padding: 24, textAlign: 'center', color: '#9CA3AF' }}>
											Chưa có vật liệu
										</div>
									)}
								</div>
							</div>
						</Col>

						<Col xs={24} lg={8}>
							<div className='inv-card' style={{ marginBottom: 24 }}>
								<div className='inv-card__header'>
									<div className='inv-card__title'>
										<AlertTriangle size={18} color='#EF4444' />
										<span>Cảnh báo tồn kho</span>
									</div>
								</div>
								<div className='inv-alerts'>
									{stats.lowStockItems.length === 0 ? (
										<div style={{ padding: 12, textAlign: 'center', color: '#9CA3AF' }}>
											Không có cảnh báo
										</div>
									) : (
										stats.lowStockItems.map((m, idx) => {
											const p = ALERT_PALETTE[idx] || ALERT_PALETTE[0];
											return (
												<div key={m.materialId} className='inv-alert' style={{ background: p.bg }}>
													<div>
														<div className='inv-alert__name' style={{ color: p.text }}>
															{m.materialName}
														</div>
														<div className='inv-alert__sub' style={{ color: p.text }}>
															Còn {fmtQty(m.stockQuantity)}/{fmtQty(m.reorderLevel)} {m.unit}
														</div>
													</div>
													<button
														className='inv-alert__btn'
														style={{ background: p.btnBg }}
														onClick={() => history.push('/vat-lieu')}
													>
														Nhập kho
													</button>
												</div>
											);
										})
									)}
								</div>
							</div>

							<div className='inv-card'>
								<div className='inv-card__header'>
									<div className='inv-card__title'>
										<TrendingUp size={18} color='#c47070' />
										<span>Vật liệu tiêu thụ nhiều nhất (30 ngày)</span>
									</div>
								</div>
								<div className='inv-bars'>
									{stats.topMaterials.length === 0 ? (
										<div style={{ padding: 12, textAlign: 'center', color: '#9CA3AF' }}>
											Chưa có dữ liệu
										</div>
									) : (
										stats.topMaterials.map((s) => {
											const pct = Math.round((s.count / stats.maxMat) * 100);
											return (
												<div key={s.name} className='inv-bar'>
													<div className='inv-bar__top'>
														<span>{s.name}</span>
														<span style={{ color: '#6B7280' }}>{s.count} {s.unit}</span>
													</div>
													<div className='inv-bar__track'>
														<div className='inv-bar__fill' style={{ width: `${pct}%` }} />
													</div>
												</div>
											);
										})
									)}
								</div>
							</div>
						</Col>
					</Row>
				</div>
			</Spin>
		</div>
	);
}
