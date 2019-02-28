import { JSONSchema4 } from 'json-schema'
import { TemplateFactory, Templates } from '../../types'
import { ensureDefaultDependencies } from '../ensure-default-dependencies'

export const ArrayTemplate: TemplateFactory =
  ( document: Document, dependencies: Partial<Templates> = {} ) => {
    const deps = ensureDefaultDependencies( document, dependencies )

    const arrayTemplate = ( schema: JSONSchema4 ) => {
      const container = deps.container( schema )

      container.dataset.title = schema.title || 'Array'

      if ( Array.isArray( schema.items ) && deps.tuple ) {
        return deps.tuple( schema )
      }

      if ( schema.items && deps.arrayItems ) {
        return deps.arrayItems( schema )
      }

      return container
    }

    return arrayTemplate
  }
