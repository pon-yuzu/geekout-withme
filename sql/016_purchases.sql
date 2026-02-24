-- 016: Single-payment purchase history for services
CREATE TABLE public.purchases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  product_type text NOT NULL,  -- 'workbook' | 'coaching' | 'session'
  stripe_session_id text UNIQUE,
  amount integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON public.purchases FOR SELECT
  USING (auth.uid() = user_id);
