import { Templates } from '../types'
import { ArrayTemplate } from './types/array'
import { BooleanTemplate } from './types/boolean'
import { NumberTemplate } from './types/number'
import { ObjectTemplate } from './types/object'
import { StringTemplate } from './types/string'
import { FieldsetDecorator } from './decorators/fieldset'
import { FormatDecorator } from './decorators/format'
import { LabelDecorator } from './decorators/label'

export const FormTemplates = ( document: Document ) => {
  const templates: Partial<Templates> = {}

  templates.array = FieldsetDecorator(
    document,
    ArrayTemplate( document, templates )
  )

  templates.boolean = LabelDecorator(
    document,
    BooleanTemplate( document ), true
  )

  templates.number = LabelDecorator(
    document,
    NumberTemplate( document )
  )

  templates.object = FieldsetDecorator(
    document,
    ObjectTemplate( document, templates )
  )

  templates.string = LabelDecorator(
    document,
    FormatDecorator(
      document,
      {
        string: StringTemplate( document ),
        multiline: StringTemplate( document, true )
      }
    )
  )

  return <Templates>templates
}
