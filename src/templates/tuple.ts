import { JSONSchema4 } from 'json-schema'
import { Templates } from '../types'

export const TupleTemplate =
  ( document: Document, templates: Partial<Templates> = {} ) => {
  const tupleTemplate = ( schema: JSONSchema4, name = '', defaultValue?: any[] ) => {
    const container = document.createElement( 'div' )

    container.title = schema.title || 'Tuple'

    if ( !Array.isArray( schema.items ) ) return container

    schema.items.forEach( ( childSchema, key ) => {
      if ( typeof childSchema.type !== 'string' ) return

      const template = templates[ childSchema.type ]

      if ( !template ) return

      let childDefaultValue: any = undefined

      if ( Array.isArray( defaultValue ) ) {
        childDefaultValue = defaultValue[ key ]
      }

      const childName = name ? `${ name }[${ key }]` : String( key )

      const editor = template( childSchema, childName, childDefaultValue )

      container.appendChild( editor )
    } )

    return container
  }

  return tupleTemplate
}
