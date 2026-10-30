const parseCSVLine = line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (inQuotes) {
            if (char === '"' && line[i + 1] === '"') { current += '"'; i++; }
            else if (char === '"') inQuotes = false;
            else current += char;
        } else if (char === '"') inQuotes = true;
        else if (char === ',') { values.push(current.trim()); current = ''; }
        else current += char;
    }
    values.push(current.trim());
    return values;
};

const parseCSV = text => {
    const [header, ...lines] = text.trim().split(/\r?\n/).map(parseCSVLine);
    return lines.map(line => Object.fromEntries(header.map((key, i) => [key, line[i] ?? ''])));
};

export const today = new Date().toISOString().split('T')[0];

export const formatDate = (dateStr, { withYear = false } = {}) =>
    new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', ...(withYear ? { year: 'numeric' } : {})
    });

export const el = (tag, props = {}, ...children) => {
    const node = Object.assign(document.createElement(tag), props);
    node.append(...children);
    return node;
};

export const frag = (...children) => {
    const fragment = document.createDocumentFragment();
    fragment.append(...children);
    return fragment;
};

const LUMA_URL = 'https://luma.com/java-meetup-cologne';

export const VENUE = { street: 'Buttermarkt 24', postalCode: '50667', city: 'Cologne' };

export const venueLabel = `${VENUE.street}, ${VENUE.postalCode} ${VENUE.city} & online via Zoom`;

export const eventUrl = ({ date }) => `event.html?date=${encodeURIComponent(date)}`;

export const renderRegisterButton = () =>
    el('a', {
        className: 'btn-register',
        href: LUMA_URL,
        target: '_blank',
        rel: 'noopener',
        textContent: 'Register',
    });

// Only the next upcoming meetup is open for registration.
export const nextEvent = events =>
    events.filter(e => e.date >= today).toSorted((a, b) => a.date.localeCompare(b.date))[0];

export const loadEvents = () =>
    fetch('data/events.csv')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.text();
        })
        .then(parseCSV);

// Abstracts live in data/abstracts/<date>.md; resolves to null when there is none yet.
export const loadAbstract = ({ date }) =>
    fetch(`data/abstracts/${encodeURIComponent(date)}.md`)
        .then(response => response.ok ? response.text() : null)
        .catch(() => null);

export const eventSchema = (e, description) => ({
    '@type': 'Event',
    name: e.title,
    startDate: `${e.date}T${e.time.split('–')[0]}`,
    endDate:   `${e.date}T${e.time.split('–')[1]}`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    location: [
        {
            '@type': 'Place',
            name: `${VENUE.street}, ${VENUE.city}`,
            address: {
                '@type': 'PostalAddress',
                streetAddress: VENUE.street,
                postalCode: VENUE.postalCode,
                addressLocality: VENUE.city,
                addressCountry: 'DE',
            },
        },
        { '@type': 'VirtualLocation', url: LUMA_URL },
    ],
    organizer: { '@type': 'Organization', name: 'JUG Colonia' },
    ...(description ? { description } : {}),
    ...(e.speaker && e.speaker.toLowerCase() !== 'tba'
        ? { performer: { '@type': 'Person', name: e.speaker } }
        : {}),
});

export const appendSchema = schema => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', ...schema });
    document.head.appendChild(script);
};
