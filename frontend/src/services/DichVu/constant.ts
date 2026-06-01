const serviceImages: Record<string, string> = {
  massage: require('@/assets/landingPage-img/services/massage.jpg'),
  facial: require('@/assets/landingPage-img/services/facial.jpg'),
  scrub: require('@/assets/landingPage-img/services/scrub.jpg'),
  aroma: require('@/assets/landingPage-img/services/aroma.jpg'),
  hotstone: require('@/assets/landingPage-img/services/hotstone.jpg'),
};

export const MOCK_SERVICES: DichVu.IRecord[] = [
  {
    _id: 'svc-001',
    name: 'Massage Trị Liệu',
    durationMinutes: 90,
    unitPrice: 500000,
    description:
      'Kỹ thuật massage sâu và kiểu Thụy Điển giúp giải tỏa căng thẳng, giảm đau cơ và thúc đẩy thư giãn toàn thân. Liệu trình kết hợp các phương pháp massage truyền thống với tinh dầu thiên nhiên, giúp cải thiện tuần hoàn máu, giảm đau nhức cơ bắp và mang lại cảm giác thư thái sâu. Phù hợp cho người thường xuyên căng thẳng, đau lưng, mỏi vai gáy.',
    imageUrl: serviceImages.massage,
    isActive: true,
    category: 'MASSAGE',
  },
  {
    _id: 'svc-002',
    name: 'Chăm Sóc Da Mặt',
    durationMinutes: 60,
    unitPrice: 400000,
    description:
      'Tái tạo làn da với liệu trình chăm sóc da mặt tùy chỉnh, sử dụng sản phẩm hữu cơ cao cấp cho làn da rạng rỡ, tươi trẻ. Bao gồm các bước làm sạch sâu, tẩy tế bào chết nhẹ nhàng, đắp mặt nạ dưỡng ẩm và massage mặt chuyên sâu giúp da săn chắc, mềm mịn.',
    imageUrl: serviceImages.facial,
    isActive: true,
    category: 'SKINCARE',
  },
  {
    _id: 'svc-003',
    name: 'Tẩy Tế Bào Chết',
    durationMinutes: 45,
    unitPrice: 350000,
    description:
      'Loại bỏ tế bào chết và làm mới làn da với liệu trình tẩy tế bào chết cao cấp, giúp da mềm mịn và được nuôi dưỡng sâu. Sử dụng hỗn hợp muối biển, đường nâu kết hợp tinh dầu thiên nhiên giúp da sáng đều màu, tăng cường khả năng hấp thụ dưỡng chất.',
    imageUrl: serviceImages.scrub,
    isActive: true,
    category: 'SKINCARE',
  },
  {
    _id: 'svc-004',
    name: 'Liệu Pháp Tinh Dầu',
    durationMinutes: 75,
    unitPrice: 380000,
    description:
      'Hài hòa tâm trí và cơ thể với các hỗn hợp tinh dầu được chọn lọc kỹ lưỡng giúp thư giãn, tăng năng lượng hoặc cân bằng cơ thể. Liệu trình sử dụng tinh dầu lavender, bạc hà, tràm trà được pha chế riêng theo nhu cầu cá nhân, kết hợp massage nhẹ nhàng.',
    imageUrl: serviceImages.aroma,
    isActive: true,
    category: 'AROMATHERAPY',
  },
  {
    _id: 'svc-005',
    name: 'Đá Nóng Trị Liệu',
    durationMinutes: 90,
    unitPrice: 550000,
    description:
      'Đá bazan ấm đặt tại các huyệt đạo giúp xua tan căng thẳng, cải thiện tuần hoàn máu và mang lại cảm giác thư giãn sâu. Nhiệt độ ấm nóng từ đá giúp giãn cơ, giảm đau nhức hiệu quả. Kết hợp với kỹ thuật massage truyền thống mang lại liệu trình trị liệu toàn diện.',
    imageUrl: serviceImages.hotstone,
    isActive: true,
    category: 'MASSAGE',
  },
];

export const formatPrice = (price: number): string => {
  return price.toLocaleString('vi-VN') + 'đ';
};
