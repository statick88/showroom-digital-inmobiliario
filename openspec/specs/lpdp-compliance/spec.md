# LPDP Compliance Specification

## Purpose

Cumplir con la Ley de Protección de Datos Personales (Ley N° 29733) y su reglamento DS 016-2024-JUS. Agregar consentimiento explícito en formulario de contacto y banner de cookies informativo.

## Requirements

### REQ-LC-01: Privacy Consent Checkbox

The LeadForm MUST include a required checkbox: "He leído y acepto la Política de Privacidad según Ley N° 29733" with a link to the privacy policy page.

#### Scenario: Checkbox prevents submission

- GIVEN the user fills all contact fields
- WHEN the privacy checkbox is NOT checked
- THEN the submit button MUST be disabled
- AND a visual hint MUST indicate the requirement

#### Scenario: Checkbox enables submission

- GIVEN the user fills all contact fields
- WHEN the privacy checkbox IS checked
- THEN the submit button MUST be enabled
- AND clicking submit MUST include consent timestamp in the lead record

#### Scenario: Privacy policy link opens

- GIVEN the privacy checkbox is rendered
- THEN "Política de Privacidad" MUST be a clickable link
- AND clicking it MUST open the privacy policy page in a new tab
- AND the link target MUST be `/privacidad`

### REQ-LC-02: Cookie Banner

The system SHOULD display an informational cookie banner on first visit, stating that cookies are used for analytics and session management.

#### Scenario: Banner appears on first visit

- GIVEN the user visits the site for the first time
- THEN a cookie banner MUST appear at the bottom of the viewport
- AND it MUST state: "Usamos cookies para mejorar tu experiencia"
- AND it MUST have an "Aceptar" button
- AND it MAY have a "Más información" link

#### Scenario: Banner does not reappear after acceptance

- GIVEN the user clicked "Aceptar" on the cookie banner
- WHEN they reload or navigate
- THEN the banner MUST NOT appear again
- AND the consent MUST be stored in localStorage

### REQ-LC-03: Consent Audit Trail

When a lead is submitted with privacy consent, the system MUST store: ISO timestamp of consent, IP address (anonymized), and user agent string.

#### Scenario: Consent data is stored with lead

- GIVEN a lead submits with privacy consent checked
- THEN the lead record MUST include `consent_timestamp` (ISO 8601)
- AND `consent_ip` (anonymized last octet: 192.168.1.xxx)
- AND `user_agent` string
