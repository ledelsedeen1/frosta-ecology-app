# Supabase password reset checklist

Use this checklist when a member reports that the reset password e-mail does
not arrive or the link from Supabase does not let them set a new password.

This document is for the web password reset flow only. Do not add Android,
Capacitor or TWA deep-link redirects during this check.

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

Do not add unrelated domains. Do not add Android deep links until the Android
password recovery flow is intentionally tested as a separate release task.

## Check the Auth user e-mail

Supabase password reset works against `auth.users.email`. It does not reset a
different account just because the member typed an address stored elsewhere in
`public.members` or another application table.

Test these Auth e-mail addresses without changing any user data:

```text
admin@frostadiving.no
krzysztof-kluczek1@wp.pl
kedzierski1974@gmail.com
wawrzyszczakm@gmail.com
```

Do not change UIDs, e-mail addresses, roles or passwords. Do not try to read
passwords from the database.

Use this read-only check when you have Supabase Dashboard SQL access:

```sql
SELECT
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  last_sign_in_at,
  created_at
FROM auth.users
WHERE lower(email) IN (
  lower('admin@frostadiving.no'),
  lower('krzysztof-kluczek1@wp.pl'),
  lower('kedzierski1974@gmail.com'),
  lower('wawrzyszczakm@gmail.com')
)
ORDER BY email;
```

If a member enters a different e-mail address than the one in `auth.users`, ask
them to request the reset using the Auth e-mail address. Supabase will not send
a valid reset link for another account.

## Check member profile links

If `public.members.email` and `auth.users.email` differ, use `auth.users.email`
for password reset:

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
WHERE lower(member.email) IN (
  lower('admin@frostadiving.no'),
  lower('krzysztof-kluczek1@wp.pl'),
  lower('kedzierski1974@gmail.com'),
  lower('wawrzyszczakm@gmail.com')
)
OR lower(auth_user.email) IN (
  lower('admin@frostadiving.no'),
  lower('krzysztof-kluczek1@wp.pl'),
  lower('kedzierski1974@gmail.com'),
  lower('wawrzyszczakm@gmail.com')
)
ORDER BY member.full_name;
```

## Check delivery

If the reset e-mail does not arrive:

1. Confirm the address exists in `auth.users`.
2. Check spam/junk folders.
3. Open **Supabase > Logs > Auth** and filter by the Auth e-mail address.
4. Check whether the project has reached Supabase e-mail limits or rate limits.
5. Check whether the project uses Supabase default SMTP or a custom SMTP.
6. If the app has more active users, consider configuring a custom SMTP provider
   such as Brevo, Resend or Postmark. Do not configure SMTP as part of this
   checklist without a separate deployment decision.

Typical causes are:

- the redirect URL is not allowed in Supabase;
- the member typed an address that is not present in `auth.users`;
- the recovery link was opened after it expired or after it had already been used;
- SMTP delivery failed;
- the message went to spam/junk;
- Supabase rate limits were reached.

## Web test steps

1. Open the Netlify app.
2. On the login screen, click **Glemt passord?**, **Nie pamiętasz hasła?** or
   **Forgot password?** depending on the selected language.
3. Enter one of the Auth e-mail addresses listed above.
4. Confirm that the app shows a success message after requesting the reset.
5. Open the e-mail and click the Supabase recovery link.
6. Confirm that the browser opens `/reset-password`.
7. Confirm that the form shows **new password**, **repeat new password** and
   **save new password** fields.
8. Try a password shorter than 8 characters and confirm the validation message.
9. Try two different passwords and confirm the mismatch message.
10. Save a valid password and confirm the success message and return to login.
11. Reuse the same recovery link or open `/reset-password` without a valid code
    and confirm that the app says the reset link is invalid or expired.
