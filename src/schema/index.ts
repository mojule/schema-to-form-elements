import { JSONSchema4 } from 'json-schema'

import * as contactForm from '../schema/contact-form.schema.json'
import * as nestedArray from '../schema/nested-array.schema.json'
import * as simpleArray from '../schema/simple-array.schema.json'

export const contactFormSchema = <JSONSchema4>contactForm
export const nestedArraySchema = <JSONSchema4>nestedArray
export const simpleArraySchema = <JSONSchema4>simpleArray
