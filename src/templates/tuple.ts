import { JSONSchema4 } from 'json-schema'
import { TemplateFactory, Templates } from '../types'
import { ensureDefaultDependencies } from './ensure-default-dependencies';

export const TupleTemplate: TemplateFactory =
( document: Document, options: Partial<Templates> = {} ) => {
  const opts = ensureDefaultDependencies( document, options )

  const tupleTemplate = ( schema: JSONSchema4 ) => {
    const container = opts.container( schema )

    container.dataset.title = schema.title || 'Tuple'

    if ( !Array.isArray( schema.items ) ) return container

    schema.items.forEach( ( childSchema, key ) => {
      if ( typeof childSchema.type !== 'string' ) return
      if ( !( childSchema.type in opts ) ) return

      const template = opts[ childSchema.type ]
      const editor = template( childSchema )

      editor.dataset.key = String( key )

      container.appendChild( editor )
    } )

    return container
  }

  return tupleTemplate
}
