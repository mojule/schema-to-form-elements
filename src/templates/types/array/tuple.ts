import { JSONSchema4 } from 'json-schema'
import { Templates, ContainerTemplateFactory } from '../../../types'
import { getTitle, getChildName } from '../../utils'

export const TupleTemplate: ContainerTemplateFactory =
  ( document: Document, templates: Partial<Templates> = {} ) => {
    const tupleTemplate = ( schema: JSONSchema4 = {}, name = '', value?: any[], isRequired = false ) => {
      const container = document.createElement( 'div' )

      container.title = getTitle( schema, name, 'Tuple' )

      if ( name ) container.dataset.name = name

      if ( !Array.isArray( schema.items ) ) return container

      if ( typeof value === 'undefined' && Array.isArray( schema.default ) )
        value = schema.default

      schema.items.forEach( ( childSchema, key ) => {
        if ( typeof childSchema.type !== 'string' ) return

        const template = templates[ childSchema.type ]

        if ( !template ) return

        let childValue: any = undefined

        if ( Array.isArray( value ) ) {
          childValue = value[ key ]
        }

        const childName = getChildName( name, key )

        const editor = template( childSchema, childName, childValue, isRequired )

        container.appendChild( editor )
      } )

      return container
    }

    return tupleTemplate
  }
