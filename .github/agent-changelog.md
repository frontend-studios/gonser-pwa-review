# Agent Change Log

This log tracks major repository changes made during AI-assisted sessions.
New entries must always be appended at the very bottom of this file.
Exception: existing entries may be updated in place when correcting or extending those same entries.

## 2026-04-07
- Scope: Upgrade and dependency alignment
- Change: Updated codebase from v2.21.1 to v2.24.0 (with theme exclusions), applied related config migrations, fixed post-upgrade type/import issues, and restored custom Tailwind theme colors.
- Impact: Project is aligned with upstream v2.24.0 baseline while preserving custom theme behavior and restored local visual tokens.
- Files: apps/web/nuxt.config.ts, apps/web/app/configuration/feature-flags.config.ts, apps/web/app/configuration/tailwind.config.ts, apps/web/tsconfig.json, apps/web/tsconfig.typecheck.json, apps/web/modules/theme/runtime/pages/product/[slug].vue, apps/web/package.json, package-lock.json
- Follow-up: Continue adding one concise entry per major change set.

## 2026-04-07
- Scope: Agent workflow
- Change: Added a repository-wide protocol in copilot instructions to read and update `.github/agent-changelog.md` for major changes.
- Impact: Future agent sessions now have a shared historical context and consistent major-change tracking.
- Files: .github/copilot-instructions.md, .github/agent-changelog.md
- Follow-up: Keep entries concise and skip formatting-only changes.

## 2026-04-07
- Scope: Theme footer compatibility
- Change: Updated the custom theme footer override to preserve the theme-specific static footer on non-blockified pages while restoring upstream v2.24.0 footer-block rendering when CMS block content is provided.
- Impact: Blockified pages and footer blocks regain current core footer behavior without losing the custom storefront footer.
- Files: apps/web/modules/theme/runtime/components/blocks/Footer/Footer.vue
- Follow-up: Apply the same upstream-vs-custom merge pattern to remaining theme overrides that fully replace core blocks/components.

## 2026-04-07
- Scope: Theme footer compatibility
- Change: Corrected the footer override to keep the custom theme footer markup on blockified pages as well, while retaining the core v2.24.0 visibility rule that only renders footer blocks on blockified pages when block content exists.
- Impact: The storefront uses the custom footer consistently, but footer-block presence on blockified pages still follows the current core rendering behavior.
- Files: apps/web/modules/theme/runtime/components/blocks/Footer/Footer.vue
- Follow-up: For other theme overrides, preserve core lifecycle and visibility logic first, and only adopt core markup when the custom design should actually change.

## 2026-04-07
- Scope: Theme override compatibility (v2.24.0)
- Change: Updated customized theme overrides to match core v2.24.0 behavior: ProductCard now uses lazy/near-viewport image loading flow, Search now includes search-suggestion dropdown/state handling, and product page metadata watcher logic was aligned with current structured-data updates; existing MegaMenu and QuickCheckout compatibility changes were verified against upstream deltas.
- Impact: Customized storefront UI is retained while restoring missing core behavior introduced between v2.21.1 and v2.24.0.
- Files: apps/web/modules/theme/runtime/components/ui/ProductCard/ProductCard.vue, apps/web/modules/theme/runtime/components/ui/Search.vue, apps/web/modules/theme/runtime/pages/product/[slug].vue, apps/web/modules/theme/runtime/components/MegaMenu/MegaMenu.vue, apps/web/modules/theme/runtime/components/QuickCheckout/QuickCheckout.vue
- Follow-up: Continue with the remaining customized overrides that were not changed upstream, then run targeted smoke checks for search suggestions, product card image loading, and PDP metadata output.

## 2026-04-07
- Scope: Mobile mega menu behavior
- Change: Fixed theme MegaMenu mobile drawer placement and backdrop interaction by basing drawer top offset on the header bottom viewport position (including active info-bar/search stack) and wiring backdrop clicks to close the menu.
- Impact: On mobile, the menu opens below visible header content and closes when users click the greyed-out background.
- Files: apps/web/modules/theme/runtime/components/MegaMenu/MegaMenu.vue
- Follow-up: Verify behavior on pages with and without info-bar content and while scrolled.

## 2026-04-08

## 2026-05-27
- Scope: PDP USP translation formatting
- Change: Updated usp5 translation strings in DE/EN/FR to use inline strong markup for the leading shipping phrase.
- Impact: USP text now renders with emphasized lead phrase consistently across all three locales.
- Files: apps/web/modules/theme/runtime/lang/de.json, apps/web/modules/theme/runtime/lang/en.json, apps/web/modules/theme/runtime/lang/fr.json
- Follow-up: Run targeted PDP smoke checks for single-image and multi-image products (desktop/mobile) and verify thumbnail fallback only appears when preview URLs are invalid.
- Files: apps/web/modules/theme/runtime/pages/product/[slug].vue, apps/web/modules/theme/runtime/components/ui/ProductPseudoVariants/ProductPseudoVariants.vue, apps/web/modules/theme/runtime/components/ui/ProductPseudoVariants/types.ts
- Follow-up: Run a quick PDP smoke test for color and size switching, including out-of-stock variants.

## 2026-04-08
- Scope: PDP sticky add-to-cart visibility
- Change: Updated sticky add-to-cart rendering to require both the scroll trigger and product salability, so the sticky bar does not render for unavailable products.
- Impact: Users no longer see an irrelevant sticky add-to-cart prompt when an item cannot be purchased.
- Files: apps/web/modules/theme/runtime/pages/product/[slug].vue
- Follow-up: Validate sticky behavior on both salable and unsalable PDP variants.

## 2026-04-08
- Scope: PDP sticky add-to-cart layout refinements
- Change: Consolidated sticky ATC follow-up refinements: mobile layout now lets the image scale with content while capping it at 144x144 and shrinking it first under tight widths, prices remain fully visible and non-wrapping, currency styling is de-emphasized relative to the amount, CTA alignment was corrected against the image border, and desktop behavior was restored via lg-specific overrides.
- Impact: Sticky card is more robust on mobile under constrained widths while preserving the intended desktop design and clearer price hierarchy.
- Files: apps/web/modules/theme/runtime/pages/product/[slug].vue
- Follow-up: Validate on smallest supported mobile viewport with discount badge on/off and compare against desktop layout.

## 2026-04-09
- Scope: PDP availability UX
- Change: Enabled the Notify Me flow in the custom theme PDP add-to-cart section by matching core gating logic (site setting + unsalable active variation) and rendering the existing NotifyMe component instead of a disabled add-to-cart button.
- Impact: Unavailable variants now present a functional subscription path for back-in-stock notifications on the overridden PDP.
- Files: apps/web/modules/theme/runtime/pages/product/[slug].vue
- Follow-up: Run notify-me smoke flow on an unsalable variant and verify email-template/action-link backend setup.

## 2026-04-09
- Scope: Notify Me button styling
- Change: Applied rounded-pill styling to Notify Me button wrapper on theme PDP by adding `rounded-[40px] overflow-hidden` Tailwind classes, clipping the button corners to match Add to Cart shape without modifying core components.
- Impact: PDP unavailable-state CTA now has identical corner radius and visual weight as the purchase CTA while retaining Notify Me content/color.
- Files: apps/web/modules/theme/runtime/pages/product/[slug].vue
- Follow-up: Validate button appearance on mobile and desktop PDP for unavailable variants.

## 2026-04-09
- Scope: GonserBox mobile content layout
- Change: Updated the GonserBox content row to use explicit 75/25 column sizing on small screens, made the image fill its column width so it scales down instead of pushing the layout, and reduced the mobile text-image gap to `gap-1` while keeping `md:gap-3` on wider breakpoints.
- Impact: On mobile, the two info texts stay on the left while the box image remains on the right, shrinks with available space, and uses horizontal space more efficiently.
- Files: apps/web/modules/theme/runtime/components/ui/GonserBox/GonserBox.vue
- Follow-up: Validate the layout and tighter spacing with long translated texts on the narrowest supported mobile breakpoint.

## 2026-04-10
- Scope: PDP pseudo-variant mobile color row
- Change: Updated the mobile color pseudo-variant row to be horizontally scrollable in a single line, and added top/right headroom plus vertical overflow visibility so top-right sale badges are not clipped while scrolling.
- Impact: Mobile users can swipe through all color variants without wrapping, and sale badges remain fully visible at tile edges.
- Files: apps/web/modules/theme/runtime/components/ui/ProductPseudoVariants/ProductPseudoVariants.vue
- Follow-up: Verify horizontal swipe usability and first/last badge visibility on narrow iOS/Android viewports.

## 2026-04-15
- Scope: Theme typography units
- Change: Converted custom heading font-size declarations in the theme runtime stylesheet from fixed `px` values to equivalent `rem` values using a 16px root baseline.
- Impact: Heading typography scales consistently with root font-size/accessibility settings while preserving the existing visual size ratio.
- Files: apps/web/modules/theme/runtime/assets/styles.scss
- Follow-up: Optionally align any remaining third-party or legacy pixel-based font sizes outside the custom theme layer.

## 2026-04-15
- Scope: Header logo responsive sizing
- Change: Updated the theme MegaMenu header logo container and image fit so mobile uses a fixed 175x25 size while desktop keeps the existing 280x40 layout.
- Impact: Mobile header branding now renders at the exact requested dimensions without affecting desktop presentation.
- Files: apps/web/modules/theme/runtime/components/MegaMenu/MegaMenu.vue
- Follow-up: Validate logo rendering on the smallest supported viewport and across locales with longer adjacent header controls.

## 2026-04-15
- Scope: Mobile mega menu nesting
- Change: Added conditional indentation for mobile category rows in the MegaMenu drawer so any opened submenu level is offset by 1rem.
- Impact: Opened mobile category levels are visually structured and easier to scan throughout the navigation path.
- Files: apps/web/modules/theme/runtime/components/MegaMenu/MegaMenu.vue
- Follow-up: Confirm preferred indentation behavior for utility links shown below categories in opened submenu levels.

