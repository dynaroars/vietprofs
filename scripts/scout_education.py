#!/usr/bin/env python3
"""
Automated Education & CV Scout for VietProfs
Discovers and extracts undergraduate, master, doctoral, and postdoctoral credentials
as well as competitive honors from faculty websites and CVs.
"""

import json
import re
import os
import sys
import tempfile
import subprocess
import urllib.request
import urllib.parse
from bs4 import BeautifulSoup

CANONICAL_VN_INSTITUTIONS = {
    'hust': 'Hanoi University of Science and Technology',
    'hanoi university of science and technology': 'Hanoi University of Science and Technology',
    'bach khoa': 'Hanoi University of Science and Technology',
    'hanoi university of technology': 'Hanoi University of Science and Technology',
    'hanoi university of science': 'VNU University of Science',
    'vnu university of science': 'VNU University of Science',
    'vietnam national university, hanoi': 'Vietnam National University, Hanoi',
    'vnu hanoi': 'Vietnam National University, Hanoi',
    'vietnam national university hanoi': 'Vietnam National University, Hanoi',
    'vietnam national university - hanoi': 'Vietnam National University, Hanoi',
    'university of science, vnu': 'University of Science, Vietnam National University Ho Chi Minh City',
    'university of science, vietnam national university': 'University of Science, Vietnam National University Ho Chi Minh City',
    'university of science, vietnam national university ho chi minh city': 'University of Science, Vietnam National University Ho Chi Minh City',
    'university of science, vnu hcmc': 'University of Science, Vietnam National University Ho Chi Minh City',
    'university of science, vnu-hcm': 'University of Science, Vietnam National University Ho Chi Minh City',
    'university of science - vnu hcm': 'University of Science, Vietnam National University Ho Chi Minh City',
    'university of science, vnu-hcmc': 'University of Science, Vietnam National University Ho Chi Minh City',
    'ho chi minh city university of technology': 'Ho Chi Minh City University of Technology',
    'hcmut': 'Ho Chi Minh City University of Technology',
    'national economics university': 'National Economics University',
    'foreign trade university': 'Foreign Trade University',
    'diplomatic academy of vietnam': 'Diplomatic Academy of Vietnam',
    'hanoi medical university': 'Hanoi Medical University',
    'university of medicine and pharmacy, ho chi minh city': 'University of Medicine and Pharmacy at Ho Chi Minh City',
    'can tho university': 'Can Tho University',
    'hue university': 'Hue University',
    'danang university of science and technology': 'Danang University of Science and Technology',
    'university of danang': 'The University of Danang',
}

def clean_institution(name: str) -> str:
    name = name.strip().rstrip('.,;:')
    low = name.lower()
    for k, v in CANONICAL_VN_INSTITUTIONS.items():
        if k in low:
            return v
    # Common international cleanups
    name = re.sub(r'^at\s+', '', name, flags=re.IGNORECASE)
    name = re.sub(r'^the\s+', '', name, flags=re.IGNORECASE)
    if 'massachusetts institute of technology' in low or low == 'mit':
        return 'Massachusetts Institute of Technology'
    if 'stanford' in low:
        return 'Stanford University'
    if 'harvard' in low:
        return 'Harvard University'
    if 'princeton' in low:
        return 'Princeton University'
    if 'berkeley' in low or 'uc berkeley' in low:
        return 'University of California, Berkeley'
    if 'ucla' in low or 'uc los angeles' in low:
        return 'University of California, Los Angeles'
    if 'uc san diego' in low or 'ucsd' in low:
        return 'University of California, San Diego'
    if 'cornell' in low:
        return 'Cornell University'
    if 'columbia university' in low:
        return 'Columbia University'
    if 'yale' in low:
        return 'Yale University'
    if 'oxford' in low:
        return 'University of Oxford'
    if 'cambridge' in low:
        return 'University of Cambridge'
    if 'national university of singapore' in low or low == 'nus':
        return 'National University of Singapore'
    if 'nanyang technological university' in low or low == 'ntu':
        return 'Nanyang Technological University'
    if 'kaist' in low:
        return 'KAIST'
    if 'seoul national university' in low or low == 'snu':
        return 'Seoul National University'
    if 'tokyo' in low and 'university' in low:
        return 'The University of Tokyo'
    if 'ecole polytechnique' in low:
        return 'École Polytechnique'
    if 'epfl' in low or 'lausanne' in low:
        return 'École Polytechnique Fédérale de Lausanne'
    if 'eth zurich' in low or 'eth zürich' in low:
        return 'ETH Zurich'
    if 'toronto' in low and 'university' in low:
        return 'University of Toronto'
    if 'waterloo' in low and 'university' in low:
        return 'University of Waterloo'
    if 'mcgill' in low:
        return 'McGill University'
    if 'lomonosov' in low or 'moscow state university' in low:
        return 'Lomonosov Moscow State University'
    return name

