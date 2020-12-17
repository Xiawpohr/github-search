import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import styled from 'styled-components'
import { Box, Heading, Text } from 'rebass'
import { Input } from '@rebass/forms'
import useIsMounted from '../hooks/useIsMounted'
import useDebouncedValue from '../hooks/useDebouncedValue'
import useInfiniteScroll from '../hooks/useInfiniteScroll'
import RepositorySearch from '../services/RepositorySearch'
import { RateLimitExceeded } from '../services/Errors'
import SearchItem from '../components/SearchItem'

const List = styled.ul`
  margin: 32px 0;
  padding: 0;
  list-style: none;

  > *:not(:first-child) {
    margin-top: 24px;
  }
`

const repoSearch = new RepositorySearch()
repoSearch.setPerPage(30)

export default function RepoSearch() {
  const isMounted = useIsMounted()

  const [keyword, setKeyword] = useState('')
  const keywordDebounced = useDebouncedValue(keyword, 500)

  const [repositories, setRepositories] = useState<any[]>([])

  const [isSearching, setIsSearching] = useState(false)

  const [hasMore, setHasMore] = useState(false)

  const [retryAfter, setRetryAfter] = useState(0)
  useEffect(() => {
    let timer: number
    if (retryAfter) {
      timer = setTimeout(() => {
        setRetryAfter(retryAfter - 1)
      }, 1000)
    }

    return () => {
      clearTimeout(timer)
    }
  }, [retryAfter])

  const search = useCallback(
    async (keyword) => {
      try {
        setIsSearching(true)
        const data = await repoSearch.search(keyword)
        if (isMounted) {
          if (repoSearch.canNextPage()) {
            setHasMore(true)
          }
          setRepositories([...data])
        }
      } catch (e) {
        if (e instanceof RateLimitExceeded) {
          const seconds = repoSearch.getRetryAfter()
          setRetryAfter(seconds)
        }
      } finally {
        setIsSearching(false)
      }
    },
    [isMounted],
  )

  const loadMore = useCallback(async () => {
    if (repoSearch.canNextPage() && retryAfter === 0) {
      try {
        setIsSearching(true)
        const data = await repoSearch.nextPage()
        if (isMounted) {
          if (repoSearch.canNextPage()) {
            setHasMore(true)
          } else {
            setHasMore(false)
          }
          setRepositories((prev) => [...prev, ...data])
        }
      } catch (e) {
        if (e instanceof RateLimitExceeded) {
          const seconds = repoSearch.getRetryAfter()
          setRetryAfter(seconds)
        }
      } finally {
        setIsSearching(false)
      }
    }
  }, [isMounted, retryAfter])

  useEffect(() => {
    if (!keywordDebounced) return
    search(keywordDebounced)
  }, [keywordDebounced, search])

  const containerRef = useRef<HTMLDivElement>(null)
  const loaderRef = useRef<HTMLDivElement>(null)

  useInfiniteScroll(loadMore, loaderRef, containerRef)

  const message = useMemo(() => {
    if (!keyword) {
      return 'Please typing some keywords to search repositories'
    }
    if (retryAfter) {
      return `Wait ${retryAfter} seconds to load`
    }
    if (hasMore) {
      return 'Loading more results...'
    }
    if (isSearching) {
      return 'searching...'
    }
    if (keywordDebounced) {
      return 'No more result'
    }
  }, [hasMore, isSearching, keyword, keywordDebounced, retryAfter])

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: 'auto',
        px: 3,
      }}
    >
      <Heading fontSize={5} color='#07c' mb={2}>
        GitHub Search
      </Heading>
      <Input
        value={keyword}
        onChange={(event: React.FormEvent<HTMLInputElement>) =>
          setKeyword(event.currentTarget.value)
        }
      />
      <Box>
        <List>
          {repositories.map((repo, index) => (
            <li key={`${repo['node_id']}${index}`}>
              <SearchItem
                name={repo['full_name']}
                description={repo['description']}
                stargazers={repo['stargazers_count']}
                watchers={repo['watchers_count']}
                forks={repo['forks_count']}
                url={repo['html_url']}
              />
            </li>
          ))}
        </List>
        <Text ref={loaderRef} fontSize={3} color='#30c' textAlign='center'>
          {message}
        </Text>
      </Box>
    </Box>
  )
}
