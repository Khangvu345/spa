declare module LeTan {
	export interface IKpiCard {
		key: string;
		label: string;
		value: string;
		trend: string;
		trendUp: boolean;
		icon: string;
		color: string;
		bgColor: string;
	}

	export interface IAppointment {
		key: string;
		time: string;
		customer: string;
		phone: string;
		service: string;
		specialist: string;
		status: 'hoan_thanh' | 'da_xac_nhan' | 'dang_thuc_hien' | 'cho_xac_nhan';
		price: number;
		avatarColor: string;
	}

	export interface IWaitingCustomer {
		key: string;
		name: string;
		detail: string;
		type: 'booking' | 'walkin';
		time: string;
	}
}
