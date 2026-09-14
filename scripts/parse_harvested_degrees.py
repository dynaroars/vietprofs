#!/usr/bin/env python3
"""
Fast, robust, and accurate education and honors parser.
Uses fast lowercase string search with known institutions.
"""

import glob
import json
import os
import re

def build_known_institutions():
    with open('scratch/known_institutions.json') as f:
        known = json.load(f)
    # Filter out generic short names
    filtered = [k for k in known if len(k) >= 6 and not any(bad in k.lower() for bad in ['is an', 'is a', 'at the rank of', 'joined', 'department', 'faculty of'])]
    # Sort by length descending for longest substring match first
    filtered.sort(key=lambda x: len(x), reverse=True)
    return [(k, k.lower()) for k in filtered]

def clean_extracted_inst(line, known_pairs):
    line_lower = line.lower()
    
    # Fast substring match against known institutions
    for k, k_lower in known_pairs:
        # Check that k_lower is in line_lower and bounded by non-alphanumeric or start/end
        idx = line_lower.find(k_lower)
        if idx != -1:
            # Check boundaries
            before_ok = (idx == 0) or not line_lower[idx - 1].isalnum()
            after_idx = idx + len(k_lower)
            after_ok = (after_idx >= len(line_lower)) or not line_lower[after_idx].isalnum()
            if before_ok and after_ok:
                return k
                
    # Generic cleanup fallback
    inst_match = re.search(r'((?:University\s+of\s+[A-Za-z\s,\-]+|[A-Za-z\s,\-]+?(?:University|College|Institute|Polytechnic|École)(?:\s+[A-Za-z\s,\-]+)?))', line)
    if inst_match:
        inst = inst_match.group(1).strip(' ,.;:')
        inst = re.sub(r',\s*(?:Vietnam|Canada|USA|US|South Korea|Japan|Australia|France|Germany|UK|Singapore|China).*$', '', inst, flags=re.IGNORECASE)
        inst = re.sub(r'^(?:at|from|in|the|a)\s+', '', inst, flags=re.IGNORECASE)
        inst = re.sub(r'^(?:M\.?S\.?|B\.?S\.?|Ph\.?D\.?|Bachelor|Master|Doctorate|Postdoc|Postdoctoral|Geomatic|Electrical|Computer|Intelligent|Kawakami|Internship|Associate|Assistant|Professor|Visiting|Research|Fellow|Lab|Laboratory)[^A-Z]*', '', inst, flags=re.IGNORECASE)
        inst = inst.strip(' ,.;:')
        if any(bad in inst.lower() for bad in ['is an', 'is a', 'at the rank of', 'joined', 'curriculum', 'vitae', 'resume', 'page', 'department']):
            return None
        if any(k in inst.lower() for k in ['university', 'institute', 'college', 'école', 'polytechnic']) and len(inst) >= 6:
            return inst
            
    return None

