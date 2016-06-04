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
 * Fixture setup utilities
 */
const prunk = require('prunk');

const getKeysToRemove = smth => {
    if( 'string' === typeof smth )
        return [smth];

    if( ! smth )
        return [];

    return smth;
};

module.exports = {

    /**
     * Resets the test double injections by resetting
     * prunk's cache as well as the registry of `require`.
     *
     * @param  {array<string>=|string}  imports  List of imports or single import to remove from `require`.
     *                                           Default: none
     */
    resetTestDoubles(imports) {

        getKeysToRemove(imports)
                .map( file => require.resolve(file) )
                .forEach( key => delete require.cache[key] );

        prunk.unmockAll();
        prunk.unsuppressAll();
        prunk.unaliasAll();
    }
};