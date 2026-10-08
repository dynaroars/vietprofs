import type { AcademicRelationship } from './relationships.ts';

export interface GraphPoint { x: number; y: number }
export const isMentorship = (edge: AcademicRelationship): boolean => edge.type.endsWith('advisor') || edge.type === 'postdoctoral-mentor';

/** Breadth-first search gives a shortest path by number of recorded relationships.
 * Mentorship may be traversed in either direction; the stored arrow is retained for display.
 */
export function connectionPath(edges: AcademicRelationship[], start: string, end: string): { ids: string[]; edges: AcademicRelationship[] } | null {
  if (start === end) return { ids: [start], edges: [] };
  const adjacency = new Map<string, { id: string; edge: AcademicRelationship }[]>();
  for (const edge of edges) for (const [a, b] of [[edge.sourceId, edge.targetId], [edge.targetId, edge.sourceId]]) {
    if (!adjacency.has(a)) adjacency.set(a, []);
    adjacency.get(a)!.push({ id: b, edge });
  }
  const queue = [start];
  const previous = new Map<string, { id: string; edge: AcademicRelationship }>();
  const seen = new Set(queue);
  for (let index = 0; index < queue.length; index++) {
    for (const next of adjacency.get(queue[index]) ?? []) {
      if (seen.has(next.id)) continue;
      seen.add(next.id);
      previous.set(next.id, { id: queue[index], edge: next.edge });
      if (next.id === end) {
        const ids = [end], path: AcademicRelationship[] = [];
        let id = end;
        while (id !== start) {
          const step = previous.get(id)!;
          path.unshift(step.edge); ids.unshift(step.id); id = step.id;
        }
        return { ids, edges: path };
      }
      queue.push(next.id);
    }
  }
  return null;
}

/** Layers follow advisor → advisee edges, rather than dates or career seniority. */
export function lineageLayout(edges: AcademicRelationship[]): { points: Map<string, GraphPoint>; height: number; width: number; hasCycle: boolean } {
  const ids = [...new Set(edges.flatMap(edge => [edge.sourceId, edge.targetId]))].sort();
  const incoming = new Map(ids.map(id => [id, 0]));
  const outgoing = new Map(ids.map(id => [id, new Set<string>()]));
  for (const edge of edges) {
    if (!outgoing.get(edge.sourceId)!.has(edge.targetId)) {
      outgoing.get(edge.sourceId)!.add(edge.targetId);
      incoming.set(edge.targetId, incoming.get(edge.targetId)! + 1);
    }
  }
  const levels = new Map(ids.map(id => [id, 0]));
  const queue = ids.filter(id => incoming.get(id) === 0);
  for (let index = 0; index < queue.length; index++) {
    const id = queue[index];
    for (const child of outgoing.get(id)!) {
      levels.set(child, Math.max(levels.get(child)!, levels.get(id)! + 1));
      incoming.set(child, incoming.get(child)! - 1);
      if (incoming.get(child) === 0) queue.push(child);
    }
  }
  const unresolved = ids.filter(id => incoming.get(id)! > 0);
  // Cycles and their descendants have no well-defined generation. Keep them visible
  // in a separate row and tell the visitor that a hierarchy could not be assigned.
  const lastLevel = Math.max(0, ...levels.values()) + 1;
  for (const id of unresolved) levels.set(id, lastLevel);
  const seen = new Set<string>();
  const components: string[][] = [];
  const neighbors = new Map(ids.map(id => [id, new Set<string>()]));
  for (const edge of edges) { neighbors.get(edge.sourceId)!.add(edge.targetId); neighbors.get(edge.targetId)!.add(edge.sourceId); }
  for (const id of ids) {
    if (seen.has(id)) continue;
    const component: string[] = [], pending = [id]; seen.add(id);
    while (pending.length) { const next = pending.pop()!; component.push(next); for (const neighbor of neighbors.get(next)!) if (!seen.has(neighbor)) { seen.add(neighbor); pending.push(neighbor); } }
    components.push(component.sort());
  }
  components.sort((a, b) => b.length - a.length || a[0].localeCompare(b[0]));
  const points = new Map<string, GraphPoint>();
  let x = 0, y = 0, rowHeight = 0, width = 800;
  for (const component of components) {
    const rows = new Map<number, string[]>();
    const minimum = Math.min(...component.map(id => levels.get(id)!));
    for (const id of component) { const level = levels.get(id)! - minimum; if (!rows.has(level)) rows.set(level, []); rows.get(level)!.push(id); }
    const componentWidth = Math.max(...[...rows.values()].map(row => row.length)) * 220;
    const componentHeight = 140 + Math.max(...rows.keys()) * 125;
    if (x > 0 && x + componentWidth > 800) { x = 0; y += rowHeight; rowHeight = 0; }
    for (const [level, row] of rows) row.forEach((id, index) => points.set(id, { x: x + 45 + index * 220, y: y + 60 + level * 125 }));
    width = Math.max(width, x + componentWidth);
    x += componentWidth; rowHeight = Math.max(rowHeight, componentHeight);
  }
  return { points, height: Math.max(240, y + rowHeight), width, hasCycle: unresolved.length > 0 };
}
