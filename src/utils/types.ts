export type CallbackFunction = (...args: any[]) => any

export interface PaginationLinks {
  next?: string
  prev?: string
  first?: string
  last?: string
}
