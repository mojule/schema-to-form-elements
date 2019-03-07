import { JSONSchema4 } from 'json-schema'
import { Templates, ContainerTemplateFactory } from '../../../types'
import { TupleTemplate } from './tuple'
import { ArrayListTemplate } from './array-list'

export const ArrayTemplate: ContainerTemplateFactory =
  ( document: Document, templates: Partial<Templates> = {} ) => {
    const arrayTemplate = ( schema: JSONSchema4 = {}, name = '', value?: any[] ) => {
      if(
        typeof value === 'undefined' &&
        Array.isArray( schema.default )
      ){
        value = schema.default
      }

      if( Array.isArray( schema.items ) ){
        if( templates.tuple ){
          return templates.tuple( schema, name, value )
        }

        return TupleTemplate( document, templates )( schema, name, value )
      }

      if( templates.arrayList ){
        return templates.arrayList( schema, name, value )
      }

      return ArrayListTemplate( document, templates )( schema, name, value )
    }

    return arrayTemplate
  }
