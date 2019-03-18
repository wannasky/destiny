const babel = require('@babel/core');
const logger = require('../../util/logger').createLogger();

const presets = [
    require('@babel/preset-typescript'),
    require('@babel/preset-env')
];

const presetsMinify = [
    require('@babel/preset-typescript'),
    require('@babel/preset-env'),
    [require('babel-preset-minify'), {builtIns: false}]
];

const plugins = [require('@babel/plugin-proposal-class-properties')];

const parser = async (filename, options = {}, minify) => {
    options.plugins = plugins;
    options.presets = minify ? presetsMinify : presets;
    return await new Promise((resolve, reject) => {
        babel.transformFile(filename, options, function (error, result) {
            if(error){
                logger.error(`${filename}代码解析出错`, error);
                reject(null);
            }else{
                resolve({
                    code: result.code,
                    map: result.map ? JSON.stringify(result.map) : null
                });
            }
        });
    });
}

module.exports = parser;
