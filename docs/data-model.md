# Data Model

`organizations` is the tenant root. `locations` and all operational entities carry `organization_id`. A customer belongs to one organization and is never shared across unrelated businesses.

Core relationships:

- organization -> locations, members, customers, tiers, rules, rewards, campaigns
- customer -> visits, transactions, point transactions, redemptions, referrals
- location -> visits, rewards, QR codes, partner offers
- campaign -> audience configuration, schedule, simulated or provider metrics
- referral -> referrer, referred customer, qualifying transaction, attributed revenue

All primary keys are UUIDs. Mutable operational records include `created_at` and `updated_at`. Flexible rule, audience, benefit, and metric definitions use JSONB while identity, money, status, and relationship fields remain typed columns.

RLS checks `organization_members` through security-definer membership functions. Public access is limited to inserting `demo_requests`. Customer self-service policies and restricted staff RPCs should be added when production customer authentication is connected.
