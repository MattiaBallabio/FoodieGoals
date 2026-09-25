# Interface and calorie filters

Implemented September 8, 2026, after the owner authorized the redesign and filter work. Two specialist subagents prepared independent UI and filter drafts outside the shared checkout. The lead reviewed and integrated them, adjusted typography/control accessibility and fieldset layout, and performed combined validation.

## Appearance

- Deep navy text (#142b42), teal actions (#087c72), cool neutral backgrounds, clearer input borders, rounded panels, and consistent meal/map cards.
- Inter is self-hosted at `/fonts/InterVariable.woff2`, with a system-font fallback and font-display swap. No Google Fonts request is introduced. The original, unmodified font comes from the [official Inter v4.1 release](https://github.com/rsms/inter/releases/tag/v4.1), with its SIL Open Font License retained in `app/public/fonts/LICENSE.txt`.
- Body text is 16px; operational labels generally 14px or larger. Important controls have visible focus, key text color pairs exceed 4.5:1 in the static palette review, and reduced-motion preferences are supported. This is not a full accessibility certification.
- Calorie inputs appear side by side on larger screens and stack on small phones. Existing category selection, optional nutrient controls, map, detail dialog, and saved meals continue to use the same flows.
- Restaurant identifiers remain neutral initials. The pre-existing restaurant food photo remains; its rights are still unresolved in the legal review. This redesign does not establish new permission for that asset.

## Calorie contract

New search requests send `calories: { min: 500, max: 700 }` by default. Both values are required finite whole numbers between 0 and 10,000 inclusive, with min <= max. Equality is allowed. Zero is an actual boundary, not an empty preference. These input guardrails do not prescribe nutritionally suitable meals.

Filtering includes both endpoints. Unknown calorie values cannot satisfy the filter. A miss explains whether the meal is below the minimum or above the maximum. Calorie sorting uses distance to `(min + max) / 2`, then stable meal ID. Other sorting modes keep their primary sort and use this midpoint distance as the tie-breaker.

Optional protein, carbohydrate, fat, and fiber preferences retain their separate minimum/maximum/target-with-tolerance behavior. Saved meal IDs and the existing browser storage key are unchanged.

For compatibility, the API accepts the previous `calories: { value: 600, mode: 'range', tolerance: 100 }` format and translates it to lower=max(0, value-tolerance), upper=value+tolerance. It rejects mixed old/new formats. Previously accepted legacy decimals and derived upper limits above 10,000 remain valid on that legacy path; new explicit inputs use the stricter whole-number contract. When the old lower limit clipped to zero, midpoint sorting can differ from sorting around the old target, although eligibility stays the same.

## Completion evidence and limits

Validation covers inclusive/equal/zero bounds, malformed or missing input, reversed bounds, legacy compatibility, ranking, optional nutrients, and actual HTTP search results. Browser checks cover inline errors, exact 500-calorie search, 44512 shortcut, editing filters, normal search/details, and saved meals after reload. The font loaded locally, desktop and small-phone layouts were inspected, and map directions were checked.

This is a local demo with three supported recommendation ZIPs (44512, 10001, 02108), not nationwide availability or a public launch. Accounts, cloud-synced favorites, native iOS, and broader legal/data work remain future milestones.
