import { JSDOM } from 'jsdom'

import * as nestedArray from '../schema/nested-array.schema.json'
import { JSONSchema4 } from 'json-schema'
import { ArrayTemplate } from '../templates/types/array'
import { NumberTemplate } from '../templates/types/number'
import { ArrayItemsTemplate } from '../templates/array-items'
import { ArrayApi } from '../templates/api/array'
import { getEntries, entriesToPointers } from './util'
import { Templates } from '../types.js';

const schema = <JSONSchema4>nestedArray

const jsdom = new JSDOM( `<!doctype html>` )
const { document } = jsdom.window

const templates: Partial<Templates> = {}

const { arrayApiDecorator, api } = ArrayApi( document, templates )

templates.number = NumberTemplate( document )
templates.arrayItems = ArrayItemsTemplate( document, templates )
templates.array = ArrayTemplate( document, templates )


const unnamed = templates.array( schema )

const named = templates.array( schema, 'nested-array' )

// api[ 'nested-array' ].add( [ 5, 6 ] )
// api[ 'nested-array' ].add( [ 7, 8 ] )
// api[ 'nested-array' ].remove( 3 )

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
  "Naamed Nested Array Pointers": JSON.stringify(
    entriesToPointers( namedEntries ), null, 2
  ),
}
