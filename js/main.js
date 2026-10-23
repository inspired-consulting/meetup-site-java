import {
    today, formatDate, el, frag, eventUrl, renderRegisterButton, nextEvent, loadEvents, eventSchema, appendSchema,
} from './events.js';

const renderCard = (event, { isNext = false } = {}) => {
    const { date, time, title, speaker } = event;
    return el('article', { className: 'meetup-card' },
        el('time', { dateTime: date, textContent: formatDate(date) }),
        el('p', { textContent: time }),
        el('h3', {}, el('a', { href: eventUrl(event), textContent: title })),
        el('p', { textContent: speaker }),
        ...(isNext ? [renderRegisterButton()] : []));
};

const groupByYear = events =>
    events.reduce((groups, event) => {
        const year = event.date.slice(0, 4);
        return { ...groups, [year]: [...(groups[year] ?? []), event] };
    }, {});

const renderYearGroups = (events, next) =>
    frag(...Object.entries(groupByYear(events))
        .sort(([a], [b]) => b - a)
        .flatMap(([year, group]) => [
            el('h3', { textContent: year }),
            el('div', { className: 'meetup-grid' }, ...group.map(event => renderCard(event, { isNext: event === next }))),
        ]));

const renderEventListSchema = upcoming => {
    if (!upcoming.length) return;
    appendSchema({
        '@type': 'ItemList',
        itemListElement: upcoming.map((e, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: { ...eventSchema(e), url: new URL(eventUrl(e), location.href).href },
        })),
    });
};

loadEvents()
    .then(events => {
        const upcoming = events.filter(e => e.date >= today);
        const past     = events.filter(e => e.date <  today).toReversed();

        document.getElementById('upcoming-container').replaceChildren(
            upcoming.length ? renderYearGroups(upcoming, nextEvent(events)) : el('p', { textContent: 'No upcoming events.' }));

        document.getElementById('past-container').replaceChildren(renderYearGroups(past));

        renderEventListSchema(upcoming);
    })
    .catch(error => {
        console.error('Could not load events:', error);
        document.getElementById('upcoming-container').replaceChildren(el('p', { textContent: 'Could not load events.' }));
    });
