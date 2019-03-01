import { Templates } from '../../types';
import { JSONSchema4 } from 'json-schema';
export declare const ArrayApi: (document: Document, templates?: Partial<Templates>) => {
    arrayApiDecorator: (schema: JSONSchema4, name?: string, defaultValue?: any[] | undefined) => HTMLElement;
    api: any;
};
