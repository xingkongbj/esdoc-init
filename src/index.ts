import { hasFile, coverFile, modifyFile } from './lib/file';
import { getLogger } from './lib/logger';
import { installList } from './lib/npm_install';
import { esdocPackage } from './config';

const chalk = require('chalk');
const path = require('path');
const shell = require('shelljs');

export async function init() {
    const logger = getLogger(false, false);
    try {
        // 校验目录是否正确
        const cwd = process.cwd();
        let hasPackage = await hasFile(`${cwd}/package.json`);
        logger.debug(hasPackage);
        if (!hasPackage) {
            logger.log(chalk.red('Not found package.json!'));
            process.exit(0);
        }
        // 安装程序
        let installResult = await installList(esdocPackage, 'npm');
        if (installResult && installResult.some((obj: {name: string, result: boolean}) => obj.result === false)) {
            logger.log(chalk.red('Installation failed!'));
            process.exit(0);
        }
        logger.log(chalk.green('Installation complete.'));
        // 复制文件
        shell.cp('-rf', path.resolve(__dirname, '../files/*'), cwd);
        logger.log(chalk.green('Copy files successed.'));
        // 修改 .gitignore
        modifyFile(`${cwd}/.gitignore`, 'utf8', (str: string) => {
            let ignore = str.replace(/\n\/esdocs/g,'\n');
            ignore = ignore + '\n/esdocs';
            ignore = ignore.replace(/\n+/g,'\n');
            return ignore;
        });
        // 修改 package.json
        modifyFile(`${cwd}/package.json`, 'utf8', (str: string) => {
            let json = JSON.parse(str);
            json.scripts.esdoc = 'rm -rf ./esdocs && esdoc && open ./esdocs/index.html';
            return JSON.stringify(json, null, 2);
        });
        logger.log(chalk.green('Configuration modification successed.'));
        logger.log(chalk.green('finished.'));
        return true;
    } catch (err) {
        logger.debug(err);
        logger.log(chalk.red('esdoc initialization failed.'));
        return err;
    }
}

