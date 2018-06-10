import { hasFile } from './file';
import { getLogger } from './logger';
import construct = Reflect.construct;

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
        logger.log(chalk.red(`Installed ${packageStr} failed.`));
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
        logger.log(chalk.red(`Updated ${packageStr} failed.`));
        return false;
    }
    return true;
}


/**
 * 安装具体的npm包
 * @param {String} obj 包名和版本
 * @param {String} install 安装工具
 */
async function installs(obj: {name: string, version: string}, install?: string): Promise<boolean> {
    const logger = getLogger();
    logger.log(chalk.green(`Installing ${obj.name}${obj.version ? `@${obj.version}` : ''}`));
    if (await detectInstalled(obj.name, { local: true })) {
        return await updatePackage(obj.name, obj.version, install);
    } else {
        return await installPackage(obj.name, obj.version, install);
    }
}

/**
 * 安装具体的npm包
 * @param {Array} packageList 包名称
 * @param {String} install 安装工具
 */
export async function installList(packageList: {name: string, version: string}[], install?: string): Promise<{name: string, result: boolean}[]> {
    const logger = getLogger();
    const result = [];
    if (packageList && packageList.length) {
        for (let i = 0; i < packageList.length; i++) {
            const name = packageList[i].name;
            const res = await installs(packageList[i], 'npm');
            result.push({'name' : name, 'result': res});
        }
    }
    return result;
}
