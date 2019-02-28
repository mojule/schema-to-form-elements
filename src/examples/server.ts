import { JSDOM } from 'jsdom'
import * as contactForm from '../schema/contact-form.schema.json'
import { JSONSchema4 } from 'json-schema'
import { ObjectTemplate } from '../templates/types/object'
import { StringTemplate } from '../templates/types/string'
import { LabelDecorator } from '../templates/decorators/label'
import { FieldsetDecorator } from '../templates/decorators/fieldset.js';
import { FormatDecorator } from '../templates/decorators/format.js';

const schema = <JSONSchema4>contactForm

const jsdom = new JSDOM( `<!doctype html>` )
const { document } = jsdom.window

const stringTemplate = StringTemplate( document )
const objectTemplate = ObjectTemplate( document, { string: stringTemplate } )

console.log( 'Unnamed object: ' )

const unnamed = objectTemplate( schema )

console.log( unnamed.outerHTML )

console.log( '\nNamed object: ' )

const named = objectTemplate( schema, 'contact' )

console.log( named.outerHTML )

console.log( '\nWith decorators: ' )

const multilineStringTemplate = StringTemplate( document, true )
const formattedStringTemplate = FormatDecorator( document, stringTemplate, multilineStringTemplate )
const labelledStringTemplate = LabelDecorator( document, formattedStringTemplate )
const labelledObjectTemplate = ObjectTemplate( document, { string: labelledStringTemplate } )
const fieldsetObjectTemplate = FieldsetDecorator( document, labelledObjectTemplate )

const decorated = fieldsetObjectTemplate( schema )

console.log( decorated.outerHTML )
