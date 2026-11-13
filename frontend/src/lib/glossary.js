// Legal-jargon glossary. Nothing here is shown on its own: `findTerms` scans the OCR text
// of the uploaded document and returns only the terms that actually appear in it,
// each with the exact place (page + line) where it was read.
//
// RULE FOR ADDING TERMS: only legal jargon whose meaning a worker can't get just by reading
// the word ("liquidated damages", "force majeure", "co-terminus"). Everyday words such as
// penalty, resignation, overtime, salary, consent or termination do NOT belong here.
//
// Definitions are plain-language explanations, not legal advice.
// Keys of `def` match LANGUAGES in i18n/messages.js.

export const GLOSSARY = [
  {
    id: 'liquidatedDamages',
    name: 'Liquidated damages',
    pattern: /\bliquidated\s+damages\b/i,
    def: {
      English: 'An amount agreed in advance that one side pays if they break part of the contract, like leaving early.',
      Filipino: 'Halagang napagkasunduan nang maaga na babayaran kapag may hindi tinupad sa kontrata, gaya ng maagang pag-alis.',
      Taglish: 'Halagang napagkasunduan in advance na babayaran kapag may hindi nasunod sa kontrata, gaya ng maagang pag-alis.',
    },
  },
  {
    id: 'quitclaim',
    name: 'Quitclaim',
    pattern: /\bquit\s?claims?\b/i,
    def: {
      English: 'A document saying you received your pay and will not claim anything more from the employer. Read it carefully before signing.',
      Filipino: 'Dokumentong nagsasabing natanggap mo na ang bayad at wala ka nang hahabulin sa employer. Basahing mabuti bago pumirma.',
      Taglish: 'Dokumentong nagsasabing natanggap mo na ang bayad at wala ka nang ibang hahabulin sa employer. Basahing mabuti bago pumirma.',
    },
  },
  {
    id: 'waiver',
    name: 'Waiver',
    pattern: /\bwaive[sd]?\b|\bwaiver\b|\bwaiving\b/i,
    def: {
      English: 'Giving up a right or a claim on purpose. Once signed, it can be hard to take back.',
      Filipino: 'Kusang pagbitaw sa isang karapatan o paghahabol. Kapag napirmahan na, mahirap na itong bawiin.',
      Taglish: 'Kusang pag-give up ng isang karapatan o paghahabol. Kapag napirmahan na, mahirap na itong bawiin.',
    },
  },
  {
    id: 'probationary',
    name: 'Probationary',
    pattern: /\bprobation(?:ary)?\b/i,
    def: {
      English: 'A trial period, usually up to 6 months, when the employer checks if you meet standards they told you about at the start.',
      Filipino: 'Panahon ng pagsubok, karaniwang hanggang 6 na buwan, kung kailan tinitingnan kung naaabot mo ang pamantayang sinabi sa iyo sa simula.',
      Taglish: 'Trial period, usually hanggang 6 na buwan, kung kailan tinitingnan kung pasado ka sa standards na sinabi sa iyo sa simula.',
    },
  },
  {
    id: 'fixedTerm',
    name: 'Fixed-term',
    pattern: /\bfixed[-\s]?(?:term|period)\s+(?:employment|contract|basis)\b/i,
    def: {
      English: 'A contract with a set start and end date. It ends on its own when the period is over.',
      Filipino: 'Kontratang may takdang petsa ng simula at katapusan. Kusa itong natatapos pagdating ng huling araw.',
      Taglish: 'Kontratang may malinaw na start at end date. Kusa itong natatapos pagdating ng end date.',
    },
  },
  {
    id: 'coTerminus',
    name: 'Co-terminus / project-based',
    pattern: /\bco-?terminous\b|\bco-?terminus\b|\bproject[-\s]?based\b|\bproject\s+employ(?:ee|ment)\b/i,
    def: {
      English: 'Your job ends at the same time as a project or another contract. When that ends, your work ends too.',
      Filipino: 'Natatapos ang trabaho mo kasabay ng isang proyekto o ibang kontrata. Kapag natapos iyon, tapos din ang trabaho mo.',
      Taglish: 'Natatapos ang trabaho mo kasabay ng isang project o ibang kontrata. Kapag tapos na iyon, tapos din ang trabaho mo.',
    },
  },
  {
    id: 'justCause',
    name: 'Just cause',
    pattern: /\bjust\s+causes?\b/i,
    def: {
      English: 'A reason to dismiss that comes from the worker’s own fault, like serious misconduct. The employer must still give notice and a chance to explain.',
      Filipino: 'Dahilan ng pagtanggal na mula sa sariling pagkakamali ng manggagawa, gaya ng malubhang maling asal. Kailangan pa rin ng abiso at pagkakataong magpaliwanag.',
      Taglish: 'Dahilan ng pagtanggal na galing sa sariling mali ng worker, gaya ng malubhang maling asal. Kailangan pa rin ng notice at chance na magpaliwanag.',
    },
  },
  {
    id: 'authorizedCause',
    name: 'Authorized cause',
    pattern: /\bauthori[sz]ed\s+causes?\b|\bredundancy\b|\bretrenchment\b/i,
    def: {
      English: 'A business reason to end jobs, like cutting costs (retrenchment) or the job no longer being needed (redundancy). It usually comes with separation pay.',
      Filipino: 'Dahilang pangnegosyo sa pagtatapos ng trabaho, gaya ng pagbabawas ng gastos (retrenchment) o hindi na kailangan ang posisyon (redundancy). Karaniwang may separation pay.',
      Taglish: 'Business reason para tapusin ang trabaho, gaya ng pagtitipid (retrenchment) o hindi na kailangan ang posisyon (redundancy). Usually may separation pay.',
    },
  },
  {
    id: 'constructiveDismissal',
    name: 'Constructive dismissal',
    pattern: /\bconstructive(?:ly)?\s+dismiss(?:al|ed)\b/i,
    def: {
      English: 'When the employer makes work so unbearable, or cuts pay or rank, that you are forced to quit. The law treats it like being fired.',
      Filipino: 'Kapag ginawang di-matiis ng employer ang trabaho, o binawasan ang sahod o ranggo, kaya napilitan kang umalis. Itinuturing ito ng batas na parang tinanggal ka.',
      Taglish: 'Kapag ginawang hindi na kaya ng employer ang trabaho, o binawasan ang sahod o ranggo, kaya napilitan kang umalis. Tinuturing ito ng batas na parang tinanggal ka.',
    },
  },
  {
    id: 'abandonment',
    name: 'Abandonment / AWOL',
    pattern: /\babandonment\s+of\s+work\b|\babandonment\b|\bAWOL\b|\babsence\s+without\s+(?:official\s+)?leave\b/i,
    def: {
      English: 'Not reporting for work without permission and with a clear intent not to return. It can be a ground for dismissal.',
      Filipino: 'Hindi pagpasok nang walang paalam at may malinaw na balak na hindi na bumalik. Maaari itong dahilan ng pagtanggal.',
      Taglish: 'Hindi pagpasok nang walang paalam at halatang wala nang balak bumalik. Puwede itong dahilan ng pagtanggal.',
    },
  },
  {
    id: 'floatingStatus',
    name: 'Floating status',
    pattern: /\bfloating\s+status\b|\bbench(?:ed|ing)?\s+status\b|\boff-?detail\b/i,
    def: {
      English: 'A temporary period with no assignment, usually for agency or security workers. By law it should not go beyond 6 months.',
      Filipino: 'Pansamantalang panahon na walang assignment, kadalasan sa agency o security worker. Ayon sa batas, hindi ito dapat lumampas sa 6 na buwan.',
      Taglish: 'Pansamantalang walang assignment, madalas sa agency o security workers. Ayon sa batas, hindi dapat lumampas ng 6 na buwan.',
    },
  },
  {
    id: 'forfeiture',
    name: 'Forfeit / forfeiture',
    pattern: /\bforfeit(?:s|ed|ure)?\b/i,
    def: {
      English: 'Losing something you would otherwise get, such as unpaid salary or a deposit, as a consequence written in the contract.',
      Filipino: 'Pagkawala ng bagay na dapat sana ay makukuha mo, gaya ng hindi pa naibibigay na sahod o deposito, bilang kahihinatnan na nakasaad sa kontrata.',
      Taglish: 'Pagkawala ng dapat sana ay makukuha mo, gaya ng hindi pa nabibigay na sahod o deposit, bilang consequence na nakasulat sa kontrata.',
    },
  },
  {
    id: 'proRata',
    name: 'Pro rata / prorated',
    pattern: /\bpro[-\s]?rata\b|\bpro[-\s]?rated?\b/i,
    def: {
      English: 'Computed only for the part of the period you actually worked. For example, half a year of work gets half the yearly amount.',
      Filipino: 'Kinukuwenta lamang para sa bahagi ng panahong talagang nagtrabaho ka. Halimbawa, kalahating taon ng trabaho ay kalahati ng taunang halaga.',
      Taglish: 'Kinukuwenta lang para sa part ng panahon na talagang nagtrabaho ka. Halimbawa, kalahating taon ng trabaho, kalahati ng yearly amount.',
    },
  },
  {
    id: 'inLieu',
    name: 'In lieu of',
    pattern: /\bin\s+lieu\s+(?:of|thereof)\b/i,
    def: {
      English: 'Instead of. For example, “pay in lieu of notice” means money is given instead of advance notice.',
      Filipino: 'Kapalit ng. Halimbawa, ang “pay in lieu of notice” ay perang ibinibigay kapalit ng maagang abiso.',
      Taglish: 'Kapalit ng. Halimbawa, ang “pay in lieu of notice” ay perang binibigay kapalit ng advance notice.',
    },
  },
  {
    id: 'notwithstanding',
    name: 'Notwithstanding',
    pattern: /\bnotwithstanding\b/i,
    def: {
      English: 'Despite, or regardless of. The sentence that follows applies even if something else in the contract says otherwise.',
      Filipino: 'Sa kabila ng, o anuman ang. Ang kasunod na pangungusap ay susundin kahit iba ang sinasabi ng ibang bahagi ng kontrata.',
      Taglish: 'Kahit pa, o regardless of. Ang kasunod na sentence ay susundin kahit iba ang sinasabi ng ibang part ng kontrata.',
    },
  },
  {
    id: 'herein',
    name: 'Herein / hereof / thereof',
    pattern: /\bhere(?:in|of|to|under|by|inafter|inbefore)\b|\bthere(?:of|in|to|under|after)\b/i,
    def: {
      English: 'Old legal words that point to a document. “Herein” or “hereof” means “in this contract”; “thereof” means “of that thing just mentioned.”',
      Filipino: 'Lumang salitang legal na tumutukoy sa dokumento. Ang “herein” o “hereof” ay “sa kontratang ito”; ang “thereof” ay “ng bagay na kababanggit lang.”',
      Taglish: 'Lumang legal words na tumuturo sa dokumento. Ang “herein” o “hereof” ay “sa kontratang ito”; ang “thereof” ay “ng bagay na kababanggit lang.”',
    },
  },
  {
    id: 'solidary',
    name: 'Jointly and severally / solidary',
    pattern: /\bjointly\s+and\s+severally\b|\bsolidar(?:y|ily)\b/i,
    def: {
      English: 'Each person named can be made to pay the whole amount, not just their own share. Common between an agency and its client.',
      Filipino: 'Bawat isang nakapangalan ay maaaring pagbayarin ng buong halaga, hindi lang ng bahagi niya. Karaniwan ito sa agency at sa kliyente nito.',
      Taglish: 'Bawat isang nakapangalan ay puwedeng pagbayarin ng buong halaga, hindi lang ng share niya. Common ito sa agency at sa client nito.',
    },
  },
  {
    id: 'indemnify',
    name: 'Indemnify',
    pattern: /\bindemni(?:fy|fies|fied|fication|ty)\b/i,
    def: {
      English: 'To pay for someone else’s loss or damage. Check who must pay whom, and for what.',
      Filipino: 'Ang pagbabayad sa pagkalugi o pinsala ng iba. Alamin kung sino ang magbabayad kanino, at para saan.',
      Taglish: 'Ang pagbayad sa loss o damage ng iba. Alamin kung sino ang magbabayad kanino, at para saan.',
    },
  },
  {
    id: 'holdHarmless',
    name: 'Hold harmless',
    pattern: /\b(?:hold|save)\s+(?:[\w.,-]+\s+){0,6}harmless\b/i,
    def: {
      English: 'A promise not to blame or sue the other side if something goes wrong, and sometimes to cover their costs.',
      Filipino: 'Pangakong hindi sisisihin o idedemanda ang kabilang panig kapag may nangyaring masama, at minsan ay sasagutin pa ang gastos nila.',
      Taglish: 'Pangakong hindi sisisihin o kakasuhan ang kabilang side kapag may nangyaring masama, at minsan sasagutin pa ang gastos nila.',
    },
  },
  {
    id: 'nonCompete',
    name: 'Non-compete',
    pattern: /\bnon-?compet(?:e|ition)\b/i,
    def: {
      English: 'A limit on working for a competitor for some time after you leave. Check how long and where it applies.',
      Filipino: 'Limitasyon sa pagtatrabaho sa kakumpitensya nang ilang panahon matapos kang umalis. Alamin kung gaano katagal at saan.',
      Taglish: 'Limit sa pagtatrabaho sa competitor nang ilang panahon pagkaalis mo. Alamin kung gaano katagal at saan.',
    },
  },
  {
    id: 'trainingBond',
    name: 'Training bond',
    pattern: /\btraining\s+bond\b|\bemployment\s+bond\b|\bservice\s+bond\b/i,
    def: {
      English: 'A promise to stay for a set time after training, or pay back some of its cost if you leave early.',
      Filipino: 'Pangakong mananatili nang takdang panahon matapos ang training, o babayaran ang bahagi ng gastos kung aalis nang maaga.',
      Taglish: 'Pangakong mag-stay nang takdang panahon pagkatapos ng training, o babayaran ang part ng gastos kung aalis nang maaga.',
    },
  },
  {
    id: 'sil',
    name: 'Service incentive leave',
    pattern: /\bservice\s+incentive\s+leave\b/i,
    def: {
      English: 'At least 5 days of paid leave a year once you have worked for one year.',
      Filipino: 'Hindi bababa sa 5 araw na bayad na bakasyon bawat taon matapos ang isang taon ng serbisyo.',
      Taglish: 'At least 5 days na paid leave kada taon kapag naka-isang taon ka na sa trabaho.',
    },
  },
  {
    id: 'nightDiff',
    name: 'Night differential',
    pattern: /\bnight[-\s]?(?:shift\s+)?differential\b/i,
    def: {
      English: 'At least 10% extra per hour for work between 10 PM and 6 AM.',
      Filipino: 'Dagdag na hindi bababa sa 10% bawat oras para sa trabaho mula 10 ng gabi hanggang 6 ng umaga.',
      Taglish: 'Dagdag na at least 10% kada oras para sa trabaho mula 10 PM hanggang 6 AM.',
    },
  },
  {
    id: 'forceMajeure',
    name: 'Force majeure',
    pattern: /\bforce\s+majeure\b|\bfortuitous\s+events?\b|\bacts?\s+of\s+god\b/i,
    def: {
      English: 'Events no one can control, like disasters, that can excuse a side from doing what the contract says.',
      Filipino: 'Mga pangyayaring walang may kontrol, gaya ng kalamidad, na maaaring magpaumanhin sa hindi pagtupad sa kontrata.',
      Taglish: 'Mga pangyayaring walang may control, gaya ng kalamidad, na puwedeng mag-excuse sa hindi pagsunod sa kontrata.',
    },
  },
  {
    id: 'severability',
    name: 'Severability',
    pattern: /\bseverab(?:le|ility)\b|\bseparability\b/i,
    def: {
      English: 'If one part of the contract is found invalid, the rest of the contract still applies.',
      Filipino: 'Kapag napatunayang walang bisa ang isang bahagi ng kontrata, may bisa pa rin ang natitirang bahagi.',
      Taglish: 'Kapag napatunayang invalid ang isang part ng kontrata, valid pa rin ang natitirang parts.',
    },
  },
  {
    id: 'jurisdiction',
    name: 'Jurisdiction / venue',
    pattern: /\bjurisdiction\b|\bvenue\s+of\s+(?:any\s+)?(?:action|suit|case)s?\b|\bgoverning\s+law\b/i,
    def: {
      English: 'Which law applies and which court or office handles it if there is a dispute.',
      Filipino: 'Kung aling batas ang susundin at aling korte o tanggapan ang hahawak kapag may hindi pagkakasundo.',
      Taglish: 'Kung aling batas ang susundin at aling court o office ang hahawak kapag may dispute.',
    },
  },
  {
    id: 'covenant',
    name: 'Covenant',
    pattern: /\bcovenants?\b/i,
    def: {
      English: 'A formal promise written in the contract. Breaking it can have the consequences the contract lists.',
      Filipino: 'Pormal na pangakong nakasulat sa kontrata. Ang paglabag dito ay maaaring may kahihinatnan na nakasaad.',
      Taglish: 'Formal na pangakong nakasulat sa kontrata. Kapag nilabag, puwedeng may consequence na nakasulat.',
    },
  },
]

