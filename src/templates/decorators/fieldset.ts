import { SchemaTemplate } from '../../types'
import { JSONSchema4 } from 'json-schema'
import { getTitle } from '../utils';

export const FieldsetDecorator =
  ( document: Document, containerTemplate: SchemaTemplate, useLegend = true ) => {
    const fieldsetDecorator = ( schema: JSONSchema4 = {}, name = '', value?: any[] ) => {
      const container = containerTemplate( schema, name, value )
      const title = getTitle( schema, name, 'Container' )
      const fieldset = document.createElement( 'fieldset' )

      if( useLegend ){
        const legend = document.createElement( 'legend' )

        legend.innerHTML = title

        fieldset.appendChild( legend )
      }

      fieldset.appendChild( container )

      return fieldset
    }

    return fieldsetDecorator
  }
