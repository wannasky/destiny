
module.exports = {
    watch: true,
    memory: false,
    src: './__src',
    dist:'./dist',
    files: ['**/*.ts', '**/*.js' ,'**/*.json', '**/*.scss', '**/*.html', '**/*.jpg'],
    exclude: [],
    skip: ['test.js'],
    options: {
        scriptSourceMap: true,
        styleSourceMap: true,
        minify: true
    }
}
