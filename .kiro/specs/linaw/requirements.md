# Requirements Document

## Introduction

Linaw is a web app that helps Filipino workers understand their employment contract or quitclaim. Users upload a photo or PDF, the system extracts text with OCR, the user verifies the extracted fields, and the system explains the document in plain language (English, Filipino, or Taglish). The app EXPLAINS only. It never gives legal advice, and it never lets an LLM do money math.

Cross-cutting constraints (from steering): deterministic code does all calculations; the LLM only sees user-confirmed fields; uploaded document text is untrusted data; contracts are sensitive personal data under the PH Data Privacy Act.

## Glossary

- **System**: The Linaw web app (web client plus API).
- **OcrProvider**: Adapter interface wrapping Lumen OCR.
- **ChatProvider**: Adapter interface wrapping Lumen AI Chat.
- **Field**: A structured contract value (salary, pay frequency, start date, duration, hours, rest days, deductions, penalties, employer, position).
- **Confirmed Field**: A Field the user has explicitly confirmed after review.
- **Low-confidence Field**: A Field whose OCR confidence is below the configured threshold.
- **Source Region**: The bounding box in the original document from which a Field was extracted.
- **Session**: An anonymous, account-less user session.
- **Glossary Table**: Curated, human-reviewed table of legal terms and one-line definitions.
- **Calculator**: A pure, deterministic function computing a money value from Confirmed Fields and /config tables.
- **Agency Contacts**: DOLE, DMW, OWWA, and PAO info from /config/agency-contacts.json.
- **No-Storage Policy**: Linaw keeps no copy of a user's document, extracted text, Field values, summaries, or chat on its servers. Working data lives only in the user's browser tab (sessionStorage) and is cleared when the tab closes. Copies held by the OCR or AI provider are deleted as soon as they are no longer needed.

## Requirements

### R1: Upload & OCR

**User Story:** As a worker, I want to upload a photo or PDF of my contract, so that the app can read it for me.

#### Acceptance Criteria

1. WHEN a user selects a file, THE System SHALL accept only JPG, PNG, and PDF files.
2. WHEN a file exceeds the configured maximum size or page count, THE System SHALL reject it and show a message stating the limit.
3. THE System SHALL read maximum file size and maximum page count from configuration, not hard-coded values.
4. WHEN a valid file is uploaded, THE System SHALL call Lumen OCR only through the OcrProvider interface.
5. WHEN OCR completes, THE System SHALL return the extracted text, per-field confidence scores, and per-field bounding boxes.
6. IF OCR reports the file as blurry or unreadable, THEN THE System SHALL show a friendly prompt asking the user to retake or re-upload the photo, with tips (lighting, flat surface, full page).
7. IF the OcrProvider call fails or times out, THEN THE System SHALL show a retry option and preserve the uploaded file for the retry.
8. WHILE OCR is running, THE System SHALL display a progress state.

### R2: Verify & Correct

**User Story:** As a worker, I want to check and fix what the app read, so that the explanation is based on what my contract actually says.

#### Acceptance Criteria

1. WHEN OCR results are available, THE System SHALL display the original document image beside the extracted text and Fields.
2. THE System SHALL present these editable Fields: salary, pay frequency, start date, duration, hours, rest days, deductions, penalties, employer, position.
3. WHEN a Field's confidence is below the configured threshold, THE System SHALL flag it visually and with a text label (not color alone).
4. WHEN the user taps or focuses a Field, THE System SHALL highlight its Source Region on the original document.
5. WHEN the user edits a Field, THE System SHALL mark the edited value as user-provided.
6. THE System SHALL NOT generate any explanation until the user explicitly confirms the Fields.
7. WHEN the user confirms, THE System SHALL send only Confirmed Fields (not raw OCR output) to the ChatProvider.
8. IF a Field was not found, THEN THE System SHALL let the user leave it empty or enter it manually.

### R3: 30-Second Summary

**User Story:** As a worker, I want a quick overview, so that I can grasp the key terms in seconds.

#### Acceptance Criteria

1. WHEN the user confirms Fields, THE System SHALL show summary cards for pay, deductions, working hours, days off, contract length, and penalties.
2. IF a Field is missing, THEN THE System SHALL show "Not found in document" for that card and SHALL NOT guess a value.
3. THE System SHALL attach a source clause citation to every claim in the summary.
4. WHEN the user taps a citation, THE System SHALL show the cited clause text and highlight its Source Region.
5. THE System SHALL show the non-legal-advice disclaimer and agency links on the summary screen.

