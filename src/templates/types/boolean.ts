import { JSONSchema4 } from 'json-schema'

export const BooleanTemplate =
  ( document: Document ) => {
    const booleanTemplate = ( schema: JSONSchema4, name = '', defaultValue?: boolean ) => {
      const editor = document.createElement( 'input' )

      editor.type = 'checkbox'
      editor.title = schema.title || 'Boolean'

      if( name ) editor.name = name

      if( typeof defaultValue === 'boolean' ){
        editor.checked = defaultValue
      } else if ( typeof schema.default === 'boolean' ){
        editor.checked = schema.default
      }

      return editor
    }

    return booleanTemplate
  }