def extract_education_and_honors(text, person, known_pairs):
    updates = {}
    honors_to_add = []
    
    lines = [l.strip() for l in text.splitlines() if l.strip() and len(l.strip()) < 300]
    
    ug_keywords = ['b.s.', 'b.s', 'b.a.', 'b.a', 'b.sc.', 'b.sc', 'b.eng.', 'b.eng', 'b.tech', 'bachelor', 'undergraduate', 'b.e.']
    ms_keywords = ['m.s.', 'm.s', 'm.a.', 'm.a', 'm.sc.', 'm.sc', 'm.eng.', 'm.eng', 'master', 'm.phil']
    phd_keywords = ['ph.d.', 'ph.d', 'phd', 'doctorate', 'doctor of philosophy', 'd.phil', 'sc.d']
    
    existing_honor_titles = {h.get('title', '').lower() for h in person.get('honors', [])}
    
    for line in lines:
        l_lower = line.lower()
        
        # 1. Honors check
        if 'nsf career' not in str(existing_honor_titles) and 'career award' in l_lower and 'nsf' in l_lower:
            m_yr = re.search(r'\b(20[0-2]\d)\b', line)
            honors_to_add.append({
                "title": "NSF CAREER Award",
                "category": "career_award",
                "issuer": "National Science Foundation",
                "year": int(m_yr.group(1)) if m_yr else None,
                "source": person.get("websiteUrl") or person.get("profileUrl")
            })
            existing_honor_titles.add('nsf career award')
            
        if 'sloan' not in str(existing_honor_titles) and 'sloan' in l_lower and ('fellow' in l_lower or 'research' in l_lower):
            m_yr = re.search(r'\b(20[0-2]\d)\b', line)
            honors_to_add.append({
                "title": "Sloan Research Fellowship",
                "category": "career_award",
                "issuer": "Alfred P. Sloan Foundation",
                "year": int(m_yr.group(1)) if m_yr else None,
                "source": person.get("websiteUrl") or person.get("profileUrl")
            })
            existing_honor_titles.add('sloan research fellowship')
            
        if 'ieee fellow' not in str(existing_honor_titles) and 'ieee fellow' in l_lower:
            m_yr = re.search(r'\b(19\d\d|20[0-2]\d)\b', line)
            honors_to_add.append({
                "title": "IEEE Fellow",
                "category": "fellow",
                "issuer": "IEEE",
                "year": int(m_yr.group(1)) if m_yr else None,
                "source": person.get("websiteUrl") or person.get("profileUrl")
            })
            existing_honor_titles.add('ieee fellow')
            
        if 'acm fellow' not in str(existing_honor_titles) and 'acm fellow' in l_lower:
            m_yr = re.search(r'\b(19\d\d|20[0-2]\d)\b', line)
            honors_to_add.append({
                "title": "ACM Fellow",
                "category": "fellow",
                "issuer": "Association for Computing Machinery",
                "year": int(m_yr.group(1)) if m_yr else None,
                "source": person.get("websiteUrl") or person.get("profileUrl")
            })
            existing_honor_titles.add('acm fellow')

        # 2. Undergrad Check
        if not person.get('undergradInstitution') and not updates.get('undergradInstitution'):
            if any(k in l_lower for k in ug_keywords) and not any(k in l_lower for k in phd_keywords):
                m_yr = re.search(r'\b(19\d\d|20[0-2]\d)\b', line)
                cleaned = clean_extracted_inst(line, known_pairs)
                if cleaned:
                    updates['undergradInstitution'] = cleaned
                    if m_yr:
                        updates['undergradYear'] = int(m_yr.group(1))

        # 3. MS Check
        if not person.get('msInstitution') and not updates.get('msInstitution'):
            if any(k in l_lower for k in ms_keywords) and not any(k in l_lower for k in phd_keywords) and not any(k in l_lower for k in ug_keywords):
                m_yr = re.search(r'\b(19\d\d|20[0-2]\d)\b', line)
                cleaned = clean_extracted_inst(line, known_pairs)
                if cleaned:
                    updates['msInstitution'] = cleaned
                    if m_yr:
                        updates['msYear'] = int(m_yr.group(1))

        # 4. PhD Check
        if (not person.get('phdInstitution') or not person.get('phdYear')) and not (updates.get('phdInstitution') and updates.get('phdYear')):
            if any(k in l_lower for k in phd_keywords) and not any(k in l_lower for k in ug_keywords):
                m_yr = re.search(r'\b(19\d\d|20[0-2]\d)\b', line)
                cleaned = clean_extracted_inst(line, known_pairs)
                if cleaned and not person.get('phdInstitution'):
                    updates['phdInstitution'] = cleaned
                if m_yr and not person.get('phdYear'):
                    updates['phdYear'] = int(m_yr.group(1))

    return updates, honors_to_add

def main():
    with open('public/data.json') as f:
        roster = json.load(f)
    roster_by_id = {p['id']: p for p in roster}
    
    known_pairs = build_known_institutions()
    
    crawl_files = sorted(glob.glob('scratch/crawl_batch_*.json'))
    print(f'Found {len(crawl_files)} crawl batch files: {crawl_files}')
    
    total_crawled = {}
    for cf in crawl_files:
        with open(cf) as f:
            data = json.load(f)
            total_crawled.update(data)
            
    print(f'Total crawled profiles available: {len(total_crawled)}')
    
    proposals = {}
    honors_proposals = {}
    
    for pid, txt in total_crawled.items():
        person = roster_by_id.get(pid)
        if not person:
            continue
        updates, honors = extract_education_and_honors(txt, person, known_pairs)
        
        # Validation on chronological years
        ug_yr = updates.get('undergradYear') or person.get('undergradYear')
        ms_yr = updates.get('msYear') or person.get('msYear')
        phd_yr = updates.get('phdYear') or person.get('phdYear')
        
        if ug_yr and phd_yr and ug_yr > phd_yr:
            if 'undergradYear' in updates:
                del updates['undergradYear']
            if 'phdYear' in updates:
                del updates['phdYear']
        if ms_yr and phd_yr and ms_yr > phd_yr:
            if 'msYear' in updates:
                del updates['msYear']
                
        # Direct fields check: never overwrite directFields
        direct_fields = set(person.get('directFields', []))
        for k in list(updates.keys()):
            if k in direct_fields:
                del updates[k]
                
        if updates:
            proposals[pid] = updates
        if honors:
            honors_proposals[pid] = honors
            
    print(f'\nFound education proposals for {len(proposals)} professors.')
    print(f'Found honors proposals for {len(honors_proposals)} professors.')
    
    with open('scratch/parsed_proposals.json', 'w') as f:
        json.dump({'education': proposals, 'honors': honors_proposals}, f, indent=2)
    print('Saved to scratch/parsed_proposals.json')

if __name__ == '__main__':
    main()
