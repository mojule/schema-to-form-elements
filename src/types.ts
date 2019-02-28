import { JSONSchema4 } from 'json-schema'

export type Template<T = HTMLElement> = ( schema: JSONSchema4 ) => T

export type TemplateFactory<T = HTMLElement> = ( document: Document, dependencies?: Partial<Templates> ) => Template<T>

export interface Templates {
  container: Template
  input: Template<HTMLInputElement>
  [ name: string ]: Template
}

export type ElementDecorator = ( element: HTMLElement ) => HTMLElement

export type ElementDecoratorFactory = ( document: Document ) => ElementDecorator