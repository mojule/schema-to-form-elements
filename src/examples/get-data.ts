import { getEntries, entriesToPointers } from '../templates/utils'
import { expand } from '@mojule/json-pointer'

export const getData = ( form: HTMLFormElement ) => {
  const entries = getEntries( form, false )
  const pointers = entriesToPointers( entries )

  const map: any = {}

  pointers.forEach( ([ pointer, value ]) => {
    map[ pointer ] = value
  })

  return expand( map )
}
