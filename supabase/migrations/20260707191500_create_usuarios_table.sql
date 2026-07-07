-- 1. Create table usuarios in public schema
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  nome VARCHAR(255),
  celular VARCHAR(50),
  foto_url TEXT,
  aprovado BOOLEAN NOT NULL DEFAULT FALSE,
  regra VARCHAR(50) NOT NULL DEFAULT 'usuario',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security (RLS) on public.usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function to check if a user is an admin without recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = user_id AND regra = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Create RLS Policies for public.usuarios
CREATE POLICY "Allow select for everyone"
  ON public.usuarios
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can update all profiles"
  ON public.usuarios
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete profiles"
  ON public.usuarios
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 5. Trigger function to automatically create profile for new auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_admin_email BOOLEAN;
BEGIN
  is_admin_email := (new.email = 'paulogtillmann@gmail.com');
  
  INSERT INTO public.usuarios (id, email, nome, celular, aprovado, regra)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'nome', new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'celular', new.raw_user_meta_data->>'phone', ''),
    is_admin_email, -- True if paulogtillmann@gmail.com, False otherwise
    CASE WHEN is_admin_email THEN 'admin' ELSE 'usuario' END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Trigger function to auto-confirm email sign-ups in auth.users
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  new.email_confirmed_at := COALESCE(new.email_confirmed_at, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_auth_user_created_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_user();

-- 7. Storage Bucket Creation for avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, '{image/png, image/jpeg, image/gif, image/webp}')
ON CONFLICT (id) DO NOTHING;

-- 8. Storage RLS Policies for avatars
CREATE POLICY "Permitir upload de avatares próprios"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Permitir update de avatares próprios"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Permitir delete de avatares próprios"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Permitir acesso público de leitura aos avatares"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 9. Create the admin user in auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  aud,
  role,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at
) VALUES (
  'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e0e0',
  '00000000-0000-0000-0000-000000000000',
  'paulogtillmann@gmail.com',
  extensions.crypt('admin@2026', extensions.gen_salt('bf')),
  now(),
  'authenticated',
  'authenticated',
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"nome": "Paulo Tillmann", "name": "Paulo Tillmann"}'::jsonb,
  false,
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- 10. Grant privileges to roles
GRANT SELECT ON public.usuarios TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.usuarios TO authenticated;
