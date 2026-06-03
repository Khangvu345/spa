import { useState } from 'react';
import { message } from 'antd';

export interface ReviewFormData {
  fullName: string;
  phone: string;
  email: string;
  service: string;
  rating: number;
  feedback: string;
}

export const serviceOptions = [
  'Massage Trị Liệu',
  'Chăm Sóc Da Mặt',
  'Tẩy Tế Bào Chết',
  'Liệu Pháp Tinh Dầu',
  'Đá Nóng Trị Liệu',
  'Chăm Sóc Móng',
];

export default () => {
  const [loading, setLoading] = useState(false);

  const submitReview = async (values: ReviewFormData) => {
    setLoading(true);
    try {
      console.log('Review submitted:', values);
      message.success('Cảm ơn bạn đã gửi đánh giá!');
      return true;
    } catch (error) {
      message.error('Gửi đánh giá thất bại, vui lòng thử lại');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, serviceOptions, submitReview };
};
