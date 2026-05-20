# Provas TIP

Sistema de provas/quiz em tempo real para treinamentos da TIP Brasil.

## Setup

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   - Copie `.env.local.example` para `.env.local`:
     ```bash
     cp .env.local.example .env.local
     ```
   - Edite `.env.local` e cole sua NOVA `SUPABASE_SERVICE_ROLE_KEY` (gerada via Rotate no Supabase Dashboard)

3. **Rodar:**
   ```bash
   npm run dev
   ```

4. Abra http://localhost:3000

## Stack

- Next.js 15 (App Router) + TypeScript
- Supabase (Postgres + Realtime + Auth)
- Tailwind CSS
- Visual: TIP Brasil dark theme
