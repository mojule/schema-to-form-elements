import { JSONSchema4 } from 'json-schema'
import { SchemaTemplate } from '../../types'
import { getTitle } from '../utils'

export const LabelDecorator =
  ( document: Document, inputTemplate: SchemaTemplate, isSuffix = false ) => {
    const labelDecorator = ( schema: JSONSchema4 = {}, name = '', value?: any, isRequired = false ) => {
      const editor = inputTemplate( schema, name, value, isRequired )

      const input = <HTMLInputElement | null>(
        editor.matches( 'input' ) ? editor :
          editor.querySelector( 'input' )
      )

      if( input && input.type === 'hidden' ) return editor

      const label = document.createElement( 'label' )
      const span = document.createElement( 'span' )

      span.innerHTML =
        `${ getTitle( schema, name, 'Input' ) }${ isRequired ? '*' : '' }`

      if( isSuffix ){
        label.appendChild( editor )
        label.appendChild( span )
      } else {
        label.appendChild( span )
        label.appendChild( editor )
      }

      return label
    }

    return labelDecorator
  }
