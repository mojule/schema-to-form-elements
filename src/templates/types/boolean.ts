import { JSONSchema4 } from 'json-schema'
import { getTitle } from '../utils';
import { PrimitiveTemplateFactory } from '../../types'

export const BooleanTemplate: PrimitiveTemplateFactory =
  ( document: Document ) => {
    const booleanTemplate = ( schema: JSONSchema4, name = '', value?: boolean, isRequired = false ) => {
      const editor = document.createElement( 'input' )

      editor.type = 'checkbox'
      editor.title = getTitle( schema, name, 'Boolean' )

      if( isRequired )
        editor.setAttribute( 'required', '' )

      if( name ) editor.name = name

      if( typeof value === 'boolean' ){
        if( value ) editor.setAttribute( 'checked', '' )
      } else if ( typeof schema.default === 'boolean' ){
        if ( schema.default ) editor.setAttribute( 'checked', '' )
      }

      return editor
    }

    return booleanTemplate
  }
