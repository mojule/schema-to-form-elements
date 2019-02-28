import { SchemaTemplate } from '../../types'
import { JSONSchema4 } from 'json-schema'

export const LabelDecorator =
  ( document: Document, template: SchemaTemplate, isSuffix = false ) => {
    const labelDecorator = ( schema: JSONSchema4, name = '', defaultValue?: any[] ) => {
      const editor = template( schema, name, defaultValue )
      const { title } = schema

      if( !title ) return editor

      const label = document.createElement( 'label' )
      const span = document.createElement( 'span' )

      span.innerHTML = title

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