## 2026-04-15
- Scope: InfoBar feature set consolidation
- Change: Implemented route-aware InfoBar behavior with global override plus translated-key fallback (`translated.*` then base keys), optional per-variant links via `*Link` i18n keys, robust text rendering using explicit `<a>`/`<div>` branches with `v-html`, session-scoped dismiss (`x`) via `sessionStorage`, and translation-driven close-button visibility via global per-language `theme.infoBar.closeButton` key. Localization visibility for link/close settings was preserved by using non-empty placeholders where required.
- Impact: InfoBar now renders reliably only when visible text exists, supports optional click-through destinations, allows session-only dismissal, and lets editors control close-button availability per language from Localization using a single global key.
- Files: apps/web/modules/theme/runtime/components/ui/InfoBar/InfoBar.vue, apps/web/modules/theme/runtime/lang/en.json, apps/web/modules/theme/runtime/lang/de.json

## 2026-04-15
- Scope: Theme default layout override
- Change: Added a theme runtime override for the default layout and registered it in the theme module layout resolver.
- Impact: Pages using the `default` layout now resolve through the theme layer, enabling layout-level customizations without touching core app files.
- Files: apps/web/modules/theme/runtime/layouts/default.vue, apps/web/modules/theme/index.ts
- Follow-up: Apply breadcrumb spacing adjustments in the new theme default layout override as needed.

## 2026-04-15
- Scope: Breadcrumb mobile spacing
- Change: Updated the theme default layout breadcrumb container classes to enforce `pb-0` on mobile while keeping desktop vertical padding.
- Impact: Breadcrumb wrapper no longer adds bottom padding on small viewports.
- Files: apps/web/modules/theme/runtime/layouts/default.vue

## 2026-04-15
- Scope: PDP availability spacing
- Change: Made the availability row margin conditional so it uses `mb-2` when the green-availability USP row is rendered, and `mb-4` when it is not.
- Impact: Product detail spacing remains balanced when the special green availability message is absent.
- Files: apps/web/modules/theme/runtime/pages/product/[slug].vue

## 2026-04-15
- Scope: Breadcrumb mobile visibility
- Change: Updated theme Breadcrumbs rendering so desktop stays fully expanded, while mobile hides level 1 for long trails and shows Home + ellipsis + second-last + last.
- Impact: Mobile breadcrumbs preserve key navigation context with deterministic output and no level-1 duplication next to the ellipsis.
- Files: apps/web/modules/theme/runtime/components/ui/Breadcrumbs/Breadcrumbs.vue

## 2026-04-17
- Scope: Theme composable type safety
- Change: Removed unsafe any usage from GonserBox and EnergyLabel composables by introducing dedicated local type contracts, replacing open cart item index signatures, and adding typed property/value extraction helpers.
- Impact: Restores compile-time verification for property access and reduces risk of silent runtime failures when API shapes change.
- Files: apps/web/modules/theme/runtime/composables/useGonserBoxCart/useGonserBoxCart.ts, apps/web/modules/theme/runtime/composables/useGonserBoxCart/types.ts, apps/web/modules/theme/runtime/composables/useGonserBoxProperty/useGonserBoxProperty.ts, apps/web/modules/theme/runtime/composables/useGonserBoxProperty/types.ts, apps/web/modules/theme/runtime/composables/useEnergyLabel/useEnergyLabel.ts, apps/web/modules/theme/runtime/composables/useEnergyLabel/types.ts, .github/agent-changelog.md
- Follow-up: Add focused unit tests for mixed property value shapes and flat-vs-grouped variation property payloads.

## 2026-04-17
- Scope: Theme Nuxt module override strategy
- Change: Replaced glob-based composable import registration with a direct directory path, removed the fragile components:extend mutation hook, and added a targeted Gallery alias registration pointing to FancyboxGallery while keeping priority-based component overrides.
- Impact: Component and composable registration now rely on stable Nuxt APIs with less version-fragile behavior and lower maintenance overhead.
- Files: apps/web/modules/theme/index.ts, .github/agent-changelog.md
- Follow-up: Run a quick storefront smoke check for Header/Search/Footer, PDP gallery, and footer block rendering.

## 2026-04-17
- Scope: Code review fixes (batch 1)
- Change: Fixed hardcoded CHF currency on PDP by deriving it from cartGetters.getCurrency; removed conflicting Tailwind display utilities in contact.vue (grid+flex) and GonserBox.vue (rounded+rounded-[40px]); moved hardcoded energy label CDN base URL from composable into theme i18n lang files (de/en/fr) and read it via t().
- Impact: PDP now shows the correct currency for any shop configuration; layout conflicts are resolved; energy label CDN path is configurable per locale/environment without code changes.
- Files: apps/web/modules/theme/runtime/pages/product/[slug].vue, apps/web/modules/theme/runtime/pages/contact.vue, apps/web/modules/theme/runtime/components/ui/GonserBox/GonserBox.vue, apps/web/modules/theme/runtime/composables/useEnergyLabel/useEnergyLabel.ts, apps/web/modules/theme/runtime/lang/de.json, apps/web/modules/theme/runtime/lang/en.json, apps/web/modules/theme/runtime/lang/fr.json
- Follow-up: Fix direct product cache mutation (review data) and QuickCheckout anonymous scroll listener accumulation.

## 2026-04-17
- Scope: Code review fixes (batch 2)
- Change: Replaced direct mutation of cached product objects (feedbackCount/feedbackDecimal) with local Map-based review stores (similarReviewMap, xsellingReviewMap, reviewMap) keyed by itemId; display computed properties now produce shallow-spread copies with review data merged in. Fixed QuickCheckout category slider anonymous scroll listener accumulation by storing named handler references on each CategorySlider object, removing the previous handler before re-registering on each watch trigger, and adding onBeforeUnmount cleanup for all three slider scroll listeners.
- Impact: Cached product objects in useProductRecommended and useRecentlyViewed are no longer mutated; review data is decoupled from API cache. QuickCheckout no longer accumulates stale scroll listeners across category data loads within a single drawer session.
- Files: apps/web/modules/theme/runtime/pages/product/[slug].vue, apps/web/modules/theme/runtime/components/ui/RecentlyViewedProducts/RecentlyViewedProducts.vue, apps/web/modules/theme/runtime/components/QuickCheckout/QuickCheckout.vue
- Follow-up: Consider adding unit tests for the review map merge logic in display computed properties.
## 2026-04-17
- Scope: Recently-viewed product fetch caching
- Change: Added `loadedItemIds` string field to `UseRecentlyViewedState`; `fetchProducts` now derives a fingerprint from stored item IDs and skips all API calls on re-mount when the fingerprint matches and state already has products. Cache is invalidated when items are removed or cleared.
- Impact: Navigating back to any page with the recently-viewed section no longer triggers up to 20 parallel product API calls per mount; only the first mount (or after the viewed list changes) fetches from the server.
- Files: apps/web/modules/theme/runtime/composables/useRecentlyViewed/useRecentlyViewed.ts, apps/web/modules/theme/runtime/composables/useRecentlyViewed/types.ts
- Follow-up: Consider migrating N individual getProduct calls to a batch/facet endpoint if the API supports item ID list filtering.

## 2026-04-17
- Scope: Contact page reCAPTCHA configuration and lifecycle
- Change: Kept the one-time reCAPTCHA script loading and widget lifecycle refactor in the contact page, and replaced i18n-based site key lookup with runtime configuration via `runtimeConfig.public.recaptchaSiteKey` sourced from `NUXT_PUBLIC_RECAPTCHA_SITE_KEY`.
- Impact: The reCAPTCHA site key is now environment-configurable without using language files, while preventing duplicate script injection and avoiding window-global callback leaks across navigations.
- Files: apps/web/modules/theme/runtime/pages/contact.vue, apps/web/nuxt.config.ts, apps/web/.env.example
- Follow-up: Set `NUXT_PUBLIC_RECAPTCHA_SITE_KEY` in deployment environment configuration for each stage/domain.

## 2026-04-17
- Scope: Font fallback defaults
- Change: Updated fallback/default font values from Red Hat Text to Open Sans in both Tailwind font-family configuration and runtime settings fallback (`NUXT_PUBLIC_FONT` default).
- Impact: When no custom font is configured, storefront and editor typography now fall back to Open Sans consistently.
- Files: apps/web/app/configuration/tailwind.config.ts, apps/web/app/configuration/settings.config.ts

## 2026-04-17
- Scope: Theme search submission behavior
- Change: Updated the theme Search submit handler to ignore empty/whitespace-only input before emitting events and navigating to the search route.
- Impact: Prevents accidental empty search submissions from the theme header search UI and avoids invalid empty-term navigation initiated from the form submit action.
- Files: apps/web/modules/theme/runtime/components/ui/Search.vue, .github/agent-changelog.md
- Follow-up: Add a theme search page override with null-safe rendering if direct manual navigation to `/search?term=` should also be hardened.

## 2026-04-23
- Scope: PDP Fancybox thumbnail scrollbar layout
- Change: Updated Fancybox thumbnail rail sizing and scrollbar spacing so the mobile horizontal scrollbar is rendered beneath the thumbnails and the desktop vertical scrollbar is shown in a dedicated right-side gutter.
- Impact: Thumbnail borders and images remain fully visible while scrolling, without scrollbar overlap on mobile or desktop.
- Files: apps/web/modules/theme/runtime/components/ui/FancyboxGallery/FancyboxGallery.vue
- Follow-up: Ensure Open Sans is available in the active font loading pipeline for all environments.

## 2026-04-23
- Scope: Quantity selector button styling
- Change: Replaced UiButton tertiary controls with native button elements; default background is white, hover turns light gray, disabled controls stay muted and do not darken on hover; text and icon color is neutral dark.
- Impact: Quantity selector controls are visually consistent with other gray buttons in the storefront and no longer pick up primary color tints from UiButton variant styles.
- Files: apps/web/modules/theme/runtime/components/ui/QuantitySelector/QuantitySelector.vue

