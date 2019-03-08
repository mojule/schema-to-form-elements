# schema-forms

Generate HTML forms from [JSON Schema](https://json-schema.org/)

This module attempts to provide a toolkit which is small, simple and flexible
enough to cover all use cases

todo: rationale, toc, example code, playground, full documentation, etc

`npm install @mojule/schema-forms`

## features

- supports all schema functionality required for the majority of data models,
  with remaining functionality planned in future releases
- modular and extensible - use the convenience functions provided to create
  forms with a few lines of code or easily override any of the functionality by
  following the established template/decorator/api patterns
- 100% test coverage
- typescript typings
- no strings, generates actual HTML elements for the browser or server (server
  via JSDOM or similar, easily serialized to a string to send as an HTTP
  response)
- no dependencies
- simple class-free coding style

## quickstart

Write a schema:

```json
{
  "type": "object",
  "title": "Contact Form",
  "properties": {
    "name": {
      "type": "string",
      "title": "Name"
    },
    "email": {
      "type": "string",
      "title": "Email",
      "format": "email"
    },
    "subject": {
      "type": "string",
      "title": "Subject",
      "default": "I have a query"
    },
    "message": {
      "type": "string",
      "title": "Message",
      "format": "multiline"
    }
  },
  "required": [ "name", "email", "message" ]
}
```

In the browser:
```js
import { SchemaToFormElements } from '@mojule/schema-forms'
import * as schema from '/path/to/your/schema'

const createEl = SchemaToFormElements( document )

const el = createEl( schema )

console.log( el.outerHTML )
```

On the server:
```js
import { JSDOM } from 'jsdom'
import { SchemaToFormElements } from '@mojule/schema-forms'
import * as schema from '/path/to/your/schema'

const { document } = new JSDOM( '<!doctype html>' ).window

const createEl = SchemaToFormElements( document )

const el = createEl( schema )

console.log( el.outerHTML )
```

Outputs:
```html
<fieldset>
  <legend>Contact Form</legend>
  <div title="Contact Form">
    <label>
      <span>Name</span>
      <input type="text" title="Name" required="" name="name">
    </label>
    <label>
      <span>Email</span>
      <input type="email" title="Email" required="" name="email">
    </label>
    <label>
      <span>Subject</span>
      <input type="text" title="Subject" name="subject" value="I have a query">
    </label>
    <label>
      <span>Message</span>
      <textarea title="Message" required="" name="message"></textarea>
    </label>
  </div>
</fieldset>
```

## supported schema functionality

Some unsupported features are planned (particularly `anyOf`/`oneOf`, `enum`)

PRs will be welcome after 1.0 release, until then please open an issue to
discuss

todo: document which features won't be supported as they don't make sense for
generating forms, support JSON Schema past draft 4

### ✔️ string

- ✔️ minLength
- ✔️ maxLength
- ✔️ pattern
- ✔️ format

### ✔️ number / ✔️ integer

- ✔️ multipleOf
- ✔️ minimum
- ✔️ maximum

### ✔️ object

- ✔️ properties
- ✔️ required
- ❌ additionalProperties
- ❌ minProperties
- ❌ maxProperties
- ❌ dependencies
- ❌ patternProperties

todo: custom api/decorator to support advanced keywords

### ✔️ array
- ✔️ items (list)
- ✔️ items (tuple)
- ✔️ minItems
- ✔️ maxItems
- ❌ additionalItems
- ❌ contains
- ❌ uniqueItems

todo: custom api/decorator to support advanced keywords

### ✔️ boolean

### ❌ null

todo: support via hidden element

### ✔️ generic keywords
- ✔️ title
- ✔️ default
- ✔️ type (string)
- ✔️ type (undefined)
- ❌ type (array)
- ❌ description
- ❌ enum

Where type is undefined, the type will be inferred according to which template
was called, but note that type is required for child schema of arrays and
objects, as these cannot be inferred - any child schema missing a type will be
skipped

todo: enum is easy for primitive types, description could be added via a
decorator in the same way that title is added with the label decorator, consider
strict mode that throws instead of skipping, child types can be inferred in most
cases if they have type-specific keywords

### ❌ combining keywords
- ❌ allOf
- ❌ anyOf
- ❌ oneOf
- ❌ not

todo: support `anyOf`/`oneOf`, these are easy via api/decorator similar to how
`array` lists already work - possibly `not` in some situations - `allOf` is
not possible without making some opiniated decisions about how it should
work, see prior art in various npm modules that attempt this, they all do it
differently. An inelegant solution would be to treat `allOf` the same way as
an `array` tuple and let the consumer of the form data figure out what to do
with it, makes for an ugly and cluttered form for the user however

### ❌ $ref

todo: full resolution eg with http and etc is beyond the scope of this package
and there are plenty of good packages to handle this. A decorator/api that works
with this package could be published as a separate module.

Even so, `$ref` can be circular but again an api and decorator can be written
that takes the required schema and allows adding them tree-style without
triggering an infinite loop

### ❌ definitions

Essentially the same as `$ref`, pre-resolve them or create an external module
to handle it

## Convenience Factories

### SchemaToFormElements

Creates a single function for turning a schema into an element (schema must
have a `type: string` keyword ):
```js
import { SchemaToFormElements } from '@mojule/schema-forms'
```

```js
const createEl = SchemaToFormElements( document )

const inputText = createEl( { type: 'string' } )
```

todo: document

### TypeTemplates

Create an object containing basic templates for each schema type:
```js
import { TypeTemplates } from '@mojule/schema-forms'
```

```js
const templates = TypeTemplates( document )
```

`templates` will be an instance of `Templates` with no decorators applied:

```typescript
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
```

todo: document

### ServerFormTemplates

Create an object containing basic templates for each schema type, pre-decorated
with labels and fieldsets:
```js
import { ServerFormTemplates } from '@mojule/schema-forms'
```

```js
const templates = TypeTemplates( document )
```

```js
// <label><span>Foo</span><input type="text" name="foo" value="Bar"></label>
const el = templates.string( { title: 'Foo', default: 'Bar' }, 'foo' )
```

todo: document

### ClientFormTemplates

Create an object containing basic templates for each schema type, pre-decorated
with labels and fieldsets and using the mutable array list decorator so that
the user can add and delete items from an array list:
```js
import { ClientFormTemplates } from '@mojule/schema-forms'
```

```js
const templates = ClientFormTemplates( document )
```

```js
// <label><span>Foo</span><input type="text" name="foo" value="Bar"></label>
const el = templates.string( { title: 'Foo', default: 'Bar' }, 'foo' )
```

todo: document

## Template Factories

Template Factory functions are exported for each schema `type`

The factory functions take an instance of document, allowing use in either the
browser or on the server via JSDOM or any other module that provides an
implementation of Document, and return a function that creates an HTML element

The signature for a schema template is:

```typescript
( schema?: JSONSchema4, name?: string, value?: any, isRequired?: boolean ) => HTMLElement
```

### StringTemplate

Get the template factory:
```js
import { StringTemplate } from '@mojule/schema-forms'
```

Create a function that returns an `input[type="text"]` element:
```js
const inputText = StringTemplate( document )
```

No arguments:
```js
const foo = inputText()

// <input type="text">
console.log( foo.outerHTML )
```

Empty schema and name:
```js
const foo = inputText( {}, 'foo' )

// <input type="text" name="foo">
console.log( foo.outerHTML )
```

Schema provides default value:
```js
const foo = inputText( { default: 'bar' } )

// <input type="text" value="bar">
console.log( foo.outerHTML )
```

Default value passed explictly, empty name:
```js
const foo = inputText( {}, '', 'bar' )

// <input type="text" value="bar">
console.log( foo.outerHTML )
```

Default value and name provided:
```js
const foo = inputText( { default: 'bar' }, 'foo' )

// <input type="text" name="foo" value="bar">
console.log( foo.outerHTML )
```

Empty schema, name and value:
```js
const foo = inputText( {}, 'foo', 'bar' )

// <input type="text" name="foo" value="bar">
console.log( foo.outerHTML )
```

Empty schema, no name, no value, isRequired is true:
```js
const foo = inputText( {}, '', '', true )

// <input type="text" required>
console.log( foo.outerHTML )
```

Empty schema, name, value, isRequired is true:
```js
const foo = inputText( {}, 'foo', 'bar', true )

// <input type="text" name="foo" value="bar" required>
console.log( foo.outerHTML )
```

StringTemplate takes an optional extra argument, `isMultiline`, to generate a
`textarea` instead of an input element:

```js
const textarea = StringTemplate( document, true )

const foo = textarea()

// <textarea name="foo"></textarea>
console.log( foo.outerHTML )
```

todo: document minLength, maxLength, pattern, how format is used (see format
decorator below ) etc.

### NumberTemplate

Get the template factory:
```js
import { NumberTemplate } from '@mojule/schema-forms'
```

todo: document in full, basically same as string

### ObjectTemplate

Get the template factory:
```js
import { ObjectTemplate } from '@mojule/schema-forms'
```

todo: document

### ArrayTemplate

Get the template factory:
```js
import { ArrayTemplate } from '@mojule/schema-forms'
```

todo: document

### BooleanTemplate

Get the template factory:
```js
import { BooleanTemplate } from '@mojule/schema-forms'
```

## decorators

Decorators modify the template output, allowing you to customize the generated
DOM, eg `<label>text <input></label>` vs
`<label for="foo">text</label> <input id="foo">`, or adding extra metadata
for client side interactivity and any number of other use cases

### LabelDecorator

Get the decorator factory:
```js
import { LabelDecorator } from '@mojule/schema-forms'
```

Wrap all string inputs with labels:
```js
import { LabelDecorator, StringTemplate } from '@mojule/schema-forms'

const labelledString = LabelDecorator( document, StringTemplate( document ) )

// <label><span>Foo</span><input type="text"></label>
const el = labelledString( { title: 'Foo' } )
```

todo: document

### FieldsetDecorator

Get the decorator factory:
```js
import { FieldsetDecorator } from '@mojule/schema-forms'
```

todo: document

### FormatDecorator

Get the decorator factory:
```js
import { FormatDecorator } from '@mojule/schema-forms'
```

todo: document

### MutableArrayListDecorator

Get the decorator factory:
```js
import { MutableArrayListDecorator } from '@mojule/schema-forms'
```

todo: document

## api

API provides interaction without having to create and dispatch synthetic events,
for eg manipulating arrays etc

### ArrayListApi

Get the decorator factory:
```js
import { ArrayListApi } from '@mojule/schema-forms'
```

todo: document

## utils

todo: document - existing utils are useful for getting the data from a form
post, or from the form element itself in the client - easy to turn into json
using eg `@mojule/json-pointer`; also, consider if it is out of scope for this
package to populate an already generated form from json-compatible object, if so
consider creating an external module

## validation

todo: not really in scope for this package but an external module that plays
nicely with this one using `ajv` or similar would be good

## architecture, extending, customising etc.

todo: overview

### how templates and template factories work, creating your own

todo: document

### how decorators and decorator factories work, creating your own

todo: document

### how apis and api factories work, creating your own

todo: document

### license

MIT License

Copyright (c) 2019 Nik Coughlin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.