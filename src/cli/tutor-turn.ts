import { TutorResponseSchema } from '../schemas/tutor-response.schema';
import type { TutorResponse } from '../schemas/tutor-response.schema';

export function parseTutorReply(raw: string): TutorResponse | null {
  const json = extractJsonPayload(raw);
  if (!json) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }

  const result = TutorResponseSchema.safeParse(parsed);
  return result.success ? result.data : null;
}

function extractJsonPayload(raw: string): string | null {
  const fenced = raw.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end <= start) {
    return null;
  }
  return raw.slice(start, end + 1);
}

export function formatTutorTurn(turn: TutorResponse): string {
  const lines: string[] = [`Tutor: ${turn.reply_text}`];

  for (const correction of turn.corrections) {
    lines.push(
      `  ✎ "${correction.original}" → "${correction.corrected}" (${correction.type})`,
      `     ${correction.explanation}`,
    );
  }

  if (turn.pronunciation_score !== undefined) {
    lines.push(`  🎧 Pronunciation: ${turn.pronunciation_score}/10`);
  }

  if (turn.next_lesson) {
    lines.push(`  ➜ Next lesson: ${turn.next_lesson}`);
  }

  return lines.join('\n');
}
