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
const file_1 = require("./file");
const logger_1 = require("./logger");
const commandExists = require('command-exists');
const shell = require('shelljs');
const chalk = require('chalk');
const detectInstalled = require('detect-installed');
function getInstall(packageName) {
    return __awaiter(this, void 0, void 0, function* () {
        let install;
        if ((yield file_1.hasFile(`${process.cwd()}/yarn.lock`)) && (yield commandExists('yarn'))) {
            install = 'yarn';
        }
        else if (packageName && packageName[0] === '@' && (yield commandExists('mnpm'))) {
            install = 'mnpm';
        }
        else {
            install = 'npm';
        }
        return install;
    });
}
exports.getInstall = getInstall;
function installPackage(packageName, version, install) {
    return __awaiter(this, void 0, void 0, function* () {
        const installTool = install || (yield getInstall(packageName));
        const packageStr = `${packageName}${version ? `@${version}` : '@latest'}`;
        try {
            if (installTool === 'yarn') {
                shell.exec(`yarn add ${packageStr} --dev`, { silent: true });
            }
            else {
                shell.exec(`${installTool} install ${packageStr} --save-dev --save-exact`, { silent: true });
            }
        }
        catch (e) {
            const logger = logger_1.getLogger();
            logger.debug(e);
            logger.log(chalk.red(`Installed ${packageStr} failed.`));
            return false;
        }
        return true;
    });
}
exports.installPackage = installPackage;
function updatePackage(packageName, version, install) {
    return __awaiter(this, void 0, void 0, function* () {
        const installTool = install || (yield getInstall(packageName));
        const packageStr = `${packageName}${version ? `@${version}` : ''}`;
        try {
            if (installTool === 'yarn') {
                shell.exec(`yarn upgrade ${packageStr} --dev`, { silent: true });
            }
            else {
                if (version) {
                    shell.exec(`${installTool} install ${packageStr} --save-dev --save-exact`, { silent: true });
                }
                else {
                    shell.exec(`${installTool} update ${packageStr}`, { silent: true });
                }
            }
        }
        catch (e) {
            const logger = logger_1.getLogger();
            logger.debug(e);
            logger.log(chalk.red(`Updated ${packageStr} failed.`));
            return false;
        }
        return true;
    });
}
exports.updatePackage = updatePackage;
function installs(obj, install) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = logger_1.getLogger();
        logger.log(chalk.green(`Installing ${obj.name}${obj.version ? `@${obj.version}` : ''}`));
        if (yield detectInstalled(obj.name, { local: true })) {
            return yield updatePackage(obj.name, obj.version, install);
        }
        else {
            return yield installPackage(obj.name, obj.version, install);
        }
    });
}
function installList(packageList, install) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = logger_1.getLogger();
        const result = [];
        if (packageList && packageList.length) {
            for (let i = 0; i < packageList.length; i++) {
                const name = packageList[i].name;
                const res = yield installs(packageList[i], 'npm');
                result.push({ 'name': name, 'result': res });
            }
        }
        return result;
    });
}
exports.installList = installList;
