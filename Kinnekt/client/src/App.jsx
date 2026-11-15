import { useRoutes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Discover from './pages/Discover'
import Resources from './pages/Resources'
import EventDetails from './pages/EventDetails'
import CreateEvent from './pages/CreateEvent'
import EditEvent from './pages/EditEvent'
import Account from './pages/Account'
import PageNotFound from './pages/PageNotFound'
import './App.css'

function App() {
  // Each page loads its own data through src/services
  const element = useRoutes([
    { path: '/', element: <Home /> },
    { path: '/discover', element: <Discover /> },
    { path: '/resources', element: <Resources /> },
    { path: '/events/new', element: <CreateEvent /> },
    { path: '/events/:eventId', element: <EventDetails /> },
    { path: '/events/:eventId/edit', element: <EditEvent /> },
    { path: '/account', element: <Account /> },
    { path: '/*', element: <PageNotFound /> }
  ])

  return (
    <div className="App">
      <Navbar />
      {element}
    </div>
  )
}

export default App
