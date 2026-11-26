import { expect, test } from 'vitest';
import { config, videos, commentPage, mediaPath } from '../lib/demo';
import { sortVideos, filterVideos, excerpt } from '../lib/catalog';

test('has built-in bilingual content and deterministic recording-date order', () => {
  expect(sortVideos(videos('de').reverse(), config.meta).map((video) => video.videoId)).toEqual(['lake', 'mountains', 'garden']);
  expect(videos('en')[0].plainTitle).toBe('A summer by the lake');
  expect(videos('de')[0].plainDescription).not.toBe(videos('en')[0].plainDescription);
  expect(new Set(videos('de').map((video) => video.videoId)).size).toBe(3);
});

test('returns independent data, paginated comments and an empty final cursor', () => {
  const first = commentPage('lake');
  expect(first.comments.map((comment) => comment.commentId)).toEqual(['c2', 'c3']);
  expect(first.next).toBe(2);
  expect(commentPage('lake', first.next!).next).toBeNull();
  first.comments[0].displayName = 'Changed';
  expect(commentPage('lake').comments[0].displayName).toBe('Sam');
  const list = videos('de');
  (list[0].meta.people as string[]).push('Changed');
  expect(videos('de')[0].meta.people).toEqual(['Alex', 'Sam']);
  expect(commentPage('unknown')).toEqual({ comments: [], next: null });
});

test('searches descriptions and metadata and combines recording-date filters', () => {
  const all = videos('de');
  expect(filterVideos(all, 'Wolken', {}, config.meta).map((v) => v.videoId)).toEqual(['mountains']);
  expect(filterVideos(all, 'Robin', { recordedFrom: '2026-07-01', recordedTo: '2026-07-31' }, config.meta).map((v) => v.videoId)).toEqual(['mountains']);
  expect(filterVideos(all, '', { 'meta:category': 'Freizeit / Leisure' }, config.meta).map((v) => v.videoId)).toEqual(['garden']);
  expect(excerpt('a'.repeat(151))).toBe('a'.repeat(150) + '…');
});

test('serves media from same-origin bundled assets', () => {
  for (const video of videos('de')) {
    expect(mediaPath(video.videoId, 'video')).toBe(`/demo/${video.videoId}.mp4`);
    expect(mediaPath(video.videoId, 'thumbnail')).toBe(`/demo/${video.videoId}.jpg`);
  }
});
