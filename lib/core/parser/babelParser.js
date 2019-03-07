const babel = require('@babel/core');
const path = require('path');
const logger = require('../../util/logger').createLogger();

// 修复babel7.x preset plugin默认从当前cwd获取的问题
const destiny_global = path.join(process.argv[1], '../../');

const presets = [
    babel.createConfigItem('@babel/preset-typescript', {dirname: destiny_global, type: 'preset'}),
    babel.createConfigItem('@babel/preset-env', {dirname: destiny_global, type: 'preset'})
];

const plugins = [
    babel.createConfigItem('@babel/plugin-proposal-class-properties', {dirname: destiny_global, type: 'plugin'}),
];

const parser = async (filename, options = {}, minify) => {
    options = Object.assign({
        presets: presets,
        plugins: plugins
    }, options);
    if(minify) {
        options.presets.push(babel.createConfigItem('babel-preset-minify', {dirname: destiny_global, type: 'preset'}));
    }
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
