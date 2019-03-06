import { JSONSchema4 } from 'json-schema';
export declare const getTitle: (schema: JSONSchema4, name?: string, fallback?: string) => string;
export declare const H: <K extends "object" | "font" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "link" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "small" | "source" | "span" | "strong" | "style" | "sub" | "sup" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(document: Document, name: K) => (attributes?: {
    [key: string]: any;
}, ...children: Node[]) => HTMLElementTagNameMap[K];
export declare const Form: (document: Document) => (attributes?: {
    [key: string]: any;
}, ...children: Node[]) => HTMLFormElement;
export declare const GetEntries: (FormData: {
    new (form?: HTMLFormElement | undefined): FormData;
    prototype: FormData;
}) => (form: HTMLFormElement) => string[][];
export declare const keyToJsonPointer: (key: string) => string;
export declare const entriesToPointers: (entries: string[][]) => string[][];
