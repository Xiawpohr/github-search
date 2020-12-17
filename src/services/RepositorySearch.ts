import axios, { AxiosInstance } from 'axios'
import { RateLimitExceeded } from './Errors'
import { formatQueryString, parsePaginationLinks } from '../utils'
import { PaginationLinks } from '../utils/types'

export default class RepositorySearch {
  public baseUrl: string
  public query: string = ''
  public perPage: number = 100
  public rateLimit: number = 10
  public rateLimitRemaining: number = 0
  public rateLimitReset: number = 0
  private client: AxiosInstance
  private paginations: PaginationLinks | undefined

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || 'https://api.github.com'
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 5000,
    })
  }

  setPerPage(count: number) {
    this.perPage = count
  }

  getRetryAfter() {
    if (Date.now() < this.rateLimitReset) {
      return Math.ceil((this.rateLimitReset - Date.now()) / 1000) // second
    }

    return 0
  }

  async search(query: string) {
    if (!query) {
      throw Error('can not search empty string')
    }

    this.query = query
    const queryString = formatQueryString({
      q: this.query,
      per_page: this.perPage,
    })
    const url = `/search/repositories${queryString}`
    return this.request(url)
  }

  canNextPage() {
    return !!this.paginations?.next
  }

  canPreviousPage() {
    return !!this.paginations?.prev
  }

  async nextPage() {
    if (!!this.paginations?.next) {
      return this.request(this.paginations.next)
    }
    return []
  }

  async previousPage() {
    if (!!this.paginations?.prev) {
      return this.request(this.paginations.prev)
    }
    return []
  }

  async firstPage() {
    if (!!this.paginations?.first) {
      return this.request(this.paginations.first)
    }
    return []
  }

  async lastPage() {
    if (!!this.paginations?.last) {
      return this.request(this.paginations.last)
    }
    return []
  }

  private async request(url: string) {
    if (this.rateLimitRemaining === 0 && this.rateLimitReset > Date.now()) {
      throw new RateLimitExceeded('no rate limit')
    }

    try {
      const response = await this.client.get(url)
      this.paginations = parsePaginationLinks(response.headers['link'])
      this.rateLimit = parseInt(response.headers['x-ratelimit-limit'])
      this.rateLimitRemaining = parseInt(
        response.headers['x-ratelimit-remaining'],
      )
      this.rateLimitReset =
        parseInt(response.headers['x-ratelimit-reset']) * 1000
      return response.data.items
    } catch (e) {
      if (e.response.status === 403) {
        throw new RateLimitExceeded(e.message)
      }
    }
  }
}
