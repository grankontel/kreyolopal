//const dico = require('./converted/needUpdate.json')
const dico = require('./converted/dicofile.json')
const fs = require('fs')
const path = require('path')
const {EOL} = require('os');

// const outputFile = path.join(__dirname, '/converted/needUpdate.csv')
const outputFile = path.join(__dirname, '/converted/dicofile.csv')
const data = [];
data.push(`entry;definition_no;nature;definition_fr;usage;synonyme;`)

dico.forEach((item) => {
  item.definitions.gp.forEach((def, index) => {
    const natures = def.nature.map(n => n.trim().toLowerCase()).join(',')
    const usages = def.usage.map(n => n?.trim()).join(',')
    const synonymes = def.synonyms.map(n => n.trim().toLowerCase()).join(',')
    data.push(`${item.entry.trim().toLowerCase()};${index};${natures};${def.meaning.fr.trim()};${usages};${synonymes};`)
    // console.log(`${item.entry};${index};${natures};${def.meaning.fr};${usages}`)
  })
})

fs.writeFile(
    outputFile,
    '\ufeff' + data.join(EOL),
    { encoding: 'utf8' },
    (err) => {
      if (err) {
        throw err
      }
      console.log('needUpdate is saved.')
    }
  )