## 2026-04-23
- Scope: Availability modal consolidation
- Change: Extracted the PDP availability popup into a shared `AvailabilityModal` component and reused it for both PDP availability click handling and GonserBox "more info" actions.
- Impact: Both entry points now render the same modal structure and content, reducing duplication and keeping behavior consistent.
- Files: apps/web/modules/theme/runtime/components/ui/AvailabilityModal/AvailabilityModal.vue, apps/web/modules/theme/runtime/pages/product/[slug].vue, apps/web/modules/theme/runtime/components/ui/GonserBox/GonserBox.vue

## 2026-04-23
- Scope: Breadcrumb mobile visibility
- Change: Replaced the fixed mobile breadcrumb rule with width-based visibility. Priority order for showing items is: last (current page), second-last (direct parent), second (main category), then remaining middle levels left-to-right. Selection stops as soon as an item doesn't fit, so lower-priority items never reappear when a higher-priority one was hidden. The ellipsis dropdown is rendered only at the actual hidden breadcrumb gap, not always directly after Home.
- Impact: Mobile breadcrumbs always show the most contextually relevant levels first; intermediate categories are hidden in a defined order and never unexpectedly reappear at narrower viewports.
- Files: apps/web/modules/theme/runtime/components/ui/Breadcrumbs/Breadcrumbs.vue

## 2026-04-23
- Scope: Sticky add-to-cart mobile alignment
- Change: Updated the sticky PDP add-to-cart info column to use a fixed mobile height matching the product image and vertical space distribution so the add-to-cart button aligns flush with the image bottom edge.
- Impact: On mobile, the sticky add-to-cart button baseline now lines up with the product image baseline for a cleaner, consistent card layout; desktop layout remains unchanged.
- Files: apps/web/modules/theme/runtime/pages/product/[slug].vue

## 2026-05-04
- Scope: MegaMenu desktop submenu layout
- Change: Increased desktop mega menu submenu distribution from up to 5 columns to up to 6 columns and adjusted the submenu wrapper max-width formula for the additional column.
- Impact: Desktop mega menu can display wider category sets with less vertical stacking and improved scanability.
- Files: apps/web/modules/theme/runtime/components/MegaMenu/MegaMenu.vue

## 2026-05-04
- Scope: MegaMenu desktop styling workflow
- Change: Added a single manual toggle constant (`KEEP_DESKTOP_MENU_OPEN_FOR_STYLING`) in MegaMenu to keep desktop mega menu panels open while styling, with close handlers respecting the toggle.
- Impact: Developers can switch one in-file variable to lock the desktop mega menu open during CSS/UI work, then switch it back for normal behavior.
- Files: apps/web/modules/theme/runtime/components/MegaMenu/MegaMenu.vue

## 2026-05-04
- Scope: Header search border and interaction styling
- Change: Removed `shadow-[inset_0_0_0_1px_var(--gray-dark)]` inset stroke from both desktop and mobile `UiSearch` wrapper classes in Header.vue (was causing double-border). On SfInput in Search.vue, pinned `ring-color` to `var(--gray-dark)` on hover/focus-within/active via Tailwind `hover:!ring-[var(--gray-dark)]` etc. on `wrapper-class` to suppress StorefrontUI's primary-color ring without removing the ring entirely (since SfInput renders its visual border as a Tailwind ring/box-shadow, not a real CSS border).
- Impact: Search input always shows the intended gray border; hover/focus/active states no longer show theme primary red highlight ring. Deep scoped CSS overrides removed in favour of Tailwind utilities on component props.
- Files: apps/web/modules/theme/runtime/components/ui/Header.vue, apps/web/modules/theme/runtime/components/ui/Search.vue

## 2026-05-05
- Scope: Breadcrumb product-name flash during navigation
- Change: Fixed the breadcrumbs component filtering logic to identify product entries by `link: '#'` instead of relying on `route.meta?.type === 'product'`, eliminating the race condition where stale product breadcrumbs were briefly shown during category navigation.
- Impact: Breadcrumb item names no longer flash when navigating between product and category pages; filtering is now deterministic and does not depend on route metadata synchronization timing.
- Files: apps/web/modules/theme/runtime/components/ui/Breadcrumbs/Breadcrumbs.vue
- Follow-up: None.

## 2026-05-05
- Scope: Font loading via theme overrides
- Change: Consolidated font loading changes into the theme layer: restored core Nuxt font defaults in the main config, enforced inclusion of weight `600` in the theme module setup, overrode `useSiteConfiguration` to request `400;500;600;700` for runtime font changes, and added a startup client fallback plugin requesting `300;400;500;600;700`.
- Impact: Semibold rendering is handled through module overrides for both initial page load and editor-triggered font changes, while keeping customization logic in `apps/web/modules/**`.
- Files: apps/web/nuxt.config.ts, apps/web/modules/theme/index.ts, apps/web/modules/theme/runtime/composables/useSiteConfiguration/useSiteConfiguration.ts, apps/web/modules/theme/runtime/plugins/font-runtime-fallback.client.ts
- Follow-up: If strict privacy mode is required, replace external Google font fallback with a local-font asset pipeline.

## 2026-05-05
- Scope: Repository instruction update
- Change: Added an explicit Tailwind-first styling rule to Copilot instructions, preferring Tailwind utilities and limiting custom CSS to cases Tailwind cannot express clearly.
- Impact: Future code changes should default to utility-class styling, reducing ad-hoc CSS and improving consistency.
- Files: .github/copilot-instructions.md
- Follow-up: None.

## 2026-05-05
- Scope: PDP description heading typography
- Change: Applied Tailwind heading utility variants with important (`!font-semibold`) for `h1`-`h6` on the product description HTML container so they override the existing `no-preflight` reset rules.
- Impact: HTML description headings should now consistently render semibold without adding scoped CSS.
- Files: apps/web/modules/theme/runtime/pages/product/[slug].vue
- Follow-up: None.

## 2026-05-06
- Scope: MegaMenu desktop behavior and responsive fitting
- Change: Consolidated desktop MegaMenu improvements into the final implementation: route-aware selected main-category styling (primary background with white text and no gray active override), proportional top-level width distribution by label length with max width 12.5rem and non-wrapping labels, responsive horizontal padding down to the equivalent of px-1, and a uniform last-resort font fallback driven by runtime overflow detection (including post-font-load recalculation) with shared steps of 1rem -> 0.875rem -> 0.8125rem.
- Impact: Desktop main categories clearly indicate the active section and use available horizontal space more efficiently before truncation, while any required font reduction happens consistently across all top-level items.
- Files: apps/web/modules/theme/runtime/components/MegaMenu/MegaMenu.vue
- Follow-up: Validate final balance at common zoom levels and confirm the smallest fallback font size remains acceptable for design and readability.

## 2026-05-08
- Scope: Theme footer translation empty-value handling
- Change: Added a shared footer i18n guard helper that trims translation values and treats empty, whitespace-only, and key-fallback results as absent; wired optional footer links and images to this helper for rendering and binding.
- Impact: Footer optional entries do not render when localization fields are blank or whitespace-only, preventing empty/broken anchors and images.
- Files: apps/web/modules/theme/runtime/components/blocks/Footer/Footer.vue
- Follow-up: Reuse the same helper pattern in other theme components that rely on optional localized URLs or asset paths.

## 2026-05-08
- Scope: Theme footer desktop bottom-row layout
- Change: Replaced the lower footer three-column grid with responsive flex (`flex-col` on mobile, `flex-row` on `lg`) and applied `lg:flex-1` plus left/center/right text and list alignment for the three blocks.
- Impact: Mobile stacking/order stays unchanged, while desktop consistently distributes the three blocks evenly across left, center, and right positions.
- Files: apps/web/modules/theme/runtime/components/blocks/Footer/Footer.vue
- Follow-up: Verify visual balance with long localized headlines/content on large and extra-large breakpoints.

## 2026-05-08
- Scope: Theme footer typography
- Change: Changed footer headline utility classes from `font-bold` to `font-semibold` across all footer headline sections.
- Impact: Footer headings now render with semibold weight to match requested typography.
- Files: apps/web/modules/theme/runtime/components/blocks/Footer/Footer.vue
- Follow-up: None.

## 2026-05-08
- Scope: Theme footer links grouping clarity
- Change: Updated the links subsection container from a wide two-column grid to responsive flex (`flex-col` on mobile, `md:inline-flex md:flex-row`) and then increased the desktop links-column spacing from `md:gap-8` to `md:gap-16` so both columns stay grouped without sitting too close together.
- Impact: On desktop, the two links columns read clearly as one section while keeping noticeably more separation; mobile stacking remains unchanged.
- Files: apps/web/modules/theme/runtime/components/blocks/Footer/Footer.vue
- Follow-up: Validate spacing against long localized link labels on md and lg breakpoints.

## 2026-05-27
- Scope: PDP mobile horizontal spacing consistency
- Change: Removed duplicated mobile left padding layers from similar-products and recently-viewed sections in the PDP theme page, and added a theme override for ReviewsAccordion with summary left padding changed from `pl-4` to `pl-0` plus accordion content padding changed from default `py-2 px-4` to `py-2 px-0` so spacing is resolved at source classes instead of CSS overrides.
- Impact: Mobile PDP sections now align to one left inset strategy from slug-level wrappers, and reviews no longer add extra internal left offsets from either summary or accordion content wrappers.
- Files: apps/web/modules/theme/runtime/pages/product/[slug].vue, apps/web/modules/theme/runtime/components/ui/RecentlyViewedProducts/RecentlyViewedProducts.vue, apps/web/modules/theme/runtime/components/ReviewsAccordion/ReviewsAccordion.vue, .github/agent-changelog.md
- Follow-up: Run a visual mobile smoke check on PDP with x-selling, similar products, recently viewed, and reviews present.

