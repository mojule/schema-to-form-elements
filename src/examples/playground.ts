import * as Ajv from 'ajv'
import { JSONSchema4 } from 'json-schema'

import * as schemas from '../schema'
import * as data from '../schema/data'
import { getData } from './get-data'
import { SchemaToFormElements } from '..'
import { ClientFormTemplates } from '../templates'

const valid = '✔️'
const invalid = '❌'
const unknown = '❓'

const ajv = new Ajv( {
  schemaId: 'id',
  allErrors: true,
  jsonPointers: true
} )

ajv.addMetaSchema( schemas.meta )

ajv.addFormat( 'multiline', () => true )
ajv.addFormat( 'password', () => true )
ajv.addFormat( 'tel', () => true )
ajv.addFormat( 'range', () => true )
ajv.addFormat( 'hidden', () => true )
ajv.addFormat( 'color', /^\#[a-f0-9]{6}$/ )
ajv.addFormat( 'month', /^\d{4}-\d{1,2}$/ )
ajv.addFormat( 'week', /^\d{4}-W\d{1,2}$/ )

document.addEventListener( 'DOMContentLoaded', () => {
  const schemaToDom = SchemaToFormElements( ClientFormTemplates( document, Event ) )

  const {
    form, submit, select, schema, schemaSubmit, resultJson, resultFormData,
    resultSubmit, schemaSection, formSection, resultSection, schemaValid,
    formValid, resultValid, formErrors, schemaErrors, resultErrors, showJson,
    showFormData
  } = init()

  submit.onclick = e => {
    e.preventDefault()

    onFormSubmit()
  }

  schemaSubmit.onclick = e => {
    e.preventDefault()

    onSchemaSubmit()
  }

  resultSubmit.onclick = e => {
    e.preventDefault()

    onResultSubmit()
  }

  const onFormSubmit = () => {
    if ( !isSchemaValid() ) return
    if ( !isFormValid() ) return

    resultSection.classList.remove( 'invalid' )

    const value = getData( form )

    resultJson.value = JSON.stringify( value, null, 2 )

    const formData = new FormData( form )

    resultFormData.innerHTML = ''
    Array.from( formData.entries() ).forEach( ( [ key, value ] ) => {
      const tr = document.createElement( 'tr' )
      const th = document.createElement( 'th' )
      const td = document.createElement( 'td' )

      th.innerText = key
      td.innerHTML = String( value ).split( '\n' ).join( '<br>' )

      tr.appendChild( th )
      tr.appendChild( td )
      resultFormData.appendChild( tr )
    } )

    const isValid = isResultValid()

    resultValid.innerText = isValid ? valid : invalid

    if ( !isValid ) {
      resultSection.classList.add( 'invalid' )

      let errors = ajv.errorsText( ajv.errors )

      if ( errors === 'No errors' ) {
        errors = 'Invalid JSON'
      } else {
        errors = errors.split( ', ' ).join( '\n' )
      }

      resultErrors.innerText = errors
    }
  }

  const onSelect = () => {
    const key = select.selectedOptions[ 0 ].value
    let currentSchema = schemas[ key ]

    if ( key in data ) {
      currentSchema = JSON.parse( JSON.stringify( currentSchema ) )
      currentSchema.default = data[ key ]
    }

    schema.value = JSON.stringify( currentSchema, null, 2 )
    form.innerHTML = ''
    resultJson.value = ''
    resultFormData.innerHTML = ''

    onSchemaChange()
  }

  const onSchemaChange = () => {
    const isValid = isSchemaValid()

    schemaValid.innerText = isValid ? valid : invalid
    formSection.classList.remove( 'invalid' )
    resultSection.classList.remove( 'invalid' )

    if ( !isValid ) {
      schemaSection.classList.add( 'invalid' )

      let errors = ajv.errorsText( ajv.errors )

      if ( errors === 'No errors' ) {
        errors = 'Invalid JSON'
      } else {
        errors = errors.split( ', ' ).join( '\n' )
      }

      schemaErrors.innerText = errors

      form.innerHTML = ''
      resultJson.value = ''
      resultFormData.innerHTML = ''

      formValid.innerText = unknown
      resultValid.innerText = unknown

      return
    }

    schemaSection.classList.remove( 'invalid' )

    onSchemaSubmit()
  }

  const onSchemaSubmit = () => {
    const currentSchema = JSON.parse( schema.value )
    const schemaDom = schemaToDom( currentSchema )

    form.innerHTML = ''
    resultJson.value = ''
    resultFormData.innerHTML = ''

    form.appendChild( schemaDom )

    onFormChange()
  }

  const onFormChange = () => {
    console.log( 'form change' )

    const isValid = isFormValid()

    formValid.innerText = isValid ? valid : invalid

    if ( !isValid ) {
      formSection.classList.add( 'invalid' )

      let errors = ''

      const invalidItems = <HTMLInputElement[]>Array.from(
        form.querySelectorAll( ':invalid' )
      )

      invalidItems.forEach( item => {
        if ( item.localName === 'fieldset' ) return

        errors += `${ item.title || item.name || item.localName }: ${ item.validationMessage }\n`
      } )

      formErrors.innerText = errors

      const currentFocus = <HTMLElement>document.activeElement

      form.reportValidity()

      if ( currentFocus !== null ) currentFocus.focus()

      resultValid.innerText = unknown
      resultJson.value = ''
      resultFormData.innerHTML = ''

      return
    }

    formSection.classList.remove( 'invalid' )

    onFormSubmit()
  }

  const onResultChange = () => {
    const isValid = isResultValid()

    resultValid.innerText = isValid ? valid : invalid

    if ( !isValid ) {
      resultSection.classList.add( 'invalid' )

      let errors = ajv.errorsText( ajv.errors )

      if ( errors === 'No errors' ) {
        errors = 'Invalid JSON'
      } else {
        errors = errors.split( ', ' ).join( '\n' )
      }

      resultErrors.innerText = errors
    }
  }

  const onResultSubmit = () => {
    if ( !isSchemaValid() ) return
    if ( !isFormValid() ) return
    if ( !isResultValid() ) return

    const resultValue = JSON.parse( resultJson.value )
    let currentSchema = JSON.parse( schema.value )

    currentSchema.default = resultValue

    schema.value = JSON.stringify( currentSchema, null, 2 )

    onSchemaSubmit()
  }

  schema.oninput = onSchemaChange
  form.oninput = onFormChange
  resultJson.oninput = onResultChange
  select.onchange = onSelect

  showJson.onclick = e => {
    e.preventDefault()
    showJson.classList.add( 'selected' )
    showFormData.classList.remove( 'selected' )
    resultSection.classList.remove( 'form-data' )
    resultSection.classList.add( 'json' )
  }

  showFormData.onclick = e => {
    e.preventDefault()
    showJson.classList.remove( 'selected' )
    showFormData.classList.add( 'selected' )
    resultSection.classList.add( 'form-data' )
    resultSection.classList.remove( 'json' )
  }

  onSelect()
} )

const isSchemaValid = () => {
  const schema = getCurrentSchema()

  if ( !schema ) return false

  return ajv.validate( 'http://json-schema.org/draft-04/schema#', schema )
}

const isFormValid = () => {
  const form = getForm()

  if ( !form ) return false

  return form.checkValidity()
}

const isResultValid = () => {
  const result = getResult()

  if ( result === undefined ) return false

  if ( !isSchemaValid() ) return false

  const currentSchema = getCurrentSchema()

  if ( !currentSchema ) return false

  return ajv.validate( currentSchema, result )
}

const getCurrentSchema = () => {
  try {
    const schema = <HTMLTextAreaElement>document.querySelector(
      '.schema textarea'
    )

    return <JSONSchema4>JSON.parse( schema.value )
  } catch {
    return
  }
}

const getForm = () => {
  const form = <HTMLFormElement>document.querySelector( '.form form' )

  if ( form ) return form
}

const getResult = () => {
  try {
    const result = <HTMLTextAreaElement>document.querySelector( '.result textarea' )

    return JSON.parse( result.value )
  } catch {
    return
  }
}

const init = () => {
  const form = createForm()
  const submit = createFormButton()
  const select = createSelect()
  const schema = <HTMLTextAreaElement>document.querySelector(
    '.schema textarea'
  )
  const schemaSubmit = createSchemaButton()
  const resultJson = <HTMLTextAreaElement>document.querySelector( '.result textarea.json' )
  const resultFormData = <HTMLTableElement>document.querySelector( '.result table.form-data' )
  const resultSubmit = createResultButton()

  const formSection = <HTMLElement>document.querySelector( '.form' )
  const schemaSection = <HTMLElement>document.querySelector( '.schema' )
  const resultSection = <HTMLElement>document.querySelector( '.result' )

  const schemaValid = <HTMLSourceElement>document.querySelector( '.schema-valid' )
  const formValid = <HTMLSourceElement>document.querySelector( '.form-valid' )
  const resultValid = <HTMLSourceElement>document.querySelector( '.result-valid' )

  const formErrors = <HTMLPreElement>document.querySelector( '.form pre' )
  const schemaErrors = <HTMLPreElement>document.querySelector( '.schema pre' )
  const resultErrors = <HTMLPreElement>document.querySelector( '.result pre' )

  const showJson = <HTMLAnchorElement>document.querySelector( '.result a[href="#json"]' )
  const showFormData = <HTMLAnchorElement>document.querySelector( '.result a[href="#form-data"]' )

  return {
    form, submit, select, schema, schemaSubmit, resultJson, resultFormData,
    resultSubmit, formSection, schemaSection, resultSection, schemaValid,
    formValid, resultValid, formErrors, schemaErrors, resultErrors, showJson,
    showFormData
  }
}

const createForm = () => {
  const form = <HTMLFormElement>document.querySelector( '.form form' )

  return form
}

const createFormButton = () => {
  const formButtonContainer = document.querySelector( '.form-button' )!
  const submit = document.createElement( 'input' )
  submit.type = 'submit'
  submit.value = 'Update Results'

  formButtonContainer.appendChild( submit )

  return submit
}

const createSchemaButton = () => {
  const schemaButtonContainer = document.querySelector( '.schema-button' )!
  const schemaSubmit = document.createElement( 'input' )
  schemaSubmit.type = 'submit'
  schemaSubmit.value = 'Update Form'

  schemaButtonContainer.appendChild( schemaSubmit )

  return schemaSubmit
}

const createResultButton = () => {
  const resultButtonContainer = document.querySelector( '.result-button' )!
  const resultSubmit = document.createElement( 'input' )
  resultSubmit.type = 'submit'
  resultSubmit.value = 'Update Schema Defaults'

  resultButtonContainer.appendChild( resultSubmit )

  return resultSubmit
}

const createSelect = () => {
  const select = <HTMLSelectElement>document.querySelector( 'header select' )
  const keys = Object.keys( schemas )

  keys.forEach( ( key, i ) => {
    const schema = schemas[ key ]
    const option = document.createElement( 'option' )

    option.value = key
    option.innerText = schema.title
    option.selected = i === 0

    select.appendChild( option )
  } )

  return select
}