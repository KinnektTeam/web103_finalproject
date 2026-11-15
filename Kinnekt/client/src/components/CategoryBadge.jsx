// Color dot + category name (the name is always shown so color isn't the only cue)
function CategoryBadge({ name, color }) {
  return (
    <span className="lm-badge">
      <span className="lm-swatch" style={{ background: color }} aria-hidden="true" />
      {name}
    </span>
  )
}

export default CategoryBadge
