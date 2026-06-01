// State + logic Admin Dashboard. Aggregator client-side dùng service-orders + customers.
import { useCallback, useState } from 'react';
import { message } from 'antd';
import * as api from '@/services/admin/Dashboard/api';

export default () => {
	const [data, setData] = useState<api.IDashboardData | null>(null);
	const [loading, setLoading] = useState(false);

	const fetch = useCallback(async () => {
		setLoading(true);
		try {
			const d = await api.getDashboard();
			setData(d);
		} catch (e: any) {
			message.error(e?.response?.data?.error?.message || 'Không tải được dashboard');
		} finally {
			setLoading(false);
		}
	}, []);

	return { data, loading, fetch };
};
