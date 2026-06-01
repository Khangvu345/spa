import { Form, Input, Select, Rate, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useModel } from 'umi';

const { TextArea } = Input;

export function ReviewForm() {
  const [form] = Form.useForm();
  const { loading, serviceOptions, submitReview } = useModel('landingPage.review');

  const onFinish = async (values: any) => {
    const success = await submitReview(values);
    if (success) form.resetFields();
  };

  return (
    <section
      id="feedback"
      className="flex flex-col items-center gap-12 px-[120px] py-20"
      style={{ backgroundColor: 'var(--clay-canvas)', fontFamily: 'DM Sans, sans-serif' }}
    >
      <div className="flex flex-col items-center gap-3">
        <span
          className="text-[13px] font-bold tracking-[4px]"
          style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--clay-accent)' }}
        >
          GỬI ĐÁNH GIÁ
        </span>
        <h2
          className="text-[40px] font-black tracking-tight"
          style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--clay-foreground)' }}
        >
          Chia Sẻ Trải Nghiệm
        </h2>
        <p
          className="text-[15px]"
          style={{
            fontFamily: 'DM Sans, sans-serif',
            color: 'var(--clay-muted)',
            fontWeight: 500,
          }}
        >
          Phản hồi của bạn giúp chúng tôi cải thiện và giúp mọi người biết đến Luna Spa
        </p>
      </div>

      <div
        className="w-[680px] p-10"
        style={{
          borderRadius: 24,
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(16px)',
          boxShadow:
            '16px 16px 32px rgba(180, 150, 150, 0.22), -10px -10px 24px rgba(255, 255, 255, 0.95), inset 4px 4px 8px rgba(196, 112, 112, 0.03), inset -4px -4px 8px rgba(255, 255, 255, 1)',
          border: 'none',
        }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
          <div className="flex gap-4">
            <Form.Item
              name="fullName"
              label="Họ và tên *"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Nhập họ và tên" className="landing-input" />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Số điện thoại *"
              rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="+84 xxx xxx xxxx" className="landing-input" />
            </Form.Item>
          </div>

          <Form.Item
            name="email"
            label="Địa chỉ email *"
            rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input placeholder="email@example.com" className="landing-input" />
          </Form.Item>

          <Form.Item
            name="service"
            label="Dịch vụ đã sử dụng *"
            rules={[{ required: true, message: 'Vui lòng chọn dịch vụ' }]}
          >
            <Select placeholder="Chọn dịch vụ" className="landing-select">
              {serviceOptions.map((s) => (
                <Select.Option key={s} value={s}>{s}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="rating"
            label="Đánh giá của bạn *"
            rules={[{ required: true, message: 'Vui lòng đánh giá' }]}
          >
            <Rate style={{ color: 'var(--accent-deep)', fontSize: 28 }} />
          </Form.Item>

          <Form.Item
            name="feedback"
            label="Nhận xét của bạn *"
            rules={[{ required: true, message: 'Vui lòng nhập nhận xét' }]}
          >
            <TextArea rows={4} placeholder="Hãy chia sẻ trải nghiệm của bạn..." className="landing-input" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              icon={<SendOutlined />}
              className="landing-btn-primary"
            >
              Gửi đánh giá
            </Button>
          </Form.Item>
        </Form>
      </div>
    </section>
  );
}

export default ReviewForm;
