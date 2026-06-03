declare module Dashboard {
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
    _id: string;
    customerName: string;
    serviceName: string;
    time: string;
    status: 'completed' | 'pending' | 'confirmed' | 'cancelled';
    avatarColor: string;
  }

  export interface IPopularService {
    _id: string;
    name: string;
    bookings: number;
    price: number;
    icon: string;
    color: string;
    bgColor: string;
  }

  export interface IRevenueData {
    day: string;
    revenue: number;
  }

  export interface IAppointmentStatus {
    label: string;
    value: number;
    color: string;
  }
}
