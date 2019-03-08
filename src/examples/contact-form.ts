import * as contactForm from '../schema/contact-form.schema.json'
import { JSONSchema4 } from 'json-schema'
import { ObjectTemplate } from '../templates/types/object'
import { StringTemplate } from '../templates/types/string'
import { LabelDecorator } from '../templates/decorators/label'
import { FieldsetDecorator } from '../templates/decorators/fieldset'
import { FormatDecorator } from '../templates/decorators/format'
import { entriesToPointers, getEntries } from '../templates/utils'
import { document, form } from '../server/dom'

const schema = <JSONSchema4>contactForm

const stringTemplate = StringTemplate( document )
const objectTemplate = ObjectTemplate( document, { string: stringTemplate } )

const unnamed = objectTemplate( schema )

const named = objectTemplate( schema, 'contact' )

const multilineStringTemplate = StringTemplate( document, true )
const formattedStringTemplate = FormatDecorator( document, {
  string: stringTemplate,
  multiline: multilineStringTemplate
})
const labelledStringTemplate = LabelDecorator( document, formattedStringTemplate )
const labelledObjectTemplate = ObjectTemplate( document, { string: labelledStringTemplate } )
const fieldsetObjectTemplate = FieldsetDecorator( document, labelledObjectTemplate )

const decorated = fieldsetObjectTemplate( schema )


const unnamedEntries = getEntries( form( {}, unnamed ) )
const namedEntries = getEntries( form( {}, unnamed ) )

export const contactFormExample = {
  'Unnamed Contact Form': unnamed.outerHTML,
  'Named Contact Form': named.outerHTML,
  'Decorated Contact Form': decorated.outerHTML,
  'Unnamed Contact Form Data': JSON.stringify( unnamedEntries, null, 2 ),
  'Named Contact Form Data': JSON.stringify( namedEntries, null, 2 ),
  "Unnamed Contact Form Pointers": JSON.stringify(
    entriesToPointers( unnamedEntries ), null, 2
  ),
  "Named Contact Form Pointers": JSON.stringify(
    entriesToPointers( namedEntries ), null, 2
  )
}
