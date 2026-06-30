# Supabase password reset checklist

Use this checklist when a member reports that the reset password e-mail does
not arrive.

## Supabase Auth URLs for web

In Supabase Dashboard, open **Authentication > URL Configuration**.

Set **Site URL**:

```text
https://resplendent-melba-bf3f7f.netlify.app
```

Add this **Redirect URL**:

```text
https://resplendent-melba-bf3f7f.netlify.app/reset-password
```

For local web testing, optionally add:

```text
http://localhost:5173/reset-password
http://localhost:4173/reset-password
```

For a future Android deep-link flow, the app code is prepared for:

```text
no.divingecologyfrosta.app://auth/reset-password
```

Do not add unrelated domains.

## Check the Auth user

Supabase password reset works against `auth.users.email`, not only the e-mail
stored in `public.members`.

For Krzysztof Kluczek, use the Auth e-mail:

```text
krzysztof-kluczek1@wp.pl
```

Run:

```sql
SELECT
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  last_sign_in_at,
  created_at
FROM auth.users
WHERE lower(email) = lower('krzysztof-kluczek1@wp.pl');
```

## Check the member link

```sql
SELECT
  member.id AS member_id,
  member.full_name,
  member.email AS member_email,
  member.user_id,
  auth_user.email AS auth_email,
  auth_user.email_confirmed_at,
  auth_user.last_sign_in_at
FROM public.members AS member
LEFT JOIN auth.users AS auth_user
  ON auth_user.id = member.user_id
WHERE lower(member.full_name) = lower('Krzysztof Kluczek')
   OR lower(member.email) = lower('krzysztof-kluczek1@wp.pl')
   OR lower(auth_user.email) = lower('krzysztof-kluczek1@wp.pl');
```

If `member.email` and `auth_email` are different, request reset for
`auth_email`.

## Check delivery

In Supabase Dashboard:

1. Open **Logs > Auth**.
2. Filter by the Auth e-mail address.
3. Look for reset password events and delivery errors.

Typical causes are:

- redirect URL is not allowed;
- the member typed an address that is not present in `auth.users`;
- SMTP delivery failed;
- the message went to spam/junk;
- rate limits were reached.
