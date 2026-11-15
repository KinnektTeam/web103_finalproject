import { useEffect, useState } from 'react'
import ResourcesAPI from '../services/ResourcesAPI'
import ResourceCard from '../components/ResourceCard'
import { EmptyState, ErrorMessage, Loading } from '../components/StatusMessage'
import { COST_LEVEL_LABELS } from '../utils/format'
import './Resources.css'

// Resource finder: local resources by category, filterable by cost and sortable by cheapest
function Resources() {
  const [categories, setCategories] = useState([])
  const [categoryId, setCategoryId] = useState(null) // null = all categories
  const [costLevels, setCostLevels] = useState([])
  const [sort, setSort] = useState('cheapest')
  const [resources, setResources] = useState(null)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let ignore = false
    ResourcesAPI.getCategories()
      .then((rows) => !ignore && setCategories(rows))
      .catch((err) => !ignore && setError(err.message))
    return () => {
      ignore = true
    }
  }, [])

  const costKey = costLevels.join(',')

  useEffect(() => {
    let ignore = false
    ResourcesAPI.getAll({ category_id: categoryId ?? '', cost_level: costKey, sort })
      .then((rows) => {
        if (ignore) return
        setResources(rows)
        setError('')
      })
      .catch((err) => !ignore && setError(err.message))
    return () => {
      ignore = true
    }
  }, [categoryId, costKey, sort, reloadKey])

  const toggleCost = (level) =>
    setCostLevels((prev) => (prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]))

  return (
    <main className="lm-page">
      <div className="lm-page-head">
        <div>
          <h1>Local resources</h1>
          <p>Housing, jobs, study spots, and support programs in your community.</p>
        </div>
      </div>

      <div className="rs-tabs" role="group" aria-label="Resource category">
        <button
          type="button"
          className="rs-tab"
          aria-pressed={categoryId === null}
          onClick={() => setCategoryId(null)}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className="rs-tab"
            aria-pressed={categoryId === c.id}
            onClick={() => setCategoryId(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="lm-filters">
        <div className="lm-filter">
          <span className="lm-filter__label">Cost</span>
          <div className="lm-toggles" role="group" aria-label="Filter by cost">
            {Object.entries(COST_LEVEL_LABELS).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className="lm-toggle"
                aria-pressed={costLevels.includes(value)}
                onClick={() => toggleCost(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <label className="lm-filter">
          <span className="lm-filter__label">Sort by</span>
          <select className="lm-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="cheapest">Cheapest first</option>
            <option value="category">Category</option>
          </select>
        </label>
      </div>

      {error ? (
        <ErrorMessage message={error} onRetry={() => setReloadKey((k) => k + 1)} />
      ) : resources === null ? (
        <Loading label="Loading resources…" />
      ) : resources.length === 0 ? (
        <EmptyState title="No resources match">
          <p>Try another category or cost level.</p>
        </EmptyState>
      ) : (
        <div className="lm-grid">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </main>
  )
}

export default Resources
