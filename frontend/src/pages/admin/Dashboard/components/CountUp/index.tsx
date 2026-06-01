import React, { useEffect, useRef, useState } from 'react';

interface CountUpProps {
	value: string;
	duration?: number;
}

const CountUp: React.FC<CountUpProps> = ({ value, duration = 1500 }) => {
	const numeric = parseInt(value.replace(/[^\d-]/g, ''), 10);
	const isNumber = !Number.isNaN(numeric);
	const [display, setDisplay] = useState<number | string>(isNumber ? 0 : value);
	const rafRef = useRef<number>();

	useEffect(() => {
		if (!isNumber) return;
		const start = performance.now();
		const tick = (now: number) => {
			const progress = Math.min((now - start) / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			setDisplay(Math.floor(numeric * eased));
			if (progress < 1) rafRef.current = requestAnimationFrame(tick);
			else setDisplay(numeric);
		};
		rafRef.current = requestAnimationFrame(tick);
		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [numeric, duration, isNumber]);

	if (!isNumber) return <>{value}</>;
	const hasCurrency = /đ$/i.test(value);
	const formatted = (display as number).toLocaleString('vi-VN');
	return <>{hasCurrency ? `${formatted}đ` : formatted}</>;
};

export default CountUp;
