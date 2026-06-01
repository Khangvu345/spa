// Gọi BE /suppliers CRUD.
import axios from '@/utils/axios';
import { authBaseUrl } from '@/services/Auth/api';

const BASE = `${authBaseUrl}/suppliers`;

type Envelope<T> = { success: boolean; data: T };

async function unwrap<T>(p: Promise<{ data: Envelope<T> | T }>): Promise<{ data: T }> {
	const res = await p;
	const body = res.data as any;
	const data: T = body && typeof body === 'object' && 'success' in body && 'data' in body ? body.data : body;
	return { ...res, data };
}

async function fetchPage(query: SupplierMgmt.IQuery) {
	const params: any = { ...query };
	if (typeof params.isActive === 'boolean') params.isActive = params.isActive ? 'true' : 'false';
	const res = await axios.get(BASE, { params });
	const body: any = res.data;
	return {
		items: (body?.data ?? []) as SupplierMgmt.ISupplier[],
		meta: (body?.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0 }) as SupplierMgmt.IPagedResponse['meta'],
	};
}

export async function getSuppliers(query: SupplierMgmt.IQuery = {}) {
	// Không lọc trạng thái → dual-call active + inactive rồi merge (giống Services).
	if (query.isActive === undefined) {
		const page = query.page ?? 1;
		const limit = query.limit ?? 10;
		const fetchAll = { ...query, page: 1, limit: 100 };
		const [activeRes, inactiveRes] = await Promise.all([
			fetchPage({ ...fetchAll, isActive: true }),
			fetchPage({ ...fetchAll, isActive: false }),
		]);
		const seen = new Set<string>();
		const merged: SupplierMgmt.ISupplier[] = [];
		for (const item of [...activeRes.items, ...inactiveRes.items]) {
			if (!seen.has(item.id)) {
				seen.add(item.id);
				merged.push(item);
			}
		}
		const sortBy = query.sortBy ?? 'createdAt';
		const sortOrder = query.sortOrder ?? 'desc';
		merged.sort((a: any, b: any) => {
			const av = (a as any)[sortBy];
			const bv = (b as any)[sortBy];
			if (av === bv) return 0;
			const cmp = av > bv ? 1 : -1;
			return sortOrder === 'asc' ? cmp : -cmp;
		});
		const total = merged.length;
		const start = (page - 1) * limit;
		const slice = merged.slice(start, start + limit);
		return {
			data: {
				data: slice,
				meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
			},
		};
	}

	const single = await fetchPage(query);
	return { data: { data: single.items, meta: single.meta } };
}

export function getSupplier(id: string) {
	return unwrap<SupplierMgmt.ISupplier>(axios.get(`${BASE}/${id}`));
}

export function createSupplier(payload: SupplierMgmt.ICreatePayload) {
	return unwrap<SupplierMgmt.ISupplier>(axios.post(BASE, payload));
}

export function updateSupplier(id: string, payload: SupplierMgmt.IUpdatePayload) {
	return unwrap<SupplierMgmt.ISupplier>(axios.patch(`${BASE}/${id}`, payload));
}
