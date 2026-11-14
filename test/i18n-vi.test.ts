import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FIELDS } from '../src/data.ts';
import { connectionLabelVi, FIELD_VI, placeVi, rankVi } from '../src/i18n-vi.ts';
import { connectionLabel } from '../src/relationships.ts';

test('every broad field has a Vietnamese name', () => {
  for (const field of FIELDS) assert.ok(FIELD_VI[field], field);
});

test('Vietnamese ranks follow the career level and track', () => {
  assert.equal(rankVi({ rank: 'Associate Professor', track: 'Tenure-line' }), 'Phó Giáo sư');
  assert.equal(
    rankVi({ rank: 'Assistant Professor', track: 'Research' }),
    'Trợ lý Giáo sư nghiên cứu',
  );
  assert.equal(rankVi({ rank: 'Professor', track: 'Emeritus' }), 'Giáo sư danh dự');
  assert.equal(rankVi({ rank: 'Senior Lecturer', track: 'Tenure-line' }), 'Giảng viên cao cấp');
  assert.equal(rankVi({ track: 'Deceased' }), 'Đã mất');
});

test('unknown places fall back to the English name instead of failing', () => {
  assert.equal(placeVi('United States'), 'Mỹ');
  assert.equal(placeVi('Atlantis'), 'Atlantis');
});

test('every connection label has a Vietnamese form', () => {
  const types = [
    'doctoral-advisor',
    'masters-advisor',
    'undergraduate-advisor',
    'postdoctoral-mentor',
    'grant-collaborator',
    'patent-coinventor',
    'coauthor',
  ] as const;
  for (const type of types) {
    for (const role of ['mentor', 'mentee', 'peer'] as const) {
      for (const count of [1, 3]) {
        const label = connectionLabel(type as never, role, count);
        assert.notEqual(connectionLabelVi(label), label, label);
      }
    }
  }
});