/** The glossary entry a typed question is about (e.g. "ano ang force majeure?"), or null. */
export function matchGlossary(question) {
  const text = String(question ?? '')
  return GLOSSARY.find((entry) => entry.pattern.test(text)) ?? null
}

/**
 * Scans the OCR lines and returns the glossary terms that appear in the document,
 * in the order they first appear. Each hit carries where it was read.
 *
 * @param linesByPage [{ pageNumber, lines: [{ text }] }] from extractFields
 * @returns [{ id, name, def, count, page, quote, match }]
 */
export function findTerms(linesByPage) {
  const found = new Map()
  linesByPage.forEach(({ pageNumber, lines }) => {
    lines.forEach((line, i) => {
      // Join with the next line so terms broken across a line wrap are still found.
      const next = lines[i + 1]?.text ?? ''
      const window = next ? `${line.text} ${next}` : line.text
      const hits = []
      for (const entry of GLOSSARY) {
        const flags = entry.pattern.flags.includes('g') ? entry.pattern.flags : `${entry.pattern.flags}g`
        for (const m of window.matchAll(new RegExp(entry.pattern.source, flags))) {
          // Count only matches that START on this line, so wraps are not counted twice.
          if (next && m.index > line.text.length) continue
          hits.push({ entry, m })
        }
      }
      // Keep reading order within the line.
      hits.sort((a, b) => a.m.index - b.m.index)
      for (const { entry, m } of hits) {
        const hit = found.get(entry.id)
        if (hit) {
          hit.count += 1
          continue
        }
        const spansNext = m.index + m[0].length > line.text.length
        found.set(entry.id, {
          id: entry.id,
          name: entry.name,
          def: entry.def,
          count: 1,
          page: pageNumber,
          order: found.size,
          quote: spansNext ? window : line.text,
          match: m[0],
        })
      }
    })
  })
  return [...found.values()].sort((a, b) => a.order - b.order)
}
