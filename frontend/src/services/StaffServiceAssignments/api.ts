// Gọi BE /staff-service-assignments — list/create/update + lookups by-service / by-staff.
import axios from '@/utils/axios';
import { authBaseUrl } from '@/services/Auth/api';

const BASE = `${authBaseUrl}/staff-service-assignments`;

type Envelope<T> = { success: boolean; data: T };

async function unwrap<T>(p: Promise<{ data: Envelope<T> | T }>): Promise<{ data: T }> {
	const res = await p;
	const body = res.data as any;
	const data: T = body && typeof body === 'object' && 'success' in body && 'data' in body ? body.data : body;
	return { ...res, data };
}

export function getAssignments(query: AssignMgmt.IQuery = {}) {
	const params: any = { ...query };
	if (typeof params.isActive === 'boolean') params.isActive = params.isActive ? 'true' : 'false';
	return unwrap<AssignMgmt.IAssignment[]>(axios.get(BASE, { params }));
}

export function getAssignmentsByService(serviceId: string) {
	return unwrap<AssignMgmt.IAssignment[]>(axios.get(`${BASE}/by-service/${serviceId}`));
}

export function getAssignmentsByStaff(staffId: string) {
	return unwrap<AssignMgmt.IAssignment[]>(axios.get(`${BASE}/by-staff/${staffId}`));
}

export function createAssignment(payload: AssignMgmt.ICreatePayload) {
	return unwrap<AssignMgmt.IAssignment>(axios.post(BASE, payload));
}

export function updateAssignment(id: string, payload: AssignMgmt.IUpdatePayload) {
	return unwrap<AssignMgmt.IAssignment>(axios.patch(`${BASE}/${id}`, payload));
}
