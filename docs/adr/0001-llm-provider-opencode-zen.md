# ADR-0001 — LLM provider gratuito (opencode zen) para el tutor

- Estado: Aceptado
- Fecha: 2026-08-19
- Contexto: `diario/2026-08-19.md` del workspace.

## Decisión

Usar **opencode zen** como proveedor LLM del agente:
`baseURL: https://opencode.ai/zen/v1` + modelo `deepseek-v4-flash-free`, conectado con `@ai-sdk/openai-compatible`.

## Alternativas consideradas

- `zen/go/v1`: consume una suscripción pagada (Go), no usar en el public showcase.
- Groq LLM (texto): cuota 1,000 req/día, muere rápido en uso diario.
- Modelos locales: fuera de alcance (máquina del usuario sin capacidad de correrlos).

## Consecuencias

- Costo LLM: **$0** (endpoint free). Texto-only — el audio (STT/TTS) va por Groq Whisper y Google AI Studio Gemini (ver ADR-0002).
- La configuración vive en `.env` (`OPENCODE_ZEN_API_KEY`), nunca commiteada.
- Se deja el patrón `createOpenAICompatible` portátil: cambiar de provider = cambiar `name/baseURL/model` en `src/llm/opencode-zen.provider.ts`.
