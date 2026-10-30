// Show the back-to-top link once the header has scrolled out of view.
const link = document.querySelector('.to-top');
const header = document.querySelector('header');

new IntersectionObserver(([entry]) => { link.inert = entry.isIntersecting; })
    .observe(header);