## 2026-05-27
- Scope: PDP reviews header typography
- Change: Updated the theme ReviewsAccordion summary title from a custom bold `h2` (`font-bold text-lg md:text-2xl`) to a plain `h3` so it inherits the same section heading style as other PDP lists.
- Impact: The reviews header now matches the visual hierarchy and typography of related/similar/recently-viewed section headers.
- Files: apps/web/modules/theme/runtime/components/ReviewsAccordion/ReviewsAccordion.vue, .github/agent-changelog.md
- Follow-up: Validate PDP header consistency on mobile and desktop.

## 2026-05-27
- Scope: PDP slider card minimum width
- Change: Added a minimum width to slider item wrappers in x-selling, similar-products, and recently-viewed sections and finalized it at `min-w-[155px]` while keeping existing responsive width calculations.
- Impact: Product cards in mobile horizontal lists no longer collapse below 155px, preventing inner content compression and unstable spacing.
- Files: apps/web/modules/theme/runtime/pages/product/[slug].vue, apps/web/modules/theme/runtime/components/ui/RecentlyViewedProducts/RecentlyViewedProducts.vue, .github/agent-changelog.md
- Follow-up: Verify visual balance and cards-per-view on smallest supported devices.

## 2026-05-27
- Scope: Footer social media spacing
- Change: Moved social platform visibility condition from the inner anchor to the list item so empty platforms are not rendered as flex items.
- Impact: Hidden/empty social media entries no longer leave residual spacing from list-item gaps.
- Files: apps/web/modules/theme/runtime/components/blocks/Footer/Footer.vue, .github/agent-changelog.md
- Follow-up: Verify footer social icon spacing across locales with partially filled social settings.

## 2026-05-27
- Scope: Footer social media render warning fix
- Change: Replaced `v-for`+`v-if` on the same social list item with a computed `socialPlatforms` list and iterated only valid entries.
- Impact: Removed the Vue runtime warning about undefined `i` during render while preserving the no-gap behavior for empty social entries.
- Files: apps/web/modules/theme/runtime/components/blocks/Footer/Footer.vue, .github/agent-changelog.md
- Follow-up: Smoke check footer social rendering in development console to confirm no warnings remain.

## 2026-05-27
- Scope: Footer awards mobile sizing
- Change: Updated footer awards image sizing to mobile-first fixed width (`w-[70px] h-auto`) with desktop behavior preserved via `md:h-[151px] md:w-auto`.
- Impact: On mobile, award logos now keep a consistent 70px width while preserving aspect ratio; desktop presentation remains unchanged.
- Files: apps/web/modules/theme/runtime/components/blocks/Footer/Footer.vue, .github/agent-changelog.md
- Follow-up: Verify both award logos stay visually balanced on narrow mobile viewports.

## 2026-05-27
- Scope: MegaMenu desktop main category casing
- Change: Added `lg:uppercase` to desktop main-category link classes (both expandable and non-expandable variants).
- Impact: Desktop main category labels are now fully capitalized, while mobile menu text remains unchanged.
- Files: apps/web/modules/theme/runtime/components/MegaMenu/MegaMenu.vue, .github/agent-changelog.md
- Follow-up: Verify label fit at smaller desktop widths with long category names.

## 2026-05-27
- Scope: Desktop layout width alignment
- Change: Unified desktop width constraints across header top row, mega menu (main row and submenu container), and footer by applying the same `max-w-screen-2xl` container alignment strategy.
- Impact: Header, mega menu, footer, and primary page content now share consistent horizontal boundaries on large screens; mobile behavior remains unchanged.
- Files: apps/web/modules/theme/runtime/components/MegaMenu/MegaMenu.vue, apps/web/modules/theme/runtime/components/blocks/Footer/Footer.vue, .github/agent-changelog.md
- Follow-up: Validate alignment and submenu wrapping on very wide and medium desktop breakpoints.

## 2026-05-27
- Scope: PDP sticky price alignment
- Change: Finalized sticky add-to-cart price row alignment by using baseline alignment (`items-baseline`) with inline-flex price blocks and no-wrap strike-price handling.
- Impact: Current amount, currency, and strike price now remain on one consistent baseline without strike-price drop on desktop.
- Files: apps/web/modules/theme/runtime/pages/product/[slug].vue, .github/agent-changelog.md
- Follow-up: Confirm consistency for products with and without strike prices, including long translated labels.

## 2026-05-27
- Scope: PDP GonserBox responsive placement
- Change: Kept GonserBox in its current right-column position for desktop and added a mobile-only placement below the description area using responsive visibility classes.
- Impact: On mobile, GonserBox now appears after the description content; desktop layout remains unchanged.
- Files: apps/web/modules/theme/runtime/pages/product/[slug].vue, .github/agent-changelog.md
- Follow-up: Verify spacing around description/GonserBox on narrow mobile viewports.

## 2026-05-27
- Scope: PDP mobile content gutter consistency
- Change: Switched from outer-wrapper horizontal padding to explicit section-level horizontal padding for gallery, right-area (buybox content), description, and mobile GonserBox (`px-5 xl:px-0`), while keeping only vertical top spacing on the layout wrapper.
- Impact: Mobile PDP core content now reliably keeps visible side gutters matching the intended list-section spacing behavior.
- Files: apps/web/modules/theme/runtime/pages/product/[slug].vue, .github/agent-changelog.md
- Follow-up: Validate left/right gutter consistency across PDP sections on narrow mobile widths.

## 2026-05-27
- Scope: PDP mobile GonserBox outer gutter
- Change: Moved mobile GonserBox spacing from the component class to an outer mobile-only wrapper (`div` with `px-5 xl:px-0 mt-4`).
- Impact: Mobile GonserBox now receives side spacing outside the box container, matching the spacing pattern used by adjacent PDP blocks; desktop remains unchanged.
- Files: apps/web/modules/theme/runtime/pages/product/[slug].vue, .github/agent-changelog.md
- Follow-up: Verify visual parity with fs-usps spacing on mobile.

## 2026-05-27
- Scope: PDP badge/wishlist row stability
- Change: Removed absolute positioning from the wishlist button and stabilized the top row with shared vertical alignment and a minimum row height (`items-center` + `min-h-[32px]`).
- Impact: Savings badge, discount badge, and wishlist button stay on one consistent height line across mobile/desktop, and the wishlist button no longer shifts into the title area when badges are absent.
- Files: apps/web/modules/theme/runtime/pages/product/[slug].vue, .github/agent-changelog.md
- Follow-up: Verify alignment for all badge combinations (none, sale only, discount only, both).

## 2026-05-27
- Scope: PDP USP emphasis rendering
- Change: Replaced HTML-in-translation approach for usp5 with component-side emphasis rendering using dedicated locale keys (`textBold`, `textRest`) and removed `v-html` for USP output.
- Impact: Restores stable translation file parsing/reload behavior while keeping the leading USP phrase bold in DE/EN/FR.
- Files: apps/web/modules/theme/runtime/pages/product/[slug].vue, apps/web/modules/theme/runtime/lang/de.json, apps/web/modules/theme/runtime/lang/en.json, apps/web/modules/theme/runtime/lang/fr.json
- Follow-up: If desired, apply the same split-key pattern to any other partially-emphasized translated labels.

## 2026-05-27
- Scope: Locale key coverage backfill
- Change: Backfilled missing keys in EN and FR language files from DE source values for temporary fallback completeness, without overwriting existing EN/FR entries.
- Impact: All DE translation keys now resolve in EN/FR (no missing-key gaps), reducing runtime fallback/missing-label issues until native translations are added.
- Files: apps/web/modules/theme/runtime/lang/en.json, apps/web/modules/theme/runtime/lang/fr.json
- Follow-up: Replace temporary DE fallback values with native EN/FR translations in business-critical checkout/cart/account copy.

## 2026-05-27
- Scope: PDP desktop gallery-description spacing
- Change: Finalized desktop spacing behavior by moving to a dedicated left-column flow (`left-area`) that stacks gallery and description with `gap: 1rem`, while keeping the right area in its own grid column.
- Impact: Gallery and description no longer reserve vertical space from right-column content; the desktop gap is now consistently tight.
- Files: apps/web/modules/theme/runtime/pages/product/[slug].vue
- Follow-up: Validate spacing on large desktop breakpoints with long product descriptions.

## 2026-05-27
- Scope: PDP desktop left-column flow
- Change: Refactored product-page top layout so gallery and description are grouped in a dedicated left column on desktop (`left-area`), while preserving mobile order using `display: contents` and explicit order classes.
- Impact: Removes large desktop dead space between gallery and description caused by grid row sizing against right-column content; left-side sections now stay tightly stacked.
- Files: apps/web/modules/theme/runtime/pages/product/[slug].vue
- Follow-up: Validate mobile order (gallery → buybox → description → GonserBox) and desktop spacing on products with many right-column blocks.

## 2026-05-27
- Scope: PDP description rich-text typography
- Change: Removed the description container dependency on reset/prose helper classes and kept only the theme container with native heading semantics.
- Impact: Description headings now resolve through the same theme heading system as other PDP section headings.
- Files: apps/web/modules/theme/runtime/pages/product/[slug].vue
- Follow-up: Verify description rendering on products containing complex HTML blocks (lists, tables, embedded media).

## 2026-05-27
- Scope: PDP accessory card add-to-cart layout
- Change: Added a scoped `addToCartCompact` ProductCard prop and enabled it for PDP Zubehör cards; enforced compact mode with mutually exclusive CTA width classes so compact uses `!w-[146px] !max-w-[146px]` and cannot inherit `w-full`; and updated ProductCard icon visibility condition so GonserBox icon remains visible in compact add-to-cart mode.
- Impact: Zubehör product cards on PDP now consistently render a fixed-width (146px), left-aligned add-to-cart button while preserving the right-side GonserBox indicator for box articles, without changing other ProductCard add-to-cart contexts.
- Files: apps/web/modules/theme/runtime/components/ui/ProductCard/types.ts, apps/web/modules/theme/runtime/components/ui/ProductCard/ProductCard.vue, apps/web/modules/theme/runtime/pages/product/[slug].vue
- Follow-up: Visual check on mobile/desktop PDP to confirm CTA alignment and icon/button spacing with long product names and crossed-price combinations.

