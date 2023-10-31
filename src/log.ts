export interface ConfigureLogOptions {
  enable: boolean | 'devtools'
}

class Logger {
  static ColorMap = {
    orange: '#d95220',
    blue: '#6cb6ff',
    green: '#67de7b'
  }

  loggable = false

  configureLog(options?: ConfigureLogOptions) {
    if (options?.enable === 'devtools') {
      this.loggable = this.enableLogInDevtools()
    }
    if (typeof options?.enable === 'boolean') {
      this.loggable = options.enable
    }
  }

  enableLogInDevtools() {
    if (wx?.canIUse('getSystemInfoSync')) {
      const systemInfo = wx.getSystemInfoSync()
      return systemInfo.platform === 'devtools'
    }
    return false
  }

  // output data change
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
  }
}

export const logger = new Logger()

export const configureLog = (...args: Parameters<Logger['configureLog']>) => {
  logger.configureLog.apply(logger, args)
}
