import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#da7507',
                'background-light': '#faf9f8',
            },
            fontFamily: {
                display: ['Work Sans', 'sans-serif'],
            },
            screens: {
                'xxs': '375px',
            },
        },
    },
    plugins: [],
};

export default config;
