const dicoSource    = require('./lib.s3-dicofile')
const nspell        = require('nspell')
const NodeCache     = require( "node-cache" );
const myCache       = new NodeCache();


const puncRegex = new RegExp("^[^A-Za-z0-9_]+$", 'g');
const withDigits = new RegExp("^([A-Za-z]*)[0-9]+([A-Za-z]*)$", 'g');
const isSpace = new RegExp("^\s+$", 'g');

/**
 * Verify spelling for a string
 * @param {string} src String to spellcheck
 * @param {string} kreyol Wich kreyol
 */
async function nspell_spellcheck(src, kreyol) {
    let  affix ='', dictionary =''

    var value = myCache.get( "dicofiles" );
    if (value !== undefined) {
        affix= value.affix
        dictionary=value.dictionary
    } else {
        value = await dicoSource.readDicoFiles(kreyol)
        myCache.set('dicofiles', value)
        affix= value.affix
        dictionary=value.dictionary
    }
  
    var diko     = nspell(affix, dictionary)

    //make an array from string
    const source = src.split(' ');
    var hunspelled = []

    //build the hunspelled array
    for (let index = 0; index < source.length; index++) {
        const word = source[index];

        //empty
        if (word.length ==0 || isSpace.test(word)) {
            continue;
        }

        //non character
        if (puncRegex.test(word)) {
            hunspelled.push({word: word, isCorrect: true})
            continue;
        }

        //non character
        if (withDigits.test(word)) {
            hunspelled.push({word: word, isCorrect: true})
            continue;
        }
        
        let isCorrect = diko.correct(word)
        hunspelled.push({word: word, isCorrect: isCorrect})
    }

    //add the suggestions
    for (let index = 0; index < hunspelled.length; index++) {
        const element = hunspelled[index];

        if (!element.isCorrect) {

            let suggestions = diko.suggest(element.word)
            element.suggestions = suggestions;
        }
    }

    const rep_reducer = (acc, item) => {
        let nl = item.isCorrect ? item.word
        : (
            item.suggestions.length ? item.suggestions[0]
            : `~${item.word}~`
        )

        acc.push(nl);

        return acc
    }

    var response = hunspelled.reduce(rep_reducer, []).join(' ');

    const errors = hunspelled
        .filter(item => !item.isCorrect && !item.suggestions.length)
        .map(el  => el.word)

    const reponse = {
        source: src,
        message: response,
        unknown_words: errors
    }

    diko = undefined;

    return reponse
}

module.exports=nspell_spellcheck;