# Restaurant logo review

Checked September 8, 2026 for FoodieGoals: small restaurant identifiers next to meal recommendations on an independent website, with a possible future commercial release and iOS port.

**Official logos enabled: none.** No documented permission covering this use was established for the three current restaurants. This is a conservative implementation decision, not a legal conclusion that all unlicensed identification uses are unlawful. Trademark identification defenses and copyright exceptions are fact-specific; this review does not rely on them as legal clearance.

| Restaurant | Official evidence | Decision |
| --- | --- | --- |
| Panda Express | [Terms, sections 5–6](https://www.pandaexpress.com/legal) reserve content rights, limit the service license to personal/noncommercial use, and require prior written permission for Panda marks. The [Panda media center](https://www.pandarg.com/media-center) offers logo downloads for materials in a media context, but did not establish a clear app-specific grant resolving that restriction. | Permission scope unresolved. Use neutral **PE** text badge. |
| Chipotle | [Terms, “Chipotle Property” and “Access to the Services”](https://www.chipotle.com/terms-of-use) restrict reproduction/display of Chipotle content without prior express written consent, except where otherwise noted. No exception covering FoodieGoals was found. | Use neutral **C** text badge. |
| Chick-fil-A | The [US general terms page](https://www.chick-fil-a.com/legal/terms-conditions/chick-fil-a-inc-terms-conditions-of-use) did not expose its substantive text through the research reader. Its [official shop terms, section 2](https://shop.chick-fil-a.com/policies/terms-of-service) reserve logo/content rights and restrict reuse; these are shop-specific terms, not substituted for the missing general terms. The [official media resources page](https://www.chick-fil-a.com/press-room/media-resources) did not establish a permission grant for this app. | General permission remains unverified. Use neutral **CFA** text badge. |

Publicly accessible downloads, press assets, search-engine images, and third-party logo APIs do not by themselves establish all necessary rights. A license to an API service also does not necessarily grant the restaurant's trademark or artwork rights. No logo files were downloaded, traced, generated, recolored, or hotlinked.

## What changed

The shared `app/components/restaurant-name.tsx` displays plain initials in the same neutral badge style for all restaurants, next to the full restaurant name. It is used on search-result cards, saved-meal cards, and meal details. Badges are decorative and hidden from screen readers; the full name remains accessible. Unknown restaurants get their first character. There are no added third-party network requests, dependencies, or changes to matching, nutrition data, or saved-meal storage.

These are FoodieGoals interface labels, not official restaurant logos. They do not copy distinctive lettering, brand colors, mascots, or logo geometry. No sponsorship or restaurant partnership is claimed. The separate pre-existing food photo still has the unresolved rights issue documented in [the legal review](LEGAL_REVIEW.md); this logo review does not clear it.

## Enabling a logo later

Before adding an official logo, retain written permission or a specific applicable published license, including the asset/version, rights holder, URL, date, commercial website/iOS scope, attribution, size/clear-space rules, and any expiry or revocation conditions. Keep private correspondence and personal details out of the repository; record a sanitized permission reference here.

Use the permitted original asset without tracing, distortion, or recoloring; preserve proportions and required clear space. Keep the full restaurant name and a text fallback if the image cannot load. Recheck permission if the placement, monetization, or platform changes. No permission requests have been sent.
