import { Link } from 'react-router-dom'
import { EmptyState } from '../components/StatusMessage'

function PageNotFound() {
  return (
    <main className="lm-page">
      <EmptyState title="404 - Page not found">
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/" className="lm-btn">
          Back to events
        </Link>
      </EmptyState>
    </main>
  )
}

export default PageNotFound
