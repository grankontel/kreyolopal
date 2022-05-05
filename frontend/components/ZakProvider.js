import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import zakariClient from '../lib/lib.zakariClient'

const ZakContext = React.createContext(null)

const Protected = ({ to, children }) => {
  const auth = React.useContext(ZakContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (auth !== null && auth.user === null) {
      navigate(to)
    }
  }, [])

  return children
}

const ZakProvider = (props) => {
  const [client, setClient] = useState(null)

  useEffect(() => {
    setClient(
      typeof window !== 'undefined' && window
        ? zakariClient(window.location.origin)
        : null
    )
  }, [])
  return (
    <ZakContext.Provider value={client}>{props.children}</ZakContext.Provider>
  )
}

/* class ZakProvider extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      client:
        typeof window !== 'undefined' && window
          ? zakariClient(window.location.origin)
          : null,
    }
  }

  render() {
    return (
      <ZakContext.Provider value={this.state.client}>
        {this.props.children}
      </ZakContext.Provider>
    )
  }
}
 */
ZakProvider.Protected = Protected

export function useZakari() {
  return React.useContext(ZakContext)
}

export default ZakProvider
