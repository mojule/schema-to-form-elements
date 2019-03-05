import { JSONSchema4 } from 'json-schema'
import { getTitle } from '../utils';

export const StringTemplate =
  ( document: Document, isMultiline = false ) => {
    const stringTemplate = ( schema: JSONSchema4, name = '', value?: string, isRequired = false ) => {
      let editor: HTMLInputElement | HTMLTextAreaElement

      if( isMultiline ){
        editor = document.createElement( 'textarea' )
      } else {
        editor = document.createElement( 'input' )

        editor.type = 'text'

        if ( schema.pattern ) {
          editor.pattern = schema.pattern
        }
      }

      editor.title = getTitle( schema, name, 'String' )

      if ( isRequired )
        editor.setAttribute( 'required', '' )

      if( name ) editor.name = name

      if ( typeof value === 'string' ) {
        editor.defaultValue = value
      } else if ( typeof schema.default === 'string' ) {
        editor.defaultValue = schema.default
      }

      if ( schema.minLength !== undefined ) {
        editor.minLength = schema.minLength
      }

      if ( schema.maxLength !== undefined ) {
        editor.maxLength = schema.maxLength
      }

      return editor
    }

    return stringTemplate
  }
