//тут идет обработка ввода данных нового отчета на странице report
const $reportTitle = document.querySelector('#report-title');
const $reportDescription = document.querySelector('#report-sphere');
const $reportSphere = document.querySelector('#report-description');

$reportTitle.addEventListener('input', ({ target }) => {
    dataComplete.markItem('title', target.value.length > 0);
});

$reportSphere.addEventListener('input', ({ target }) => {
    dataComplete.markItem('sphere', target.value.length > 0);
});

$reportDescription.addEventListener('input', ({ target }) => {
    dataComplete.markItem('description', target.value.length > 0);
});