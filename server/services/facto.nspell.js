const nspell = require('nspell')

const createSpellchecker = (affix, dictionary) => {
  const diko = nspell(affix, dictionary)
  return {
    check: (word) => diko.correct(word),
    suggest: (word) => diko.suggest(word),
  }
}

module.exports = createSpellchecker
