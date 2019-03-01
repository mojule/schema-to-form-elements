import { DOMWindow } from 'jsdom'

export const getEntries = ( window: DOMWindow, element: HTMLElement ) => {
  const { document, FormData } = window

  const form = document.createElement( 'form' )

  form.appendChild( element )

  // workaround for jsdom bug https://github.com/jsdom/jsdom/issues/2523
  form.querySelectorAll( 'input' ).forEach( input => {
    input.value = input.value || ''
  } )

  const formData = new FormData( form )

  return Array.from( formData.entries() ).map(
    ([ key, value ]) => [ key, String( value ) ]
  )
}

export const keyToPointer = ( key: string ) => {
  key = key.replace( /\[/g, '/' )
  key = key.replace( /\]/g, '/' )

  if( key[ key.length - 1 ] === '/' ) key = key.substr( 0, key.length - 1 )
  if( !key.startsWith( '/' ) ) key = '/' + key

  return key
}

export const entriesToPointers = ( entries: string[][] ) =>
  entries.map( ( [ key, value ] ) => [ keyToPointer( key ), value ] )
