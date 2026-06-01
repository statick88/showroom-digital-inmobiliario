# Lead Form Specification

## Purpose

Define el formulario de contacto para leads: modal con campos nombre/email/teléfono, Turnstile Captcha, throttle 30s, LPDP consent, submit con toast de confirmación.

## Requirements

### REQ-LF-01: Modal Trigger

The LeadForm MUST open as a modal when the user clicks "Contactar" from the PropertyDetailPanel. The modal title MUST be "Contactar" followed by the property code.

#### Scenario: Lead form opens

- GIVEN the PropertyDetailPanel is open
- WHEN the user clicks "Contactar"
- THEN a modal MUST appear with title "Contactar {property_code}"
- AND the form MUST be centered with max-w-md

### REQ-LF-02: Form Fields

The form MUST include: Nombre (required text input), Email (required email input), Teléfono (optional input with +51 prefix).

#### Scenario: Form fields render with validation

- GIVEN the lead form modal is open
- THEN a "Nombre" input with * indicator MUST be present
- AND an "Email" input of type email with * indicator MUST be present
- AND a "Teléfono" input with "+51" prefix MUST be present
- AND submitting with empty Nombre MUST show: "El nombre es obligatorio"
- AND submitting with invalid Email MUST show: "Email inválido"

### REQ-LF-03: Turnstile Captcha

The form MUST include Cloudflare Turnstile Captcha widget to prevent bot submissions.

#### Scenario: Captcha renders and validates

- GIVEN the lead form modal is open
- THEN a Turnstile Captcha widget MUST render below the phone input
- AND the submit button MUST be disabled until the captcha is solved

### REQ-LF-04: LPDP Consent Checkbox

The form MUST include a required checkbox: "He leído y acepto la Política de Privacidad según Ley N° 29733" with a link to /privacidad.

#### Scenario: Checkbox prevents submission

- GIVEN all fields are filled and captcha is solved
- WHEN the privacy checkbox is NOT checked
- THEN the submit button MUST be disabled
- AND a visual hint MUST indicate the requirement

#### Scenario: Checkbox enables submission

- GIVEN the user fills all fields and solves captcha
- WHEN the privacy checkbox IS checked
- THEN the submit button MUST be enabled
- AND submit MUST include consent_timestamp in the lead record

### REQ-LF-05: Throttle

The system MUST enforce a 30-second throttle between lead submissions from the same browser session.

#### Scenario: Throttle prevents duplicate submissions

- GIVEN the user submitted a lead less than 30 seconds ago
- WHEN they try to submit again
- THEN the submit button MUST be disabled
- AND a message MUST display: "Puedes enviar una solicitud cada 30 segundos"

### REQ-LF-06: Submit & Confirm

On successful submission, the system MUST show a success toast and close the modal.

#### Scenario: Successful submission

- GIVEN the user filled all fields and accepted privacy
- WHEN they click "Enviar solicitud"
- THEN the form MUST submit to the leads endpoint
- AND a toast MUST appear: "Solicitud enviada"
- AND the modal MUST close after 2 seconds
