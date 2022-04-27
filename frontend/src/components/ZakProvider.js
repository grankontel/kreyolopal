import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
const zakariClient = require('../lib/lib.zakariClient')

const ZakContext = React.createContext(null)

const Protected = ({ to, children }) => {
  const auth = React.useContext(ZakContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (auth.user === null) {
      navigate(to)
    }
  })

  return children
}

class ZakProvider extends React.Component {
  constructor(props) {
    super(props)
    this.client = zakariClient(window.location.origin)
  }

  render() {
    return (
      <ZakContext.Provider value={this.client}>
        {this.props.children}
      </ZakContext.Provider>
    )
  }
}

ZakProvider.Protected = Protected

export function useZakari() {
  return React.useContext(ZakContext)
}

export default ZakProvider
