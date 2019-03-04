import { JSDOM } from 'jsdom'

import * as nestedArray from '../schema/nested-array.schema.json'
import { JSONSchema4 } from 'json-schema'
import { ArrayTemplate } from '../templates/types/array'
import { NumberTemplate } from '../templates/types/number'
import { ArrayItemsTemplate } from '../templates/array-items'
import { ArrayItemsApi } from '../templates/api/array-items'
import { getEntries, entriesToPointers } from './util'
import { Templates } from '../types.js';

const schema = <JSONSchema4>nestedArray

const jsdom = new JSDOM( `<!doctype html>` )
const { document } = jsdom.window

const templates: Partial<Templates> = {}

templates.number = NumberTemplate( document )
templates.arrayItems = ArrayItemsTemplate( document, templates )
const { arrayItemsDecorator, arrayItemsApi } = ArrayItemsApi( document, templates )
templates.arrayItems = arrayItemsDecorator
templates.array = ArrayTemplate( document, templates )

const unnamed = templates.array( schema )

const named = templates.array( schema, 'nested-array' )

arrayItemsApi[ 'nested-array' ].add( [ 5, 6 ] )
arrayItemsApi[ 'nested-array' ].add( [ 7, 8 ] )
arrayItemsApi[ 'nested-array' ].remove( 3 )

const unnamedEntries = getEntries( jsdom.window, unnamed )
const namedEntries = getEntries( jsdom.window, named )

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