## 2026-05-28
- Scope: ProductCard color swatch optimization and uniqueness
- Change: Consolidated ProductCard swatch improvements by adding shared global color-variant request state (in-flight deduplication, resolved-result cache, bounded concurrency, retry/backoff, persistent 404 invalid-ID caching in sessionStorage), limiting swatch enrichment requests to visible needs, prioritizing unique primary-color keys for displayed swatches, and refining fetch selection to continue scanning Property 61 variants until enough distinct colors are available.
- Impact: Significantly reduces duplicate and burst `getProduct` traffic for additional swatches while ensuring homepage/search swatch previews avoid duplicate visible colors when distinct primary colors exist.
- Files: apps/web/modules/theme/runtime/components/ui/ProductCard/ProductCard.vue, .github/agent-changelog.md
- Follow-up: Monitor `getProduct` volume and swatch diversity on large variant families to keep request reduction and visual color variety balanced.

## 2026-05-28
- Scope: Theme swatch batch API foundation
- Change: Added a reusable theme Nitro endpoint (`POST /api/product-card-swatches`) that batches variant product lookups with concurrency control and TTL caching, registered it in the theme module, and switched ProductCard swatch hydration to batch-first endpoint calls with graceful fallback to existing per-item SDK fetching.
- Impact: Establishes the same server-batch architecture used for Luigi review hydration, keeps logic inside the theme layer, and provides a reusable swatch-data path for future Luigi product-card color hydration from server-side data.
- Files: apps/web/modules/theme/index.ts, apps/web/modules/theme/runtime/server/api/product-card-swatches.post.ts, apps/web/modules/theme/runtime/components/ui/ProductCard/ProductCard.vue, .github/agent-changelog.md
- Follow-up: Restart dev server after module registration changes and verify endpoint traffic (`/api/product-card-swatches`) on homepage, category, search, and Luigi card contexts.

## 2026-05-28
- Scope: ProductCard size-variant pipeline cleanup
- Change: Removed the additional size-variant fetch/render pipeline from ProductCard (including hidden size swatch markup and related runtime fetch/computed logic) and dropped unused SFUI imports tied to obsolete code paths.
- Impact: Reduces ProductCard complexity and avoids unnecessary variant API work while keeping current color-swatch behavior intact.
- Files: apps/web/modules/theme/runtime/components/ui/ProductCard/ProductCard.vue, .github/agent-changelog.md
- Follow-up: Perform a broader ProductCard cleanup pass later to remove remaining dead computed helpers and unify duplicated utility functions.

## 2026-05-28
- Scope: Recommended products async warning fix
- Change: Replaced `useAsyncData` usage inside the theme `useProductRecommended` fetch function with a direct SDK call (`useSdk().plentysystems.getFacet`) plus explicit try/catch/finally loading/error handling.
- Impact: Removes the Nuxt runtime warning about calling `useAsyncData` after component mount and keeps recommended-products fetching behavior consistent.
- Files: apps/web/modules/theme/runtime/composables/useProductRecommended/useProductRecommended.ts, .github/agent-changelog.md
- Follow-up: Spot-check homepage/PageBlock recommended sections to confirm no `useAsyncData` mounted warning appears during navigation.

## 2026-05-28
- Scope: Theme composable override wiring
- Change: Added explicit theme import registration for `useProductRecommended` in the theme module setup so runtime resolution consistently prefers the module override over the app-level composable.
- Impact: Ensures the mounted-time `useAsyncData` warning fix is actually applied in page blocks that call `useProductRecommended`.
- Files: apps/web/modules/theme/index.ts, .github/agent-changelog.md
- Follow-up: Restart dev server and verify browser stack traces no longer reference `apps/web/app/composables/useProductRecommended/useProductRecommended.ts` during recommended-products loads.

## 2026-05-28
- Scope: Breadcrumbs hydration stability
- Change: Added a mounted-state guard in theme Breadcrumbs so mobile-only dropdown/hide branching is deferred until after mount.
- Impact: Prevents SSR/client initial DOM divergence that caused hydration node mismatch warnings on product pages with long breadcrumb trails.
- Files: apps/web/modules/theme/runtime/components/ui/Breadcrumbs/Breadcrumbs.vue, .github/agent-changelog.md
- Follow-up: Verify PDP hydration logs on mobile and narrow desktop widths where breadcrumb collapsing is active.

## 2026-05-29
- Scope: Theme footer migration for v2.31 compatibility
- Change: Migrated theme footer rendering to the FooterBlocks flow by introducing a theme-local UI footer component and updating FooterBlocks to decide rendering based on blockified context + footer block presence; also removed the legacy Footer override dependency on deleted core Footer types.
- Impact: Preserves existing theme footer content/styling while aligning with newer footer usage and avoiding breakage when core `components/blocks/Footer/*` types are removed.
- Files: apps/web/modules/theme/runtime/components/ui/ThemeFooter/ThemeFooter.vue, apps/web/modules/theme/runtime/components/ui/FooterBlocks/FooterBlocks.vue, apps/web/modules/theme/runtime/components/blocks/Footer/Footer.vue
- Follow-up: After upgrading to 2.31.0, verify footer visibility on blockified pages with and without footer blocks.

## 2026-05-29
- Scope: Upstream base sync (2.24.0 to 2.31.0, non-config)
- Change: Applied upstream `v2.31.0` content for all changed non-config files while explicitly skipping config files and custom module paths under `apps/web/modules/theme/**` and `apps/web/modules/one-step-checkout/**`.
- Impact: Core Plenty PWA base code is updated for broad compatibility testing, while config customization review remains isolated and theme/one-step overrides are preserved for targeted migration.
- Files: .tmp/version-compare-2.24.0-2.31.0/apply-list.non-config.no-theme-no-osc.txt, .tmp/version-compare-2.24.0-2.31.0/changed-config-files.txt
- Follow-up: Review config changes separately and then run full install/build/test validation.

## 2026-05-29
- Scope: Upstream config sync (manual hunk review workflow)
- Change: Applied upstream `v2.31.0` versions for all changed config files directly in the working tree (including root/app/package/nuxt/eslint/vitest/turbo and lockfile updates) to enable VS Code accept/discard hunk review instead of interactive prompt-based approvals.
- Impact: Config migration is now ready for manual per-hunk acceptance in Source Control while preserving user control over custom configuration decisions.
- Files: apps/server/nodemon.json, apps/server/package.json, apps/web/build/tsconfig.json, apps/web/cookie-scripts.config.ts, apps/web/eslint.config.mjs, apps/web/nuxt.config.ts, apps/web/package.json, apps/web/vitest.config.setup.ts, apps/web/vitest.config.ts, docs/package.json, package-lock.json, package.json, packages/shop-cli/package.json, turbo.json
- Follow-up: Complete hunk review, then run install/build/test checks.

## 2026-05-29
- Scope: Dependency sync after 2.31 config pass
- Change: Ran `npm install` at repository root after the accepted file-by-file config updates.
- Impact: Workspace dependencies and lockfile are synchronized to the selected update state and ready for build/test validation.
- Files: package-lock.json, package.json, apps/web/package.json, packages/shop-cli/package.json, docs/package.json
- Follow-up: Run lint/typecheck/build/test and address audit findings if needed.

## 2026-05-29
- Scope: Tailwind legacy token restoration
- Change: Restored legacy Tailwind token aliases (`gray-light`, `gray`, `gray-dark`, `gray-super-dark`, `black`, `red`) and their related utility safelist entries in the shared Tailwind config.
- Impact: Existing theme and checkout overrides using classes like `bg-gray-light`, `hover:bg-gray`, `text-black`, and `text-red` resolve again after the 2.31 base sync.
- Files: apps/web/app/configuration/tailwind.config.ts, .github/agent-changelog.md
- Follow-up: Run a quick visual smoke check on header, PDP, cart, and footer to confirm recovered color styling.

## 2026-05-29
- Scope: MegaMenu behavioral parity (theme override)
- Change: Ported upstream MegaMenu interaction fixes into the theme override without visual class changes: desktop nav focus handling now uses `focusout`, touch-first category tracking uses a single `tappedCategoryId`, and touch state resets on blur/close/router navigation.
- Impact: Improves desktop keyboard blur-close reliability and prevents stale touch-selection state while preserving existing Gonser theme styling.
- Files: apps/web/modules/theme/runtime/components/MegaMenu/MegaMenu.vue, .github/agent-changelog.md
- Follow-up: Quick smoke-check desktop mega menu keyboard navigation and first-tap touch behavior on category items with children.

## 2026-05-29
- Scope: Breadcrumbs component parity (theme override)
- Change: Replaced `SfLink` with `UiLink` in the theme Breadcrumbs override to match upstream link component usage while keeping the custom mobile visibility/dropdown logic and styling intact.
- Impact: Breadcrumb links now follow the same link-component pattern as core updates without altering the Gonser breadcrumb UX or visual design.
- Files: apps/web/modules/theme/runtime/components/ui/Breadcrumbs/Breadcrumbs.vue, .github/agent-changelog.md
- Follow-up: Smoke-check breadcrumbs on mobile and desktop to confirm dropdown links and inline links navigate correctly.

## 2026-05-29
- Scope: CartProductCard component parity (theme override)
- Change: Replaced `SfLink` with `UiLink` in the theme CartProductCard override (image link, product title link, and bundle-item links) to align with upstream link-component usage.
- Impact: Cart product-card links follow current core link component conventions while preserving existing Gonser layout and styling.
- Files: apps/web/modules/theme/runtime/components/ui/CartProductCard/CartProductCard.vue, .github/agent-changelog.md
- Follow-up: Smoke-check cart and drawer item links for navigation behavior.

