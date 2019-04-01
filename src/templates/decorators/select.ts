import { SchemaTemplate } from '../../types'
import { JSONSchema4 } from 'json-schema'
import { getTitle } from '../utils'

export const SelectDecorator = (
  document: Document, stringTemplate: SchemaTemplate,
  predicate = ( _schema: JSONSchema4 ) => true
) => {
  const selectDecorator = ( schema: JSONSchema4 = {}, name = '', value?: string, isRequired = false ) => {
    if( !Array.isArray( schema.enum ) || !predicate( schema ) )
      return stringTemplate( schema, name, value, isRequired )

    if( !schema.enum.every( value => typeof value === 'string' ) )
      throw Error( 'Expected enum to be an array of strings' )

    const enumValues = <string[]>schema.enum

    const editor: HTMLSelectElement = document.createElement( 'select' )

    editor.title = getTitle( schema, name, 'String' )

    if ( isRequired )
      editor.setAttribute( 'required', '' )

    if ( name ) editor.name = name

    enumValues.forEach( ( enumValue: string, i ) => {
      const option: HTMLOptionElement = document.createElement( 'option' )

      const title: string = (
        schema[ '_enumTitles' ] && schema[ '_enumTitles' ][ i ] ?
        schema[ '_enumTitles' ][ i ] :
        enumValue
      )

      option.value = enumValue
      option.innerHTML = title

      if ( typeof value === 'string' ) {
        option.selected = enumValue === value
      } else if ( typeof schema.default === 'string' ) {
        option.selected = enumValue === schema.default
      }

      editor.appendChild( option )
    })

    return editor
  }

  return selectDecorator
}
