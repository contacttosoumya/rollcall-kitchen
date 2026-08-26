-- Comprehensive schema repair.
--
-- The pattern found on newsletter_subscribers (016, 017) — table created
-- successfully, but some column DEFAULT/NOT NULL clauses silently lost —
-- has now also hit points_ledger.created_at. Rather than keep discovering
-- these one table at a time as each surfaces in production, this migration
-- re-asserts every DEFAULT and NOT NULL constraint every original table
-- migration (001-015) specified, across the whole schema, in one pass.
--
-- Every ALTER here is idempotent: re-setting a default/NOT NULL that's
-- already correct is a harmless no-op. The only way any single line could
-- fail is a genuine NULL already sitting in a column being marked NOT
-- NULL -- if that happens, Postgres names the exact column, so it's easy
-- to pinpoint if it ever occurs.

-- categories
ALTER TABLE categories ALTER COLUMN icon SET DEFAULT '🍽️';
ALTER TABLE categories ALTER COLUMN blurb SET DEFAULT '';
ALTER TABLE categories ALTER COLUMN sort_order SET DEFAULT 0;
ALTER TABLE categories ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE categories ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE categories ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE categories ALTER COLUMN slug SET NOT NULL;
ALTER TABLE categories ALTER COLUMN label SET NOT NULL;
ALTER TABLE categories ALTER COLUMN icon SET NOT NULL;
ALTER TABLE categories ALTER COLUMN blurb SET NOT NULL;
ALTER TABLE categories ALTER COLUMN sort_order SET NOT NULL;
ALTER TABLE categories ALTER COLUMN is_active SET NOT NULL;
ALTER TABLE categories ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE categories ALTER COLUMN updated_at SET NOT NULL;

-- dishes
ALTER TABLE dishes ALTER COLUMN description SET DEFAULT '';
ALTER TABLE dishes ALTER COLUMN is_veg SET DEFAULT TRUE;
ALTER TABLE dishes ALTER COLUMN spice_level SET DEFAULT 0;
ALTER TABLE dishes ALTER COLUMN tags SET DEFAULT '{}';
ALTER TABLE dishes ALTER COLUMN is_available SET DEFAULT TRUE;
ALTER TABLE dishes ALTER COLUMN sort_order SET DEFAULT 0;
ALTER TABLE dishes ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE dishes ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE dishes ALTER COLUMN category_id SET NOT NULL;
ALTER TABLE dishes ALTER COLUMN slug SET NOT NULL;
ALTER TABLE dishes ALTER COLUMN name SET NOT NULL;
ALTER TABLE dishes ALTER COLUMN description SET NOT NULL;
ALTER TABLE dishes ALTER COLUMN price_cents SET NOT NULL;
ALTER TABLE dishes ALTER COLUMN is_veg SET NOT NULL;
ALTER TABLE dishes ALTER COLUMN spice_level SET NOT NULL;
ALTER TABLE dishes ALTER COLUMN tags SET NOT NULL;
ALTER TABLE dishes ALTER COLUMN is_available SET NOT NULL;
ALTER TABLE dishes ALTER COLUMN sort_order SET NOT NULL;
ALTER TABLE dishes ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE dishes ALTER COLUMN updated_at SET NOT NULL;

-- locations
ALTER TABLE locations ALTER COLUMN hours SET DEFAULT '[]';
ALTER TABLE locations ALTER COLUMN features SET DEFAULT '{}';
ALTER TABLE locations ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE locations ALTER COLUMN sort_order SET DEFAULT 0;
ALTER TABLE locations ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE locations ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE locations ALTER COLUMN slug SET NOT NULL;
ALTER TABLE locations ALTER COLUMN name SET NOT NULL;
ALTER TABLE locations ALTER COLUMN address SET NOT NULL;
ALTER TABLE locations ALTER COLUMN phone SET NOT NULL;
ALTER TABLE locations ALTER COLUMN map_query SET NOT NULL;
ALTER TABLE locations ALTER COLUMN hours SET NOT NULL;
ALTER TABLE locations ALTER COLUMN features SET NOT NULL;
ALTER TABLE locations ALTER COLUMN is_active SET NOT NULL;
ALTER TABLE locations ALTER COLUMN sort_order SET NOT NULL;
ALTER TABLE locations ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE locations ALTER COLUMN updated_at SET NOT NULL;

