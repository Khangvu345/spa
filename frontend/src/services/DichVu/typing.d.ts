declare module DichVu {
  export interface IRecord {
    _id: string;
    name: string;
    durationMinutes: number;
    unitPrice: number;
    description: string;
    imageUrl: string;
    isActive: boolean;
    category?: string;
    createdAt?: string;
    updatedAt?: string;
  }
}
