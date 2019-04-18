const path = require('path');
const glob = require('../../util/glob');
const fileUtil = require('../../util/fileUtil');
const logger = require('../../util/logger').createLogger();

const filename = 'destiny.config.js';

const config = (commander) => {
    const cwd = process.cwd();
    let configFile = commander.config ? commander.config : filename;
    let config = {
        cwd: cwd,
        base: cwd,
        src: './',
        dist: './',
        files: [],
        watch: false,
        options: {}
    };
    if(fileUtil.exist(configFile)){
        let cf = require(path.join(cwd, configFile));
        cf.src = cf.src || './';
        cf.dist = cf.dist || cf.src;
        cf.files = (cf.files || []).map(item => path.join(cf.src, item));
        cf.exclude = (cf.exclude || []).map(item => path.join(cf.src, item));
        config.base = path.join(cwd, cf.src);
        config.files = filterCompileFiles(cf.files, cf.exclude);
        ['watch', 'src', 'dist', 'options'].forEach(item => {
            if(cf[item]) {
                config[item] = cf[item];
            }
        });
    }
    if(commander.args.length){
        config.files = filterCompileFiles([path.join(cwd, commander.args[0])]);
    }
    if(commander.dist) {
        config.dist = path.join(cwd, commander.dist);
    }
    if(commander.watch !== undefined) {
        config.watch = commander.watch !== 'false';
    }
    if(commander.sourceMap !== undefined) {
        config.options.scriptSourceMap = commander.sourceMap !== 'false';
        config.options.styleSourceMap = commander.styleSourceMap !== 'false';
    }
    if(commander.minify !== undefined) {
        config.options.minify = commander.minify !== 'false';
    }
    if(!config.files.length) {
        logger.warn('未指定需要编译的文件');
        process.exit();
    }
    return config;
}

const isStyleDepsFile = (file) => {
    return fileUtil.extname(file) === 'scss'
        && path.basename(file).indexOf('_') === 0;
}

const filterCompileFiles = (files = [], exclude = []) => {
    return glob(files, exclude).filter(item => fileUtil.extname(item) !== 'scss' || !isStyleDepsFile(item));
}

module.exports = config;
