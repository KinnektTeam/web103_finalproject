// Small presenter components for loading, error, and empty states

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="lm-status" role="status">
      {label}
    </div>
  )
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="lm-status lm-status--error" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="lm-btn lm-btn--secondary lm-btn--small" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, children }) {
  return (
    <div className="lm-status">
      <h3>{title}</h3>
      {children}
    </div>
  )
}

// Shows one message or a list of validation messages from the API
export function FormErrors({ error }) {
  if (!error) return null
  const details = error.details?.length > 1 ? error.details : null
  return (
    <div className="lm-alert" role="alert">
      {details ? (
        <>
          Please fix the following:
          <ul>
            {details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </>
      ) : (
        error.message
      )}
    </div>
  )
}
