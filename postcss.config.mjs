/** @type {import('postcss-load-config').Config} */
const config = {
    plugins: {
        tailwindcss: {},
        autoprefixer: {}, // autoprefixer is usually needed with tailwind
    },
};

export default config;
