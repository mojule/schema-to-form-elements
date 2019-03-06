import { Templates } from '../../types'
import { ArrayTemplate } from './array'
import { BooleanTemplate } from './boolean'
import { NumberTemplate } from './number'
import { ObjectTemplate } from './object'
import { StringTemplate } from './string'

export const TypeTemplates = ( document: Document ) => {
  const templates: Partial<Templates> = {}

  templates.array = ArrayTemplate( document, templates )
  templates.boolean = BooleanTemplate( document )
  templates.number = NumberTemplate( document )
  templates.integer = templates.number
  templates.object = ObjectTemplate( document, templates )
  templates.string = StringTemplate( document )

  return <Templates>templates
}