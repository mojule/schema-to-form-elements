import { JSONSchema4 } from 'json-schema'
import { Templates } from '../../types'

export const ArrayTemplate =
  ( document: Document, templates: Templates ) => {
    const arrayTemplate = ( schema: JSONSchema4, name = '', defaultValue?: any[] ) => {
      if ( Array.isArray( schema.items ) && templates.tuple ) {
        return templates.tuple( schema, name, defaultValue )
      }

      if ( schema.items && templates.arrayItems ) {
        return templates.arrayItems( schema, name, defaultValue )
      }

      const container = document.createElement( 'div' )

      container.title = schema.title || 'Array'

      return container
    }

    return arrayTemplate
  }
