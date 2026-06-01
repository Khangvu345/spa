// State + logic cho BOM (Service-Material). Scope theo serviceId hiện tại.
import { useCallback, useState } from 'react';
import { message } from 'antd';
import * as api from '@/services/Bom/api';

export default () => {
	const [list, setList] = useState<BomMgmt.IBom[]>([]);
	const [loading, setLoading] = useState(false);
	const [serviceId, setServiceId] = useState<string | null>(null);

	const fetchByService = useCallback(async (svcId: string) => {
		setLoading(true);
		setServiceId(svcId);
		try {
			const res = await api.getBoms({ serviceId: svcId });
			setList(res.data ?? []);
		} catch (e: any) {
			message.error(e?.response?.data?.message || 'Không tải được định mức');
		} finally {
			setLoading(false);
		}
	}, []);

	const refresh = useCallback(async () => {
		if (serviceId) await fetchByService(serviceId);
	}, [serviceId, fetchByService]);

	const create = useCallback(async (payload: BomMgmt.ICreatePayload) => {
		try {
			await api.createBom(payload);
			message.success('Đã thêm vật liệu vào định mức');
			await refresh();
		} catch (e: any) {
			const code = e?.response?.data?.error?.code;
			if (code === 'BOM_ENTRY_EXISTS') {
				message.warning('Vật liệu này đã có trong định mức (có thể đang bị tạm ngưng). Hãy bật lại hoặc cập nhật dòng tương ứng.');
				await refresh();
				throw e;
			}
			message.error(e?.response?.data?.error?.message || e?.response?.data?.message || 'Không thêm được vật liệu');
			throw e;
		}
	}, [refresh]);

	const update = useCallback(async (id: string, payload: BomMgmt.IUpdatePayload) => {
		await api.updateBom(id, payload);
		message.success('Cập nhật định mức thành công');
		await refresh();
	}, [refresh]);

	const remove = useCallback(async (id: string) => {
		await api.deleteBom(id);
		message.success('Đã xoá khỏi định mức');
		await refresh();
	}, [refresh]);

	const reset = useCallback(() => {
		setList([]);
		setServiceId(null);
	}, []);

	return { list, loading, serviceId, fetchByService, create, update, remove, reset };
};
