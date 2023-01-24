import mongoose from 'mongoose'

const definitionSchema = mongoose.Schema({
  nature: {
    type: [
      {
        type: 'String',
        enum: [
          'adjectif',
          'adverbe',
          'article',
          'conjonction',
          'exclamation',
          'expression',
          'interjection',
          'locution',
          'nom',
          'nom propre',
          'nombre',
          'particule',
          'préfixe',
          'préposition',
          'pronom',
          'suffixe',
          'verbe',
        ],
        required: true,
      },
    ],
  },
  meaning: {
    gp: {
      type: 'String',
    },
    fr: {
      type: 'String',
    },
  },
  usage: {
    type: ['String'],
  },
  synonyms: {
    type: ['String'],
  },
  quotes: {
    type: ['String'],
  },
}, { timestamps: true })

const wordSchema = mongoose.Schema({
  entry: {
    type: 'String',
    required: true,
    unique: true,
  },
  variations: {
    type: ['String'],
    index: true
  },
  definitions: {
    gp: {
      type: [definitionSchema],
    },
  },
  publishedAt: {
    type: 'Date',
    default: null,
    index: true
  }
}, { timestamps: true })

export const wordModel = mongoose.model('Word', wordSchema)
