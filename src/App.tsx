import { ThemeProvider } from 'styled-components'
import theme from '@rebass/preset'
import RepoSearch from './components/RepoSearch'

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <RepoSearch />
    </ThemeProvider>
  )
}
