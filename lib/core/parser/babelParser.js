const babel = require('@babel/core');
const logger = require('../../util/logger').createLogger();

const presets = [
    "@babel/preset-typescript",
    "@babel/preset-env"
];

const plugins = [
    "@babel/plugin-proposal-class-properties"
];

const parser = async (filename, options = {}) => {
    options = Object.assign({
        presets: presets,
        plugins: plugins,
    }, options);

    return await new Promise((resolve, reject) => {
        babel.transformFile(filename, options, function (error, result) {
            if(error){
                logger.error(`${filename}代码解析出错`, error);
                reject(null);
            }else{
                resolve(result);
            }
        });
    });
}

module.exports = parser;
