# ADR-0003 — Interfaz para proveedores LLM en el borde externo

- Estado: Aceptado
- Fecha: 2026-08-23
- Contexto: `context/architecture.md` del workspace (simplicidad por defecto; interfaces solo en bordes externos).

## Decisión

Introducir una **interfaz mínima** para el proveedor LLM:

- `LlmProvider<TModel>` en `src/llm/llm-provider.ts` (`id` + `createModel()`).
- `OpencodeZenProvider` implementa la interfaz y encapsula `OPENCODE_ZEN_API_KEY`/`BASE_URL`/`MODEL`.
- `resolveLlmProvider(env)` en `src/llm/resolve-llm-provider.ts` es el único lugar que lee `process.env` y elige implementación según `LLM_PROVIDER` (default `opencode-zen`).
- `createEnglishTutorAgent` recibe `model: TutorModel` ya construido, no `apiKey`.

## Alternativas consideradas

- Seguir leyendo `OPENCODE_ZEN_API_KEY` en cada entrypoint (`cli`, `evals`): duplica conocimiento del proveedor y dificulta el swap.
- Registro genérico/DI container: prematuro con un solo proveedor (YAGNI).

## Consecuencias

- Cambiar de proveedor = implementar `LlmProvider` + una rama en el factory + `LLM_PROVIDER` en `.env`. Sin tocar `agent` ni entrypoints.
- La lógica sigue testeable por inyección de `model` (tests de `resolveLlmProvider` en `tests/llm-provider.test.ts`).
- `.env.example` documenta `LLM_PROVIDER` opcional.
