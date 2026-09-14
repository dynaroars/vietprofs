#!/usr/bin/env python3
"""
Deep Roster Scout & Education Extractor for VietProfs
Scans all faculty profile and website URLs to harvest complete educational credentials.
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

CANONICAL_VN_INSTITUTIONS = {
    'hust': 'Hanoi University of Science and Technology',
    'hanoi university of science and technology': 'Hanoi University of Science and Technology',
    'bach khoa': 'Hanoi University of Science and Technology',
    'hanoi university of technology': 'Hanoi University of Science and Technology',
    'hanoi university of science': 'VNU University of Science',
    'vnu university of science': 'VNU University of Science',
    'vietnam national university, hanoi': 'Vietnam National University, Hanoi',
    'vnu hanoi': 'Vietnam National University, Hanoi',
    'vnu-hn': 'Vietnam National University, Hanoi',
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
    'ho chi minh city university of education': 'Ho Chi Minh City University of Education',
    'hcm city university of education': 'Ho Chi Minh City University of Education',
    'hanoi national university of education': 'Hanoi National University of Education',
    'vietnamese-german university': 'Vietnamese-German University'
}

def clean_institution(name: str) -> str:
    name = re.sub(r'^(at|from|the)\s+', '', name.strip().rstrip('.,;:'), flags=re.IGNORECASE).strip()
    low = name.lower()
    
    for k, v in CANONICAL_VN_INSTITUTIONS.items():
        if k in low:
            return v
            
    if 'stanford' in low:
        return 'Stanford University'
    if 'harvard' in low:
        return 'Harvard University'
    if 'mit' == low or 'massachusetts institute of technology' in low:
        return 'Massachusetts Institute of Technology'
    if 'caltech' == low or 'california institute of technology' in low:
        return 'California Institute of Technology'
    if 'princeton' in low:
        return 'Princeton University'
    if 'yale' in low:
        return 'Yale University'
    if 'columbia university' in low:
        return 'Columbia University'
    if 'cornell' in low:
        return 'Cornell University'
    if 'upenn' in low or 'university of pennsylvania' in low:
        return 'University of Pennsylvania'
    if 'brown university' in low:
        return 'Brown University'
    if 'dartmouth' in low:
        return 'Dartmouth College'
    if 'uc berkeley' in low or 'berkeley' in low:
        return 'University of California, Berkeley'
    if 'ucla' in low or 'university of california, los angeles' in low:
        return 'University of California, Los Angeles'
    if 'uc san diego' in low or 'ucsd' in low:
        return 'University of California, San Diego'
    if 'uc santa barbara' in low or 'ucsb' in low:
        return 'University of California, Santa Barbara'
    if 'uc irvine' in low or 'uci' in low:
        return 'University of California, Irvine'
    if 'uc davis' in low or 'ucd' in low:
        return 'University of California, Davis'
    if 'uc riverside' in low:
        return 'University of California, Riverside'
    if 'uc santa cruz' in low:
        return 'University of California, Santa Cruz'
    if 'uc san francisco' in low or 'ucsf' in low:
        return 'University of California, San Francisco'
    if 'carnegie mellon' in low or 'cmu' == low:
        return 'Carnegie Mellon University'
    if 'johns hopkins' in low or 'jhu' == low:
        return 'Johns Hopkins University'
    if 'northwestern' in low:
        return 'Northwestern University'
    if 'university of chicago' in low or 'uchicago' in low:
        return 'University of Chicago'
    if 'university of michigan' in low:
        return 'University of Michigan'
    if 'georgia tech' in low or 'georgia institute of technology' in low:
        return 'Georgia Institute of Technology'
    if 'uiuc' in low or 'illinois at urbana' in low:
        return 'University of Illinois Urbana-Champaign'
    if 'university of washington' in low:
        return 'University of Washington'
    if 'university of texas at austin' in low or 'ut austin' in low:
        return 'The University of Texas at Austin'
    if 'university of wisconsin' in low and ('madison' in low or 'uw' in low):
        return 'University of Wisconsin-Madison'
    if 'purdue' in low:
        return 'Purdue University'
    if 'penn state' in low or 'pennsylvania state university' in low:
        return 'Pennsylvania State University'
    if 'ohio state' in low:
        return 'The Ohio State University'
    if 'indiana university' in low:
        return 'Indiana University Bloomington'
    if 'university of maryland' in low:
        return 'University of Maryland, College Park'
    if 'university of minnesota' in low:
        return 'University of Minnesota, Twin Cities'
    if 'university of virginia' in low:
        return 'University of Virginia'
    if 'university of north carolina' in low and 'chapel hill' in low:
        return 'University of North Carolina at Chapel Hill'
    if 'duke' in low:
        return 'Duke University'
    if 'rice university' in low:
        return 'Rice University'
    if 'vanderbilt' in low:
        return 'Vanderbilt University'
    if 'university of notre dame' in low or 'notre dame' in low:
        return 'University of Notre Dame'
    if 'georgetown' in low:
        return 'Georgetown University'
    if 'emory' in low:
        return 'Emory University'
    if 'rutgers' in low:
        return 'Rutgers University'
    if 'texas a&m' in low:
        return 'Texas A&M University'
    if 'university of florida' in low:
        return 'University of Florida'
    if 'university of pittsburgh' in low:
        return 'University of Pittsburgh'
    if 'university of colorado' in low and 'boulder' in low:
        return 'University of Colorado Boulder'
    if 'university of arizona' in low:
        return 'University of Arizona'
    if 'arizona state' in low:
        return 'Arizona State University'
    if 'university of utah' in low:
        return 'University of Utah'
    if 'michigan state' in low:
        return 'Michigan State University'
    if 'virginia tech' in low:
        return 'Virginia Tech'
    if 'massachusetts amherst' in low or 'umass amherst' in low:
        return 'University of Massachusetts Amherst'
    if 'new york university' in low or 'nyu' == low:
        return 'New York University'
    if 'boston university' in low:
        return 'Boston University'
    if 'northeastern university' in low:
        return 'Northeastern University'
    if 'university of southern california' in low or 'usc' == low:
        return 'University of Southern California'
    if 'university of oxford' in low or 'oxford' in low:
        return 'University of Oxford'
    if 'university of cambridge' in low or 'cambridge' in low:
        return 'University of Cambridge'
    if 'imperial college' in low:
        return 'Imperial College London'
    if 'university college london' in low or 'ucl' == low:
        return 'University College London'
    if 'university of toronto' in low:
        return 'University of Toronto'
    if 'mcgill' in low:
        return 'McGill University'
    if 'university of british columbia' in low or 'ubc' in low:
        return 'University of British Columbia'
    if 'university of waterloo' in low:
        return 'University of Waterloo'
    if 'national university of singapore' in low or 'nus' == low:
        return 'National University of Singapore'
    if 'nanyang technological' in low or 'ntu' == low:
        return 'Nanyang Technological University'
    if 'university of melbourne' in low:
        return 'University of Melbourne'
    if 'university of sydney' in low:
        return 'University of Sydney'
    if 'unsw' in low or 'new south wales' in low:
        return 'University of New South Wales'
    if 'australian national university' in low or 'anu' == low:
        return 'Australian National University'
    if 'monash' in low:
        return 'Monash University'
    if 'university of queensland' in low:
        return 'The University of Queensland'
    if 'eth zurich' in low or 'eth zürich' in low:
        return 'ETH Zurich'
    if 'epfl' in low or 'lausanne' in low:
        return 'École Polytechnique Fédérale de Lausanne'
    if 'tokyo' in low and 'university' in low:
        return 'The University of Tokyo'
    if 'kyoto' in low and 'university' in low:
        return 'Kyoto University'
    if 'kaist' in low:
        return 'KAIST'
    if 'seoul national university' in low:
        return 'Seoul National University'
    if 'ecole polytechnique' in low or 'école polytechnique' in low:
        return 'École Polytechnique'
    if 'sorbonne' in low:
        return 'Sorbonne Université'
    if 'paris-saclay' in low or 'paris sud' in low:
        return 'Université Paris-Saclay'
    if 'ku leuven' in low:
        return 'KU Leuven'
    if 'lomonosov' in low or 'moscow state' in low:
        return 'Lomonosov Moscow State University'
    if 'budapest university of technology and economics' in low:
        return 'Budapest University of Technology and Economics'
        
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

def crawl_person(p):
    pid = p['id']
    urls = []
    if p.get('websiteUrl'):
        urls.append(p['websiteUrl'])
    if p.get('profileUrl') and not p['profileUrl'].endswith('.pdf'):
        urls.append(p['profileUrl'])
        
    texts = []
    cv_urls = []
    
    for u in urls:
        try:
            data = fetch_url(u, timeout=7)
            if u.lower().endswith('.pdf') or b'%PDF' in data[:10]:
                ptxt = extract_pdf(data)
                texts.append(ptxt)
                continue
                
            soup = BeautifulSoup(data, 'html.parser')
            for tag in soup(['script', 'style', 'nav']):
                tag.decompose()
            texts.append(soup.get_text(separator='\n', strip=True))
            
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
                texts.append(ptxt)
            else:
                csoup = BeautifulSoup(cdata, 'html.parser')
                for tag in csoup(['script', 'style', 'nav']):
                    tag.decompose()
                texts.append(csoup.get_text(separator='\n', strip=True))
        except Exception:
            pass
            
    return pid, '\n\n'.join(texts)

def main():
    start = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    cnt = int(sys.argv[2]) if len(sys.argv) > 2 else 100
    
    with open('public/data.json') as f:
        roster = json.load(f)
        
    batch = roster[start:start + cnt]
    print(f'Crawling batch of {len(batch)} faculty profiles (indices {start} to {start + len(batch)})...')
    
    results = {}
    with ThreadPoolExecutor(max_workers=24) as executor:
        futures = {executor.submit(crawl_person, p): p for p in batch}
        for fut in as_completed(futures):
            pid, txt = fut.result()
            if len(txt) > 50:
                results[pid] = txt
                
    print(f'Successfully harvested text for {len(results)}/{len(batch)} profiles.')
    
    # Save crawl batch to scratch cache
    os.makedirs('scratch', exist_ok=True)
    with open(f'scratch/crawl_batch_{start}_{cnt}.json', 'w') as f:
        json.dump(results, f)
    print(f'Saved to scratch/crawl_batch_{start}_{cnt}.json')

if __name__ == '__main__':
    main()
