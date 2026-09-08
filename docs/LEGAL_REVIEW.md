# FoodieGoals legal research and launch checklist

Research date: September 8, 2026. Operating location supplied by owner: Boardman, Ohio. Audience age is **not yet confirmed**. This is a preliminary, source-backed product review, not a legal opinion or a certification of compliance. It does not cover every state or municipal ordinance. Recheck applicable law and the actual product before launch, especially if recommendations, monetization, or collected data change.

## What was reviewed

The current local prototype filters restaurant meal combinations against user-entered nutrition preferences. It does not assess medical history, calculate a prescribed diet, sell food, or provide clinician services. It has 30 sourced combinations from three chains, two demonstration ZIP centers, no verified restaurant branches, and browser-only favorites. Chipotle data is explicitly historical (July 2022). There are no accounts or public deployment. These facts narrow some issues; they do not establish a legal exemption.

Code reference points: `app/lib/matching.ts`, `app/lib/location.ts`, `app/app/api/search/route.ts`, `app/app/page.tsx`, and `app/data/verified.json`. The requested seven-day planner is a **software development schedule**, not a weekly diet prescribed to users.

## Priority findings

| Priority | Finding | Future action and evidence needed |
| --- | --- | --- |
| Before public launch | Ohio allows general non-medical nutrition information but regulates dietetics and certain professional titles. The boundary depends on behavior and presentation. | Ohio counsel reviews actual screens, defaults, objectives, marketing, and any generated advice. Record the permitted product scope. |
| Before operating as a business | Boardman lists zoning compliance for new businesses and a home-occupation application. Applicability to this operation is unconfirmed. | Owner confirms parcel jurisdiction and requirements with Planning and Zoning; retain the response and any required approval. |
| Before public launch | Nutrition provenance is documented, but currentness and reuse rights are separate questions. The external restaurant photo has no documented reuse permission. | Record source rights and freshness; license or replace the photo; refresh historical entries or keep them out of current recommendations. |
| Before accounts | Identified nutrition preferences and meal history may raise consumer health-data duties outside HIPAA. | Complete a data map, jurisdiction review, retention/deletion design, vendor review, and accurate privacy disclosures. |
| Before nationwide launch | Two demo ZIPs and zero verified branches cannot substantiate nationwide nearby-meal claims. | Audit ZIP recognition and branch coverage separately, with visible limitations and dated evidence. |
| Before collecting minors' information | Intended age group is unresolved. | Owner chooses audience; assess child-directed content, actual knowledge, and applicable teen protections. |

## Ohio: food information versus practicing dietetics

