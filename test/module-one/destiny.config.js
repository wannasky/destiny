
module.exports = {
    watch: true,
    src: './__src',
    dist:'./dist',
    files: ['**/*.ts', '**/*.scss', '**/*.html'],
    exclude: [],
    options: {
        scriptSourceMap: true,
        styleSourceMap: true,
        minify: true
    }
}
