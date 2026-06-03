import React, { useState } from 'react';
import { Spin } from 'antd';
import {
  SkinOutlined,
  StarOutlined,
  ExperimentOutlined,
  CustomerServiceOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { useModel } from 'umi';
import { formatPrice } from '@/services/DichVu/constant';
import { ServiceDetailModal } from './ServiceDetailModal';

// Map icon theo category BE — dùng khi chưa có ảnh.
const categoryIconMap: Record<string, React.ReactNode> = {
  SWEDISH: <CustomerServiceOutlined />,
  HOT_STONE: <FireOutlined />,
  THAI: <SkinOutlined />,
  FOOT: <ExperimentOutlined />,
  NECK_SHOULDER: <StarOutlined />,
  AROMA: <ExperimentOutlined />,
};
const fallbackIcons: React.ReactNode[] = [
  <SkinOutlined />,
  <StarOutlined />,
  <ExperimentOutlined />,
  <CustomerServiceOutlined />,
  <FireOutlined />,
];
const getIcon = (service: DichVu.IRecord, idx: number): React.ReactNode =>
  (service.category && categoryIconMap[service.category]) ||
  fallbackIcons[idx % fallbackIcons.length];

const ORB_GRADIENTS = [
  'linear-gradient(135deg, #d98b8b 0%, #c47070 100%)',
  'linear-gradient(135deg, #E2C2C2 0%, #d98b8b 100%)',
  'linear-gradient(135deg, #e9b8b8 0%, #b85f5f 100%)',
  'linear-gradient(135deg, #f4c2c2 0%, #c47070 100%)',
  'linear-gradient(135deg, #d98b8b 0%, #a04848 100%)',
];

export const ServicesSection: React.FC = () => {
  const { list, loading } = useModel('landingServices') as {
    list: DichVu.IRecord[];
    loading: boolean;
  };
  const [selectedService, setSelectedService] = useState<DichVu.IRecord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenDetail = (service: DichVu.IRecord) => {
    setSelectedService(service);
    setModalVisible(true);
  };

  return (
    <section
      id="services"
      className="flex flex-col items-center gap-10"
      style={{ padding: '80px', backgroundColor: 'var(--clay-canvas)', fontFamily: 'DM Sans, sans-serif' }}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <span
          className="text-[13px] tracking-widest font-bold"
          style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--clay-accent)' }}
        >
          — Dịch vụ của chúng tôi
        </span>
        <h2
          className="text-[40px] font-black tracking-tight"
          style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--clay-foreground)' }}
        >
          Dịch Vụ
        </h2>
        <p
          className="text-[16px] max-w-[600px] leading-relaxed"
          style={{
            fontFamily: 'DM Sans, sans-serif',
            color: 'var(--clay-muted)',
            fontWeight: 500,
          }}
        >
          Trải nghiệm các liệu trình được thiết kế tỉ mỉ, giúp khôi phục sự cân bằng
          tự nhiên và mang lại cảm giác tươi mới cho bạn.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-[1100px]">
        {loading ? (
          <Spin />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-6 w-full">
              {list.slice(0, 3).map((service, idx) => (
                <ServiceCard
                  key={service._id}
                  icon={getIcon(service, idx)}
                  gradient={ORB_GRADIENTS[idx % ORB_GRADIENTS.length]}
                  service={service}
                  onViewDetail={() => handleOpenDetail(service)}
                />
              ))}
            </div>
            {list.length > 3 && (
              <div className="grid grid-cols-2 gap-6 w-full max-w-[730px]">
                {list.slice(3).map((service, idx) => (
                  <ServiceCard
                    key={service._id}
                    icon={getIcon(service, idx + 3)}
                    gradient={ORB_GRADIENTS[(idx + 3) % ORB_GRADIENTS.length]}
                    service={service}
                    onViewDetail={() => handleOpenDetail(service)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <ServiceDetailModal
        visible={modalVisible}
        service={selectedService}
        onClose={() => setModalVisible(false)}
      />
    </section>
  );
};

const ServiceCard: React.FC<{
  icon: React.ReactNode;
  gradient: string;
  service: DichVu.IRecord;
  onViewDetail: () => void;
}> = ({ icon, gradient, service, onViewDetail }) => {
  return (
    <div
      className="landing-card cursor-pointer transition-all"
      style={{
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        borderRadius: 24,
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(16px)',
        boxShadow:
          '14px 14px 28px rgba(180, 150, 150, 0.2), -8px -8px 20px rgba(255, 255, 255, 0.95), inset 4px 4px 8px rgba(196, 112, 112, 0.03), inset -4px -4px 8px rgba(255, 255, 255, 1)',
        border: 'none',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-6px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
      onClick={onViewDetail}
    >
      <div
        className="w-[56px] h-[56px] rounded-2xl flex items-center justify-center"
        style={{
          background: gradient,
          color: '#ffffff',
          fontSize: 24,
          boxShadow:
            '8px 8px 16px rgba(196, 112, 112, 0.28), -4px -4px 10px rgba(255, 255, 255, 0.7), inset 2px 2px 4px rgba(255, 255, 255, 0.3)',
        }}
      >
        {icon}
      </div>

      <h3
        className="text-[22px] font-extrabold"
        style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--clay-foreground)', margin: 0 }}
      >
        {service.name}
      </h3>
      <p
        className="text-[14px] leading-relaxed"
        style={{
          fontFamily: 'DM Sans, sans-serif',
          color: 'var(--clay-muted)',
          fontWeight: 500,
          margin: 0,
        }}
      >
        {service.description.length > 100
          ? service.description.substring(0, 100) + '...'
          : service.description}
      </p>
      <span
        className="text-[14px] font-extrabold"
        style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--clay-accent)' }}
      >
        Từ {formatPrice(service.unitPrice)}
      </span>
      <a
        className="text-[13px] font-bold cursor-pointer transition-colors"
        style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--clay-accent)' }}
        onClick={(e) => {
          e.preventDefault();
          onViewDetail();
        }}
      >
        Tìm hiểu thêm →
      </a>
    </div>
  );
};

export default ServicesSection;
