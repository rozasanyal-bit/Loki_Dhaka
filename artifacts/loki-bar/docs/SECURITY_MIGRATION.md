# Loki privacy migration

Customer-safe identity data lives in `publicProfiles/{uid}`. Private status, notes, favorite drink, staff activity and visits remain in `users/{uid}` / `visits/{visitId}` and are privileged.

Before production, backfill `publicProfiles` for every existing Auth user with only: name, email, role, qrCode, createdAt. Do not copy status, notes, favoriteDrink, spending, visits, or internal observations. Use Firebase Admin credentials only on a trusted machine/CI environment.
