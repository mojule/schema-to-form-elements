import { JSDOM } from 'jsdom'

import * as simpleArray from '../schema/simple-array.schema.json'
import { JSONSchema4 } from 'json-schema'
import { ArrayTemplate } from '../templates/types/array'
import { NumberTemplate } from '../templates/types/number'
import { ArrayItemsTemplate } from '../templates/array-items'
import { ArrayItemsApi } from '../templates/api/array-items'
import { getEntries, entriesToPointers } from './util'

const schema = <JSONSchema4>simpleArray

const jsdom = new JSDOM( `<!doctype html>` )
const { document } = jsdom.window

const numberTemplate = NumberTemplate( document )
const arrayItemsTemplate = ArrayItemsTemplate( document, { number: numberTemplate } )
const { arrayItemsDecorator, arrayItemsApi } = ArrayItemsApi( document, { number: numberTemplate, arrayItems: arrayItemsTemplate } )
const arrayTemplate = ArrayTemplate( document, { number: numberTemplate, arrayItems: arrayItemsDecorator } )

const unnamed = arrayTemplate( schema )

const named = arrayTemplate( schema, 'simple-array' )

arrayItemsApi[ 'simple-array' ].add( 4 )
arrayItemsApi[ 'simple-array' ].add( 5 )
arrayItemsApi[ 'simple-array' ].remove( 3 )

const unnamedEntries = getEntries( jsdom.window, unnamed )
const namedEntries = getEntries( jsdom.window, named )

export const simpleArrayExample = {
  'Unnamed Simple Array': unnamed.outerHTML,
  'Named Simple Array': named.outerHTML,
  'Unnamed Simple Array Data': JSON.stringify( unnamedEntries, null, 2 ),
  'Named Simple Array Data': JSON.stringify( namedEntries, null, 2 ),
  "Unnamed Simple Array Pointers": JSON.stringify(
    entriesToPointers( unnamedEntries ), null, 2
  ),
  "Naamed Simple Array Pointers": JSON.stringify(
    entriesToPointers( namedEntries ), null, 2
  ),
}
