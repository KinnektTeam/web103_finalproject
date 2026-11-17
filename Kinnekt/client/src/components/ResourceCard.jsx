import { COST_LEVEL_LABELS } from '../utils/format'

function ResourceCard({ resource }) {
  return (
    <article className="rs-card">
      <div className="rs-card__top">
        <span className="rs-card__category">{resource.category_name}</span>
        <span className={`rs-card__cost rs-card__cost--${resource.cost_level}`}>
          {COST_LEVEL_LABELS[resource.cost_level]}
        </span>
      </div>
      <h3 className="rs-card__title">{resource.name}</h3>
      {resource.description && <p className="rs-card__desc">{resource.description}</p>}
    </article>
  )
}

export default ResourceCard