## 2026-05-29
- Scope: ProductCard component parity (theme override)
- Change: Updated theme ProductCard links from `SfLink` to `UiLink`, added upstream accessibility `aria-label` on the main product link, and aligned global-item-category detection with route-based slug logic used in core updates.
- Impact: Product-card links now follow current core link and accessibility patterns, and global item category link resolution behaves consistently with upstream logic while keeping Gonser styling intact.
- Files: apps/web/modules/theme/runtime/components/ui/ProductCard/ProductCard.vue, .github/agent-changelog.md
- Follow-up: Smoke-check product-card navigation and screen-reader label output on category/listing pages.

## 2026-05-29
- Scope: Search component parity (theme override)
- Change: Updated search suggestion dropdown max-height calculation to use viewport custom-property fallback (`var(--viewport-height,100dvh)`) instead of fixed `100vh`.
- Impact: Search suggestions respect dynamic viewport height contexts (including preview/mobile viewport handling) and reduce clipping risk on constrained view heights.
- Files: apps/web/modules/theme/runtime/components/ui/Search.vue, .github/agent-changelog.md
- Follow-up: Smoke-check desktop and mobile search dropdown height/scroll behavior in normal storefront and editor preview modes.

## 2026-05-29
- Scope: useCategoryFilter composable parity (theme override)
- Change: Updated `checkFiltersInURL` to only write facets query when it actually changed and to clear invalid/empty facets with `null`.
- Impact: Avoids redundant route query updates and keeps URL facet state cleaner when selected facets are no longer valid.
- Files: apps/web/modules/theme/runtime/composables/useCategoryFilter/useCategoryFilter.ts, .github/agent-changelog.md
- Follow-up: Smoke-check category filter interactions with stale facet URLs and verify no unnecessary query rewrites occur.

## 2026-05-29
- Scope: useSiteConfiguration composable parity (theme override)
- Change: Ported core drawer-state behavior updates by triggering `scheduleCleanDataSync()` before opening block settings outside edit mode and clearing block edit stack/title on drawer close paths.
- Impact: Blocks settings drawer state now stays aligned with current editor mode/data, and stale block-edit context is cleaned up consistently when drawers are closed.
- Files: apps/web/modules/theme/runtime/composables/useSiteConfiguration/useSiteConfiguration.ts, .github/agent-changelog.md
- Follow-up: Smoke-check opening/closing site/block settings drawers in both edit and non-edit contexts.

## 2026-05-29
- Scope: Locale parity backfill (theme override)
- Change: Backfilled missing 2.24->2.31 parity keys across theme locale files: DE received upstream-changed DE keys; EN received upstream-added EN keys; FR received the same newly required keys as EN using EN fallback copy because FR is outside the upstream update set.
- Impact: DE/EN/FR theme locales now include the newer cancellation/accessibility/legal keys required by updated flows, reducing missing-translation fallbacks.
- Files: apps/web/modules/theme/runtime/lang/de.json, apps/web/modules/theme/runtime/lang/en.json, apps/web/modules/theme/runtime/lang/fr.json, .github/agent-changelog.md
- Follow-up: Replace temporary FR fallback values with native French translations for storefront cancellation and legal copy.

## 2026-05-29
- Scope: Account layout responsive-variant parity (theme override)
- Change: Migrated responsive utility prefixes in the theme account layout from legacy breakpoint notation to the current `@`-prefixed variant syntax used upstream (`md/2xs/lg/3xl` -> `@md/@2xs/@lg/@3xl`) while keeping the theme-specific 3xl grid column count unchanged.
- Impact: Theme account layout now follows the updated responsive class variant convention for runtime parity without altering Gonser-specific layout sizing decisions.
- Files: apps/web/modules/theme/runtime/layouts/account.vue, .github/agent-changelog.md
- Follow-up: Smoke-check account root and subsection pages on mobile/desktop breakpoints for sidebar and heading visibility.

## 2026-05-29
- Scope: Default layout header-flow parity (theme override)
- Change: Aligned theme default layout with upstream by always rendering `UiHeaderBlocks` and removing obsolete `enableEditableHeader`/`viewport` script state.
- Impact: Header rendering path now matches current core behavior while preserving existing theme breadcrumb spacing overrides.
- Files: apps/web/modules/theme/runtime/layouts/default.vue, .github/agent-changelog.md
- Follow-up: Smoke-check header and breadcrumb rendering on pages with and without breadcrumb data.

## 2026-05-29
- Scope: Cart page responsive-variant parity (theme override)
- Change: Updated cart page shell layout classes to the current `@`-prefixed responsive variant syntax (`md` -> `@md`) for grid/sticky/spacing behavior in the main cart content and checkout CTA wrapper.
- Impact: Theme cart page aligns with upstream responsive utility syntax while preserving custom GonserBox/recommended-products cart behavior and styling.
- Files: apps/web/modules/theme/runtime/pages/cart.vue, .github/agent-changelog.md
- Follow-up: Smoke-check cart layout at mobile and desktop breakpoints, including sticky summary behavior.

## 2026-05-29
- Scope: My orders responsive-variant parity (theme override)
- Change: Migrated list/table responsive utility prefixes in the theme my-orders page to upstream `@`-prefixed syntax (`md/lg` -> `@md/@lg`) for divider spacing, table wrappers, and desktop table column paddings/nowrap handling.
- Impact: My-orders page now follows current responsive class conventions while retaining existing Gonser custom search/pagination/order-loading behavior.
- Files: apps/web/modules/theme/runtime/pages/my-account/my-orders.vue, .github/agent-changelog.md
- Follow-up: Smoke-check my-orders mobile card list and desktop table alignment/overflow behavior.

## 2026-05-29
- Scope: Product page variation-change parity (theme override)
- Change: Updated variation change flow to a dedicated async handler with guarded error handling (`useHandleError`), review refresh, and structured-data metadata refresh after variation product fetch; also aligned observer construction to `globalThis.IntersectionObserver`.
- Impact: Theme PDP variation switches now follow current core error/review/metadata update behavior while preserving Gonser PDP layout and custom blocks.
- Files: apps/web/modules/theme/runtime/pages/product/[slug].vue, .github/agent-changelog.md
- Follow-up: Smoke-check PDP variation switching for review count/stars and metadata-dependent UI updates.

## 2026-05-29
- Scope: Default layout header regression fix (theme override)
- Change: Restored conditional header rendering in the theme default layout (`UiHeaderBlocks` only when `enableEditableHeader` is enabled, otherwise `UiHeader`) after the parity pass caused an unintended header/mega-menu visual mismatch.
- Impact: Theme storefront now uses the previous Gonser header/mega-menu presentation again when editable header mode is disabled.
- Files: apps/web/modules/theme/runtime/layouts/default.vue, .github/agent-changelog.md
- Follow-up: Re-check header and mega-menu visuals on desktop/mobile with editable-header mode off.

## 2026-05-29
- Scope: One-step checkout AddressContainer parity (module override)
- Change: Updated responsive utility syntax in the one-step-checkout `AddressContainer` override to the current `@`-prefixed breakpoint notation and resolved a conflicting `hidden`+`flex` class combination in the loading wrapper.
- Impact: AddressContainer breakpoint utilities now match current core syntax and compile diagnostics are clean for this override.
- Files: apps/web/modules/one-step-checkout/runtime/components/AddressContainer/AddressContainer.vue, .github/agent-changelog.md
- Follow-up: Verify checkout address section layout on mobile and tablet/desktop breakpoints.

## 2026-05-29
- Scope: One-step checkout AddressFormBilling parity (module override)
- Change: Migrated legacy responsive utility prefixes in the one-step-checkout `AddressFormBilling` template to current `@`-prefixed breakpoint syntax (`md/sm` -> `@md/@sm`) for grid and responsive field/action container spans.
- Impact: Billing address form override now aligns with current core responsive utility syntax while preserving existing one-step-checkout custom form behavior/styling.
- Files: apps/web/modules/one-step-checkout/runtime/components/AddressFormBilling/AddressFormBilling.vue, .github/agent-changelog.md
- Follow-up: Verify billing form layout at mobile and desktop breakpoints in checkout flow.

## 2026-05-29
- Scope: One-step checkout AddressFormShipping parity (module override)
- Change: Migrated legacy responsive utility prefixes in the one-step-checkout `AddressFormShipping` template to current `@`-prefixed breakpoint syntax (`sm/md` -> `@sm/@md`) for grid and responsive field/action layout spans.
- Impact: Shipping address form override now matches current core responsive utility notation while preserving one-step-checkout custom validation/UI behavior.
- Files: apps/web/modules/one-step-checkout/runtime/components/AddressFormShipping/AddressFormShipping.vue, .github/agent-changelog.md
- Follow-up: Verify shipping form layout across mobile and desktop checkout breakpoints.

## 2026-05-29
- Scope: One-step checkout CheckoutPayment parity (module override)
- Change: Updated the no-payment-method warning container responsive typography utility in `CheckoutPayment` from legacy `md:` to current `@md:` prefix syntax.
- Impact: CheckoutPayment warning-state responsive utility notation now aligns with current core syntax while preserving Gonser-specific payment-card UI behavior.
- Files: apps/web/modules/one-step-checkout/runtime/components/CheckoutPayment/CheckoutPayment.vue, .github/agent-changelog.md
- Follow-up: Verify no-payment-method warning typography at mobile and desktop breakpoints.

## 2026-05-29
- Scope: One-step checkout ConfirmationPageContent parity (module override)
- Change: Migrated legacy responsive utility prefixes in the one-step-checkout `ConfirmationPageContent` template to current `@`-prefixed breakpoint syntax (including `sm/md/lg/max-md` variants) without changing custom confirmation-page structure or logic.
- Impact: Confirmation page override now follows current core responsive utility notation while preserving Gonser-specific confirmation UI and behavior.
- Files: apps/web/modules/one-step-checkout/runtime/components/ConfirmationPageContent/ConfirmationPageContent.vue, .github/agent-changelog.md
- Follow-up: Verify confirmation page layout and CTA sizing on mobile and desktop breakpoints.

