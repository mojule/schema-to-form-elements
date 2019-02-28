import { JSONSchema4 } from 'json-schema'
import { Templates } from '../../types'

export const ObjectTemplate =
  ( document: Document, templates: Partial<Templates> = {} ) => {
    const objectTemplate = ( schema: JSONSchema4, name = '', defaultValue?: any ) => {
      const container = document.createElement( 'div' )

      container.title = schema.title || 'Object'

      if ( !schema.properties ) return container

      Object.keys( schema.properties ).forEach( key => {
        const childSchema = schema.properties![ key ]

        if ( typeof childSchema.type !== 'string' ) return

        const template = templates[ childSchema.type ]

        if ( !template ) return

        let childDefaultValue: any = undefined

        if( typeof defaultValue === 'object' ){
          childDefaultValue = defaultValue[ key ]
        }

        const childName = name ? `${ name }[${ key }]` : key
        const editor = template( childSchema, childName, childDefaultValue )

        container.appendChild( editor )
      } )

      return container
    }

    return objectTemplate
  }
