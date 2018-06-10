/**
 * 输出函数
 * @param {Boolean} silent 是否静默
 * @returns {Function} 返回输出函数
 */
export const logger = (silent: boolean) => (content: any) => {
    if (!silent) {
        console.log(content);
    }
};

interface consoleLogger {
    log: Function,
    debug: Function
}

// 输出单例
let consoleLogger: consoleLogger;

/**
 * 单例的输出函数
 * @param {Boolean} silent 是否静默
 * @param {Boolean} debug 是否调试模式
 * @returns {Function} 返回输出函数
 */
export const getLogger = (silent: boolean = false, debug: boolean = false) => {
    if (!consoleLogger) {
        consoleLogger = {
            log: logger(silent),
            debug: logger(!debug)
        };
    }
    return consoleLogger;
};


