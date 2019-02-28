import { Templates } from '../types'
import { ensureDefaultDependencies } from './ensure-default-dependencies'
import { StringTemplate } from './types/string'
import { BooleanTemplate } from './types/boolean'
import { NumberTemplate } from './types/number'
import { StringTextAreaTemplate } from './string-textarea'
import { ObjectTemplate } from './types/object'
import { ArrayTemplate } from './types/array'
import { ArrayItemsTemplate } from './array-items'
import { TupleTemplate } from './tuple'
import { decorateTemplate } from '../decorators/decorate-template'
import { LabelDecorator } from '../decorators/label-decorator'
import { NameDecorator } from '../decorators/name-decorator'

export const SchemaTemplates = ( document: Document, dependencies: Partial<Templates> = {} ) => {
  const deps = ensureDefaultDependencies( document, dependencies )
  const labelDecorator = LabelDecorator( document )
  const nameDecorator = NameDecorator( document )

  deps.array = deps.array || ArrayTemplate( document, deps )
  deps.boolean = deps.boolean || BooleanTemplate( document, deps )
  deps.number = deps.number || NumberTemplate( document, deps )
  deps.object = deps.object || ObjectTemplate( document, deps )
  deps.string = deps.string || StringTemplate( document, deps )
  deps.arrayItems = deps.arrayItems || ArrayItemsTemplate( document, deps )
  deps.stringTextArea = deps.stringTextArea || StringTextAreaTemplate( document, deps )
  deps.tuple = deps.tuple || TupleTemplate( document, deps )

  Object.keys( deps ).forEach( key => {
    deps[ key ] = decorateTemplate( deps[ key ], labelDecorator, nameDecorator )
  })

  return deps
}
