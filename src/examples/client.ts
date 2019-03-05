import { JSONSchema4 } from 'json-schema'
import * as contactFormJson from '../schema/contact-form.schema.json'
import * as nestedArrayJson from '../schema/nested-array.schema.json'
import { SchemaToFormElements } from '../'
import { FormTemplates } from '../templates'
import { MutableArrayList } from '../templates/decorators/mutable-array-list'
import { ArrayListTemplate } from '../templates/array-list'
import { ArrayItemTemplate } from '../templates/array-item'


const templates = FormTemplates( document )
const schemaToFormElements = SchemaToFormElements( document )


const contactFormSchema = <JSONSchema4>contactFormJson
const contactForm = document.createElement( 'form' )
contactForm.appendChild( schemaToFormElements( contactFormSchema, 'contact-form' ) )
document.body.appendChild( contactForm )


const nestArraySchema = <JSONSchema4>nestedArrayJson
const arrayList = ArrayListTemplate( document, templates )
const arrayItem = ArrayItemTemplate( document, templates )
const {
  mutableArrayListDecorator, mutableArrayItemDecorator
} = MutableArrayList( document, arrayList, arrayItem, templates )
templates.arrayList = mutableArrayListDecorator
templates.arrayItem = mutableArrayItemDecorator
const schemaToFormElementsWithMutableList = SchemaToFormElements( document, templates )
const mutableListForm = document.createElement( 'form' )
mutableListForm.appendChild( schemaToFormElementsWithMutableList( nestArraySchema, 'nested-array' ))
document.body.appendChild( mutableListForm )