import { TemplateFactory, Templates } from '../../types'
import { JSONSchema4 } from 'json-schema'
import { ensureDefaultDependencies } from '../ensure-default-dependencies';

export const ObjectTemplate: TemplateFactory =
  ( document: Document, dependencies: Partial<Templates> = {} ) => {
    const deps = ensureDefaultDependencies( document, dependencies )

    const objectTemplate = ( schema: JSONSchema4 ) => {
      const container = deps.container( schema )

      container.dataset.title = schema.title || 'Object'

      if ( !schema.properties ) return container

      Object.keys( schema.properties ).forEach( key => {
        const childSchema = schema.properties![ key ]

        if ( typeof childSchema.type !== 'string' ) return
        if ( !( childSchema.type in deps ) ) return

        const template = deps[ childSchema.type ]
        const editor = template( childSchema )

        editor.dataset.key = key

        container.appendChild( editor )
      } )

      return container
    }

    return objectTemplate
  }
