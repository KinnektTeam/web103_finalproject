import { useRoutes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Discover from './pages/Discover'
import EventDetails from './pages/EventDetails'
import CreateEvent from './pages/CreateEvent'
import EditEvent from './pages/EditEvent'
import Account from './pages/Account'
import PageNotFound from './pages/PageNotFound'
import './App.css'

function App() {
  // Replace with real data later (fetch from your API/database)
  const events = []

  const element = useRoutes([
    {
      path: '/',
      element: <Home data={events} />
    },
    {
      path: '/discover',
      element: <Discover data={events} />
    },
    {
      path: '/event/:id',
      element: <EventDetails data={events} />
    },
    {
      path: '/events/new',
      element: <CreateEvent />
    },
    {
      path: '/edit/:id',
      element: <EditEvent data={events} />
    },
    {
      path: '/account',
      element: <Account />
    },
    {
      path: '/*',
      element: <PageNotFound />
    }
  ])

  return (
    <div className="App">
      <Navbar />
      {element}
    </div>
  )
}

export default App