export default {
    // config options
    base: '/retro/',
    build: {
        chunkSizeWarningLimit: 550,
        rollupOptions: {
            output: {
                entryFileNames: `[name].js`,
                chunkFileNames: `[name].js`,
                assetFileNames: `[name].[ext]`
            }
        }
    }
}
