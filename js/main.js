
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
    return lines.map(line => Object.fromEntries(header.map((key, i) => [key, line[i]])));
};

const today = new Date().toISOString().split('T')[0];

const formatDate = dateStr =>
    new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
    });

const renderCard = ({ date, time, title, speaker }) => `
    <article class="meetup-card">
        <time datetime="${date}">${formatDate(date)}</time>
        <p>${time}</p>
        <h3>${title}</h3>
        <p>${speaker}</p>
    </article>`;

const groupByYear = events =>
    events.reduce((groups, event) => {
        const year = event.date.slice(0, 4);
        return { ...groups, [year]: [...(groups[year] ?? []), event] };
    }, {});

const renderYearGroups = events =>
    Object.entries(groupByYear(events))
        .sort(([a], [b]) => b - a)
        .map(([year, group]) => `
            <h3>${year}</h3>
            <div class="meetup-grid">${group.map(renderCard).join('')}</div>
        `).join('');

const renderEventListSchema = upcoming => {
    if (!upcoming.length) return;
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: upcoming.map((e, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
                '@type': 'Event',
                name: e.title,
                startDate: `${e.date}T${e.time.split('–')[0]}`,
                endDate:   `${e.date}T${e.time.split('–')[1]}`,
                eventStatus: 'https://schema.org/EventScheduled',
                organizer: { '@type': 'Organization', name: 'JUG Colonia' },
                ...(e.speaker && e.speaker.toLowerCase() !== 'tba'
                    ? { performer: { '@type': 'Person', name: e.speaker } }
                    : {}),
            },
        })),
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
};

fetch('data/events.csv')
    .then(response => response.text())
    .then(parseCSV)
    .then(events => {
        const upcoming = events.filter(e => e.date >= today);
        const past     = events.filter(e => e.date <  today).toReversed();

        document.getElementById('upcoming-container').innerHTML =
            upcoming.length ? renderYearGroups(upcoming) : '<p>No upcoming events.</p>';

        document.getElementById('past-container').innerHTML =
            renderYearGroups(past);

        renderEventListSchema(upcoming);
    })
    .catch(error => {
        console.error('Could not load events:', error);
        document.getElementById('upcoming-container').innerHTML = '<p>Could not load events.</p>';
    });
