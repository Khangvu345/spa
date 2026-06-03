// Mock API for ThuNgan dashboard. Persists to localStorage.
import { MOCK_TICKETS } from './constant';

const TICKETS_KEY = 'staff_thungan_tickets';

export const getTickets = (): ThuNgan.ITicket[] => {
	try {
		const raw = localStorage.getItem(TICKETS_KEY);
		if (raw) return JSON.parse(raw);
	} catch {}
	return MOCK_TICKETS;
};

export const saveTickets = (data: ThuNgan.ITicket[]): void => {
	localStorage.setItem(TICKETS_KEY, JSON.stringify(data));
};
