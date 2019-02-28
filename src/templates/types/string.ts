import { JSONSchema4 } from 'json-schema'

export const StringTemplate =
  ( document: Document, isMultiline = false ) => {
    const stringTemplate = ( schema: JSONSchema4, name = '', defaultValue?: string ) => {
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

      editor.title = schema.title || 'String'

      if( name ) editor.name = name

      if ( typeof defaultValue === 'string' ) {
        editor.defaultValue = defaultValue
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
