const sassParser = require('node-sass');
const logger = require('../../util/logger').createLogger();

const parser = async (filename, options = {}) => {
    options = Object.assign({
        file: filename
    }, options);
    return new Promise((resolve, reject) => {
        sassParser.render(options, function (error, result) {
            if(error){
                logger.error(`${filename}代码解析出错`, error);
                reject(null);
            }else{
                resolve({
                    deps: result.stats.includedFiles.slice(1),
                    code: result.css.toString('utf-8'),
                    map: result.map ? result.map.toString('utf-8') : null
                });
            }
        });
    });
}

module.exports = parser;
