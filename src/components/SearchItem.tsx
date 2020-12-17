import styled from 'styled-components'
import { Card, Heading, Text, Flex, Link } from 'rebass'
import { GitFork, Eye, Star } from '@styled-icons/octicons'

interface SearchItemProps {
  name: string
  description: string
  stargazers: number
  watchers: number
  forks: number
  url: string
}

const StyledCard = styled(Card)`
  border: 1px solid ${({ theme }) => theme.colors.gray};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadows.card};
`

export default function SearchItem(props: SearchItemProps) {
  const { name, description, stargazers, watchers, forks, url } = props

  return (
    <StyledCard width={1} p={3}>
      <Link
        href={url}
        target='_blank'
        rel='noopenner noreferrer'
        style={{ display: 'inline-block' }}
      >
        <Heading fontSize={3} width={1}>
          {name}
        </Heading>
      </Link>
      <Text mt={2}>{description}</Text>
      <Flex mt={3}>
        <Flex width={1} alignItems='center'>
          <Star size='24' />
          <Text ml={1}>{stargazers}</Text>
        </Flex>
        <Flex width={1} alignItems='center'>
          <Eye size='24' />
          <Text ml={1}>{watchers}</Text>
        </Flex>
        <Flex width={1} alignItems='center'>
          <GitFork size='24' />
          <Text ml={1}>{forks}</Text>
        </Flex>
      </Flex>
    </StyledCard>
  )
}
