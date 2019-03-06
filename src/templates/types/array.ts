import { JSONSchema4 } from 'json-schema'
import { Templates, SchemaTemplate, ContainerTemplateFactory } from '../../types'
import { TupleTemplate } from '../tuple'
import { ArrayListTemplate } from '../array-list'

export const ArrayTemplate: ContainerTemplateFactory =
  ( document: Document, templates: Partial<Templates> = {} ) => {
    const arrayTemplate = ( schema: JSONSchema4, name = '', value?: any[] ) => {
      if(
        typeof value === 'undefined' &&
        Array.isArray( schema.default )
      ){
        value = schema.default
      }

      const template: SchemaTemplate = (
        Array.isArray( schema.items ) ?
        templates.tuple || TupleTemplate( document, templates ) :
        templates.arrayList || ArrayListTemplate( document, templates )
      )

      return template( schema, name, value )
    }

    return arrayTemplate
  }
