import { JSONSchema4 } from 'json-schema'
import { Templates } from '../../types'

export const ArrayTemplate =
  ( document: Document, templates: Partial<Templates> = {} ) => {
    const arrayTemplate = ( schema: JSONSchema4, name = '', defaultValue?: any[] ) => {
      if(
        typeof defaultValue === 'undefined' &&
        Array.isArray( schema.default )
      ){
        defaultValue = schema.default
      }

      if ( Array.isArray( schema.items ) && templates.tuple ) {
        return templates.tuple( schema, name, defaultValue )
      }

      if ( schema.items && templates.arrayItems ) {
        return templates.arrayItems( schema, name, defaultValue )
      }

      const container = document.createElement( 'div' )

      container.title = schema.title || 'Array'
      if( name ) container.dataset.name = name

      return container
    }

    return arrayTemplate
  }
