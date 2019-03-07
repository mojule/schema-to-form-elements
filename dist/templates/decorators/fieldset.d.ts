import { SchemaTemplate } from '../../types';
import { JSONSchema4 } from 'json-schema';
export declare const FieldsetDecorator: (document: Document, containerTemplate: SchemaTemplate, useLegend?: boolean) => (schema?: JSONSchema4, name?: string, value?: any[] | undefined) => HTMLFieldSetElement;
