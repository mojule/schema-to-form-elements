import { Templates } from '../types'
import { ArrayTemplate } from './types/array'
import { BooleanTemplate } from './types/boolean'
import { NumberTemplate } from './types/number'
import { ObjectTemplate } from './types/object'
import { StringTemplate } from './types/string'
import { FieldsetDecorator } from './decorators/fieldset'
import { FormatDecorator } from './decorators/format'
import { LabelDecorator } from './decorators/label'
import {
  MutableArrayListDecorator, MutableArrayItemDecorator
} from './decorators/mutable-array-list'
import { ArrayListTemplate } from './types/array/array-list'
import { ArrayItemTemplate } from './types/array/array-item'
import { SelectDecorator } from './decorators/select';
import { ConstDecorator } from './decorators/const';

export const ServerFormTemplates = ( document: Document ) => {
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
    ConstDecorator(
      document,
      NumberTemplate( document )
    )
  )

  templates.integer = templates.number

  templates.object = FieldsetDecorator(
    document,
    ObjectTemplate( document, templates )
  )

  templates.string = LabelDecorator(
    document,
    ConstDecorator(
      document,
      SelectDecorator(
        document,
        FormatDecorator(
          document,
          {
            string: StringTemplate( document ),
            multiline: StringTemplate( document, true )
          }
        ),
        schema => Array.isArray( schema.enum ) && schema.enum.length > 1
      )
    )
  )

  return <Templates>templates
}

export const ClientFormTemplates = ( document: Document, Event ) => {
  const templates = ServerFormTemplates( document )

  templates.arrayList = FieldsetDecorator(
    document,
    MutableArrayListDecorator(
      document,
      Event,
      ArrayListTemplate( document, templates ),
      templates
    )
  )

  templates.arrayItem = MutableArrayItemDecorator(
    document,
    ArrayItemTemplate( document, templates )
  )

  return templates
}
