import { JSONSchema4 } from 'json-schema'
import { TemplateFactory } from '../types'

export const ContainerTemplate: TemplateFactory = ( document: Document ) => {
  const containerTemplate = ( schema: JSONSchema4 ) => {
    const container = document.createElement( 'div' )

    container.dataset.title = schema.title || 'Container'
    container.dataset.container = ''

    if ( typeof schema.type === 'string' )
      container.dataset.type = schema.type

    return container
  }

  return containerTemplate
}