import { CallbackFunction, PaginationLinks } from './types'

export function formatQueryString(queryObj: {
  [key: string]: string | number
}): string {
  return (
    '?' +
    Object.keys(queryObj)
      .map((key) => `${key}=${queryObj[key]}`)
      .join('&')
  )
}

export function parsePaginationLinks(str: string): PaginationLinks {
  return str
    .split(', ')
    .map((item) => {
      const attrs = item.split('; ')
      const link = attrs[0].slice(1, -1)
      const page = attrs[1].split('=')[1].slice(1, -1)
      return [page, link]
    })
    .reduce((obj, item) => {
      return { ...obj, [item[0]]: item[1] }
    }, {})
}

export function throttle(
  fn: CallbackFunction,
  concurrency: number,
  delay: number,
  scope: any,
): CallbackFunction {
  let count = 0

  function resetTimer() {
    count = 0
    setTimeout(() => {
      resetTimer()
    }, delay)
  }

  resetTimer()

  return function (...args: any[]) {
    if (count < concurrency) {
      count++
      return fn.apply(scope, args)
    }
  }
}
