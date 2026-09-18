
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.animals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  tag_id text NOT NULL,
  name text NOT NULL,
  species text NOT NULL DEFAULT 'DOG',
  breed text,
  age_months integer,
  gender text,
  owner_name text,
  photo_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.animals TO authenticated;
GRANT ALL ON public.animals TO service_role;
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own animals" ON public.animals FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_animals_updated BEFORE UPDATE ON public.animals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.health_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  animal_id uuid REFERENCES public.animals(id) ON DELETE CASCADE,
  hr numeric,
  spo2 numeric,
  temperature numeric,
  status text NOT NULL DEFAULT 'NORMAL',
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_readings TO authenticated;
GRANT ALL ON public.health_readings TO service_role;
ALTER TABLE public.health_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own readings" ON public.health_readings FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_readings_animal_time ON public.health_readings (user_id, animal_id, recorded_at DESC);

CREATE TABLE public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  animal_id uuid REFERENCES public.animals(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'VITALS',
  parameter text,
  value numeric,
  expected_range text,
  severity text NOT NULL DEFAULT 'WARNING',
  message text NOT NULL,
  recommendation text,
  state text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alerts TO authenticated;
GRANT ALL ON public.alerts TO service_role;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own alerts" ON public.alerts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_alerts_updated BEFORE UPDATE ON public.alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.disease_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  animal_id uuid REFERENCES public.animals(id) ON DELETE SET NULL,
  species text,
  affected_count integer NOT NULL DEFAULT 1,
  death_count integer NOT NULL DEFAULT 0,
  symptoms text,
  suspected_issue text,
  observed_on date NOT NULL DEFAULT current_date,
  village text,
  block_taluk text,
  district text,
  state text,
  notes text,
  photo_url text,
  status text NOT NULL DEFAULT 'Submitted',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.disease_reports TO authenticated;
GRANT ALL ON public.disease_reports TO service_role;
ALTER TABLE public.disease_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reports" ON public.disease_reports FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_reports_updated BEFORE UPDATE ON public.disease_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.vaccinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  animal_id uuid REFERENCES public.animals(id) ON DELETE CASCADE,
  vaccine_name text NOT NULL,
  administered_on date,
  next_due_on date,
  administered_by text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vaccinations TO authenticated;
GRANT ALL ON public.vaccinations TO service_role;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own vaccinations" ON public.vaccinations FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_vacc_updated BEFORE UPDATE ON public.vaccinations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  animal_id uuid REFERENCES public.animals(id) ON DELETE CASCADE,
  issue text,
  treatment text,
  medicine text,
  treated_on date NOT NULL DEFAULT current_date,
  vet_name text,
  follow_up_on date,
  recovery_status text NOT NULL DEFAULT 'Ongoing',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.treatments TO authenticated;
GRANT ALL ON public.treatments TO service_role;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own treatments" ON public.treatments FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_treat_updated BEFORE UPDATE ON public.treatments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.ai_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  animal_id uuid REFERENCES public.animals(id) ON DELETE SET NULL,
  species text,
  hr numeric,
  spo2 numeric,
  temperature numeric,
  symptoms text,
  observations text,
  status text,
  risk_level text,
  concern text,
  recommendation text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_assessments TO authenticated;
GRANT ALL ON public.ai_assessments TO service_role;
ALTER TABLE public.ai_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own assessments" ON public.ai_assessments FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