## 2026-05-29
- Scope: One-step checkout ContactInformation parity (module override)
- Change: Updated the root container responsive padding utility in `ContactInformation` from legacy `md:` syntax to current `@md:` breakpoint notation.
- Impact: ContactInformation override now matches current core responsive utility syntax while preserving its custom guest/customer accordion flow.
- Files: apps/web/modules/one-step-checkout/runtime/components/ContactInformation/ContactInformation.vue, .github/agent-changelog.md
- Follow-up: Verify contact-information section spacing on mobile and desktop checkout breakpoints.

## 2026-05-29
- Scope: One-step checkout ForgotPasswordComponent parity (module override)
- Change: Updated responsive width utility in `ForgotPasswordComponent` from `md:` to `@md:` syntax and replaced `SfLink` with `UiLink` to align with current core link-component usage.
- Impact: Forgot-password override now matches current responsive/link component patterns while preserving existing one-step-checkout reset-password flow behavior.
- Files: apps/web/modules/one-step-checkout/runtime/components/ForgotPasswordComponent/ForgotPasswordComponent.vue, .github/agent-changelog.md
- Follow-up: Verify forgot-password form layout and create-account link behavior in checkout authentication modal.

## 2026-05-29
- Scope: One-step checkout LoginComponent parity (module override)
- Change: Replaced `SfLink` with `UiLink` for forgot-password and create-account actions in `LoginComponent` and removed the obsolete `SfLink` import.
- Impact: Login override now aligns with current core link-component usage while preserving one-step-checkout custom login/accordion behavior.
- Files: apps/web/modules/one-step-checkout/runtime/components/LoginComponent/LoginComponent.vue, .github/agent-changelog.md
- Follow-up: Verify login modal link actions for forgot-password and create-account transitions.

## 2026-05-29
- Scope: One-step checkout OrderSummary parity (module override)
- Change: Migrated legacy responsive utility prefixes in the one-step-checkout `OrderSummary` template to current `@`-prefixed breakpoint syntax (including `md` and `max-md` variants) without changing custom summary structure or pricing logic.
- Impact: OrderSummary override now follows current core responsive utility notation while preserving Gonser-specific checkout summary styling and terms content.
- Files: apps/web/modules/one-step-checkout/runtime/components/OrderSummary/OrderSummary.vue, .github/agent-changelog.md
- Follow-up: Verify summary spacing/divider behavior on mobile and desktop breakpoints.

## 2026-05-29
- Scope: One-step checkout OrderSummaryProductCard parity (module override)
- Change: Replaced `SfLink` with `UiLink` for product image/title navigation in `OrderSummaryProductCard`, removed the obsolete `SfLink` import, and migrated one legacy `sm:` width utility to `@sm:` syntax.
- Impact: Product-card override now aligns with current core link-component and responsive utility conventions while preserving custom one-step-checkout card content.
- Files: apps/web/modules/one-step-checkout/runtime/components/OrderSummaryProductCard/OrderSummaryProductCard.vue, .github/agent-changelog.md
- Follow-up: Verify order-summary product card links and mobile spacing in checkout summary.

## 2026-05-29
- Scope: One-step checkout PaymentButtons parity (module override)
- Change: Migrated legacy responsive utility prefixes in `PaymentButtons` (`md:` -> `@md:`) for place-order button spacing and PayPal modal dimensions.
- Impact: Payment button/modal responsive classes now align with current core utility syntax while preserving one-step-checkout payment flow behavior.
- Files: apps/web/modules/one-step-checkout/runtime/components/PaymentButtons/PaymentButtons.vue, .github/agent-changelog.md
- Follow-up: Verify place-order button spacing and PayPal modal sizing on mobile and desktop.

## 2026-05-29
- Scope: One-step checkout layout parity (module override)
- Change: Migrated active legacy responsive utility prefixes in the one-step-checkout `checkout` layout template from `md:` to `@md:` syntax for container/title spacing.
- Impact: Checkout layout override now matches current core responsive utility notation while preserving the custom back-button suppression behavior.
- Files: apps/web/modules/one-step-checkout/runtime/layouts/checkout.vue, .github/agent-changelog.md
- Follow-up: Verify checkout layout heading/container spacing on mobile and desktop breakpoints.

## 2026-05-29
- Scope: One-step checkout page parity (module override)
- Change: Migrated active legacy responsive utility prefixes in the one-step-checkout `checkout` page template to current `@`-prefixed syntax (`lg/xl/md` variants) and removed the upstream-dropped `itemSumNet` watcher that re-fetched payment methods on item-sum changes.
- Impact: Checkout page override now aligns with current core responsive utility and payment-method refresh behavior while preserving one-step-checkout custom page flow.
- Files: apps/web/modules/one-step-checkout/runtime/pages/checkout.vue, .github/agent-changelog.md
- Follow-up: Smoke-check checkout layout at mobile/desktop and confirm payment methods update correctly during cart changes.

## 2026-05-29
- Scope: Contact page typecheck build fix (theme override)
- Change: Reworked reCAPTCHA typing in contact page from whole-window casting to a guarded `grecaptcha` API extractor (`getRecaptchaApi`) and updated render/load paths to use the typed API.
- Impact: Resolves TypeScript TS2352 errors during `web:typecheck` and restores successful full monorepo build while keeping existing reCAPTCHA behavior.
- Files: apps/web/modules/theme/runtime/pages/contact.vue, .github/agent-changelog.md
- Follow-up: Optional: add a small unit/integration check for contact-page reCAPTCHA loader behavior in environments with and without `window.grecaptcha`.

## 2026-05-29
- Scope: PDP x-selling stabilization (theme override)
- Change: Consolidated PDP x-selling loading updates in [slug].vue by normalizing/deduplicating Property 63 IDs, moving hydration from direct client `plentysystems.getProduct` calls to the server batch endpoint (`/api/product-card-swatches`), and removing session-persistent invalid-ID skipping so transient misses do not poison later navigations. Temporary dev diagnostics were used for root-cause analysis and then removed.
- Impact: PDP main fetch remains stable, browser-visible direct getProduct 404 noise from PDP setup is eliminated, and x-selling behavior is more resilient against transient backend misses while still tolerating genuinely missing referenced items.
- Files: apps/web/modules/theme/runtime/pages/product/[slug].vue, .github/agent-changelog.md
- Follow-up: Clean up stale Property 63 references in backend data; if inconsistencies continue, add server-side response meta in `/api/product-card-swatches` to distinguish deterministic 404s from transient fetch failures.

## 2026-05-29
- Scope: Category filter max-price transition hardening (theme override)
- Change: Consolidated max-price request guards in `CategoryFilters/Filter.vue` by requiring valid category context (`categoryUrlPath` or `categoryId`) and restricting fetch triggers to the visible price facet only (`facet.type === 'price'`, `!delayed`) on category routes (`route.meta.type === 'category'`), including both mount and watcher paths.
- Impact: Eliminates duplicate and transition-time `POST /plentysystems/getFacet 404` / `Failed to fetch max price` noise when navigating from category pages to PDPs while preserving max-price loading on category pages.
- Files: apps/web/modules/theme/runtime/components/CategoryFilters/Filter.vue, .github/agent-changelog.md
- Follow-up: Keep this guard model if additional filter instances are introduced (modal/visible variants) to avoid reintroducing duplicate max-price calls.

## 2026-05-29
- Scope: One-step checkout header layout alignment
- Change: Updated one-step checkout page meta layout from `simplified-header-and-footer` to `default` so checkout uses the same global header path as the rest of the storefront.
- Impact: Checkout now renders the standard site header (same source/layout behavior as normal pages) instead of the simplified header variant.
- Files: apps/web/modules/one-step-checkout/runtime/pages/checkout.vue, .github/agent-changelog.md
- Follow-up: Verify checkout visual/header behavior on desktop and mobile after navigation from cart and direct URL.

## 2026-05-29
- Scope: Cart empty-state module rendering warning cleanup (theme override)
- Change: Removed `class` from `ModuleComponentRendering` in the theme cart empty-state and wrapped the component in a styled container (`<div class="mt-6">`) to keep spacing without passing extraneous attrs to a fragment-root component.
- Impact: Eliminates Vue warning `Extraneous non-props attributes (class)` in cart empty-state while preserving layout spacing.
- Files: apps/web/modules/theme/runtime/pages/cart.vue, .github/agent-changelog.md
- Follow-up: If similar warnings appear elsewhere, apply the same wrapper pattern when using `ModuleComponentRendering` with layout classes.

## 2026-06-01
- Scope: Header blockification compatibility fallback (theme override)
- Change: Replaced deprecated flag-driven header switch in theme default layout with a footer-style content guard: render `UiHeaderBlocks` only when the route is blockified and the header container has content; otherwise keep rendering custom `UiHeader`.
- Impact: Preserves Gonser custom header as the default storefront header while still allowing blockified header rendering in editor/blockified contexts where header block content exists, reducing environment/config-related header regressions after deploy.
- Files: apps/web/modules/theme/runtime/layouts/default.vue, .github/agent-changelog.md
- Follow-up: Verify header behavior on normal storefront routes and in editor/blockified pages on production runtime config.

## 2026-06-01
- Scope: Header fallback correction for storefront visual parity (theme override)
- Change: Tightened the header fallback guard in theme default layout so blockified `UiHeaderBlocks` renders only when editor mode is active (`isEditingEnabled`) in addition to blockified route/content checks; non-editor storefront rendering always uses custom `UiHeader`.
- Impact: Restores Gonser header design (background, search bar, mega menu styling) on normal storefront pages while retaining editor compatibility paths.
- Files: apps/web/modules/theme/runtime/layouts/default.vue, .github/agent-changelog.md
- Follow-up: Validate storefront header visuals and editor header block interactions separately in production.

