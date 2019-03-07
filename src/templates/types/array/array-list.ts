import { JSONSchema4 } from 'json-schema'
import {
  Templates, SchemaTemplate, ContainerTemplateFactory
} from '../../../types'
import { ArrayItemTemplate } from './array-item'
import { getTitle, getChildName } from '../../utils'

export const ArrayListTemplate: ContainerTemplateFactory =
  ( document: Document, templates: Partial<Templates> = {} ) => {
    const arrayListEditor = ( schema: JSONSchema4 = {}, name = '', value?: any[] ) => {
      const container = document.createElement( 'div' )

      container.title = getTitle( schema, name, 'Array List' )

      if ( name ) container.dataset.name = name

      if ( !schema.items || Array.isArray( schema.items ) ) return container

      const childSchema = schema.items

      if ( typeof childSchema.type !== 'string' ) return container

      const template = templates[ childSchema.type ]

      if ( !template ) return container

      const itemTemplate: SchemaTemplate = (
        templates.arrayItem || ArrayItemTemplate( document, templates )
      )

      if( typeof value === 'undefined' && Array.isArray( schema.default ) )
        value = schema.default

      const hasMaxItems = typeof schema.maxItems === 'number'
      const hasMinItems = typeof schema.minItems === 'number'

      let count = (
        Array.isArray( value ) ? value.length :
        hasMaxItems ? schema.maxItems! :
        hasMinItems ? schema.minItems! :
        1
      )

      if( hasMaxItems && count > schema.maxItems! ){
        count = schema.maxItems!
      }

      if( hasMinItems && count < schema.minItems! ){
        count = schema.minItems!
      }

      const list = document.createElement( 'ol' )

      container.appendChild( list )

      for ( let key = 0; key < count; key++ ) {
        let childValue: any = undefined

        if ( Array.isArray( value ) ) {
          childValue = value[ key ]
        }

        const childName = getChildName( name, key )

        const li = itemTemplate( childSchema, childName, childValue )

        list.appendChild( li )
      }

      return container
    }

    return arrayListEditor
  }
