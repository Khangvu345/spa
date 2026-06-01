// Gọi BE /services (public — không cần token, dành cho landing page).
import axios from '@/utils/axios';
import { authBaseUrl } from '@/services/Auth/api';

const BASE = `${authBaseUrl}/services`;

/** Map BE service → DichVu.IRecord (giữ tương thích landing page hiện có). */
function toRecord(s: any): DichVu.IRecord {
	return {
		_id: s?.id,
		name: s?.name,
		durationMinutes: s?.durationMinutes,
		unitPrice: s?.unitPrice,
		description: s?.description ?? '',
		imageUrl: s?.imageUrl ?? '', // BE chưa hỗ trợ ảnh → để rỗng, UI render placeholder
		isActive: !!s?.isActive,
		category: s?.category,
		createdAt: s?.createdAt,
		updatedAt: s?.updatedAt,
	};
}

export async function getLandingServices(limit = 50) {
	// BE mặc định trả isActive=true (cho landing public) — đúng nhu cầu.
	const res = await axios.get(BASE, { params: { limit } });
	const body: any = res.data;
	const items: DichVu.IRecord[] = (body?.data ?? []).map(toRecord);
	return items;
}
