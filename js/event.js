import {
    formatDate, el, eventUrl, renderRegisterButton, nextEvent, loadEvents, loadAbstract, eventSchema, appendSchema,
} from './events.js';
import { renderMarkdown, markdownSummary } from './markdown.js';

const container = document.getElementById('event-container');
const date = new URLSearchParams(location.search).get('date');

const renderNotFound = () =>
    container.replaceChildren(
        el('h1', { textContent: 'Meetup not found' }),
        el('p', { textContent: 'There is no meetup on this date. ' },
            el('a', { href: './', textContent: 'See all meetups' }), '.'));

const renderEvent = (event, abstract, { isNext }) => {
    const { date, time, title, speaker } = event;
    container.replaceChildren(
        el('time', { dateTime: date, textContent: formatDate(date, { withYear: true }) }),
        el('p', { className: 'event-time', textContent: time }),
        el('h1', { textContent: title }),
        abstract
            ? el('div', { className: 'event-abstract' }, renderMarkdown(abstract))
            : el('p', { className: 'event-abstract event-abstract--empty', textContent: 'Abstract coming soon.' }),
        ...(isNext ? [renderRegisterButton()] : []));
};

const updateMeta = (event, description) => {
    const url = new URL(eventUrl(event), location.href).href;
    document.title = `${event.title} — JUG Colonia`;
    document.querySelector('link[rel="canonical"]').href = url;
    document.querySelector('meta[property="og:url"]').content = url;
    document.querySelector('meta[property="og:title"]').content = event.title;
    if (description) {
        document.querySelector('meta[name="description"]').content = description;
        document.querySelector('meta[property="og:description"]').content = description;
    }
};

loadEvents()
    .then(async events => {
        const event = events.find(e => e.date === date);
        if (!event) return renderNotFound();

        const abstract = await loadAbstract(event);
        const description = abstract && markdownSummary(abstract);

        renderEvent(event, abstract, { isNext: event === nextEvent(events) });
        updateMeta(event, description);
        appendSchema(eventSchema(event, description));
    })
    .catch(error => {
        console.error('Could not load event:', error);
        container.replaceChildren(el('p', { textContent: 'Could not load event.' }));
    });