[Ohio Revised Code 4759.01](https://codes.ohio.gov/ohio-revised-code/section-4759.01) defines the practice of dietetics to include nutritional assessment and certain nutrition counseling, education, and care standards. [Section 4759.02](https://codes.ohio.gov/ohio-revised-code/section-4759.02) restricts unlicensed practice, offers to practice, and protected representations.

The current [Ohio Administrative Rule 4759-2-01, effective October 31, 2025](https://codes.ohio.gov/assets/laws/administrative-code/authenticated/4759/0/2/4759-2-01_20251031.pdf) expressly distinguishes general non-medical nutrition information. It also defines assessment, counseling, medical nutrition therapy, and titles tending to imply dietetics practice. **Our inference:** filtering published meal facts using numbers the user chooses is closer to general information than assessing a person's nutritional needs. That inference is not a ruling on FoodieGoals, and increasingly personalized advice could change the analysis.

[Section 4759.10](https://codes.ohio.gov/ohio-revised-code/section-4759.10) contains specific exemptions, including certain literature distribution and approved general weight-control instruction. Do not assume that being free, adding a disclaimer, or calling the app educational automatically satisfies one.

Proposed product boundary for review: describe which entered constraints a meal satisfies; explain arithmetic and source dates; avoid claiming that the numbers are medically suitable. Do not introduce disease-treatment objectives, personalized intake prescriptions, or professional nutrition titles without a new assessment. A legal disclaimer cannot change the substance of the service. This is a proposed design boundary, not an implemented change.

Ohio's [Consumer Sales Practices Act, section 1345.02](https://codes.ohio.gov/ohio-revised-code/section-1345.02) prohibits unfair or deceptive acts in covered consumer transactions. Have counsel assess applicability to the eventual business model and review freshness, proximity, affiliation, and results claims. An Ohio base does not resolve other states' dietetics or consumer-protection requirements when serving their residents.

## Boardman: confirm the business use

The township's [permit page](https://www.boardmantwp.com/zoning/permit-applications-and-fees/) identifies zoning compliance as needed for new businesses and lists home occupations. Its [home-occupation application](https://www.boardmantwp.com/zoning/files/2025/02/Home-Occupation-Permit.pdf) describes permitted residential business uses and restrictions. Whether this particular online operation requires an application depends on its actual location and use; the page alone does not settle that question.

Owner action: contact [Boardman Planning and Zoning](https://www.boardmantwp.com/zoning/) and confirm the property is within its jurisdiction. Do not put a home address in the repository. Allow time for administrative review beyond this development week.

Suggested inquiry, **not sent**: “I plan to operate an online restaurant nutrition search business from Boardman. There will be no food preparation, food storage, or customer visits at the premises [confirm these facts before sending]. Does this use need zoning compliance and/or a home-occupation permit, and what other local approvals apply?”

Business registration, tax treatment, insurance, and any later food sales or delivery arrangement need a separate business review. This research does not conclude that restaurant permits are required for the current informational prototype, or that every possible local permit has been ruled out.

## Federal claims, medical software, and menu labels

The [FTC Health Products Compliance Guidance](https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance) explains truthfulness, substantiation, and express or implied health claims. “Contains 35 g protein according to the linked source” and “will make you lose weight” require different support. Avoid unsubstantiated health outcomes, allergy-safety guarantees, or suggestions of restaurant endorsement. Explanations and disclaimers must not contradict the main message.

The FDA's [January 2026 General Wellness guidance](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/general-wellness-policy-low-risk-devices) addresses low-risk wellness products and the statutory exclusion for certain healthy-lifestyle software unrelated to disease. This is guidance, not universal approval. Medical or disease-specific functionality would require a fresh device analysis.

[FDA menu-labeling requirements](https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/menu-labeling-requirements) principally address covered restaurants and similar establishments, including qualifying chains with 20 or more locations. **Inference:** a standalone informational search site is not itself such a restaurant merely because it reproduces meal facts. Reassess if the business starts selling food or operating ordering services. Restaurant labeling compliance does not guarantee FoodieGoals' copy, combinations, or data are accurate.

## Privacy and security: current and future

The current prototype sends ZIP and nutrition filters to its own search API and saves favorites in browser storage. Search persistence is not intentionally implemented. Before making a privacy promise, inspect hosting logs, error reporting, external image requests, analytics, and every vendor: absence of an account does not mean absence of personal data processing.

| Topic | Applicability and planned response |
| --- | --- |
| HIPAA | Personal consumer apps are not automatically covered entities or business associates. Relationships with providers or health plans could change this. Do not advertise HIPAA compliance without an actual assessment. See [HHS personal apps guidance](https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/cell-phone-hipaa/index.html). |
| FTC Health Breach Notification Rule | A qualifying personal health record involves identifiable health information and the technical capacity to draw from multiple sources. Accounts alone do not establish coverage; future saved health goals or integrations need analysis. Assess breach and unauthorized-disclosure scenarios, vendors, and notification responsibilities. See [FTC compliance guidance](https://www.ftc.gov/business-guidance/resources/complying-ftcs-health-breach-notification-rule-0). |
| Washington My Health My Data | Out-of-state services and small businesses may be covered when handling covered consumer health data. Whether nutrition history constitutes that data depends on its content and inferences. The law addresses health-data policies, consent or necessary-service exceptions, separate sharing consent, deletion, security, processors, and sale authorization. A generic terms checkbox is not enough for required consent. See [RCW 19.373](https://app.leg.wa.gov/RCW/default.aspx?cite=19.373&full=true). |
| Nevada health data | Review the consumer-health-data provisions and definitions in [NRS 603A.400 onward](https://www.leg.state.nv.us/nrs/nrs-603a.html) before serving affected consumers with identified nutrition histories. Do not assume the same scope or exceptions as Washington. |
| California | CCPA coverage depends on statutory applicability and thresholds; it is not automatic for every startup. CalOPPA privacy-policy duties are a separate question for commercial services collecting covered information from Californians. See [California AG CCPA guidance](https://www.oag.ca.gov/privacy/ccpa), [current CPPA monetary adjustments](https://cppa.ca.gov/regulations/cpi_adjustment.html), and [AG privacy-policy guidance](https://oag.ca.gov/sites/all/files/agweb/pdfs/cybersecurity/making_your_privacy_practices_public.pdf). |
| Children and teens | COPPA concerns child-directed services and certain collection with actual knowledge about children under 13. An adults-only label is not a universal exemption. Confirm audience and assess state teen protections separately. Use the revised rule linked in the [FTC COPPA FAQ](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions). |
| Breach response | Assess [Ohio section 1349.19](https://codes.ohio.gov/ohio-revised-code/section-1349.19), other affected residents' state laws, and applicable federal duties. Create an incident process with counsel-confirmed triggers and deadlines; do not assume one nationwide deadline. |

This is a priority screen, **not a completed 50-state privacy survey**. Before nationwide accounts, create a current state applicability matrix based on data, audience, business model, and statutory thresholds. No health advertising, data sale, tracking SDK, HealthKit integration, or precise GPS collection is assumed in the first account release.

Recommended engineering controls, which are not all standalone legal requirements: collect only necessary data; use established authentication; isolate each user's records on the server; support export and deletion; limit retention; secure sessions; redact logs; test backups and incident response. Privacy statements must match deployed behavior and actual vendor agreements.

## Accessibility, content rights, and platform policies

The [DOJ web-accessibility guidance](https://www.ada.gov/resources/web-guidance/) explains accessibility obligations for covered businesses. The application of Title III to an online-only business can be jurisdiction-dependent. Use WCAG 2.2 AA as the engineering target; do not confuse government Title II deadlines or standards with a universal private-site rule. Test keyboard navigation, screen readers, focus, form errors, zoom, contrast, and mobile touch targets when redesigning.

Photographs are protected works; public access or hotlinking does not establish a commercial reuse license. See the [Copyright Office photography guidance](https://www.copyright.gov/registration/photographs/). The current external restaurant photo needs a documented rights basis or replacement. Review each restaurant's applicable terms, nutrition-document rights, logos, and provider caching/display restrictions. [Chick-fil-A's legal index](https://www.chick-fil-a.com/legal) is a starting point, not evidence of permission. No complete restaurant terms/license review has been completed here. Source attribution establishes provenance, not permission.

Domain availability also does not establish trademark clearance. Before investing in the brand, commission a name/confusing-similarity review. No domain purchase, trademark application, or legal clearance has occurred.

For future iOS, [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) are **platform contract rules, not US legislation**. Plan account deletion, accurate privacy disclosures, and review login-service requirements if adding third-party social authentication. Sign in with Apple is not automatically required for every email-login app. Apple describes deletion expectations in its [account-deletion guidance](https://developer.apple.com/support/offering-account-deletion-in-your-app/). Recheck policies when building the port.

## Questions to resolve and release evidence

- [ ] Owner confirms age audience, business structure, monetization, and whether any medical or weight-loss coaching is intended.
- [ ] Ohio counsel reviews the real recommendation flow and resolves licensure/representation questions; nationwide scope receives a state-law review.
- [ ] Owner confirms Boardman zoning/business-use requirements and any required approvals.
- [ ] Every public nutrition record and asset has currentness and rights evidence; uncertainty is disclosed accurately.
- [ ] Privacy data map, applicable-law matrix, vendor agreements, retention schedule, policy, deletion flow, and incident plan match the proposed release.
- [ ] Accessibility and claims reviews produce documented findings and resolutions.
- [ ] Any new paid subscriptions, advertising, food ordering, precise location, health integrations, or minors' access triggers additional review before introduction.

No authority, lawyer, restaurant, or vendor was contacted as part of this research. The outstanding items are not findings that the current prototype is necessarily unlawful; they are the evidence still needed before claiming launch readiness.
