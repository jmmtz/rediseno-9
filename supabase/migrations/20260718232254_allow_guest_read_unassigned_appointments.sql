-- Allow anon and authenticated users to read appointments without a client_id (guest bookings)
-- This is needed so the booking wizard can retrieve the appointment id after insert
-- to trigger WhatsApp confirmation messages.
CREATE POLICY "Guests can read unassigned appointments"
  ON appointments FOR SELECT
  TO anon, authenticated
  USING (client_id IS NULL);
