import { useCallback, useEffect, useMemo, useState } from 'react'
import AttendeesAPI from '../services/AttendeesAPI'
import { CurrentUserContext } from './CurrentUserContext'

const STORAGE_KEY = 'localmeet:currentUserId'

const readStoredId = () => {
  try {
    return Number(localStorage.getItem(STORAGE_KEY)) || null
  } catch {
    return null
  }
}

const writeStoredId = (id) => {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, String(id))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // storage blocked (private mode); the choice just won't be remembered
  }
}

function CurrentUserProvider({ children }) {
  const [userId, setUserIdState] = useState(readStoredId)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => readStoredId() !== null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!userId) return
    let ignore = false

    AttendeesAPI.getById(userId)
      .then((profile) => {
        if (ignore) return
        setUser(profile)
        setLoading(false)
      })
      .catch((error) => {
        if (ignore) return
        // The saved attendee no longer exists (e.g. after a database reset)
        if (error.status === 404 || error.status === 400) {
          writeStoredId(null)
          setUserIdState(null)
        }
        setUser(null)
        setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [userId, version])

  const setUserId = useCallback((id) => {
    const next = Number(id) || null
    writeStoredId(next)
    setUserIdState(next)
    setUser(null)
    setLoading(next !== null)
  }, [])

  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  const value = useMemo(
    () => ({ user, userId, loading, setUserId, refresh }),
    [user, userId, loading, setUserId, refresh]
  )

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>
}

export default CurrentUserProvider
