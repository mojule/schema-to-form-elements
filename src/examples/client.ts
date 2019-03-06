import { JSONSchema4 } from 'json-schema'
import * as contactFormJson from '../schema/contact-form.schema.json'
import * as nestedArrayJson from '../schema/nested-array.schema.json'
import { SchemaToFormElements } from '../'
import { ClientFormTemplates } from '../templates'

const schemaToFormElements = SchemaToFormElements( document )
const contactFormSchema = <JSONSchema4>contactFormJson
const contactForm = document.createElement( 'form' )
contactForm.appendChild( schemaToFormElements( contactFormSchema, 'contact-form' ) )
document.body.appendChild( contactForm )


const nestArraySchema = <JSONSchema4>nestedArrayJson
const clientTemplates = ClientFormTemplates( document )
const schemaToClientFormElements = SchemaToFormElements(
  document, clientTemplates
)
const mutableListForm = document.createElement( 'form' )
mutableListForm.appendChild( schemaToClientFormElements( nestArraySchema, 'nested-array' ))
document.body.appendChild( mutableListForm )