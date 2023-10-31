export interface ConfigureLogOptions {
  enable: boolean | 'devtools'
}

/**
 * A class representing a logger.
 */
class Logger {
  /**
   * A map of color names to their corresponding hex codes.
   */
  static ColorMap = {
    orange: '#d95220',
    blue: '#6cb6ff',
    green: '#67de7b'
  }

  /**
   * A boolean indicating whether logging is enabled.
   */
  loggable = false

  /**
   * Configures the logger.
   * @param options - The options for configuring the logger.
   */
  configureLog(options?: ConfigureLogOptions) {
    if (options?.enable === 'devtools') {
      this.loggable = this.enableLogInDevtools()
    }
    if (typeof options?.enable === 'boolean') {
      this.loggable = options.enable
    }
  }

  /**
   * Enables logging in the WeChat devtools.
   * @returns A boolean indicating whether logging is enabled in the devtools.
   */
  enableLogInDevtools() {
    if (wx?.canIUse('getSystemInfoSync')) {
      const systemInfo = wx.getSystemInfoSync()
      return systemInfo.platform === 'devtools'
    }
    return false
  }

  /**
   * Logs data changes.
   * @param param0 - The parameters for logging.
   * @returns A boolean indicating whether logging was successful.
   */
  log({
    name,
    color = 'orange',
    value
  }: {
    name: string
    color: keyof (typeof Logger)['ColorMap']
    value: any
  }) {
    if (!this.loggable) return false
    console.log(
      `%c${name}`,
      `background-color:${Logger.ColorMap[color]};padding:2px;color:#FFF;`,
      value
    )
    return true
  }
}

export const logger = new Logger()

export const configureLog = (...args: Parameters<Logger['configureLog']>) => {
  logger.configureLog.apply(logger, args)
}
