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

## Enmienda (2026-08-22)

`deepseek-v4-flash-free` fue retirado del catálogo free de opencode zen. Nuevo modelo por defecto: **`x-preview-f-free`** (Ox Alpha Free), mismo endpoint y patrón. El override `OPENCODE_ZEN_MODEL` permite cambiar de modelo sin tocar código; los evals con ground truth validan el swap antes de mergear.

## Enmienda (2026-08-23)

Benchmark de los 6 modelos free del catálogo contra los eval cases (`evals/benchmark.mts`): `x-preview-f-free` resultó lento (~80s para 2 casos, loop de reasoning) y en una corrida devolvió texto fuera del schema; `mimo-v2.5-free` y `big-pickle` cayeron en rate limit (429). Nuevo default: **`nemotron-3-ultra-free`** — 2/2 evals, el más rápido (25s total, caso de gramática en 4s), con un único 502 transitorio resuelto por reintento.
