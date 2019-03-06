const babel = require('@babel/core');
const fs = require('fs');
const logger = require('../../util/logger').createLogger();

const presets = [
    require("@babel/preset-typescript"),
    require("@babel/preset-env")
];

const plugins = [
    require("@babel/plugin-proposal-class-properties")
];

const parser = async (filename, options = {}, minify) => {
    options = Object.assign({
        presets: presets,
        plugins: plugins
    }, options);
    if(minify) {
        options.presets.push(require('babel-preset-minify'));
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
