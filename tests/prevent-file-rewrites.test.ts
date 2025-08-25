import { describe, it, expect } from 'vitest';
import { applyDiff } from '../app/utils/diff';

describe('applyDiff', () => {
  it('applies unified diff to update file content', () => {
    const original = `line1\nline2\nline3\n`;
    const diff = [
      '--- a/file.ts',
      '+++ b/file.ts',
      '@@ -1,3 +1,3 @@',
      '-line2',
      '+line2 modified',
      '+line4'
    ].join('\n');
    const updated = applyDiff(original, diff);
    expect(updated).toBe(`line1\nline2 modified\nline3\nline4\n`);
  });
});
