const path = require('path');
const fs = require('fs');
const fileUtil = require('../util/fileUtil');
const scriptParser = require('./parser/babelParser');
const styleParser = require('./parser/styleParser');
const logger = require('../util/logger').createLogger();

const build = async (config) => {
    config.files.forEach(item => {
        compile(item, config);
    })
}

const compile = async (file, config) => {
    let filename = fileUtil.pathFormat(path.relative(process.cwd(), file), '/');
    const extname = path.extname(filename);
    let result,sourceMapKey, options = {};
    const fileParse = path.parse(path.relative(config.base, file));
    let distFilePath = path.join(config.cwd, config.dist, path.relative(config.base, file));
    let code;
    if(['.ts', '.js', '.jsx'].includes(extname)){
        if(config.options.scriptSourceMap){
            options.sourceMaps = true;
            options.sourceFileName = fileUtil.pathFormat(path.relative(path.parse(distFilePath).dir, file), '/');
        }
        result = await scriptParser(filename, options);
        sourceMapKey = 'scriptSourceMap';
    }else if(['.scss'].includes(extname)) {
        result = styleParser(filename);
        sourceMapKey = 'styleSourceMap';
    }else {
        logger.error(file, '不支持此文件类型的解析');
    }
    if(result && result.code){
        distFilePath = path.join(config.cwd, config.dist, fileParse.dir, fileParse.name + getCompileFileExtname(file));
        code = result.code;
        if(config.options[sourceMapKey] && result.map) {
            let sourceFileName = path.join(fileParse.name + getCompileFileExtname(file, true));
            let sourceMapFilePath = path.join(config.cwd, config.dist, fileParse.dir, fileParse.name + getCompileFileExtname(file, true));
            code = codeAppendSourceMappingURL(result.code, sourceFileName);
            outputFile(JSON.stringify(result.map), sourceMapFilePath);
        }
        outputFile(code, distFilePath);
    }
}

const outputFile = (code, filename) => {
    fileUtil.writeFile(filename, code, (error=> {
        if(error){
            logger.error(filename, '写文件出错');
        }
    }));
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

module.exports = build;
