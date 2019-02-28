import { ElementDecorator, Template } from '../types'
import { JSONSchema4 } from 'json-schema'
import { decorateAll } from './decorate-all'

export const decorateTemplate =
  ( template: Template, ...decorators: ElementDecorator[] ): Template =>
    ( schema: JSONSchema4 ) =>
      decorateAll( template( schema ), ...decorators )
