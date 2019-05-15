const path = require('path');
const fileUtil = require('../util/fileUtil');
const scriptParser = require('./parser/babelParser');
const styleParser = require('./parser/styleParser');
const gaze = require('gaze');
const logger = require('../util/logger').createLogger();

let watchFiles = [];
let depsIndex = {};

const build = async (config) => {
    let index = config.files.length;
    config.files.forEach(item => {
        addDepsIndex(item, item);
    });
    config.files.forEach(item => {
        compile(item, config, () => {
            index--;
            if(index === 0 && config.watch) {
                watchFiles = watchFiles.concat(config.files);
                addWatch(watchFiles, config);
            }
        });
    });
}

const compile = async (file, config, callback) => {
    let result,sourceMapKey, options = {};
    let filename = fileUtil.pathFormat(path.relative(process.cwd(), file), '/');
    const extname = path.extname(filename);
    const sourceFileRelative = path.relative(config.base, file);
    const fileParse = path.parse(sourceFileRelative);
    let distFilePath = path.join(path.resolve(config.cwd, config.dist), sourceFileRelative);
    let code, hasSourceMappingURL = false;
    if(config.skip.includes(file)) {
        distFilePath = path.join(path.resolve(config.cwd, config.dist), sourceFileRelative);
        outputFile(fileUtil.readFileSync(filename), distFilePath, config.memory);
    }else if(['.ts', '.js', '.jsx'].includes(extname)){
        if(config.options.scriptSourceMap){
            options.sourceMaps = true;
            options.sourceFileName = fileUtil.pathFormat(path.relative(path.parse(distFilePath).dir, file), '/');
        }
        const minify = typeof config.options.minify === "boolean" ? config.options.minify : ((config.options.minify && config.options.minify.script) ? config.options.minify.script : false);
        try {
            result = await scriptParser(filename, options, minify);
        }catch (e) {

        }
        sourceMapKey = 'scriptSourceMap';
    }else if(['.scss'].includes(extname)) {
        if(config.options.styleSourceMap){
            options.outFile = getOutputFileName(distFilePath);
            options.sourceMap = getOutputFileName(distFilePath, true);
        }
        const minify = typeof config.options.minify === "boolean" ? config.options.minify : ((config.options.minify && config.options.minify.style) ? config.options.minify.style : false);
        options.outputStyle = minify ? 'compressed' : 'expanded';
        try {
            result = await styleParser(filename, options);
            result.deps.forEach(item => {
                watchFiles.push(item);
                addDepsIndex(item, file);
            });
        }catch (e) {

        }
        hasSourceMappingURL = true;
        sourceMapKey = 'styleSourceMap';
    }else {
        // 不支持此文件类型的解析 直接copy
        distFilePath = path.join(path.resolve(config.cwd, config.dist), sourceFileRelative);
        outputFile(fileUtil.readFileSync(filename), distFilePath, config.memory);
    }
    if(result && result.code){
        distFilePath = getOutputFileName(distFilePath);
        code = result.code;
        if(config.options[sourceMapKey] && result.map) {
            let sourceFileName = path.join(fileParse.name + getCompileFileExtname(file, true));
            let sourceMapFilePath = getOutputFileName(distFilePath, true);
            code = hasSourceMappingURL ? code : codeAppendSourceMappingURL(result.code, sourceFileName);
            outputFile(result.map, sourceMapFilePath, config.memory);
        }
        outputFile(code, distFilePath, config.memory);
    }
    logger.log('编译完成', filename);
    if(callback) callback();
}

const addWatch = (files, config) => {
    logger.warn('正在监听文件变化');
    gaze(files, function () {
        this.on('changed', (file) => {
            logger.log('检测到文件变化', file);
            file = fileUtil.pathFormat(file, '/');
            if(depsIndex[file].length){
                depsIndex[file].forEach(item => {
                    compile(item, config);
                });
            }
        });
    });
}

const addDepsIndex = (key ,value) => {
    depsIndex[key] = depsIndex[key] || [];
    depsIndex[key].push(value);
    depsIndex[key] = Array.from(new Set(depsIndex[key]));
}

const outputFile = (code, filename, memory) => {
    const method = memory ? 'writeMemoryFile' : 'writeFile';
    fileUtil[method](filename, code, error => {
        if(error){
            logger.error(filename, '写文件出错', error);
        }
    });
}

const codeAppendSourceMappingURL = (code, sourceMappingURL) => {
    return code + '\n' + `//# sourceMappingURL=${sourceMappingURL}`
}

const getCompileFileExtname = (filename, isSourceMap) => {
    let extname = path.extname(filename);
    if(['.ts', '.jsx'].includes(extname)){
        extname = '.js';
    }else if(['.scss'].includes(extname)) {
        extname = '.css';
    }
    return isSourceMap ? extname + '.map' : extname;
}

const getOutputFileName = (filename, isSourceMap) => {
    let parse = path.parse(filename);
    parse.ext = getCompileFileExtname(parse.base, isSourceMap);
    parse.base = parse.name + parse.ext;
    return path.format(parse);
}

module.exports = build;
