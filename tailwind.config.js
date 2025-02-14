/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,jsx,ts,tsx}',
        './components/**/*.{js,jsx,ts,tsx}',
    ],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                psyop: {
                    green: '#06402B',
                    gold: '#d4aF37',
                    grey: '#C0C0C0',
                },
            },
        },
    },
    plugins: [],
};
