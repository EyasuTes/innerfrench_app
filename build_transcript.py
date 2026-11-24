"""Regenerate the browser data after editing the supplied transcripts."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent

def parse(name):
    text = (ROOT / name).read_text(encoding='utf-8-sig').strip()
    parts = re.split(r'\[(\d{2}:\d{2}:\d{2})\]', text)
    rows = [(0, parts[0].strip())]
    for time, passage in zip(parts[1::2], parts[2::2]):
        h, m, s = map(int, time.split(':'))
        rows.append((h * 3600 + m * 60 + s, passage.strip()))
    assert all(body for _, body in rows), 'Empty passage'
    assert all(a[0] < b[0] for a, b in zip(rows, rows[1:])), 'Unordered timestamps'
    return rows

fr, en = parse('episode1'), parse('episode1_eng')
assert [t for t, _ in fr] == [t for t, _ in en], 'Translations must have matching timestamps'
rows = [dict(start=t, fr=f, en=e) for (t, f), (_, e) in zip(fr, en)]
(ROOT / 'transcript.js').write_text('window.PASSAGES = ' + json.dumps(rows, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
print(f'Generated {len(rows)} matched bilingual passages.')
