import { JSDOM } from 'jsdom'

import * as simpleArray from '../schema/simple-array.schema.json'
import { JSONSchema4 } from 'json-schema'
import { ArrayTemplate } from '../templates/types/array'
import { NumberTemplate } from '../templates/types/number'
import { ArrayListTemplate } from '../templates/array-list'
import { ArrayListApi } from '../templates/api/array-list'
import { getEntries, entriesToPointers } from './util'
import { Templates } from '../types.js';
import { ArrayItemTemplate } from '../templates/array-item.js';

const schema = <JSONSchema4>simpleArray

const jsdom = new JSDOM( `<!doctype html>` )
const { document } = jsdom.window

const templates: Partial<Templates> = {}

templates.number = NumberTemplate( document )
templates.arrayItem = ArrayItemTemplate( document, templates )
templates.arrayList = ArrayListTemplate( document, templates )
templates.array = ArrayTemplate( document, templates )

const unnamed = templates.array( schema )
const named = templates.array( schema, 'simple-array' )

const simpleArrayApi = ArrayListApi( named, schema, templates )

simpleArrayApi.add( 4 )
simpleArrayApi.add( 5 )
simpleArrayApi.remove( 3 )

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
