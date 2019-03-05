
module.exports = {
    src: './__src',
    dist:'./dist',
    files: ['**/*.ts', '**/*.scss'],
    exclude: [],
    filename: '[name].[ext]',
    options: {
        'scriptSourceMap': true,
        'styleSourceMap': false
    }
}
