# Agent Guidelines

- **Tech Stack**: Next.js 14 (App Router), TypeScript, Prisma ORM, and Zod.
- **TypeScript**: Adhere to strict typing. Avoid using `any` and define explicit interfaces.
- **Validation**: Validate all request payloads and query parameters using Zod schemas before processing.
- **Database & Prisma**: Always run `npm run prisma:generate` after modifying `prisma/schema.prisma`. Avoid manual migration edits.
- **API Standards**: Maintain standard JSON responses with explicit HTTP status codes and uniform format (`{ success, data, error }`).
- **Security**: Never commit secrets or hardcode credentials. Hash sensitive data with `bcryptjs` and validate JWTs securely.
- **Error Handling**: Wrap route handlers in `try/catch` blocks. Log server errors clearly and return safe messages to clients.
- **Frontend & UI**: Use shadcn/ui components and Tailwind CSS for interfaces; ensure components are responsive and accessible.
- **Verification**: Run `npm run lint` and ensure TypeScript builds cleanly before completing tasks.