-- testimonials
ALTER TABLE testimonials ALTER COLUMN author_detail SET DEFAULT '';
ALTER TABLE testimonials ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE testimonials ALTER COLUMN sort_order SET DEFAULT 0;
ALTER TABLE testimonials ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE testimonials ALTER COLUMN author_name SET NOT NULL;
ALTER TABLE testimonials ALTER COLUMN author_detail SET NOT NULL;
ALTER TABLE testimonials ALTER COLUMN quote SET NOT NULL;
ALTER TABLE testimonials ALTER COLUMN is_active SET NOT NULL;
ALTER TABLE testimonials ALTER COLUMN sort_order SET NOT NULL;
ALTER TABLE testimonials ALTER COLUMN created_at SET NOT NULL;

-- gallery_items
ALTER TABLE gallery_items ALTER COLUMN swatch SET DEFAULT 'sw-marigold';
ALTER TABLE gallery_items ALTER COLUMN caption SET DEFAULT '';
ALTER TABLE gallery_items ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE gallery_items ALTER COLUMN sort_order SET DEFAULT 0;
ALTER TABLE gallery_items ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE gallery_items ALTER COLUMN icon SET NOT NULL;
ALTER TABLE gallery_items ALTER COLUMN swatch SET NOT NULL;
ALTER TABLE gallery_items ALTER COLUMN caption SET NOT NULL;
ALTER TABLE gallery_items ALTER COLUMN is_active SET NOT NULL;
ALTER TABLE gallery_items ALTER COLUMN sort_order SET NOT NULL;
ALTER TABLE gallery_items ALTER COLUMN created_at SET NOT NULL;

-- faqs
ALTER TABLE faqs ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE faqs ALTER COLUMN sort_order SET DEFAULT 0;
ALTER TABLE faqs ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE faqs ALTER COLUMN question SET NOT NULL;
ALTER TABLE faqs ALTER COLUMN answer SET NOT NULL;
ALTER TABLE faqs ALTER COLUMN is_active SET NOT NULL;
ALTER TABLE faqs ALTER COLUMN sort_order SET NOT NULL;
ALTER TABLE faqs ALTER COLUMN created_at SET NOT NULL;

-- timeline_events
ALTER TABLE timeline_events ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE timeline_events ALTER COLUMN sort_order SET DEFAULT 0;
ALTER TABLE timeline_events ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE timeline_events ALTER COLUMN year_label SET NOT NULL;
ALTER TABLE timeline_events ALTER COLUMN title SET NOT NULL;
ALTER TABLE timeline_events ALTER COLUMN description SET NOT NULL;
ALTER TABLE timeline_events ALTER COLUMN is_active SET NOT NULL;
ALTER TABLE timeline_events ALTER COLUMN sort_order SET NOT NULL;
ALTER TABLE timeline_events ALTER COLUMN created_at SET NOT NULL;

-- value_props
ALTER TABLE value_props ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE value_props ALTER COLUMN sort_order SET DEFAULT 0;
ALTER TABLE value_props ALTER COLUMN icon SET NOT NULL;
ALTER TABLE value_props ALTER COLUMN title SET NOT NULL;
ALTER TABLE value_props ALTER COLUMN description SET NOT NULL;
ALTER TABLE value_props ALTER COLUMN is_active SET NOT NULL;
ALTER TABLE value_props ALTER COLUMN sort_order SET NOT NULL;

-- reward_steps
ALTER TABLE reward_steps ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE reward_steps ALTER COLUMN sort_order SET DEFAULT 0;
ALTER TABLE reward_steps ALTER COLUMN step_number SET NOT NULL;
ALTER TABLE reward_steps ALTER COLUMN title SET NOT NULL;
ALTER TABLE reward_steps ALTER COLUMN description SET NOT NULL;
ALTER TABLE reward_steps ALTER COLUMN is_active SET NOT NULL;
ALTER TABLE reward_steps ALTER COLUMN sort_order SET NOT NULL;

-- reward_tiers
ALTER TABLE reward_tiers ALTER COLUMN perks SET DEFAULT '{}';
ALTER TABLE reward_tiers ALTER COLUMN is_featured SET DEFAULT FALSE;
ALTER TABLE reward_tiers ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE reward_tiers ALTER COLUMN sort_order SET DEFAULT 0;
ALTER TABLE reward_tiers ALTER COLUMN badge SET NOT NULL;
ALTER TABLE reward_tiers ALTER COLUMN points_range SET NOT NULL;
ALTER TABLE reward_tiers ALTER COLUMN perks SET NOT NULL;
ALTER TABLE reward_tiers ALTER COLUMN is_featured SET NOT NULL;
ALTER TABLE reward_tiers ALTER COLUMN is_active SET NOT NULL;
ALTER TABLE reward_tiers ALTER COLUMN sort_order SET NOT NULL;

