import { useState } from 'react';

export interface Review {
  id: number;
  name: string;
  service: string;
  rating: number;
  date: string;
  body: string;
  email?: string;
  phone?: string;
  fullFeedback?: string;
}

const sampleReviews: Review[] = [
  {
    id: 1,
    name: 'Nguyễn Thị Lan',
    service: 'Massage Trị Liệu',
    rating: 5,
    date: '15/03/2026',
    body: 'Dịch vụ massage tuyệt vời! Nhân viên rất chuyên nghiệp và tận tâm. Không gian thư giãn, sạch sẽ. Tôi sẽ quay lại lần sau.',
    email: 'lan.nguyen@email.com',
    phone: '+84 912 xxx xxx',
    fullFeedback:
      'Dịch vụ massage tuyệt vời! Nhân viên rất chuyên nghiệp và tận tâm. Không gian thư giãn, sạch sẽ. Tôi đã thử nhiều spa khác nhau ở Hà Nội nhưng Luna Spa thực sự khác biệt. Kỹ thuật massage rất điêu luyện, áp lực vừa phải, đúng các điểm cần tác động.\n\nTinh dầu sử dụng thơm rất tự nhiên, không gây kích ứng da. Phòng trị liệu riêng tư, âm nhạc nhẹ nhàng tạo cảm giác thư thái tuyệt đối. Nhân viên lễ tân nhiệt tình, tư vấn rõ ràng về các gói dịch vụ.\n\nTôi chắc chắn sẽ quay lại và giới thiệu cho bạn bè, người thân. Rất đáng để trải nghiệm!',
  },
  {
    id: 2,
    name: 'Trần Văn Minh',
    service: 'Đá Nóng Trị Liệu',
    rating: 4,
    date: '12/03/2026',
    body: 'Trải nghiệm đá nóng rất tuyệt. Đá nóng giúp thư giãn cơ bắp hiệu quả. Không gian yên tĩnh và nhân viên chu đáo.',
    email: 'minh.tran@email.com',
    phone: '+84 903 xxx xxx',
  },
  {
    id: 3,
    name: 'Phạm Thị Hoa',
    service: 'Chăm Sóc Da Mặt',
    rating: 3,
    date: '08/03/2026',
    body: 'Chăm sóc da mặt ổn nhưng thời gian hơi ngắn so với mong đợi. Nhân viên thân thiện. Giá cả hợp lý.',
    email: 'hoa.pham@email.com',
    phone: '+84 988 xxx xxx',
  },
  {
    id: 4,
    name: 'Lê Hoàng Nam',
    service: 'Liệu Pháp Tinh Dầu',
    rating: 5,
    date: '05/03/2026',
    body: 'Liệu pháp tinh dầu ở đây rất đặc biệt! Tinh dầu thơm dịu, kỹ thuật massage chuyên nghiệp. Cảm giác như được tái sinh sau buổi trị liệu.',
    email: 'nam.le@email.com',
    phone: '+84 976 xxx xxx',
  },
];

export default () => {
  const [reviews, setReviews] = useState<Review[]>(sampleReviews);
  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredReviews = activeFilter
    ? reviews.filter((r) => r.rating === activeFilter)
    : reviews;

  const handleFilterChange = (stars: number | null) => {
    setActiveFilter(stars);
    setCurrentPage(1);
  };

  const openReviewDetail = (review: Review) => setSelectedReview(review);
  const closeReviewDetail = () => setSelectedReview(null);

  const getReviews = async () => {
    setLoading(true);
    try {
      setReviews(sampleReviews);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    averageRating: 4.8,
    totalReviews: 2847,
    satisfaction: 96,
  };

  return {
    reviews, filteredReviews, activeFilter, currentPage, selectedReview, loading, stats,
    setCurrentPage, handleFilterChange, openReviewDetail, closeReviewDetail, getReviews,
  };
};
