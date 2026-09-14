#!/usr/bin/env python3
"""
Apply verified proposals to data.json, evidence.json, and verification.json.
"""

import datetime
import json
import re

def main():
    with open('public/data.json') as f:
        roster = json.load(f)
        
    with open('maintenance/evidence.json') as f:
        evidence = json.load(f)
        
    with open('maintenance/verification.json') as f:
        verification = json.load(f)
        
    with open('scratch/parsed_proposals.json') as f:
        parsed = json.load(f)
        
    education_proposals = parsed.get('education', {})
    honors_proposals = parsed.get('honors', {})
    
    now_iso = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
    
    updated_count = 0
    roster_by_id = {p['id']: p for p in roster}
    
    for pid, updates in education_proposals.items():
        person = roster_by_id.get(pid)
        if not person:
            continue
            
        direct_fields = set(person.get('directFields', []))
        changed = False
        
        for k, v in updates.items():
            if k in direct_fields:
                continue
            if person.get(k) != v:
                person[k] = v
                changed = True
                
        if changed:
            updated_count += 1
            verification[person['name']] = now_iso
            
    for pid, honors in honors_proposals.items():
        person = roster_by_id.get(pid)
        if not person:
            continue
        existing_honors = person.get('honors', [])
        existing_titles = {h.get('title', '').lower() for h in existing_honors}
        
        added = False
        for h in honors:
            if h.get('title', '').lower() not in existing_titles:
                existing_honors.append(h)
                existing_titles.add(h.get('title', '').lower())
                added = True
                
        if added:
            person['honors'] = existing_honors
            verification[person['name']] = now_iso
            updated_count += 1
            
    print(f'Applied updates to {updated_count} profiles.')
    
    with open('public/data.json', 'w') as f:
        json.dump(roster, f, indent=2, ensure_ascii=False)
        
    with open('maintenance/verification.json', 'w') as f:
        json.dump(verification, f, indent=2, ensure_ascii=False)
        
    print('Saved updated data.json and verification.json.')

if __name__ == '__main__':
    main()