-- catering_packages
ALTER TABLE catering_packages ALTER COLUMN features SET DEFAULT '{}';
ALTER TABLE catering_packages ALTER COLUMN is_featured SET DEFAULT FALSE;
ALTER TABLE catering_packages ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE catering_packages ALTER COLUMN sort_order SET DEFAULT 0;
ALTER TABLE catering_packages ALTER COLUMN name SET NOT NULL;
ALTER TABLE catering_packages ALTER COLUMN price_label SET NOT NULL;
ALTER TABLE catering_packages ALTER COLUMN features SET NOT NULL;
ALTER TABLE catering_packages ALTER COLUMN is_featured SET NOT NULL;
ALTER TABLE catering_packages ALTER COLUMN is_active SET NOT NULL;
ALTER TABLE catering_packages ALTER COLUMN sort_order SET NOT NULL;

-- contact_messages
ALTER TABLE contact_messages ALTER COLUMN subject SET DEFAULT 'General question';
ALTER TABLE contact_messages ALTER COLUMN status SET DEFAULT 'new';
ALTER TABLE contact_messages ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE contact_messages ALTER COLUMN name SET NOT NULL;
ALTER TABLE contact_messages ALTER COLUMN email SET NOT NULL;
ALTER TABLE contact_messages ALTER COLUMN subject SET NOT NULL;
ALTER TABLE contact_messages ALTER COLUMN message SET NOT NULL;
ALTER TABLE contact_messages ALTER COLUMN status SET NOT NULL;
ALTER TABLE contact_messages ALTER COLUMN created_at SET NOT NULL;

-- catering_requests
ALTER TABLE catering_requests ALTER COLUMN details SET DEFAULT '';
ALTER TABLE catering_requests ALTER COLUMN status SET DEFAULT 'new';
ALTER TABLE catering_requests ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE catering_requests ALTER COLUMN name SET NOT NULL;
ALTER TABLE catering_requests ALTER COLUMN email SET NOT NULL;
ALTER TABLE catering_requests ALTER COLUMN phone SET NOT NULL;
ALTER TABLE catering_requests ALTER COLUMN details SET NOT NULL;
ALTER TABLE catering_requests ALTER COLUMN status SET NOT NULL;
ALTER TABLE catering_requests ALTER COLUMN created_at SET NOT NULL;

-- reservations
ALTER TABLE reservations ALTER COLUMN party_size SET DEFAULT 2;
ALTER TABLE reservations ALTER COLUMN notes SET DEFAULT '';
ALTER TABLE reservations ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE reservations ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE reservations ALTER COLUMN name SET NOT NULL;
ALTER TABLE reservations ALTER COLUMN phone SET NOT NULL;
ALTER TABLE reservations ALTER COLUMN party_size SET NOT NULL;
ALTER TABLE reservations ALTER COLUMN reservation_date SET NOT NULL;
ALTER TABLE reservations ALTER COLUMN reservation_time SET NOT NULL;
ALTER TABLE reservations ALTER COLUMN notes SET NOT NULL;
ALTER TABLE reservations ALTER COLUMN status SET NOT NULL;
ALTER TABLE reservations ALTER COLUMN created_at SET NOT NULL;

-- content_blocks
ALTER TABLE content_blocks ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE content_blocks ALTER COLUMN value SET NOT NULL;
ALTER TABLE content_blocks ALTER COLUMN updated_at SET NOT NULL;

-- rewards_login_tokens
ALTER TABLE rewards_login_tokens ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE rewards_login_tokens ALTER COLUMN email SET NOT NULL;
ALTER TABLE rewards_login_tokens ALTER COLUMN token SET NOT NULL;
ALTER TABLE rewards_login_tokens ALTER COLUMN expires_at SET NOT NULL;
ALTER TABLE rewards_login_tokens ALTER COLUMN created_at SET NOT NULL;

