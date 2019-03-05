
module.exports = {
    src: './__src',
    dist:'./dist',
    files: ['**/*.ts', '**/*.scss', '**/*.html'],
    exclude: [],
    filename: '[name].[ext]',
    options: {
        'scriptSourceMap': true,
        'styleSourceMap': true
    }
}
