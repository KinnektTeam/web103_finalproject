import { useContext } from 'react'
import { CurrentUserContext } from './CurrentUserContext'

// Returns { user, userId, loading, setUserId, refresh }
//   user      -> full profile from GET /api/attendees/:id (interests, organized_events, rsvps), or null
//   setUserId -> switch who you're viewing as (null to sign out)
//   refresh   -> reload the profile after changing interests, RSVPs, etc.
export const useCurrentUser = () => {
  const value = useContext(CurrentUserContext)
  if (!value) throw new Error('useCurrentUser must be used inside <CurrentUserProvider>')
  return value
}
