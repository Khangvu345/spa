// State + logic phân công NV-DV theo service. Scope theo serviceId hiện tại.
import { useCallback, useState } from 'react';
import { message } from 'antd';
import * as api from '@/services/StaffServiceAssignments/api';

export default () => {
	const [list, setList] = useState<AssignMgmt.IAssignment[]>([]);
	const [loading, setLoading] = useState(false);
	const [serviceId, setServiceId] = useState<string | null>(null);

	const handleError = (e: any, fallback: string) =>
		message.error(e?.response?.data?.error?.message || e?.response?.data?.message || fallback);

	const fetchByService = useCallback(async (svcId: string) => {
		setLoading(true);
		setServiceId(svcId);
		try {
			// Dùng /staff-service-assignments?serviceId=... để bao gồm cả isActive=false (BE by-service hardcoded active).
			const res = await api.getAssignments({ serviceId: svcId });
			setList(res.data ?? []);
		} catch (e: any) {
			handleError(e, 'Không tải được phân công');
		} finally {
			setLoading(false);
		}
	}, []);

	const refresh = useCallback(async () => {
		if (serviceId) await fetchByService(serviceId);
	}, [serviceId, fetchByService]);

	const create = useCallback(async (payload: AssignMgmt.ICreatePayload) => {
		try {
			await api.createAssignment(payload);
			message.success('Đã phân công chuyên viên');
			await refresh();
		} catch (e: any) {
			handleError(e, 'Không phân công được');
			throw e;
		}
	}, [refresh]);

	const update = useCallback(async (id: string, payload: AssignMgmt.IUpdatePayload) => {
		try {
			await api.updateAssignment(id, payload);
			message.success('Đã cập nhật phân công');
			await refresh();
		} catch (e: any) {
			handleError(e, 'Không cập nhật được phân công');
			throw e;
		}
	}, [refresh]);

	const reset = useCallback(() => {
		setList([]);
		setServiceId(null);
	}, []);

	return { list, loading, serviceId, fetchByService, create, update, reset };
};