-- points_ledger (created_at is the column that just failed in production)
ALTER TABLE points_ledger ALTER COLUMN source SET DEFAULT 'system';
ALTER TABLE points_ledger ALTER COLUMN metadata SET DEFAULT '{}';
ALTER TABLE points_ledger ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE points_ledger ALTER COLUMN subscriber_id SET NOT NULL;
ALTER TABLE points_ledger ALTER COLUMN direction SET NOT NULL;
ALTER TABLE points_ledger ALTER COLUMN points SET NOT NULL;
ALTER TABLE points_ledger ALTER COLUMN reason SET NOT NULL;
ALTER TABLE points_ledger ALTER COLUMN source SET NOT NULL;
ALTER TABLE points_ledger ALTER COLUMN metadata SET NOT NULL;
ALTER TABLE points_ledger ALTER COLUMN created_at SET NOT NULL;

-- reward_catalog
ALTER TABLE reward_catalog ALTER COLUMN description SET DEFAULT '';
ALTER TABLE reward_catalog ALTER COLUMN reward_type SET DEFAULT 'discount';
ALTER TABLE reward_catalog ALTER COLUMN reward_value SET DEFAULT '';
ALTER TABLE reward_catalog ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE reward_catalog ALTER COLUMN sort_order SET DEFAULT 0;
ALTER TABLE reward_catalog ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE reward_catalog ALTER COLUMN name SET NOT NULL;
ALTER TABLE reward_catalog ALTER COLUMN description SET NOT NULL;
ALTER TABLE reward_catalog ALTER COLUMN points_cost SET NOT NULL;
ALTER TABLE reward_catalog ALTER COLUMN reward_type SET NOT NULL;
ALTER TABLE reward_catalog ALTER COLUMN reward_value SET NOT NULL;
ALTER TABLE reward_catalog ALTER COLUMN is_active SET NOT NULL;
ALTER TABLE reward_catalog ALTER COLUMN sort_order SET NOT NULL;
ALTER TABLE reward_catalog ALTER COLUMN created_at SET NOT NULL;

-- redemption_codes
ALTER TABLE redemption_codes ALTER COLUMN status SET DEFAULT 'active';
ALTER TABLE redemption_codes ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE redemption_codes ALTER COLUMN subscriber_id SET NOT NULL;
ALTER TABLE redemption_codes ALTER COLUMN reward_catalog_id SET NOT NULL;
ALTER TABLE redemption_codes ALTER COLUMN code SET NOT NULL;
ALTER TABLE redemption_codes ALTER COLUMN points_spent SET NOT NULL;
ALTER TABLE redemption_codes ALTER COLUMN status SET NOT NULL;
ALTER TABLE redemption_codes ALTER COLUMN expires_at SET NOT NULL;
ALTER TABLE redemption_codes ALTER COLUMN created_at SET NOT NULL;

-- pos_orders
ALTER TABLE pos_orders ALTER COLUMN points_awarded SET DEFAULT 0;
ALTER TABLE pos_orders ALTER COLUMN raw_payload SET DEFAULT '{}';
ALTER TABLE pos_orders ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE pos_orders ALTER COLUMN source SET NOT NULL;
ALTER TABLE pos_orders ALTER COLUMN amount_cents SET NOT NULL;
ALTER TABLE pos_orders ALTER COLUMN points_awarded SET NOT NULL;
ALTER TABLE pos_orders ALTER COLUMN raw_payload SET NOT NULL;
ALTER TABLE pos_orders ALTER COLUMN created_at SET NOT NULL;

-- admin_users
ALTER TABLE admin_users ALTER COLUMN name SET DEFAULT '';
ALTER TABLE admin_users ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE admin_users ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE admin_users ALTER COLUMN email SET NOT NULL;
ALTER TABLE admin_users ALTER COLUMN password_hash SET NOT NULL;
ALTER TABLE admin_users ALTER COLUMN name SET NOT NULL;
ALTER TABLE admin_users ALTER COLUMN is_active SET NOT NULL;
ALTER TABLE admin_users ALTER COLUMN created_at SET NOT NULL;

-- newsletter_subscribers -- already covered by 016/017, restated here too
-- so this migration alone is a complete reference if ever needed on a
-- fresh database.
ALTER TABLE newsletter_subscribers ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE newsletter_subscribers ALTER COLUMN subscribed_at SET DEFAULT now();
ALTER TABLE newsletter_subscribers ALTER COLUMN points SET DEFAULT 0;
ALTER TABLE newsletter_subscribers ALTER COLUMN email SET NOT NULL;
ALTER TABLE newsletter_subscribers ALTER COLUMN is_active SET NOT NULL;
ALTER TABLE newsletter_subscribers ALTER COLUMN subscribed_at SET NOT NULL;
ALTER TABLE newsletter_subscribers ALTER COLUMN points SET NOT NULL;
