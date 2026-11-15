import { createContext } from 'react'

// Holds the attendee the app is "viewing as". There is no login yet, so the
// chosen attendee id is remembered in localStorage (see CurrentUserProvider).
export const CurrentUserContext = createContext(null)
