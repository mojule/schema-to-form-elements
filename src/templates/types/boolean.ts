import { JSONSchema4 } from 'json-schema'
import { getTitle } from '../utils';

export const BooleanTemplate =
  ( document: Document ) => {
    const booleanTemplate = ( schema: JSONSchema4, name = '', value?: boolean, isRequired = false ) => {
      const editor = document.createElement( 'input' )

      editor.type = 'checkbox'
      editor.title = getTitle( schema, name, 'Boolean' )

      if( isRequired )
        editor.setAttribute( 'required', '' )

      if( name ) editor.name = name

      if( typeof value === 'boolean' ){
        editor.checked = value
      } else if ( typeof schema.default === 'boolean' ){
        editor.checked = schema.default
      }

      return editor
    }

    return booleanTemplate
  }
