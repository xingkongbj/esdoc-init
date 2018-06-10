import { hasFile } from './file';
import { getLogger } from './logger';

const commandExists = require('command-exists');
const shell = require('shelljs');
const chalk = require('chalk');
const detectInstalled = require('detect-installed');

/**
 * 识别安装包的命令
 * @param {string} packageName 包名
 * @returns {Promise<string>}
 */
export async function getInstall(packageName?: string): Promise<string> {
  let install;
  if (await hasFile(`${process.cwd()}/yarn.lock`) && await commandExists('yarn')) {
    // 如果当前项目下有 yarn.lock 且 安装了 yarn
      install = 'yarn';
  } else if (packageName && packageName[0] === '@' && await commandExists('mnpm')) {
    // 如果是有scope的包，用 mnpm
      install = 'mnpm';
  } else {
      install = 'npm';
  }
  return install;
}

/**
 * 安装npm包
 * @param {string} packageName 包名称
 * @param {string} version 版本号，如果没有设置版本，默认安装最新版本
 * @param {string} install 安装工具
 */
export async function installPackage(packageName: string, version?: string, install?: string) {
    const installTool = install || await getInstall(packageName);
    const packageStr = `${packageName}${version ? `@${version}` : '@latest'}`;
    try {
        if (installTool === 'yarn') {
            shell.exec(`yarn add ${packageStr} --dev`, { silent: true });
        } else {
            shell.exec(`${installTool} install ${packageStr} --save-dev --save-exact`, { silent: true });
        }
    } catch (e) {
        const logger = getLogger();
        logger.debug(e);
        logger.log(chalk.red(`Install ${packageStr} failed.`));
        return false;
    }
    return true;
}

/**
 * 升级npm包
 * @param packageName 包名称
 * @param version 版本号，如果没有设置版本，不指定版本号升级，按默认规则
 * @param {string} install 安装工具
 */
export async function updatePackage(packageName: string, version?: string, install?: string) {
    const installTool = install || await getInstall(packageName);
    const packageStr = `${packageName}${version ? `@${version}` : ''}`;
    try {
        if (installTool === 'yarn') {
            shell.exec(`yarn upgrade ${packageStr} --dev`, { silent: true });
        } else {
            if (version) {
                shell.exec(`${installTool} install ${packageStr} --save-dev --save-exact`, { silent: true });
            } else {
                shell.exec(`${installTool} update ${packageStr}`, { silent: true });
            }
        }
    } catch (e) {
        const logger = getLogger();
        logger.debug(e);
        logger.log(chalk.red(`Update ${packageStr} failed.`));
        return false;
    }
    return true;
}

/**
 * 安装具体的npm包
 * @param {Array} packageList 包名称
 * @param {String} install 安装工具
 */
export async function installList(packageList: {name: string, version: string}[], install?: string) {
    const logger = getLogger();
    if (packageList && packageList.length) {
        packageList.forEach(async (arr) => {
            logger.log(chalk.green(`${arr.name}${arr.version ? `@${arr.version}` : ''}`));
            if (await detectInstalled(arr.name, { local: true })) {
                await updatePackage(arr.name, arr.version, install);
            } else {
                await installPackage(arr.name, arr.version, install);
            }
        });
    }
}
