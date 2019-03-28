import { JSONSchema4 } from 'json-schema'

export type SchemaTemplateFactory =
  ( document: Document, ...deps: any[] ) => SchemaTemplate

export type ContainerTemplateFactory =
  ( document: Document, templates?: Partial<Templates> ) => SchemaTemplate

export type PrimitiveTemplateFactory =
  ( document: Document ) => SchemaTemplate

export type NumberTemplateFactory =
  ( document: Document, isRange?: boolean ) => SchemaTemplate

export type StringTemplateFactory =
  ( document: Document, isMultiline?: boolean ) => SchemaTemplate

export type SchemaTemplate =
  ( schema?: JSONSchema4, name?: string, value?: any, isRequired?: boolean ) => HTMLElement

export interface Templates {
  array: SchemaTemplate
  boolean: SchemaTemplate
  number: SchemaTemplate
  integer: SchemaTemplate
  object: SchemaTemplate
  string: SchemaTemplate
  [ name: string ]: SchemaTemplate
}

export interface StringFormatTemplates extends Partial<Templates> {
  string: SchemaTemplate
}

export type TypedFormEntryValue = string | number | boolean | null

export type TypedFormEntry = [ string, TypedFormEntryValue ]

export type EditorElement =
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