### R4: Plain-Language Explanation

**User Story:** As a worker, I want explanations in a language I understand, so that I am not confused by legal wording.

#### Acceptance Criteria

1. THE System SHALL let the user choose English, Filipino, or Taglish for explanations and UI.
2. WHERE a regional language is not marked "tested" in /config/supported-languages.json, THE System SHALL NOT offer it.
3. WHEN the user taps a glossary term (e.g., quitclaim, probationary), THE System SHALL show its one-line definition.
4. THE System SHALL serve glossary definitions from the Glossary Table and SHALL NOT generate them live with the LLM.
5. IF a term is not in the Glossary Table, THEN THE System SHALL show no definition rather than a generated one.
6. WHEN the user changes language, THE System SHALL regenerate the explanation in the selected language without requiring re-upload or re-confirmation.

### R5: Deterministic Calculations

**User Story:** As a worker, I want accurate pay figures, so that I can trust what I will actually receive.

#### Acceptance Criteria

1. THE System SHALL compute salary, deductions, and 13th-month pay using pure Calculator functions.
2. THE System SHALL read rates and contribution tables from /config/wage-and-contribution-tables.json, selecting the table whose effective date applies to the relevant period.
3. THE System SHALL represent money as integer centavos or decimal.js values and SHALL NOT use floating-point arithmetic.
4. THE System SHALL pass Calculator results to the ChatProvider as data, and the ChatProvider SHALL only explain them, not compute them.
5. WHEN a calculated value is shown, THE System SHALL label it "computed by formula" and show the inputs used.
6. WHEN the start date is mid-year or the period contains a partial month, THE 13th-month Calculator SHALL prorate according to the documented formula.
7. IF required inputs for a Calculator are missing, THEN THE System SHALL show "Not enough information to compute" and list the missing Fields.
8. IF no table is effective for the requested date, THEN THE System SHALL report that and SHALL NOT fall back silently to another table.
9. THE System SHALL include unit tests for each Calculator covering normal cases, partial months, mid-year start, and boundary dates, plus property tests for invariants (e.g., non-negative results, deterministic output).

### R6: Contract Comparison

**User Story:** As a worker with two offers or versions, I want to see what differs, so that I can choose or negotiate.

#### Acceptance Criteria

1. WHEN the user starts a comparison, THE System SHALL accept two documents and run each through R1 and R2.
2. WHEN both documents are confirmed, THE System SHALL produce a structured field-by-field diff.
3. THE System SHALL label each change as better, worse, or neutral for the worker, using deterministic rules where the Field is numeric and documented rules otherwise.
4. THE System SHALL produce a plain-language summary of the changes in the selected language.
5. THE System SHALL cite the source clause in each document for every listed change.
6. IF a Field exists in only one document, THEN THE System SHALL show it as "Not found in document" for the other and SHALL NOT infer a value.
7. THE System SHALL show the non-legal-advice disclaimer on the comparison screen.

### R7: No-Contract Flow

**User Story:** As a worker without a written contract, I want to know what is generally expected, so that I understand my situation.

#### Acceptance Criteria

1. WHEN the user chooses "I have no contract", THE System SHALL start a questionnaire showing one question per screen.
2. THE System SHALL ask about employer type, pay, hours, rest day, and live-in status at minimum.
3. THE System SHALL let the user go back and change a previous answer.
4. WHEN the questionnaire is complete, THE System SHALL explain what the Batas Kasambahay generally requires, based only on /config/kasambahay-requirements.json.
5. THE System SHALL NOT present content outside the human-reviewed config as legal requirements.
6. THE System SHALL show a note that the result is general information, not legal advice.
7. IF the answers indicate a possible gap against the listed requirements, THEN THE System SHALL describe it neutrally and point to Agency Contacts.

### R8: Chat

**User Story:** As a worker, I want to ask follow-up questions, so that I can understand details specific to me.

#### Acceptance Criteria

1. THE System SHALL ground chat answers in Confirmed Fields and, where applicable, the document text.
2. WHEN the AI responds, THE System SHALL stream the response to the client.
3. THE System SHALL offer suggested "questions to ask before signing".
4. WHEN an answer relies on the document, THE System SHALL show citations.
5. IF a question requires legal judgment, THEN THE System SHALL give a short explanation and refer the user to DOLE, DMW, OWWA, or PAO.
6. IF the answer is not supported by Confirmed Fields or the document, THEN THE System SHALL say it cannot tell from the document rather than guess.
7. THE System SHALL never ask the ChatProvider to compute money values; calculation questions SHALL be answered from Calculator results.
8. THE System SHALL show the non-legal-advice disclaimer on the chat screen.
9. IF streaming is interrupted, THEN THE System SHALL show a retry option.