def fetch_url(url: str, timeout: int = 10) -> bytes:
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf,*/*;q=0.8'
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()

def extract_pdf(data: bytes) -> str:
    with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as f:
        f.write(data)
        path = f.name
    try:
        res = subprocess.run(['pdftotext', '-layout', path, '-'], capture_output=True, text=True, timeout=10)
        return res.stdout
    except Exception:
        return ''
    finally:
        if os.path.exists(path):
            os.remove(path)

def parse_faculty_page(person):
    urls_to_try = []
    if person.get('websiteUrl'):
        urls_to_try.append(person['websiteUrl'])
    if person.get('profileUrl') and not person['profileUrl'].endswith('.pdf'):
        urls_to_try.append(person['profileUrl'])
    
    cv_urls = []
    page_texts = []
    
    for u in urls_to_try:
        try:
            data = fetch_url(u, timeout=8)
            if u.lower().endswith('.pdf') or b'%PDF' in data[:10]:
                txt = extract_pdf(data)
                page_texts.append(txt)
                continue
            
            soup = BeautifulSoup(data, 'html.parser')
            for tag in soup(['script', 'style', 'nav']):
                tag.decompose()
            text = soup.get_text(separator='\n', strip=True)
            page_texts.append(text)
            
            for a in soup.find_all('a'):
                h = a.get('href', '')
                t = a.get_text().strip().lower()
                if not h or h.startswith('mailto:') or h.startswith('javascript:'):
                    continue
                if any(w in h.lower() or w in t for w in ['cv', 'resume', 'vitae', 'curriculum']):
                    full_cv = urllib.parse.urljoin(u, h)
                    if full_cv not in cv_urls:
                        cv_urls.append(full_cv)
        except Exception:
            pass
            
    # Try fetching up to 2 discovered CV URLs
    for cu in cv_urls[:2]:
        try:
            cdata = fetch_url(cu, timeout=10)
            if cu.lower().endswith('.pdf') or b'%PDF' in cdata[:10]:
                ptxt = extract_pdf(cdata)
                if len(ptxt) > 100:
                    page_texts.append(ptxt)
            else:
                csoup = BeautifulSoup(cdata, 'html.parser')
                for tag in csoup(['script', 'style', 'nav']):
                    tag.decompose()
                page_texts.append(csoup.get_text(separator='\n', strip=True))
        except Exception:
            pass
            
    return '\n\n'.join(page_texts)

def scan_roster_batch(start_idx: int, count: int):
    with open('public/data.json') as f:
        roster = json.load(f)
        
    candidates = [p for p in roster if (not p.get('undergradInstitution') or not p.get('phdYear'))]
    batch = candidates[start_idx:start_idx + count]
    print(f'Scanning batch {start_idx} to {start_idx + len(batch)} of {len(candidates)} candidates...')
    
    results = {}
    for p in batch:
        pid = p['id']
        name = p['name']
        txt = parse_faculty_page(p)
        if len(txt) < 50:
            continue
            
        univ = p.get('university', '')
        print(f'=== [{pid}] {name} ({univ}) ===')
        # Look for undergraduate, graduate, honors in text
        lines = txt.splitlines()
        for i, l in enumerate(lines):
            l_str = l.strip()
            if any(k in l_str.lower() for k in ['education', 'degree', 'b.s', 'b.a', 'bachelor', 'btech', 'ph.d', 'phd', 'doctorate', 'm.s', 'm.a', 'master', 'postdoc']):
                snippet = ' | '.join([lines[j].strip() for j in range(max(0, i-1), min(len(lines), i+4)) if lines[j].strip()])
                if len(snippet) > 10:
                    print(f'  [Hit L{i}] {snippet[:200]}')
        print('-'*40)

if __name__ == '__main__':
    start = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    cnt = int(sys.argv[2]) if len(sys.argv) > 2 else 20
    scan_roster_batch(start, cnt)
