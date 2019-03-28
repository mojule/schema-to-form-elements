import { JSONSchema4 } from 'json-schema'
import { TypedFormEntry, TypedFormEntryValue, EditorElement } from '../types';

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

export const getEntries =
  ( form: HTMLFormElement, allowEmptyValue = true ) => {
    const result: TypedFormEntry[] = []

    const editors = <EditorElement[]>Array.from(
      form.querySelectorAll( 'input, textarea, select' )
    )

    editors.forEach( editor => {
      let { name, value } = editor

      if ( !value && !allowEmptyValue ) {
        return
      }

      let typedValue: TypedFormEntryValue = value

      if (
        name.endsWith( '__number' ) ||
        name.endsWith( '__string' ) ||
        name.endsWith( '__boolean' )
      ){
        name = name.split( '__' )[ 0 ]
      }

      if( editor.type === 'number' )
        typedValue = Number( typedValue )

      if( editor.type === 'checkbox' )
        typedValue = ( <HTMLInputElement>editor ).checked

      result.push( [ name, typedValue ] )
    } )

    return result
  }

export const keyToJsonPointer = ( key: string ) => {
  key = key.replace( /\[/g, '/' )
  key = key.replace( /\]/g, '/' )

  if ( key[ key.length - 1 ] === '/' ) key = key.substr( 0, key.length - 1 )
  if ( !key.startsWith( '/' ) ) key = '/' + key

  return key
}

export const entriesToPointers = ( entries: TypedFormEntry[] ) =>
  entries.map( ( [ key, value ] ) => <TypedFormEntry>[ keyToJsonPointer( key ), value ] )
