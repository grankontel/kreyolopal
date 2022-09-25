import React from 'react'
import { Heading, Section } from 'react-bulma-components'
import StandardPage from '../layouts/StandardPage'
import { useParams } from 'react-router-dom'
import { Spinner } from '@kreyolopal/web-ui'

import useSWR from 'swr'

const fetcher = (...args) => fetch(...args).then((res) => res.json())
function getDefintion(lang, word) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data, error } = useSWR(`/api/dictionary/${lang}/${word}`, fetcher)

  return {
    entries: data,
    isLoading: !error && !data,
    isError: error,
  }
}

const NeoDicoPage = () => {
  const { lang, word } = useParams()
  const { entries, isLoading, isError } = getDefintion(lang, word)

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
        {isLoading ? (
          <Spinner />
        ) : isError || entries.length === 0 ? (
          <div>Error</div>
        ) : (
          <div>
            {entries.map((item, index) => {
              return (
                <article key={item.id} className="dico_word">
                  <Heading size={4} renderAs="h2">
                    {item.entry}
                  </Heading>
                  {item.definitions.map((def, index) => {
                    const nature = def.nature.join(', ')
                    return (
                      <div key={index} className="definition">
                        <div className="nature">{nature}</div>
                        <div className="translations">
                          <div className="translation translation_gp">
                            {def.meaning['gp']}
                          </div>
                          <div className="translation translation_fr">
                            {def.meaning['fr']}
                          </div>
                        </div>
                        {def.usage.length > 0 ? (
                        <div className="usage">
                          {def.usage.map((example, ex_index) => (
                            <div className="example " key={ex_index}>
                              {example}
                            </div>
                          ))}
                        </div>
                        ) : null}

                        {def.synonyms.length > 0 ? (
                          <div className="synonyms">
                            <Heading size={5} renderAs="h3">
                              Voir aussi
                            </Heading>
                            {def.synonyms.map((example, ex_index) => (
                              <div className="synonym" key={ex_index}>
                                {example}
                              </div>
                            ))}
                          </div>
                        ) : null}

                      </div>
                    )
                  })}
                </article>
              )
            })}
          </div>
        )}
      </Section>
    </StandardPage>
  )
}

export default NeoDicoPage
