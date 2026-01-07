/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#da7707',
                'background-light': '#f8f7f5',
                'background-dark': '#231a0f',
            },
            fontFamily: {
                display: ['"Work Sans"', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
