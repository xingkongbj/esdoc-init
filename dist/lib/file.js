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
const logger_1 = require("./logger");
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const readline = require('readline');
function hasFile(filePath) {
    const logger = logger_1.getLogger();
    logger.debug(`hasFile:${filePath}`);
    if (filePath) {
        return new Promise((resolve, reject) => {
            fs.stat(filePath, (err, stat) => {
                if (err) {
                    logger.debug(err);
                    logger.log(chalk.red(`Found ${filePath} failed.`));
                    process.exit(0);
                }
                else {
                    resolve(stat.isFile());
                }
            });
        });
    }
    else {
        return false;
    }
}
exports.hasFile = hasFile;
function coverFile(filePath, ask = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const has = yield hasFile(filePath);
        if (has) {
            if (ask) {
                return new Promise((resolve, reject) => {
                    const rl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout,
                    });
                    rl.question(`"${filePath}" file exists，do you want to cover (Y/N)[N]?`, (ans) => {
                        rl.close();
                        if (ans.toLowerCase() === 'y') {
                            resolve(true);
                        }
                        else {
                            resolve(false);
                        }
                    });
                });
            }
            else {
                return true;
            }
        }
        else {
            return true;
        }
    });
}
exports.coverFile = coverFile;
function modifyFile(filePath, encode = 'utf8', callback) {
    let fileContent;
    const logger = logger_1.getLogger();
    try {
        fileContent = fs.readFileSync(filePath, encode);
    }
    catch (err) {
        logger.debug(err);
        logger.log(chalk.red(`read ${filePath} failed.`));
        process.exit(0);
    }
    if (callback) {
        fileContent = callback(fileContent);
    }
    try {
        fs.writeFileSync(filePath, fileContent);
    }
    catch (err) {
        logger.debug(err);
        logger.log(chalk.red(`modify ${filePath} failed.`));
        process.exit(0);
    }
    return true;
}
exports.modifyFile = modifyFile;
