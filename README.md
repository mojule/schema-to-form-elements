# schema-forms

Generate HTML forms from [JSON Schema](https://json-schema.org/)

This module attempts to provide a toolkit which is small, simple and flexible
enough to cover all use cases

todo: rationale, toc etc

`npm install @mojule/schema-forms`

## features

- supports all schema functionality required to edit majority of models, with
  remaining functionality planned in future releases
- modular and extensible
- 100% test coverage
- typescript typings
- browser and server (server via JSDOM or similar)
- no dependencies
- class-free, functional style

todo: example code, playground, full documentation

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

Some unsupported features are planned (partiularly `anyOf`/`oneOf`, `enum`)

PRs will be welcome after 1.0 release, until then please open an issue to
discuss

todo: document which features won't be supported as they don't make sense for
generating forms

✔️ string
  - ✔️ minLength
  - ✔️ maxLength
  - ✔️ pattern
  - ✔️ format

✔️ number
  - ✔️ multipleOf
  - ✔️ minimum
  - ✔️ maximum

✔️ integer
  - ✔️ multipleOf
  - ✔️ minimum
  - ✔️ maximum

✔️ object
  - ✔️ properties
  - ✔️ required
  - ❌ additionalProperties
  - ❌ minProperties
  - ❌ maxProperties
  - ❌ dependencies
  - ❌ patternProperties

✔️ array
  - ✔️ items
    - ✔️ list
    - ✔️ tuple
  - ✔️ minItems
  - ✔️ maxItems
  - ❌ additionalItems
  - ❌ contains
  - ❌ uniqueItems

✔️ boolean

❌ null

✔️ generic keywords
  - ✔️ title
  - ✔️ default
  - ✔️ type
    - ✔️ where type is a string
    - ✔️ where type is undefined, the type will be inferred according to which
         template was called, but note that type is required for child schema of
         arrays and objects, as these cannot be inferred - any child schema
         missing a type will be skipped - todo: consider strict mode that throws
         instead of skipping
    - ❌ where type is an array
  - ❌ description
  - ❌ enum

❌ combining keywords
  - ❌ allOf
  - ❌ anyOf
  - ❌ oneOf
  - ❌ not

❌ $ref - you should resolve references first

## Convenience Factories

Creates a single function for turning a schema into an element (schema must
have a `type: string` keyword ):
```js
import { SchemaToFormElements } from '@mojule/schema-forms'
```

todo: document

Create an object containing basic templates for each schema type:
```js
import { TypeTemplates } from '@mojule/schema-forms'
```

todo: document

Create an object containing basic templates for each schema type, pre-decorated
with labels and fieldsets:
```js
import { ServerFormTemplates } from '@mojule/schema-forms'
```

todo: document

Create an object containing basic templates for each schema type, pre-decorated
with labels and fieldsets and using the mutable array list decorator so that
the user can add and delete items from an array list:
```js
import { ClientFormTemplates } from '@mojule/schema-forms'
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

### string

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

### number and integer

Get the template factory:
```js
import { NumberTemplate } from '@mojule/schema-forms'
```

todo: document in full, basically same as string

### object

Get the template factory:
```js
import { ObjectTemplate } from '@mojule/schema-forms'
```

todo: document

### array

Get the template factory:
```js
import { ArrayTemplate } from '@mojule/schema-forms'
```

todo: document

### boolean

Get the template factory:
```js
import { BooleanTemplate } from '@mojule/schema-forms'
```

todo: document

## decorators

### labels

Get the decorator factory:
```js
import { LabelDecorator } from '@mojule/schema-forms'
```

todo: document

### fieldsets

Get the decorator factory:
```js
import { FieldsetDecorator } from '@mojule/schema-forms'
```

todo: document

### format

Get the decorator factory:
```js
import { FormatDecorator } from '@mojule/schema-forms'
```

todo: document

### mutable arrays

Get the decorator factory:
```js
import { MutableArrayListDecorator } from '@mojule/schema-forms'
```

todo: document

## api

### array list

Get the decorator factory:
```js
import { ArrayListApi } from '@mojule/schema-forms'
```

todo: document

## architecture

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