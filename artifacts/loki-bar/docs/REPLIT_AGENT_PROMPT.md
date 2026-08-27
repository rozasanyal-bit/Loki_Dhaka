Finish Loki Bar from this repository without replacing it.

Use pnpm only. Keep appId `com.loki.bar.system` and appName `Loki Bar`.
Keep the black/dark/gold visual system and `Developed by ARZO`.
Keep `Product & experience · Roza Sanyal` subtle in the private developer maintenance area.

Security rules:
- Customer must never read spending, lifetime value, visit history, internal status/tier, rankings, staff notes, or owner observations.
- Staff may scan QR, log visits, add notes, and update customer status.
- Owner has full customer/staff controls and only owner creates/revokes staff invitations.

First run:
pnpm install
pnpm build
pnpm exec cap add android
pnpm exec cap sync android

Do not expose or print secrets. Fix only the smallest build issue when one occurs. Do not delete working Loki code.
