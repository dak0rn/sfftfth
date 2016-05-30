/**
 * Tests for the `handle-drafts` module
 */
const test = require('tape');
const handleDrafts = require('../lib/handleDrafts');
const Immutable = require('immutable');

const files = Immutable.fromJS([
    { meta: { draft: true } },
    { meta: { draft: true } },
    { meta: { draft: false } },
    { meta: { } },
    { meta: { draft: true } }
]);

test('handle-drafts; Exports a function', t => {
    t.plan(1);
    t.equal(typeof handleDrafts, 'function');
    t.end();
});

test('handle-drafts; Removes drafts if renderDrafts=false', t => {

    t.plan(3);

    const filtered = handleDrafts(Immutable.Map({ renderDrafts: false }), files);

    t.equal(filtered.count(), 2);
    filtered.forEach( file => t.false( !! file.getIn(['meta', 'draft']) ) );

    t.end();
});

test('handle-drafts; Keeps drafts if renderDrafts=true', t => {

    t.plan(1);

    const filtered = handleDrafts(Immutable.Map({ renderDrafts: true }), files);

    t.equal(filtered.count(), files.count());

    t.end();
});