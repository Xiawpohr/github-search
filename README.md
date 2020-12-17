# Front-end Web Developer Take Home Test

## 題目描述

請實作一個網頁滿足以下要求:

- 偵測文字輸入框的變動，並查詢相關的 GitHub repos(參考 GitHub API)
- 請留意搜尋 API 有 rate limit，所以必須避免過於頻繁的 API requests
- 請實作 infinite scroll，在使用者滾到頁面底部時自動載入更多 repos，此功能不得使用任何現成的 library

你不需要實作:

- GitHub 的 OAuth 登入

## Development

```
npm i
npm run start
```

## Deployment to Github Page

```
npm run build
npm run deploy
```

## 架構設計說明

#### `components/RepoSearch`

網頁主要程式碼，包含標題、文字輸入框、搜尋結果、提示文字

#### `services/RepositorySearch`

```typescript
class RepositorySearch {
  // 用關鍵字搜尋 GitHub Repositories，回傳 repository array
  async search(query: string): Repositories

  // 回傳下一頁的搜尋結果
  async nextPage(): Repositories

  // 取得需等待幾秒，ratelimit 才會重置
  getRetryAfter(): number

  // 發送 request，並且紀錄 ratelimit-remaining, ratelimit-reset 與分頁連結。每次呼叫前，會檢查 ratelimit 是否足夠
  private async request(url: string): Repositories
}
```

#### `hooks/useDebouncedValue`

用來等待使用者輸入完成後，再更新搜尋關鍵字。

```typescript
function useDebouncedValue<T>(value: T, delay: number = 500): T
```

#### `hooks/useInfiniteScroll`

使用 IntersectionObserver API 來觀察是否滾動到網頁底部，當到滾動到網頁底部時，執行 callback function。

```typescript
function useInfiniteScroll(
  cb: CallbackFunction,
  targetRef: React.RefObject<HTMLDivElement>,
  rootRef: React.RefObject<HTMLDivElement>,
): void
```
