/*
  # Add customer read access for orders

  1. Changes
    - Adds a SELECT policy on `orders` so authenticated customers can read their own orders
      matched by email (since orders only store customer_email, not a user_id foreign key)

  2. Security
    - Policy uses auth.jwt() to get the authenticated user's email
    - Only the owner of the email address can read their orders
*/

CREATE POLICY "Customers can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
