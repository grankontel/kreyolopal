import { useEffect, useMemo, useState } from 'react'
import { Form } from 'react-bulma-components'
import Downshift from 'downshift'
import debounce from 'lodash/debounce'
import { useWabap } from './WabapProvider'
import { useLocation, useNavigate } from 'react-router-dom'

export function SearchBox(props) {
  const [items, setItems] = useState([])
  const wabap = useWabap()
  const location = useLocation()
  const navigate = useNavigate()

  const loadOptions = async (inputValue) => {
    const rep = await wabap.getIndices(inputValue)

    setItems(rep)
  }

  const debounceLoadOptions = useMemo(() => debounce(loadOptions, 300), [])

  useEffect(() => {
    return () => {
      debounceLoadOptions.cancel()
    }
  })

  const renderItems = (getItemProps, highlightedIndex, selectedItem) => {
    return items.map((item, index) => (
      <li
        className="search__option"
        {...getItemProps({
          key: item.value,
          index,
          item,
          style: {
            backgroundColor: highlightedIndex === index ? 'lightgray' : 'white',
            fontWeight: selectedItem?.value === item.value ? 'bold' : 'normal',
          },
        })}
      >
        {item.label}
      </li>
    ))
  }

  return (
    <Form.Control>
      <Downshift
        onChange={(selection) => {
          const ids = selection ? JSON.parse(selection.value) : null
          if (ids) wabap.getArticles(ids)

          if (location.pathname !== '/dictionary') navigate('/dictionary')
        }}
        itemToString={(item) => (item ? item.label : '')}
        onInputValueChange={(inputValue) => debounceLoadOptions(inputValue)}
      >
        {({
          getInputProps,
          getItemProps,
          getLabelProps,
          getMenuProps,
          isOpen,
          inputValue,
          highlightedIndex,
          selectedItem,
          getRootProps,
        }) => (
          <div className="wabap_searchbox">
            <div
              style={{ display: 'inline-block' }}
              {...getRootProps({}, { suppressRefError: true })}
            >
              <input className="search__value-input" {...getInputProps()} />
            </div>
            <ul
              className="search__value-list"
              {...getMenuProps()}
              style={{
                position: 'absolute',
                zIndex: 90,
              }}
            >
              {isOpen
                ? renderItems(getItemProps, highlightedIndex, selectedItem)
                : null}
            </ul>
          </div>
        )}
      </Downshift>
    </Form.Control>
  )
}
export default SearchBox
