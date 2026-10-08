import { test } from 'node:test';
import assert from 'node:assert/strict';
import { connectionPath, lineageLayout } from '../src/connection-layouts.ts';
import type { AcademicRelationship } from '../src/relationships.ts';

function edge(a: string, b: string, type: AcademicRelationship['type'] = 'doctoral-advisor'): AcademicRelationship {
  return { id: `${type}-${a}-${b}`, type, sourceId: a, targetId: b, sources: [], evidence: '', works: [], verifiedAt: '', direct: false, notes: '' };
}

test('paths take the shortest route and retain mentorship direction when traversing backwards', () => {
  const edges = [edge('a', 'b'), edge('b', 'c'), edge('c', 'd'), edge('a', 'd', 'coauthor')];
  assert.deepEqual(connectionPath(edges, 'a', 'd')?.ids, ['a', 'd']);
  const reverse = connectionPath(edges.slice(0, 3), 'c', 'a');
  assert.deepEqual(reverse?.ids, ['c', 'b', 'a']);
  assert.equal(reverse?.edges[0].sourceId, 'b');
  assert.equal(connectionPath(edges, 'a', 'isolated'), null);
  assert.deepEqual(connectionPath(edges, 'a', 'a'), { ids: ['a'], edges: [] });
});

test('lineage places multiple advisors above their shared advisee and preserves deeper generations', () => {
  const result = lineageLayout([edge('a', 'c'), edge('b', 'c'), edge('c', 'd'), edge('a', 'c', 'masters-advisor')]);
  assert.equal(result.hasCycle, false);
  assert.equal(result.points.get('a')!.y, result.points.get('b')!.y);
  assert.ok(result.points.get('a')!.y < result.points.get('c')!.y);
  assert.ok(result.points.get('c')!.y < result.points.get('d')!.y);
  assert.notEqual(result.points.get('a')!.x, result.points.get('b')!.x);
});

test('lineage keeps cycles and their descendants visible without claiming a valid hierarchy', () => {
  const result = lineageLayout([edge('a', 'b'), edge('b', 'a'), edge('b', 'c')]);
  assert.equal(result.hasCycle, true);
  assert.equal(result.points.size, 3);
  assert.equal(result.points.get('a')!.y, result.points.get('c')!.y);
  const empty = lineageLayout([]);
  assert.equal(empty.points.size, 0);
  assert.equal(empty.hasCycle, false);
});
