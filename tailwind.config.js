/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // '파란색'이 아니라 '주요 색상'이라는 역할을 부여합니다.
        primary: {
          DEFAULT: '#2563EB',
        },
        // 에러, 성공 등의 상태 색상도 미리 정의합니다.
        danger: '#EF4444',
        success: '#10B981',
      }
    },
  },
  plugins: [],
};
