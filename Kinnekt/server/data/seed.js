// Sample data for `npm run reset`.
// Foreign keys use array indexes (e.g. category: 0 = Nature); reset.js converts them to real ids.
// Event dates are relative to the day you run the reset (days_from_now + hour, Pacific time) so they are always upcoming.

export const categories = [
    { name: 'Nature', color: '#2E8B57' },        // 0 green
    { name: 'Pets', color: '#8B5A2B' },          // 1 brown
    { name: 'Entertainment', color: '#FF8C00' }, // 2 orange
    { name: 'Food & Drink', color: '#C0392B' },  // 3 red
    { name: 'Fitness', color: '#2E86DE' },       // 4 blue
    { name: 'Arts & Crafts', color: '#8E44AD' }, // 5 purple
    { name: 'Tech', color: '#566573' },          // 6 gray
    { name: 'Music', color: '#D4AC0D' }          // 7 yellow
]

export const attendees = [
    { name: 'Maya Patel', email: 'maya@example.com', life_stage: 'new_to_town' },      // 0
    { name: 'Jordan Lee', email: 'jordan@example.com', life_stage: 'recent_grad' },    // 1
    { name: 'Sam Rivera', email: 'sam@example.com', life_stage: 'student' },           // 2
    { name: 'Priya Shah', email: 'priya@example.com', life_stage: 'relocating' },      // 3
    { name: 'Alex Kim', email: 'alex@example.com', life_stage: 'new_to_town' },        // 4
    { name: 'Chris Nguyen', email: 'chris@example.com', life_stage: 'student' }        // 5
]

export const attendeeInterests = [
    { attendee: 0, category: 0 }, { attendee: 0, category: 1 }, { attendee: 0, category: 3 },
    { attendee: 1, category: 2 }, { attendee: 1, category: 6 }, { attendee: 1, category: 7 },
    { attendee: 2, category: 4 }, { attendee: 2, category: 0 },
    { attendee: 3, category: 5 }, { attendee: 3, category: 3 },
    { attendee: 4, category: 0 }, { attendee: 4, category: 1 }, { attendee: 4, category: 4 },
    { attendee: 5, category: 6 }, { attendee: 5, category: 2 }
]

export const events = [
    {
        title: 'Sunrise Hike at Lake Trail',
        description: 'An easy 3-mile loop with a coffee stop at the end. Beginners welcome!',
        days_from_now: 3, hour: 7, location: 'Lake Trail Parking Lot', category: 0,
        group_size: 'small', cost: 0, organizer: 0
    },
    {
        title: 'Dog Park Meetup',
        description: 'Bring your pup and meet other pet owners in the neighborhood.',
        days_from_now: 5, hour: 10, location: 'Riverside Dog Park', category: 1,
        group_size: 'large', cost: 0, organizer: 4
    },
    {
        title: 'Comedy Night Downtown',
        description: 'Local stand-up comics. Grab a seat with the group near the front.',
        days_from_now: 8, hour: 20, location: 'The Laugh Box, 120 Main St', category: 2,
        group_size: 'large', cost: 15, ticket_url: 'https://example.com/tickets/comedy-night', organizer: 1
    },
    {
        title: 'Coffee & Conversation',
        description: 'A low-key one-on-one chat for anyone new to the area.',
        days_from_now: 2, hour: 9, location: 'Bean There Cafe', category: 3,
        group_size: 'one_on_one', cost: 5, organizer: 3
    },
    {
        title: 'Beginner Pottery Workshop',
        description: 'Learn to throw a bowl on the wheel. All materials included.',
        days_from_now: 12, hour: 14, location: 'Clay Studio, 45 Oak Ave', category: 5,
        group_size: 'small', cost: 35, ticket_url: 'https://example.com/tickets/pottery', organizer: 3
    },
    {
        title: 'Hack Night for Students',
        description: 'Work on side projects, get help with homework, and meet other builders.',
        days_from_now: 6, hour: 18, location: 'Campus Library Room 204', category: 6,
        group_size: 'small', cost: 0, organizer: 5
    }
]

export const rsvps = [
    { event: 0, attendee: 2, status: 'going' },
    { event: 0, attendee: 4, status: 'going' },
    { event: 0, attendee: 1, status: 'maybe' },
    { event: 1, attendee: 0, status: 'going' },
    { event: 2, attendee: 5, status: 'going' },
    { event: 2, attendee: 3, status: 'not_going' },
    { event: 3, attendee: 0, status: 'maybe' },
    { event: 5, attendee: 1, status: 'going' },
    { event: 5, attendee: 2, status: 'maybe' }
]

export const resourceCategories = [
    'Student Housing',   // 0
    'Jobs',              // 1
    'Study Spots',       // 2
    'Recovery Programs'  // 3
]

export const resources = [
    { name: 'Campus Housing Office', description: 'Help finding dorms, shared rentals, and sublets near campus.', cost_level: 'free', category: 0 },
    { name: 'Maple Street Co-op', description: 'Student co-op with shared kitchens and monthly rent below market rate.', cost_level: 'low', category: 0 },
    { name: 'Downtown Studio Lofts', description: 'Furnished studios with flexible leases for students and interns.', cost_level: 'high', category: 0 },
    { name: 'City Workforce Center', description: 'Free resume reviews, job boards, and interview practice.', cost_level: 'free', category: 1 },
    { name: 'Career Bootcamp Weekend', description: 'Two-day intensive on networking and job applications.', cost_level: 'medium', category: 1 },
    { name: 'Central Public Library', description: 'Quiet floors, free Wi-Fi, and bookable study rooms.', cost_level: 'free', category: 2 },
    { name: 'The Daily Grind Cafe', description: 'Coffee shop with long tables and outlets; buy a drink to stay.', cost_level: 'low', category: 2 },
    { name: 'Community Recovery Center', description: 'Free meetings, counseling referrals, and peer support groups.', cost_level: 'free', category: 3 },
    { name: 'Disaster Relief Housing Desk', description: 'Emergency shelter and rebuilding help for displaced residents.', cost_level: 'free', category: 3 },
    { name: 'Wellness Counseling Group', description: 'Sliding-scale counseling sessions with licensed therapists.', cost_level: 'low', category: 3 }
]
