import Debug from 'debug'

export const logger = Debug('hp')

export function createLogger(namespace: string): Debug.Debugger {
  return logger.extend(namespace)
}
