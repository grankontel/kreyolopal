import React, { useState } from 'react'

const WabapContext = React.createContext(null)

export function WabapProvider(props) {
  const [part, setPart] = useState('')
  const [indices, setIndices] = useState([])
  const [articles, setArticles] = useState([])

  const getIndices = (word) => {
    return fetch(`/api/v1/articles/indices/gp/${encodeURIComponent(word)}/0`, {
      method: 'GET',
      credentials: 'same-origin',
    })
      .then(
        (result) => {
          if (!result.ok) {
            setPart(word)
            setIndices([])
            return []
          }

          console.log(result)
          const response = result.json()
          const data = response?.sample.map((item) => {
            return {
              value: JSON.stringify(item.ids),
              label: item.wfs[0],
            }
          })
          setPart(word)
          setIndices(data)
          return data
        },
        (reason) => {
          console.log(reason)
          setPart(word)
          setIndices([])
          return []
        }
      )
      .catch((er) => {
        console.log(er)
        setPart(word)
        setIndices([])
        return []
      })
  }

  const getArticles = (ids) => {
    const values = []
    setArticles([])
    ids.forEach(async (id) => {
      await fetch(`/api/v1/articles/${encodeURIComponent(id)}`, {
        method: 'GET',
        credentials: 'same-origin',
      }).then(
        (result) => {
          if (!result.ok) {
            return
          }

          values.push(result.json())
        },
        (reason) => {
          console.log(reason)
        }
      )
    })
    setArticles(values)
    return values
  }

  const wabap = { searchWord: part, indices, articles, getIndices, getArticles }

  return (
    <WabapContext.Provider value={wabap}>
      {props.children}
    </WabapContext.Provider>
  )
}

export function useWabap() {
  return React.useContext(WabapContext)
}

export default WabapProvider
