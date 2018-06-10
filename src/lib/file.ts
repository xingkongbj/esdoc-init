import { getLogger } from './logger';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const readline = require('readline');

/**
 * 检测文件是否存在
 * @param {String} filePath 文件路径
 * @return {Boolean} 返回文件是否存在: true 文件存在
 */
export function hasFile(filePath: string) {
    const logger = getLogger();
    logger.debug(`hasFile:${filePath}`);
    if (filePath) {
        return new Promise((resolve, reject) => {
            fs.stat(filePath, (err: Error, stat: any) => {
                if (err) {
                    logger.debug(err);
                    logger.log(chalk.red(`Found ${filePath} failed.`));
                    process.exit(0);
                } else {
                    resolve(stat.isFile());
                }
            });
        });
    } else {
        return false;
    }
}

/**
 * 询问是否替换文件
 * @param {String} filePath 文件路径
 * @param {Boolean} ask 是否询问用户，不询问默认替换
 * @return {Promise} 返回是否可以覆盖: true 能覆盖
 */
export async function coverFile(filePath: string, ask: boolean = false) {
    const has = await hasFile(filePath);
    if (has) {
        if (ask) {
            return new Promise((resolve, reject) => {
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                });
                rl.question(`"${filePath}" file exists，do you want to cover (Y/N)[N]?`, (ans: string) => {
                    rl.close();
                    if (ans.toLowerCase() === 'y') {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
            });
        } else {
            return true;
        }
    } else {
        return true;
    }
}

/**
 * 修改文件内容
 * @param {String} filePath 文件路径
 * @param {String} encode 文件读取&写入编码方式 默认utf-8
 * @param {Function} callback 文件操作函数
 * @return {Number} 替换结果，true为成功
 */
export function modifyFile(filePath: string, encode: string = 'utf8', callback: Function) {
    let fileContent;
    const logger = getLogger();
    // 读取文件
    try {
        fileContent = fs.readFileSync(filePath, encode);
    } catch (err) {
        logger.debug(err);
        logger.log(chalk.red(`read ${filePath} failed.`));
        process.exit(0);
    }
    // 修改文件
    if (callback) {
        fileContent = callback(fileContent);
    }
    // 写入文件
    try {
        fs.writeFileSync(filePath, fileContent);
    } catch (err) {
        logger.debug(err);
        logger.log(chalk.red(`modify ${filePath} failed.`));
        process.exit(0);
    }
    return true;
}
