# Architecture

## Application boundaries

The app has four route areas: public acquisition, business authentication, authenticated operations, and the mobile customer portal. `AppContext` owns only cross-cutting preferences and the demo session. Domain calculations stay in `src/lib`, demo records stay in `src/data`, and product identity stays in `src/config/brand.ts`.

Production data should be introduced through repository interfaces implemented by mock and Supabase adapters. `src/lib/supabase.ts` establishes the environment switch. No view requires production credentials to render.

## Authorization

Route guards prevent staff from entering administrative screens. This is a usability boundary, not the security boundary. PostgreSQL RLS is authoritative in connected mode. Owners and managers can manage tenant records; staff should receive purpose-built RPCs for customer lookup, visit creation, points, and redemption so customer contact data never reaches the staff client.

## Internationalization and branding

Global navigation strings use the typed dictionary in `src/lib/i18n.ts`. New locales can add one dictionary and extend `Language`. Product name, promise, WhatsApp URL, and base colors are centralized in `src/config/brand.ts`. Business branding is separate and applies to customer-facing surfaces.

## Accessibility

The UI uses semantic landmarks, explicit labels, keyboard-operable controls, visible focus rings, text status labels, dialog semantics, chart summaries, and QR text alternatives. Color is never the sole status indicator. Reduced-motion preferences are respected.
