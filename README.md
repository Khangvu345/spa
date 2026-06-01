# SPA Web Frontend

Dự án frontend xây dựng trên React 17 + UmiJS + Ant Design v4 (TypeScript).

## Yêu cầu môi trường

- [Node.js](https://nodejs.org/) >= 14
- npm (đi kèm Node.js)
- [Yarn](https://classic.yarnpkg.com/) (sẽ cài ở bước dưới)

## Hướng dẫn chạy dự án sau khi clone

### 1. Clone source code

```bash
git clone <repository-url>
cd SPA_WEB_FRONTEND
```

### 2. Cài đặt Yarn (chỉ cần làm 1 lần trên máy)

```bash
npm install --global yarn
```

Kiểm tra cài đặt thành công:

```bash
yarn --version
```

### 3. Cài đặt các dependencies của dự án

```bash
yarn install
```

### 4. Cấu hình biến môi trường

Copy file mẫu thành `.env`:

```bash
# PowerShell
Copy-Item .env.example .env

# bash / git bash
cp .env.example .env
```

Mở `.env` và chỉnh ít nhất biến sau cho khớp backend Luna Spa:

| Biến | Mô tả | Mặc định |
| --- | --- | --- |
| `APP_CONFIG_API_URL` | URL gốc của BE NestJS, **đã bao gồm global prefix `/api/v1`** | `http://localhost:3000/api/v1` |

> **Quan trọng:** chỉ các biến có tiền tố `APP_CONFIG_` mới được webpack inject vào FE (xem `config/config.ts → define`). Mỗi lần đổi `.env` phải **restart** `yarn start`.

#### Kết nối backend

Backend Luna Spa (NestJS + MongoDB) nằm ở `BE_WEB_SPA/backend`. Trước khi login:

1. Trong `BE_WEB_SPA/backend/.env` đặt `CORS_ORIGIN=http://localhost:8000` (đúng port FE dev).
2. Chạy `npm run seed:admin` trong BE để tạo tài khoản ADMIN đầu tiên (lấy email/password từ `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` trong BE `.env`).
3. Khởi động BE: `npm run start:dev` (mặc định `http://localhost:3000`).

### 5. Chạy dự án ở môi trường dev

```bash
yarn start
```

Sau khi chạy xong, mở trình duyệt truy cập địa chỉ hiển thị trong terminal (mặc định là [http://localhost:8000](http://localhost:8000)).

Đăng nhập bằng tài khoản ADMIN đã seed ở bước trên. Sidebar sẽ hiển thị các mục tương ứng với role (`ADMIN` / `OPERATOR` / `STAFF`) — xem `src/access.ts` và `config/routes.ts`.

## Các lệnh hữu ích khác

| Lệnh | Mô tả |
| --- | --- |
| `yarn start` | Chạy dev server |
| `yarn build` | Build bản production vào thư mục `dist/` |
| `yarn lint` | Kiểm tra code style |
| `yarn lint:fix` | Tự động sửa lỗi lint |

## Xử lý sự cố thường gặp

- **Lệnh `yarn` không nhận diện được sau khi cài**: đóng và mở lại terminal (hoặc PowerShell) để cập nhật biến môi trường `PATH`.
- **Lỗi khi `yarn install`**: xoá thư mục `node_modules` và file `yarn.lock`, sau đó chạy lại `yarn install`.
- **Cổng 8000 đã được sử dụng**: chạy với cổng khác, ví dụ trên PowerShell: `$env:PORT=3000; yarn start`.
- **Lỗi CORS khi login**: kiểm tra `CORS_ORIGIN` trong `BE_WEB_SPA/backend/.env` đã set đúng `http://localhost:8000` (hoặc port FE đang chạy) và đã restart BE.
- **Login trả 401 dù mật khẩu đúng**: tài khoản chưa được seed — chạy `npm run seed:admin` trong thư mục backend.
- **FE gọi nhầm URL backend**: kiểm tra `APP_CONFIG_API_URL` trong `.env` của FE, restart `yarn start` sau khi đổi.
