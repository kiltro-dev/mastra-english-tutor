import { createTool } from '@mastra/core/tools';
import {
  computeSrsSchedule,
  srsScheduleOutputSchema,
  srsScheduleSchema,
} from '../schemas/srs.schema';

export function createSrsScheduleTool() {
  return createTool({
    id: 'srs-schedule',
    description:
      'Calcula la próxima revisión de un ítem usando spaced repetition (intervalos crecientes por box).',
    inputSchema: srsScheduleSchema,
    outputSchema: srsScheduleOutputSchema,
    execute: async ({ box, reviewedAt }) => computeSrsSchedule(box, reviewedAt),
  });
}
