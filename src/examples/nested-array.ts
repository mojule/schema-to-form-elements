import * as nestedArray from '../schema/nested-array.schema.json'
import { JSONSchema4 } from 'json-schema'
import { ArrayTemplate } from '../templates/types/array'
import { NumberTemplate } from '../templates/types/number'
import { ArrayListTemplate } from '../templates/types/array/array-list'
import { ArrayListApi } from '../templates/api/array-list'
import { Templates } from '../types'
import { ArrayItemTemplate } from '../templates/types/array/array-item'
import { entriesToPointers, getEntries } from '../templates/utils'
import { document, form } from '../server/dom'

const schema = <JSONSchema4>nestedArray

const templates: Partial<Templates> = {}

templates.number = NumberTemplate( document )
templates.arrayItem = ArrayItemTemplate( document, templates )
templates.arrayList = ArrayListTemplate( document, templates )
templates.array = ArrayTemplate( document, templates )

const unnamed = templates.array( schema )

const named = templates.array( schema, 'nested-array' )

const namedApi = ArrayListApi( document, named, schema, templates )

namedApi.add( [ 5, 6 ] )
namedApi.add( [ 7, 8 ] )
namedApi.remove( 3 )

const unnamedEntries = getEntries( form( {}, unnamed ) )
const namedEntries = getEntries( form( {}, named ) )

export const nestedArrayExample = {
  'Unnamed Nested Array': unnamed.outerHTML,
  'Named Nested Array': named.outerHTML,
  'Unnamed Nested Array Data': JSON.stringify( unnamedEntries, null, 2 ),
  'Named Nested Array Data': JSON.stringify( namedEntries, null, 2 ),
  "Unnamed Nested Array Pointers": JSON.stringify(
    entriesToPointers( unnamedEntries ), null, 2
  ),
  "Named Nested Array Pointers": JSON.stringify(
    entriesToPointers( namedEntries ), null, 2
  ),
}
