#!/usr/bin/env python3
"""
Verify proposals rigorously and apply clean updates.
"""

import datetime
import json
import re

CANONICAL_MAP = {
    'university of california - san diego, la jolla, california': 'University of California, San Diego',
    'chemistry, belgorod state national research university': 'Belgorod State National Research University',
    'mathematics and statistics, university of mel-': 'University of Melbourne',
    'hanoi university of technology': 'Hanoi University of Science and Technology',
    'ho chi minh university of technology': 'Ho Chi Minh City University of Technology',
    'city university of technology': 'Ho Chi Minh City University of Technology',
    'vietnam national university': 'Vietnam National University, Hanoi',
    'the university of texas at austin': 'University of Texas at Austin',
}

BAD_PATTERNS = [
    'guest lecture', 'course', 'is an associate', 'is an assistant', 'is a professor',
    'joined', 'curriculum vitae', 'resume', 'dr.', 'prof.', 'department of',
    'faculty of', 'university of\b', '^university of$'
]

def clean_inst_name(name):
    if not name:
        return None
    name = name.strip(' ,.;:')
    if len(name) < 5 or len(name) > 80:
        return None
    low = name.lower()
    
    if low in CANONICAL_MAP:
        return CANONICAL_MAP[low]
        
    for bad in BAD_PATTERNS:
        if re.search(r'\b' + re.escape(bad) + r'\b', low) or bad in low:
            return None
            
    if not any(k in low for k in ['university', 'institute', 'college', 'école', 'polytechnic', 'school of medicine']):
        return None
        
    # Strip field prefixes like "Electrical Engineering, "
    name = re.sub(r'^[A-Za-z\s&,/\-]+?,\s*(University\s+of\s+[A-Za-z\s,\-]+|[A-Za-z\s,\-]+?\s+(?:University|College|Institute|Polytechnic|École))', r'\1', name)
    name = re.sub(r',\s*(?:Vietnam|Canada|USA|US|South Korea|Japan|Australia|France|Germany|UK|Singapore|China).*$', '', name, flags=re.IGNORECASE)
    name = name.strip(' ,.;:')
    
    if name.lower() in CANONICAL_MAP:
        return CANONICAL_MAP[name.lower()]
        
    if len(name) < 5 or name.lower() == 'university of':
        return None
        
    return name

def main():
    with open('public/data.json') as f:
        roster = json.load(f)
    roster_by_id = {p['id']: p for p in roster}
    
    with open('scratch/parsed_proposals.json') as f:
        parsed = json.load(f)
        
    with open('maintenance/verification.json') as f:
        verification = json.load(f)
        
    edu_props = parsed.get('education', {})
    honors_props = parsed.get('honors', {})
    
    now_iso = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
    
    applied_edu = 0
    applied_honors = 0
    
    for pid, upds in edu_props.items():
        person = roster_by_id.get(pid)
        if not person:
            continue
        direct_fields = set(person.get('directFields', []))
        
        cleaned_upds = {}
        for k in ['undergradInstitution', 'msInstitution', 'phdInstitution']:
            if k in upds and k not in direct_fields and not person.get(k):
                clean_name = clean_inst_name(upds[k])
                if clean_name:
                    cleaned_upds[k] = clean_name
                    
        for k in ['undergradYear', 'msYear', 'phdYear']:
            if k in upds and k not in direct_fields and not person.get(k):
                yr = upds[k]
                if isinstance(yr, int) and 1960 <= yr <= 2026:
                    cleaned_upds[k] = yr
                    
        # Check chronology
        ug_yr = cleaned_upds.get('undergradYear') or person.get('undergradYear')
        ms_yr = cleaned_upds.get('msYear') or person.get('msYear')
        phd_yr = cleaned_upds.get('phdYear') or person.get('phdYear')
        
        if ug_yr and phd_yr and ug_yr > phd_yr:
            cleaned_upds.pop('undergradYear', None)
            cleaned_upds.pop('phdYear', None)
        if ms_yr and phd_yr and ms_yr > phd_yr:
            cleaned_upds.pop('msYear', None)
            cleaned_upds.pop('phdYear', None)
        if ug_yr and ms_yr and ug_yr > ms_yr:
            cleaned_upds.pop('undergradYear', None)
            cleaned_upds.pop('msYear', None)
            
        if cleaned_upds:
            for k, v in cleaned_upds.items():
                person[k] = v
            verification[person['name']] = now_iso
            applied_edu += 1
            print(f'[EDU] Applied to {person["name"]} ({person["id"]}): {cleaned_upds}')

    for pid, honors in honors_props.items():
        person = roster_by_id.get(pid)
        if not person:
            continue
        existing_honors = person.get('honors', [])
        existing_titles = {h.get('title', '').strip().lower() for h in existing_honors}
        
        added = []
        for h in honors:
            title = h.get('title', '').strip()
            if title.lower() not in existing_titles:
                # Set appropriate source link
                h['source'] = person.get('websiteUrl') or person.get('profileUrl')
                existing_honors.append(h)
                existing_titles.add(title.lower())
                added.append(title)
                
        if added:
            person['honors'] = existing_honors
            verification[person['name']] = now_iso
            applied_honors += 1
            print(f'[HONORS] Applied to {person["name"]} ({person["id"]}): {added}')
            
    print(f'\nTotal education profiles updated: {applied_edu}')
    print(f'Total honors profiles updated: {applied_honors}')
    
    with open('public/data.json', 'w') as f:
        json.dump(roster, f, indent=2, ensure_ascii=False)
        
    with open('maintenance/verification.json', 'w') as f:
        json.dump(verification, f, indent=2, ensure_ascii=False)
        
    print('Saved updated data.json and verification.json.')

if __name__ == '__main__':
    main()
