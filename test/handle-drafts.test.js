/**
 * Copyright 2016 Daniel Koch
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*
 * Tests for the `handle-drafts` module
 */
const test = require('tape');
const handleDrafts = require('../lib/handle-drafts');
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

    handleDrafts(Immutable.Map({ renderDrafts: false }), files)
        .then( filtered => {
            t.equal(filtered.count(), 2);
            filtered.forEach( file => t.false( !! file.getIn(['meta', 'draft']) ) );
        })
        .catch( e => t.fail(e) )
        .then( () => t.end() );
});

test('handle-drafts; Keeps drafts if renderDrafts=true', t => {

    t.plan(1);

    handleDrafts(Immutable.Map({ renderDrafts: true }), files)
        .then( filtered => {
            t.equal(filtered.count(), files.count());
        })
        .catch( e => t.fail(e) )
        .then( () => t.end() );
});