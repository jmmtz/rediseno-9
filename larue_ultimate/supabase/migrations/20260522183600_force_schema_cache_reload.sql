/*
  # Force PostgREST schema cache reload

  Adds a comment to each table queried by the Admin Dashboard.
  Applying a DDL statement causes Supabase to notify PostgREST to
  reload its schema cache, resolving "Database error querying schema".
*/

COMMENT ON TABLE appointments IS 'Client appointments';
COMMENT ON TABLE staff IS 'Staff members';
COMMENT ON TABLE services IS 'Offered services';
COMMENT ON TABLE coupons IS 'Discount coupons';
COMMENT ON TABLE promotions IS 'Active promotions';
COMMENT ON TABLE orders IS 'VALM store orders';
COMMENT ON TABLE app_settings IS 'Application settings';
