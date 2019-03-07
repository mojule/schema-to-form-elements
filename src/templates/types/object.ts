import { JSONSchema4 } from 'json-schema'
import { Templates, ContainerTemplateFactory } from '../../types'
import { getTitle, getChildName } from '../utils'

export const ObjectTemplate: ContainerTemplateFactory =
  ( document: Document, templates: Partial<Templates> = {} ) => {
    const objectTemplate = ( schema: JSONSchema4 = {}, name = '', value?: any ) => {
      const container = document.createElement( 'div' )

      container.title = getTitle( schema, name, 'Object' )

      if ( name ) container.dataset.name = name

      if ( !schema.properties ) return container

      if( typeof value === 'undefined' && typeof schema.default !== 'undefined' )
        value = schema.default

      const required = schema.required || []

      Object.keys( schema.properties ).forEach( key => {
        const childSchema = schema.properties![ key ]

        if ( typeof childSchema.type !== 'string' ) return

        const template = templates[ childSchema.type ]

        if ( !template ) return

        let childValue: any = undefined

        if( typeof value === 'object' ){
          childValue = value[ key ]
        }

        const isRequired = required.includes( key )

        const childName = getChildName( name, key )
        const editor = template( childSchema, childName, childValue, isRequired )

        container.appendChild( editor )
      } )

      return container
    }

    return objectTemplate
  }
