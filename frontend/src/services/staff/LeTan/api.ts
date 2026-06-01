// Mock API for LeTan dashboard. Persists to localStorage.
import { MOCK_APPOINTMENTS, MOCK_WAITING } from './constant';

const APPT_KEY = 'staff_letan_appointments';
const WAIT_KEY = 'staff_letan_waiting';

export const getAppointments = (): LeTan.IAppointment[] => {
	try {
		const raw = localStorage.getItem(APPT_KEY);
		if (raw) return JSON.parse(raw);
	} catch {}
	return MOCK_APPOINTMENTS;
};

export const saveAppointments = (data: LeTan.IAppointment[]): void => {
	localStorage.setItem(APPT_KEY, JSON.stringify(data));
};

export const getWaitingList = (): LeTan.IWaitingCustomer[] => {
	try {
		const raw = localStorage.getItem(WAIT_KEY);
		if (raw) return JSON.parse(raw);
	} catch {}
	return MOCK_WAITING;
};

export const saveWaitingList = (data: LeTan.IWaitingCustomer[]): void => {
	localStorage.setItem(WAIT_KEY, JSON.stringify(data));
};
