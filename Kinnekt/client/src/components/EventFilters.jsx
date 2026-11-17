import ColorPicker from './ColorPicker'
import { EMPTY_EVENT_FILTERS } from '../utils/eventFilters'

const GROUP_SIZE_OPTIONS = [
  { value: '', label: 'Any size' },
  { value: 'one_on_one,small', label: 'Small group or one-on-one' },
  { value: 'one_on_one', label: 'One-on-one' },
  { value: 'small', label: 'Small group' },
  { value: 'large', label: 'Large group' }
]

const COST_OPTIONS = [
  { value: '', label: 'Any price' },
  { value: '0', label: 'Free' },
  { value: '10', label: 'Under $10' },
  { value: '25', label: 'Under $25' }
]

// Presenter: shows the current filters and reports changes through onChange(nextFilters)
function EventFilters({ categories, filters, onChange }) {
  const toggleCategory = (id) => {
    const categoryIds = filters.categoryIds.includes(id)
      ? filters.categoryIds.filter((c) => c !== id)
      : [...filters.categoryIds, id]
    onChange({ ...filters, categoryIds })
  }

  const hasFilters = filters.categoryIds.length || filters.groupSize || filters.maxCost

  return (
    <div className="lm-filters">
      <div className="lm-filter">
        <span className="lm-filter__label">Colors</span>
        <ColorPicker
          categories={categories}
          selectedIds={filters.categoryIds}
          onToggle={toggleCategory}
          label="Filter by color"
        />
      </div>

      <label className="lm-filter">
        <span className="lm-filter__label">Group size</span>
        <select
          className="lm-select"
          value={filters.groupSize}
          onChange={(e) => onChange({ ...filters, groupSize: e.target.value })}
        >
          {GROUP_SIZE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="lm-filter">
        <span className="lm-filter__label">Cost</span>
        <select
          className="lm-select"
          value={filters.maxCost}
          onChange={(e) => onChange({ ...filters, maxCost: e.target.value })}
        >
          {COST_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      {hasFilters ? (
        <button type="button" className="lm-link-btn" onClick={() => onChange(EMPTY_EVENT_FILTERS)}>
          Clear filters
        </button>
      ) : null}
    </div>
  )
}

export default EventFilters
