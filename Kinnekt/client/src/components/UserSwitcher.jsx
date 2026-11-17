import { useEffect, useState } from 'react'
import AttendeesAPI from '../services/AttendeesAPI'
import { useCurrentUser } from '../context/useCurrentUser'

// There is no login yet, so this lets you pick which attendee you're "viewing as".
function UserSwitcher() {
  const { userId, setUserId } = useCurrentUser()
  const [attendees, setAttendees] = useState([])

  // Reload the list when the user changes (e.g. after creating a new profile)
  useEffect(() => {
    let ignore = false
    AttendeesAPI.getAll()
      .then((rows) => !ignore && setAttendees(rows))
      .catch(() => !ignore && setAttendees([]))
    return () => {
      ignore = true
    }
  }, [userId])

  return (
    <label className="navbar__switcher">
      <span className="navbar__switcher-label">Viewing as</span>
      <select value={userId ?? ''} onChange={(e) => setUserId(e.target.value)}>
        <option value="">Guest</option>
        {attendees.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
    </label>
  )
}

export default UserSwitcher
