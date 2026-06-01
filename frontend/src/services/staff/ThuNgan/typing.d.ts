declare module ThuNgan {
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

	export interface ITicket {
		key: string;
		code: string;
		customer: string;
		service: string;
		total: number;
		status: 'cho_thanh_toan' | 'da_thanh_toan';
		avatarColor: string;
	}

	export interface IRecentPayment {
		key: string;
		name: string;
		detail: string;
		amount: number;
	}

	export interface IQuickAction {
		icon: string;
		text: string;
		color: string;
		bg: string;
	}
}
