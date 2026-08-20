# ADR-0002 — Pipeline de voz modular (STT → LLM → TTS), no speech-to-speech

- Estado: Aceptado
- Fecha: 2026-08-19
- Contexto: `diario/2026-08-19.md` del workspace.

## Decisión

El producto (repo privado) implementa el pipeline de voz **en etapas separadas**: STT (Groq Whisper, gratuito, ~8h/día), razonamiento del tutor (opencode zen), TTS (Google AI Studio Gemini, gratuito, sin tarjeta). Este repo público expone solo la parte de razonamiento (agente + tools + evals).

## Alternativas consideradas

- Speech-to-speech end-to-end: atractivo, pero impide loguear transcripciones/timestamps, que son el dato de producto (moat).
- ElevenLabs/Deepgram/AssemblyAI/Azure: free tiers de audio demasiado pequeños para uso diario real.

## Consecuencias

- Se logueará transcripción + timestamps por turno en el repo privado.
- Latencia esperada ~1–2s por turno (aceptable para práctica de conversación).
- STT con word-level timestamps para futuro análisis de pronunciación; pronunciación fina (Speechace/Elsa) se evalúa después.
