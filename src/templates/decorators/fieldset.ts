import { SchemaTemplate } from '../../types'
import { JSONSchema4 } from 'json-schema'

export const FieldsetDecorator =
  ( document: Document, template: SchemaTemplate, useLegend = true ) => {
    const fieldsetDecorator = ( schema: JSONSchema4, name = '', defaultValue?: any[] ) => {
      const editor = template( schema, name, defaultValue )
      const { title } = schema

      const fieldset = document.createElement( 'fieldset' )

      if( title && useLegend ){
        const legend = document.createElement( 'legend' )

        legend.innerHTML = title

        fieldset.appendChild( legend )
      }

      fieldset.appendChild( editor )

      return fieldset
    }

    return fieldsetDecorator
  }