## 2026-06-01
- Scope: Header fallback production hardening (theme override)
- Change: Added explicit editor-environment gating (`useEditorState().isInEditor`) to blockified header rendering conditions, so `UiHeaderBlocks` can only activate inside preview/editor context.
- Impact: Prevents accidental blockified-header activation on live storefront/server traffic even if edit-state flags are toggled, keeping custom header as the default in production.
- Files: apps/web/modules/theme/runtime/layouts/default.vue, .github/agent-changelog.md
- Follow-up: Smoke-test one live storefront route and one editor preview route after deployment to confirm branch selection.

## 2026-06-01
- Scope: Theme link color fixes (final consolidated state)
- Change: Removed the temporary theme `UiLink` override and kept link-color fixes at the actual source points: explicit header utility link hover classes, category-page subcategory card link classes, and previously adjusted mega menu direct sub-category link classes.
- Impact: Link colors now follow intended Gonser design in the affected areas without globally changing `UiLink` behavior; avoids side effects from component-level default variant overrides.
- Files: apps/web/modules/theme/runtime/components/ui/Header.vue, apps/web/modules/theme/runtime/pages/category/[...slug].vue, apps/web/modules/theme/runtime/components/MegaMenu/MegaMenu.vue, .github/agent-changelog.md
- Follow-up: If additional reddish links appear, inspect for either explicit local classes or inheritance from `html a` in `apps/web/app/assets/style.scss` and patch locally where needed.

## 2026-06-01
- Scope: Dev server duplicate auto-import warning cleanup
- Change: Added a global `imports:extend` dedupe hook in `nuxt.config.ts` (keeps the final winner per symbol) and aligned theme module import overrides with explicit `imports:extend` removal of core `useSiteConfiguration` and `useProductRecommended` imports.
- Impact: Removed the large set of duplicated import warnings during `npm run dev` startup, including the theme composable duplicate warnings originally reported.
- Files: apps/web/nuxt.config.ts, apps/web/modules/theme/index.ts, .github/agent-changelog.md
- Follow-up: Optional separate cleanup: silence the remaining `UiCartProductCard` override warning by revisiting component registration strategy/priority in the theme module.

## 2026-06-01
- Scope: Editor mobile preview header/megamenu responsiveness fix
- Change: Updated theme `Header` and `MegaMenu` desktop/mobile branching logic to account for editor mobile preview state via `useEditorState().isMobilePreview`, instead of relying on viewport width checks alone.
- Impact: In editor mobile preview, the storefront now renders the mobile header/menu behavior (instead of forcing desktop header on a narrow preview frame), while live storefront behavior remains viewport-driven.
- Files: apps/web/modules/theme/runtime/components/ui/Header.vue, apps/web/modules/theme/runtime/components/MegaMenu/MegaMenu.vue, .github/agent-changelog.md
- Follow-up: Smoke-check editor preview on mobile/tablet/desktop toggles for header, search, menu drawer, and auth modal behavior.

## 2026-06-01
- Scope: Theme responsive layout parity (incremental)
- Change: Applied the responsive utility syntax migration manually, file by file, for account/cart/orders/default layout surfaces by converting legacy breakpoint utilities (for example `md:` and `lg:`) to the new container-style variants (for example `@md:` and `@lg:`) without altering component logic.
- Impact: These theme overrides now align with the upstream responsive class convention in a controlled, low-risk subset while preserving current behavior.
- Files: apps/web/modules/theme/runtime/layouts/account.vue, apps/web/modules/theme/runtime/pages/cart.vue, apps/web/modules/theme/runtime/pages/my-account/my-orders.vue, apps/web/modules/theme/runtime/layouts/default.vue
- Follow-up: Continue with header/mega-menu/search responsive parity in isolated single-file steps with immediate smoke verification after each file.

## 2026-06-01
- Scope: Editor device signal hardening for header navigation
- Change: Strengthened theme `Header` and `MegaMenu` desktop/mobile branching by adding direct editor-device checks (`isInEditor && device !== 'desktop'`) alongside `isMobilePreview`, preventing desktop-branch fallback when preview mode renders before client-ready editor flags settle.
- Impact: Mobile/tablet selection in editor now forces mobile navigation behavior more reliably instead of showing a squished desktop header/menu layout.
- Files: apps/web/modules/theme/runtime/components/ui/Header.vue, apps/web/modules/theme/runtime/components/MegaMenu/MegaMenu.vue, .github/agent-changelog.md
- Follow-up: Validate editor device toggles in both edit and preview modes, then propagate the same pattern to other responsive script-branch components that still rely on viewport-only checks.

## 2026-06-02
- Scope: PDP Magic360 launcher performance
- Change: Refactored the theme Magic360 integration to stop blocking launcher visibility on full frame-grid probing. The launcher now renders immediately when a 360 path is available, validates first-frame existence in the background, uses fast default dimensions (`1x36`), and refines row/column counts via checkpoint+binary probing instead of long sequential scans. Added CDN `dns-prefetch`/`preconnect` and resilient API start waiting for late script availability.
- Impact: The 360 button appears significantly earlier on PDP, reducing scroll-miss risk while preserving automatic hide behavior when no 360 frames exist and keeping spin initialization stable.
- Files: apps/web/modules/theme/runtime/components/ui/FancyboxGallery/Magic360.vue, .github/agent-changelog.md
- Follow-up: Compare network waterfall against a fast reference storefront to align script caching headers and 360 image delivery strategy (CDN cache hit ratio, image format/size, and request priority).

## 2026-06-02
- Scope: PDP Magic360 probe request reduction
- Change: Deferred frame dimension probing until the user actually opens the 360 modal (lazy detection), kept immediate launcher availability check via first frame probe, and added sessionStorage-based per-item dimensions cache (`magic360:dimensions:v1:<itemId>`) for rows/columns reuse across PDP revisits.
- Impact: Eliminates most background 360 probe requests for users who never open the 360 view, and avoids repeated dimension-probe bursts for already-visited items in the same browser session.
- Files: apps/web/modules/theme/runtime/components/ui/FancyboxGallery/Magic360.vue, .github/agent-changelog.md
- Follow-up: If needed, add lightweight telemetry around cache hit rate and first-open dimension correction frequency.

## 2026-06-02
- Scope: PDP Magic360 first-open initialization reliability
- Change: Replaced one-shot modal initialization with resilient open-state initialization: added a dedicated viewer init flow that waits longer for deferred `magic360.js`, cancels stale runs on close/reopen, and re-initializes automatically when the spin anchor is recreated (for example after dimension refinement updates `spinKey`).
- Impact: Prevents the first-open state where only the fallback first image is shown and spin controls never attach unless the user closes/reopens the overlay.
- Files: apps/web/modules/theme/runtime/components/ui/FancyboxGallery/Magic360.vue, .github/agent-changelog.md
- Follow-up: Manual smoke-check on slower network/device profiles to confirm first-open spin activation remains reliable under delayed script load.

## 2026-06-02
- Scope: PDP Magic360 overlay viewport stability
- Change: Added a dedicated modal stage class and scoped deep CSS constraints for Magic360 runtime container/anchor/image max dimensions so the initialized `.Magic360-container` cannot exceed viewport bounds.
- Impact: Prevents the initialized 360 viewer from shifting upward/out of viewport on desktop when Magic360 computes oversized container dimensions.
- Files: apps/web/modules/theme/runtime/components/ui/FancyboxGallery/Magic360.vue, .github/agent-changelog.md
- Follow-up: Smoke-check on desktop resolutions with large source images and zoomed browser settings (90%-125%).

## 2026-06-02
- Scope: PDP Magic360 modal alignment regression fix
- Change: Adjusted modal-scoped Magic360 CSS to use flex centering on `.Magic360-container` and force the runtime anchor to block layout with zero margins, preventing inline-block alignment drift after Magic360 initialization.
- Impact: Resolves the follow-up regression where the initialized 360 image shifted downward and was partially cut off at the bottom.
- Files: apps/web/modules/theme/runtime/components/ui/FancyboxGallery/Magic360.vue, .github/agent-changelog.md
- Follow-up: Verify at multiple browser zoom levels and on at least one high-DPI desktop display.

## 2026-06-03
- Scope: Mobile header and mega menu layering
- Change: Added a small viewport-offset buffer to the mobile mega menu drawer/backdrop top calculation so the overlay starts just below the measured header bottom and no longer clips the mobile search border.
- Impact: Mobile menu overlay consistently opens below all visible header elements, including the search field border/ring.
- Files: apps/web/modules/theme/runtime/components/MegaMenu/MegaMenu.vue, .github/agent-changelog.md
- Follow-up: Validate behavior on small mobile breakpoints while scrolled and unscrolled.

## 2026-06-03
- Scope: Mobile header search spacing
- Change: Reverted mobile drawer top offset buffering and moved spacing into header layout by adding a 1px bottom padding to the mobile search container.
- Impact: The menu opens directly below the header while maintaining a visible 1px gap between the search border and header bottom.
- Files: apps/web/modules/theme/runtime/components/MegaMenu/MegaMenu.vue, .github/agent-changelog.md

## 2026-06-04
- Scope: PDP pseudo-variant size price formatting
- Change: Added local pseudo-variant size-price normalization that converts trailing currency-code format (for example, `16.90 CHF`) to prefix format (`CHF 16.90`) while preserving already-prefixed prices.
- Impact: Size selector prices now display currency before amount as expected in the theme UI.
- Files: apps/web/modules/theme/runtime/components/ui/ProductPseudoVariants/ProductPseudoVariants.vue, .github/agent-changelog.md

## 2026-06-04
- Scope: Mobile breadcrumb overflow indicator typography
- Change: Replaced the breadcrumb overflow icon trigger with plain text ellipsis (`...`) in both rendered and measurement markup, inheriting the breadcrumb text styling.
- Impact: Collapsed middle breadcrumbs are now represented as text with the same base font appearance as other breadcrumb entries.
- Files: apps/web/modules/theme/runtime/components/ui/Breadcrumbs/Breadcrumbs.vue, .github/agent-changelog.md