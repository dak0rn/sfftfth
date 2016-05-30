/**
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