// Toggle chips for interest colors. Used by the Account color picker and the event filters.
function ColorPicker({ categories, selectedIds, onToggle, label }) {
  return (
    <div className="lm-toggles" role="group" aria-label={label}>
      {categories.map((category) => {
        const selected = selectedIds.includes(category.id)
        return (
          <button
            key={category.id}
            type="button"
            className="lm-toggle"
            aria-pressed={selected}
            onClick={() => onToggle(category.id)}
          >
            <span className="lm-swatch" style={{ background: category.color }} aria-hidden="true" />
            {category.name}
          </button>
        )
      })}
    </div>
  )
}

export default ColorPicker
