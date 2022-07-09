import React, { useState } from 'react'

const WabapContext = React.createContext(null)

export function WabapProvider(props) {
  const [part, setPart] = useState('')
  const [indices, setIndices] = useState([])
  const [articles, setArticles] = useState([])

  const getIndices = (word) => {
    return fetch(`/api/articles/indices/gp/${encodeURIComponent(word)}/0`, {
      method: 'GET',
      credentials: 'same-origin',
    })
      .then(
        async (result) => {
          if (!result.ok) {
            setPart(word)
            setIndices([])
            return []
          }

          const response = await result.json()

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

  const getArticles = async (ids) => {
    const values = []
    setArticles([])
    const promises = ids.map((id) => {
      return fetch(`/api/articles/${encodeURIComponent(id)}`, {
        method: 'GET',
        credentials: 'same-origin',
      }).then(
        async (result) => {
          console.log(result)
          if (!result.ok) {
            return
          }

          const item = await result.json()
          values.push(item)
        },
        (reason) => {
          console.log(reason)
        }
      )
    })
    
    Promise.all(promises)
    .then(() => {
      console.log('*** values',values)
      setArticles(values)
  
    })
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
