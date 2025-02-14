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
                    green: '#06402b',
                    gold: '#d4af37',
                    grey: '#c0c0c0',
                },
            },
        },
    },
    plugins: [],
};
