import { JSONSchema4 } from 'json-schema'

import * as contactFormSchema from './contact-form.schema.json'
import * as stringsSchema from './strings.schema.json'
import * as nestedArraySchema from './nested-array.schema.json'
import * as simpleArraySchema from './simple-array.schema.json'
import * as tupleArraySchema from './tuple-array.schema.json'
import * as metaSchema from './meta.schema.json'

export const contactForm = <JSONSchema4>contactFormSchema
export const stringsForm = <JSONSchema4>stringsSchema
export const tupleArray = <JSONSchema4>tupleArraySchema
export const simpleArray = <JSONSchema4>simpleArraySchema
export const nestedArray = <JSONSchema4>nestedArraySchema
export const meta = <JSONSchema4>metaSchema

