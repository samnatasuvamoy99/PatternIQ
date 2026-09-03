# Agent Guidelines

- **Tech Stack**: Next.js 14 (App Router), TypeScript, Prisma ORM, and Zod.
- **TypeScript**: Adhere to strict typing. Avoid using `any` and define explicit interfaces.
- **Validation**: Validate all request payloads and query parameters using Zod schemas before processing.
- **Database & Prisma**: Always run `npm run prisma:generate` after modifying `prisma/schema.prisma`. Avoid manual migration edits.
- **API Standards**: Maintain standard JSON responses with explicit HTTP status codes and uniform format (`{ success, data, error }`).
- **Security**: Never commit secrets or hardcode credentials. Hash sensitive data with `bcryptjs` and validate JWTs securely.
- **Error Handling**: Wrap route handlers in `try/catch` blocks. Log server errors clearly and return safe messages to clients.
- **Frontend & UI**: Use shadcn/ui components (theme preset `b3F4GrJpa6`) and Tailwind CSS; ensure components are responsive and accessible.
- **Documentation**: Refer to `doc/API_DOCUMENTATION.md` for any API schemas and query specifications, and `doc/FRONTEND_INTEGRATION_GUIDE.md` for client integration and auth flow.
- **Verification**: Run `npm run lint` and ensure TypeScript builds cleanly before completing tasks.
