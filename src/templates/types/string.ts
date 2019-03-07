import { JSONSchema4 } from 'json-schema'
import { getTitle } from '../utils'
import { StringTemplateFactory } from '../../types'

export const StringTemplate: StringTemplateFactory =
  ( document: Document, isMultiline = false ) => {
    const stringTemplate = ( schema: JSONSchema4 = {}, name = '', value?: string, isRequired = false ) => {
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

      if ( typeof schema.minLength === 'number' ) {
        editor.minLength = schema.minLength
      }

      if ( typeof schema.maxLength === 'number' ) {
        editor.maxLength = schema.maxLength
      }

      return editor
    }

    return stringTemplate
  }
