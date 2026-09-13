#!/usr/bin/env python3
"""
High-Throughput Concurrent Education & CV Scout for VietProfs
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
from concurrent.futures import ThreadPoolExecutor, as_completed
from bs4 import BeautifulSoup

def clean_institution(name: str) -> str:
    name = name.strip().rstrip('.,;:')
    low = name.lower()
    if 'hanoi university of science and technology' in low or 'hust' in low or 'bach khoa' in low:
        return 'Hanoi University of Science and Technology'
    if 'university of science' in low and ('ho chi minh' in low or 'hcm' in low or 'vnu' in low):
        return 'University of Science, Vietnam National University Ho Chi Minh City'
    if 'vietnam national university, hanoi' in low or 'vnu hanoi' in low or 'vnu-hn' in low or 'vnu university of science' in low:
        return 'Vietnam National University, Hanoi'
    if 'ho chi minh city university of technology' in low or 'hcmut' in low:
        return 'Ho Chi Minh City University of Technology'
    if 'national economics university' in low or 'neu' == low:
        return 'National Economics University'
    if 'foreign trade university' in low or 'ftu' == low:
        return 'Foreign Trade University'
    if 'stanford' in low:
        return 'Stanford University'
    if 'harvard' in low:
        return 'Harvard University'
    if 'mit' == low or 'massachusetts institute of technology' in low:
        return 'Massachusetts Institute of Technology'
    if 'berkeley' in low:
        return 'University of California, Berkeley'
    if 'cornell' in low:
        return 'Cornell University'
    if 'columbia university' in low:
        return 'Columbia University'
    if 'princeton' in low:
        return 'Princeton University'
    if 'yale' in low:
        return 'Yale University'
    if 'ucla' in low:
        return 'University of California, Los Angeles'
    if 'ucsd' in low:
        return 'University of California, San Diego'
    if 'uiuc' in low or 'illinois at urbana' in low:
        return 'University of Illinois Urbana-Champaign'
    if 'purdue' in low:
        return 'Purdue University'
    if 'umass amherst' in low or 'massachusetts amherst' in low:
        return 'University of Massachusetts Amherst'
    if 'university of michigan' in low:
        return 'University of Michigan'
    if 'university of minnesota' in low:
        return 'University of Minnesota, Twin Cities'
    if 'university of washington' in low:
        return 'University of Washington'
    if 'university of wisconsin' in low:
        return 'University of Wisconsin-Madison'
    if 'national university of singapore' in low or 'nus' == low:
        return 'National University of Singapore'
    if 'nanyang technological' in low or 'ntu' == low:
        return 'Nanyang Technological University'
    if 'kaist' in low:
        return 'KAIST'
    if 'lomonosov' in low or 'moscow state' in low:
        return 'Lomonosov Moscow State University'
    return name

def fetch_url(url: str, timeout: int = 8) -> bytes:
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
        res = subprocess.run(['pdftotext', '-layout', path, '-'], capture_output=True, text=True, timeout=8)
        return res.stdout
    except Exception:
        return ''
    finally:
        if os.path.exists(path):
            os.remove(path)

def process_person(p):
    pid = p['id']
    name = p['name']
    urls = []
    if p.get('websiteUrl'):
        urls.append(p['websiteUrl'])
    if p.get('profileUrl') and not p['profileUrl'].endswith('.pdf'):
        urls.append(p['profileUrl'])

    collected_text = []
    cv_urls = []

    for u in urls:
        try:
            data = fetch_url(u, timeout=7)
            if u.lower().endswith('.pdf') or b'%PDF' in data[:10]:
                ptxt = extract_pdf(data)
                collected_text.append(ptxt)
                continue

            soup = BeautifulSoup(data, 'html.parser')
            for tag in soup(['script', 'style', 'nav']):
                tag.decompose()
            collected_text.append(soup.get_text(separator='\n', strip=True))

            for a in soup.find_all('a'):
                h = a.get('href', '')
                t = a.get_text().strip().lower()
                if not h or h.startswith('mailto:') or h.startswith('javascript:'):
                    continue
                if ('cv' in h.lower() or 'resume' in h.lower() or 'vitae' in h.lower() or 'cv' in t):
                    full_cv = urllib.parse.urljoin(u, h)
                    if full_cv not in cv_urls:
                        cv_urls.append(full_cv)
        except Exception:
            pass

    for cu in cv_urls[:2]:
        try:
            cdata = fetch_url(cu, timeout=8)
            if cu.lower().endswith('.pdf') or b'%PDF' in cdata[:10]:
                ptxt = extract_pdf(cdata)
                collected_text.append(ptxt)
            else:
                csoup = BeautifulSoup(cdata, 'html.parser')
                for tag in csoup(['script', 'style', 'nav']):
                    tag.decompose()
                collected_text.append(csoup.get_text(separator='\n', strip=True))
        except Exception:
            pass

    full_text = '\n\n'.join(collected_text)
    if len(full_text) < 50:
        return None

    # Analyze text for degrees and honors
    hits = []
    lines = full_text.splitlines()
    for i, l in enumerate(lines):
        ls = l.strip()
        if any(w in ls.lower() for w in ['education', 'degree', 'b.s', 'b.a', 'bachelor', 'btech', 'ph.d', 'phd', 'doctorate', 'm.s', 'm.a', 'master', 'sloan', 'nsf career', 'ieee fellow', 'acm fellow']):
            snip = ' | '.join([lines[j].strip() for j in range(max(0, i-1), min(len(lines), i+3)) if lines[j].strip()])
            if len(snip) > 10:
                hits.append(snip[:200])

    if hits:
        return {'id': pid, 'name': name, 'university': p.get('university'), 'hits': hits[:6]}
    return None

def main():
    start = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    cnt = int(sys.argv[2]) if len(sys.argv) > 2 else 100

    with open('public/data.json') as f:
        roster = json.load(f)

    candidates = [p for p in roster if (not p.get('undergradInstitution') or not p.get('phdYear'))]
    batch = candidates[start:start + cnt]
    print(f'Starting concurrent scan on {len(batch)} candidates (from {start} to {start + len(batch)})...')

    found_count = 0
    with ThreadPoolExecutor(max_workers=16) as executor:
        futures = {executor.submit(process_person, p): p for p in batch}
        for fut in as_completed(futures):
            res = fut.result()
            if res and res['hits']:
                found_count += 1
                print(f"=== [{res['id']}] {res['name']} ({res['university']}) ===")
                for h in res['hits']:
                    print(f"  * {h}")
                print('-'*40)

    print(f'Done scan. Found {found_count} matches with education signals.')

if __name__ == '__main__':
    main()
