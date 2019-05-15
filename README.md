# destiny

编译typescrit,ES6,SCSS

## Via CLI

dest build test.ts -d /dist

### options

更多配置请`dest build --help`


## Via destiny.config.js

```javascript
module.exports = {
    watch: true,    // 是否监听文件变化
    memory: false,   // 文件输出进内存, 默认false
    src: './__src', // 源码目录
    dist:'./dist',  // 编译后的目录
    files: ['**/*.ts', '**/*.scss', '**/*.html'],   // 需要编译的文件
    exclude: [],        // 排查特例文件
    skip: [],           // 跳过编译环节直接复制的文件
    options: {
        scriptSourceMap: true,  // script 是否生成sourceMap
        styleSourceMap: true,   // style 是否生成sourceMap
        minify: true            // 是否压缩 script和style
        //minify: {
        //    script: false,    // 是否压缩 script
        //    style: true       // 是否压缩 style
        //}
    }
}
```
