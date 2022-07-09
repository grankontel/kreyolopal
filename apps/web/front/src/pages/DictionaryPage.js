import { useWabap } from '@kreyolopal/web-ui'
import React from 'react'
import { Heading, Section } from 'react-bulma-components'
import StandardPage from '../layouts/StandardPage'
import _ from 'lodash'

const WordTranslations = ({ translations, languages }) => {
  return (
    <div className="translations">
      {languages.includes('gp') ? (
        <div className="translation translation_gp">{translations['gp']}</div>
      ) : null}

      {languages
        .filter((k) => k !== 'gp')
        .map((lang) => (
          <div className={`translation translation_${lang}`} key={lang}>
            {translations[lang]}
          </div>
        ))}
    </div>
  )
}

export const DictionaryPage = () => {
  const wabap = useWabap()

  return (
    <StandardPage lang="cpf_GP">
      <StandardPage.Head
        title="Kreyolopal | Dictionnaire"
        description="Correcteur orthographique en ligne pour le créole."
      />
      <Section>
        <Heading size={2} renderAs="h1">
          Dictionnaire
        </Heading>
        {wabap.articles.map((article, index) => {
          return (
            <article key={index} className="wabap_word">
              <Heading size={4} renderAs="h2">
              {wabap.articles.length> 1 ? `${index+1}. `  : null } 
                {article.wfs.map((item, wf_index) => (
                  <span key={wf_index}>
                    <strong>{item}</strong>
                    {index < article.wfs.length - 1 ? ' / ' : ''}
                  </span>
                ))}
              </Heading>
              {article.defs.map((def, index) => {
                const nature = (def.nat || '').replace(' ', '')
                const translations = def.tsl
                const languages = _.keys(translations)
                const synonyms = def.syns

                return (
                  <div key={index} className="definition">
                    {nature.length > 0 ? (
                      <div className="nature">{nature}</div>
                    ) : null}

                    {languages.length > 0 ? (
                      <WordTranslations
                        translations={translations}
                        languages={languages}
                      />
                    ) : null}

                    {synonyms.length ? (
                      <div className="synonyms">
                        <Heading size={6} renderAs="h3">
                          Synonymes
                        </Heading>
                        <ul>
                          {synonyms.map((item, index) => {
                            return <li key={index}>{item}</li>
                          })}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </article>
          )
        })}
      </Section>
    </StandardPage>
  )
}

export default DictionaryPage
