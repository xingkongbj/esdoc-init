"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const file_1 = require("./lib/file");
const logger_1 = require("./lib/logger");
const npm_install_1 = require("./lib/npm_install");
const config_1 = require("./config");
const chalk = require('chalk');
const path = require('path');
const shell = require('shelljs');
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = logger_1.getLogger(false, false);
        try {
            const cwd = process.cwd();
            let hasPackage = yield file_1.hasFile(`${cwd}/package.json`);
            logger.debug(hasPackage);
            if (!hasPackage) {
                logger.log(chalk.red('Not found package.json!'));
                process.exit(0);
            }
            npm_install_1.installList(config_1.esdocPackage, 'npm');
            shell.cp('-rf', path.resolve(__dirname, '../files/*'), cwd);
            logger.log(chalk.green('Copy files successed.'));
            file_1.modifyFile(`${cwd}/package.json`, 'utf8', (str) => {
                let json = JSON.parse(str);
                json.scripts.esdoc = 'rm -rf ./esdocs && esdoc && open ./esdocs/index.html';
                return JSON.stringify(json, null, 2);
            });
            logger.log(chalk.green('Configuration modification successed.'));
            logger.log(chalk.green('finished.'));
            return true;
        }
        catch (err) {
            logger.debug(err);
            logger.log(chalk.red('esdoc initialization failed.'));
            return err;
        }
    });
}
exports.init = init;
