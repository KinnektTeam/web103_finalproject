import { Link, useNavigate } from 'react-router-dom'
import './account.css'

/* ---------- Placeholder data ----------
   TODO: replace these with the logged-in user and their events
   (e.g. from an auth context or an API call) once login exists.
   Only the shape below needs to stay the same. */
const user = {
  name: 'User name',
  bio: 'Short bio goes here.',
  location: 'City, ST',
  memberSince: 'Month YYYY',
  avatar: null, // image URL, or null to show the default icon
  interests: ['Interest', 'Interest', 'Interest']
}

const upcomingEvents = [
  {
    id: 1,
    date: 'FRI, NOV 13 · 5:00 PM',
    name: 'Neighborhood night market',
    venue: 'Waterfront Park',
    area: 'Downtown',
    category: 'Food & drink',
    image: null
  },
  {
    id: 2,
    date: 'FRI, NOV 20 · 7:30 PM',
    name: 'Live jazz at the courtyard',
    venue: 'The Courtyard',
    area: 'Pearl District',
    category: 'Music',
    image: null
  },
  {
    id: 3,
    date: 'SAT, NOV 21 · 10:00 AM',
    name: 'Saturday morning makers',
    venue: 'Union Hall',
    area: 'Central Eastside',
    category: 'Arts & culture',
    image: null
  }
]

const pastEvents = [
  {
    id: 4,
    date: 'SAT, NOV 7 · 9:00 AM',
    name: 'Forest Park group hike',
    venue: 'Lower Macleay Trailhead',
    area: '',
    category: 'Outdoors',
    image: null
  },
  {
    id: 5,
    date: 'SUN, NOV 8 · 11:00 AM',
    name: 'Clay & coffee workshop',
    venue: 'Studio North',
    area: 'Alberta',
    category: 'Classes',
    image: null
  },
  {
    id: 6,
    date: 'SUN, NOV 8 · 8:30 AM',
    name: 'Sunday community run',
    venue: 'Tom McCall Waterfront Park',
    area: '',
    category: 'Wellness',
    image: null
  }
]

/* ---------- Small pieces ---------- */
function UserIcon({ size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="1.5" />
      <path d="m21 15-4.5-4.5L8 19" />
    </svg>
  )
}

function EventCard({ event, status }) {
  const isUpcoming = status === 'upcoming'
  const location = [event.venue, event.area].filter(Boolean).join(' · ')

  return (
    <article className="ac__card">
      <div className="ac__card-image">
        {event.image ? (
          <img src={event.image} alt={event.name} />
        ) : (
          <div className="ac__card-placeholder">
            <ImageIcon />
            <span>Event image</span>
          </div>
        )}
      </div>

      <div className="ac__card-body">
        <p className="ac__card-date">{event.date}</p>
        <h3 className="ac__card-title">{event.name}</h3>
        <p className="ac__card-meta">{location}</p>
        <p className="ac__card-meta">
          {isUpcoming ? "You're going" : 'You attended this event'}
        </p>

        <div className="ac__card-footer">
          <span className="ac__card-status">
            {isUpcoming ? 'Going' : 'Attended'}
          </span>
          <span className="ac__card-category">{event.category}</span>
        </div>
      </div>
    </article>
  )
}

function EventSection({ title, subtitle, events, status, action }) {
  return (
    <section className="ac__section">
      <div className="ac__inner">
        <div className="ac__section-head">
          <div>
            <h2>
              {title}
              <span className="ac__count">{events.length}</span>
            </h2>
            <p className="ac__section-sub">{subtitle}</p>
          </div>
          {action}
        </div>

        <div className="ac__grid">
          {events.map((event) => (
            <EventCard key={event.id} event={event} status={status} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Page ---------- */
function Account() {
  const navigate = useNavigate()

  const handleEditProfile = () => {
    // TODO: route to your edit profile page
    navigate('/account/edit')
  }

  return (
    <main className="ac">
      {/* Profile */}
      <section className="ac__profile">
        <div className="ac__inner">
          <p className="ac__eyebrow">MY PROFILE</p>

          <div className="ac__profile-main">
            <div className="ac__avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <UserIcon size={44} />
              )}
            </div>

            <div className="ac__profile-info">
              <h1>{user.name}</h1>
              <p className="ac__bio">{user.bio}</p>
              <p className="ac__profile-meta">
                {user.location}
                <span aria-hidden="true">·</span>
                Member since {user.memberSince}
              </p>
            </div>

            <button
              type="button"
              className="ac__btn ac__btn--secondary"
              onClick={handleEditProfile}
            >
              Edit profile
            </button>
          </div>

          <div className="ac__profile-footer">
            <ul className="ac__chips">
              {user.interests.map((interest) => (
                <li key={interest} className="ac__chip">
                  {interest}
                </li>
              ))}
            </ul>
            <p className="ac__stats">
              <strong>{upcomingEvents.length} upcoming</strong>
              <span aria-hidden="true">·</span>
              {pastEvents.length} attended
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming events */}
      <EventSection
        title="Upcoming events"
        subtitle="Your next plans, all in one place."
        events={upcomingEvents}
        status="upcoming"
        action={
          <Link to="/" className="ac__link">
            Discover more events →
          </Link>
        }
      />

      {/* Past events */}
      <EventSection
        title="Past events"
        subtitle="Good times and places you've been."
        events={pastEvents}
        status="past"
        action={<span className="ac__sort">Most recent first</span>}
      />
    </main>
  )
}

export default Account