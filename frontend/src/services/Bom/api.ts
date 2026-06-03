// Gọi BE /bom — 6 endpoint (create, list, by-service, by-material, get, update, delete).
import axios from '@/utils/axios';
import { authBaseUrl } from '@/services/Auth/api';

const BASE = `${authBaseUrl}/bom`;

type Envelope<T> = { success: boolean; data: T };

async function unwrap<T>(p: Promise<{ data: Envelope<T> | T }>): Promise<{ data: T }> {
	const res = await p;
	const body = res.data as any;
	const data: T = body && typeof body === 'object' && 'success' in body && 'data' in body ? body.data : body;
	return { ...res, data };
}

export function getBoms(query: BomMgmt.IQuery = {}) {
	const params: any = { ...query };
	if (typeof params.isActive === 'boolean') params.isActive = params.isActive ? 'true' : 'false';
	return unwrap<BomMgmt.IBom[]>(axios.get(BASE, { params }));
}

export function getBomsByService(serviceId: string) {
	return unwrap<BomMgmt.IBom[]>(axios.get(`${BASE}/by-service/${serviceId}`));
}

export function getBomsByMaterial(materialId: string) {
	return unwrap<BomMgmt.IBom[]>(axios.get(`${BASE}/by-material/${materialId}`));
}

export function getBom(id: string) {
	return unwrap<BomMgmt.IBom>(axios.get(`${BASE}/${id}`));
}

export function createBom(payload: BomMgmt.ICreatePayload) {
	return unwrap<BomMgmt.IBom>(axios.post(BASE, payload));
}

export function updateBom(id: string, payload: BomMgmt.IUpdatePayload) {
	return unwrap<BomMgmt.IBom>(axios.patch(`${BASE}/${id}`, payload));
}

export function deleteBom(id: string) {
	return unwrap<{ deleted: boolean } | null>(axios.delete(`${BASE}/${id}`));
}
