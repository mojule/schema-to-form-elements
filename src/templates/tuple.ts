import { JSONSchema4 } from 'json-schema'
import { Templates } from '../types'
import { getTitle } from './utils';

export const TupleTemplate =
  ( document: Document, templates: Partial<Templates> = {} ) => {
    const tupleTemplate = ( schema: JSONSchema4, name = '', value?: any[] ) => {
      const container = document.createElement( 'div' )

      container.title = getTitle( schema, name, 'Tuple' )

      if ( !Array.isArray( schema.items ) ) return container

      schema.items.forEach( ( childSchema, key ) => {
        if ( typeof childSchema.type !== 'string' ) return

        const template = templates[ childSchema.type ]

        if ( !template ) return

        let childValue: any = undefined

        if ( Array.isArray( value ) ) {
          childValue = value[ key ]
        }

        const childName = name ? `${ name }[${ key }]` : `[${ key }]`

        const editor = template( childSchema, childName, childValue )

        container.appendChild( editor )
      } )

      return container
    }

    return tupleTemplate
  }
