import { JSDOM } from 'jsdom'
import * as contactForm from '../schema/contact-form.schema.json'
import { JSONSchema4 } from 'json-schema'
import { SchemaTemplates } from '../templates/index'

const jsdom = new JSDOM(`<!doctype html>`)

const { document } = jsdom.window
const templates = SchemaTemplates( document )
const objectElement = templates.object( <JSONSchema4>contactForm )

console.log( objectElement.outerHTML )