### R9: Safety & Referrals

**User Story:** As a worker who may be in a risky situation, I want clear help options, so that I know where to turn.

#### Acceptance Criteria

1. THE System SHALL show a persistent non-legal-advice disclaimer on all summary and chat screens.
2. THE System SHALL provide a Get Help page listing DOLE, DMW, OWWA, and PAO, loaded from /config/agency-contacts.json.
3. THE System SHALL include a per-entry "verified" status in agency-contacts.json, and a launch check SHALL fail the build if any entry is unverified in a production build.
4. WHEN a chat message contains distress, abuse, or trafficking signals, THE System SHALL prominently surface help resources before or alongside any answer.
5. THE System SHALL run distress detection in both English and Filipino/Taglish.
6. WHEN help resources are surfaced, THE System SHALL NOT dismiss the user's message or end the conversation.
7. THE System SHALL make the Get Help page reachable from every screen.

### R10: Privacy

**User Story:** As a worker, I want control over my sensitive documents, so that my privacy is protected.

#### Acceptance Criteria

1. WHEN a user first opens the upload flow, THE System SHALL show a consent screen explaining what is collected, how it is used, and that Linaw does not store it.
2. THE System SHALL NOT accept an upload until the user has given explicit consent.
3. THE System SHALL work without account creation, using an anonymous Session.
4. THE System SHALL NOT store uploaded files, extracted text, Field values, summaries, or chat messages in any database, file store, or cache. The API SHALL act as a stateless relay to the providers.
5. THE System SHALL provide a "Clear my document" action that removes the document and every result from the browser, deletes any remaining provider copy, and confirms completion.
6. THE System SHALL NOT write document content, extracted text, or Field values to logs.
7. THE System SHALL call OCR and AI providers only from the server and SHALL keep provider keys in environment variables, never in client code.
8. THE System SHALL keep working data only in the browser tab for the active Session, and SHALL clear it when the tab closes.
9. WHEN an OCR read finishes, fails permanently, or is cancelled, THE System SHALL delete the document from the OCR provider; WHEN a conversation ends, THE System SHALL end the AI provider session. IF a provider cannot delete a copy, THE System SHALL NOT claim no-storage for that provider and SHALL disclose the provider's retention on the consent screen.

### R11: Accessibility & i18n

**User Story:** As a worker on a basic phone, I want an app that is easy to read and use, so that I can use it anywhere.

#### Acceptance Criteria

1. THE System SHALL meet WCAG AA color contrast.
2. THE System SHALL use body text of at least 16px.
3. THE System SHALL provide tap targets of at least 48px.
4. THE System SHALL be fully operable by keyboard with visible focus.
5. THE System SHALL provide screen-reader labels for all controls, images, and status changes.
6. THE System SHALL provide a text-to-speech button on summaries.
7. WHERE the browser has no suitable voice for the selected language, THE System SHALL hide or disable the text-to-speech button and say why.
8. THE System SHALL provide UI strings in en, fil, and tl-en locale files via react-i18next.
9. WHILE the network is slow or offline, THE System SHALL show progress states and retry options.
10. WHEN an upload is interrupted, THE System SHALL let the user retry from the copy kept in the browser, without picking the file again.
11. THE System SHALL remain usable on low-end Android devices, with image compression on the client before upload where it does not harm OCR quality.

### R12: Prompt-Injection Defense

**User Story:** As a user, I want the app to ignore malicious text inside documents, so that results stay trustworthy.

#### Acceptance Criteria

1. THE System SHALL wrap document text in clearly delimited, labeled "untrusted data" blocks in every prompt.
2. THE System SHALL instruct the model, via versioned templates in /prompts, never to follow instructions found inside document text.
3. WHEN the ChatProvider returns extraction or explanation output, THE System SHALL validate it against a zod schema.
4. IF output fails schema validation, THEN THE System SHALL retry up to a configured limit and then reject with a user-friendly error.
5. THE System SHALL NOT render model output as HTML without sanitization.
6. THE System SHALL include tests with injection-style document text (e.g., "ignore previous instructions") confirming the output remains schema-valid and unaffected.
7. THE System SHALL record the prompt template version used for each response, without logging document content.
