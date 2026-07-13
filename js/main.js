
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

const el = (tag, props = {}, ...children) => {
    const node = Object.assign(document.createElement(tag), props);
    node.append(...children);
    return node;
};

const frag = (...children) => {
    const fragment = document.createDocumentFragment();
    fragment.append(...children);
    return fragment;
};

const renderCard = ({ date, time, title, speaker }) =>
    el('article', { className: 'meetup-card' },
        el('time', { dateTime: date, textContent: formatDate(date) }),
        el('p', { textContent: time }),
        el('h3', { textContent: title }),
        el('p', { textContent: speaker }));

const groupByYear = events =>
    events.reduce((groups, event) => {
        const year = event.date.slice(0, 4);
        return { ...groups, [year]: [...(groups[year] ?? []), event] };
    }, {});

const renderYearGroups = events =>
    frag(...Object.entries(groupByYear(events))
        .sort(([a], [b]) => b - a)
        .flatMap(([year, group]) => [
            el('h3', { textContent: year }),
            el('div', { className: 'meetup-grid' }, ...group.map(renderCard)),
        ]));

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

        document.getElementById('upcoming-container').replaceChildren(
            upcoming.length ? renderYearGroups(upcoming) : el('p', { textContent: 'No upcoming events.' }));

        document.getElementById('past-container').replaceChildren(renderYearGroups(past));

        renderEventListSchema(upcoming);
    })
    .catch(error => {
        console.error('Could not load events:', error);
        document.getElementById('upcoming-container').replaceChildren(el('p', { textContent: 'Could not load events.' }));
    });
