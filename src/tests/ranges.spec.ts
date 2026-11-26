import { expect, test } from 'vitest';
import { range } from '../lib/byteRange';

test('handles full, open-ended, bounded and suffix byte ranges', () => {
  expect(range(null, 100)).toEqual([0, 99]);
  expect(range('bytes=10-19', 100)).toEqual([10, 19]);
  expect(range('bytes=50-', 100)).toEqual([50, 99]);
  expect(range('bytes=-10', 100)).toEqual([90, 99]);
  expect(range('bytes=90-200', 100)).toEqual([90, 99]);
});

test('rejects invalid or unsatisfiable ranges', () => {
  for (const header of ['bytes=100-', 'bytes=9-1', 'bytes=-0', 'bytes=0-1,3-4', 'garbage']) expect(() => range(header, 100)).toThrow();
  expect(() => range(null, 0)).toThrow();
});
