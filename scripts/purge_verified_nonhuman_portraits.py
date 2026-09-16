#!/usr/bin/env python3

import os
import json

DATA_JSON = 'public/data.json'

NON_HUMAN_IDS = [
    'vp-0661', # UDeM banner graphic
    'vp-0766', # Feng Chia University decorative ball logo
    'vp-0772', # Imgur logo placeholder
    'vp-0855', # Penn Medicine missing photo silhouette placeholder
    'vp-0920', # Shibaura lab diagram
    'vp-1052', # University of Arkansas tower logo
    'vp-1069', # Inland Norway map diagram
    'vp-1223', # Unistra university logo vignette
    'vp-1275', # Pitt clinical fellows group banner
    'vp-1299', # IRD badge logo
    'vp-1335', # HKU logo graphic
    'vp-1361', # Saarland University map graphic
    'vp-1369', # JIHS top header graphic
    'vp-1471', # INRAE organization flowchart diagram
    'vp-1489', # RIKEN award certificate graphic
    'vp-1566', # Coventry no-portrait graphic
]

with open(DATA_JSON, 'r', encoding='utf-8') as f:
    roster = json.load(f)

removed_count = 0

for person in roster:
    if person['id'] in NON_HUMAN_IDS:
        portrait_rel = person.get('portrait')
        if portrait_rel:
            full_path = os.path.join('public', portrait_rel)
            if os.path.exists(full_path):
                os.remove(full_path)
                print(f"Deleted file {full_path}")
            del person['portrait']
        if 'portraitSource' in person:
            del person['portraitSource']
        removed_count += 1
        print(f"Purged non-human portrait on [{person['id']}] {person['name']}")

with open(DATA_JSON, 'w', encoding='utf-8') as f:
    json.dump(roster, f, indent=2)
    f.write('\n')

print(f"\nSuccessfully purged {removed_count} verified non-human portraits.")
