import { JSONSchema4 } from 'json-schema'

export const getTitle = ( schema: JSONSchema4, name = '', fallback = 'Schema' ) =>
  schema.title || name || fallback

export const getChildName = ( name: string, key: any ) =>
  name ? `${ name }[${ key }]` : String( key )

export const H =
  <K extends keyof HTMLElementTagNameMap>( document: Document, name: K ) =>
    (
      attributes: { [ key: string ]: any } = {},
      ...children: Node[]
    ): HTMLElementTagNameMap[ K ] => {
      const el = document.createElement( name )

      Object.keys( attributes ).forEach( name =>
        el.setAttribute( name, String( attributes[ name ] ) )
      )

      children.forEach( child => el.appendChild( child ) )

      return el
    }

export const Form = ( document: Document ) =>
  H( document, 'form' )

export const GetEntries = ( FormData: {
  new( form?: HTMLFormElement | undefined ): FormData;
  prototype: FormData;
} ) =>
  ( form: HTMLFormElement ) => {
    form.querySelectorAll( 'input' ).forEach( input => {
      input.value = input.value || ''
    } )

    const formData = new FormData( form )

    return Array.from( formData.entries() ).map(
      ( [ key, value ] ) => [ key, String( value ) ]
    )
  }

export const keyToJsonPointer = ( key: string ) => {
  key = key.replace( /\[/g, '/' )
  key = key.replace( /\]/g, '/' )

  if ( key[ key.length - 1 ] === '/' ) key = key.substr( 0, key.length - 1 )
  if ( !key.startsWith( '/' ) ) key = '/' + key

  return key
}

export const entriesToPointers = ( entries: string[][] ) =>
  entries.map( ( [ key, value ] ) => [ keyToJsonPointer( key ), value ] )
