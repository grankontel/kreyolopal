import { useEffect, useMemo, useState } from 'react'
import { Form } from 'react-bulma-components'
import AsyncSelect from 'react-select/async'
import debounce from 'lodash/debounce';
import { useWabap } from './WabapProvider';

const response = {
  count: 258,
  sample: [
    {
      ids: [2871, 2870, 2869, 2868, 2867, 2866, 2865, 2864],
      wfs: ['ka'],
    },
    {
      ids: [2873, 2872],
      wfs: ['kab'],
    },
    {
      ids: [2876, 2875, 2874],
      wfs: ['kabann', 'kabanné'],
    },
    {
      ids: [2877],
      wfs: ['kabanné'],
    },
    {
      ids: [2878],
      wfs: ['kabaré'],
    },
    {
      ids: [2879],
      wfs: ['kabé', 'kabèt'],
    },
    {
      ids: [2881, 2880],
      wfs: ['kabèch'],
    },
    {
      ids: [2883, 2882],
      wfs: ['kabiné'],
    },
    {
      ids: [2884],
      wfs: ['kabodas'],
    },
  ],
}

const data = response.sample.map((item) => {
  return {
    value: JSON.stringify(item.ids),
    label: item.wfs[0],
  }
})

export function SearchBox(props) {
  const [selected, setSelected] = useState('')
  const wabap = useWabap()

  const loadOptions = async (inputValue, callback) => {
    const rep = await wabap.getIndices(inputValue)
    console.log(inputValue)
    console.log(rep)
    callback(rep)
  }

  const debounceLoadOptions = useMemo(
    () =>  debounce(loadOptions, 300)
  ,[])

  useEffect(()=> {

    return () => {
      debounceLoadOptions.cancel()
    }
  })

  return (
    <Form.Control>
      <AsyncSelect
        className="wabap_searchbox"
        classNamePrefix="search"
        placeholder="Rechercher..."
        value={selected}
        onChange={(sel) => {
          console.log('selected', sel)
          setSelected(sel.value)
        }}
        loadOptions={debounceLoadOptions}
        getOptionValue={(option) => {
          return `${option['id']}`
        }}
      />
    </Form.Control>
  )
}
export default SearchBox
