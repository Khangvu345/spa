// Phân quyền theo StaffRole của BE Luna Spa (ADMIN / OPERATOR / STAFF).
// Umi plugin-access đọc các flag dưới đây để hiển thị / ẩn route trong sidebar
// và bảo vệ truy cập từng trang.

export default function access(initialState: { currentUser?: Auth.IStaff }) {
	const role = initialState?.currentUser?.role;
	const isLoggedIn = !!initialState?.currentUser;

	const isAdmin = role === 'ADMIN';
	const isOperator = role === 'OPERATOR';
	const isStaff = role === 'STAFF';

	return {
		isLoggedIn,
		canAdmin: isAdmin,
		canOperator: isOperator,
		canStaff: isStaff,
		canAdminOrOperator: isAdmin || isOperator,
		canAdminOrStaff: isAdmin || isStaff,
		canAny: isLoggedIn,
	};
}
