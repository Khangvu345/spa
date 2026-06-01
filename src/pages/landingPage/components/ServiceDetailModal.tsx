import React from 'react';
import { Modal } from 'antd';
import {
  ClockCircleOutlined,
  CalendarOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { formatPrice } from '@/services/DichVu/constant';
import './styles.less';

interface ServiceDetailModalProps {
  visible: boolean;
  service: DichVu.IRecord | null;
  onClose: () => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  visible,
  service,
  onClose,
}) => {
  if (!service) return null;

  return (
    <Modal
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={820}
      centered
      destroyOnClose
      bodyStyle={{ padding: 0 }}
      className="service-detail-modal"
    >
      <div style={{ display: 'flex', minHeight: 480 }}>
        {/* Left - Image (placeholder khi BE chưa có ảnh) */}
        <div
          style={{
            width: 340,
            flexShrink: 0,
            overflow: 'hidden',
            borderRadius: '8px 0 0 8px',
            background: service.imageUrl
              ? undefined
              : 'linear-gradient(135deg, var(--accent-light) 0%, var(--accent) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 480,
          }}
        >
          {service.imageUrl ? (
            <img
              src={service.imageUrl}
              alt={service.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                color: 'var(--accent-deep)',
                padding: 24,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 36,
                }}
              >
                <TagOutlined />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>
                Hình ảnh đang được cập nhật
              </span>
            </div>
          )}
        </div>

        {/* Right - Details */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, padding: 40 }}>
          {/* Category Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 999,
              alignSelf: 'flex-start',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.05em',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent-deep)',
            }}
          >
            <TagOutlined style={{ fontSize: 11 }} />
            {service.category || 'SPA'}
          </div>

          {/* Service Name */}
          <h2
            className="text-[28px] font-bold tracking-tight m-0"
            style={{ color: 'var(--text-primary)' }}
          >
            {service.name}
          </h2>

          {/* Meta Row */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
              <ClockCircleOutlined style={{ color: 'var(--accent-deep)' }} />
              <span className="text-[14px] font-medium">{service.durationMinutes} phút</span>
            </div>
            <span
              className="text-[14px] font-bold"
              style={{ color: 'var(--accent-deep)' }}
            >
              {formatPrice(service.unitPrice)}
            </span>
          </div>

          {/* Divider */}
          <div className="w-full h-px" style={{ backgroundColor: 'var(--border-light)' }} />

          {/* Description */}
          <div className="flex flex-col gap-2">
            <span
              className="text-[13px] font-medium"
              style={{ color: 'var(--text-muted)' }}
            >
              Mô tả dịch vụ
            </span>
            <p
              className="text-[14px] leading-relaxed m-0"
              style={{ color: 'var(--text-secondary)' }}
            >
              {service.description}
            </p>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: service.isActive ? '#22C55E' : '#9B9B9B' }}
            />
            <span
              className="text-[12px] font-medium"
              style={{ color: service.isActive ? '#22C55E' : '#9B9B9B' }}
            >
              {service.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
            </span>
          </div>

          {/* CTA Button */}
          <button
            className="flex items-center justify-center gap-2 w-full h-[52px] rounded-[14px] border-none cursor-pointer text-[15px] font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: 'var(--accent-deep)',
              color: '#FFFFFF',
            }}
            onClick={() => {
              onClose();
              const bookingEl = document.querySelector('#booking');
              if (bookingEl) bookingEl.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <CalendarOutlined />
            Đặt lịch ngay
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ServiceDetailModal;
