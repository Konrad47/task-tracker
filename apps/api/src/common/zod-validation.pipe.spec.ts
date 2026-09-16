import { BadRequestException } from '@nestjs/common';
import { createTaskSchema, updateTaskSchema } from '@task-tracker/shared';
import { ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
  const createPipe = new ZodValidationPipe(createTaskSchema);
  const updatePipe = new ZodValidationPipe(updateTaskSchema);

  it('returns parsed create input, trimming the title', () => {
    expect(
      createPipe.transform({ title: '  Buy milk  ', status: 'todo' }),
    ).toEqual({ title: 'Buy milk', status: 'todo' });
  });

  it('rejects invalid create input with flatten issues', () => {
    expect(() => createPipe.transform({ title: '' })).toThrow(
      BadRequestException,
    );

    try {
      createPipe.transform({ title: '' });
    } catch (error) {
      const response = (error as BadRequestException).getResponse() as {
        message: string;
        issues: { fieldErrors: Record<string, unknown> };
      };
      expect(response.message).toBe('Validation failed');
      expect(response.issues.fieldErrors.title).toBeDefined();
    }
  });

  it('returns parsed update input including a null description', () => {
    expect(
      updatePipe.transform({ title: 'Renamed', description: null }),
    ).toEqual({ title: 'Renamed', description: null });
  });

  it('rejects invalid update status', () => {
    expect(() => updatePipe.transform({ status: 'archived' })).toThrow(
      BadRequestException,
    );
  });
});
