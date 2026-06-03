// useModel('landingServices') — fetch danh sách dịch vụ public cho landing page.
import { useCallback, useEffect, useState } from 'react';
import { getLandingServices } from '@/services/DichVu/api';

export default () => {
	const [list, setList] = useState<DichVu.IRecord[]>([]);
	const [loading, setLoading] = useState(false);

	const fetch = useCallback(async () => {
		setLoading(true);
		try {
			const items = await getLandingServices();
			setList(items);
		} catch {
			setList([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetch();
	}, [fetch]);

	return { list, loading, fetch };
};
