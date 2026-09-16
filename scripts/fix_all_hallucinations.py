import json
import re

with open("public/data.json", "r", encoding="utf-8") as f:
    roster = json.load(f)

html_entity_map = {
    "&amp;": "&",
    "&#039;": "'",
    "&quot;": '"',
    "&nbsp;": " ",
    "&times;": "×",
    "&lt;": "<",
    "&gt;": ">",
}

def clean_html_entities(text: str) -> str:
    if not isinstance(text, str):
        return text
    for entity, char in html_entity_map.items():
        text = text.replace(entity, char)
    return text

def canonicalize_scholar_url(url: str) -> str:
    if not url:
        return url
    match = re.search(r"user=([a-zA-Z0-9_-]+)", url)
    if match:
        return f"https://scholar.google.com/citations?user={match.group(1)}"
    return url

def canonicalize_linkedin_url(url: str) -> str:
    if not url:
        return url
    url = url.strip()
    match = re.search(r"linkedin\.com/in/([a-zA-Z0-9_-]+)", url)
    if match:
        slug = match.group(1)
        if len(slug) < 5 or slug in ["th", "nguy"]:
            return ""
        return f"https://www.linkedin.com/in/{slug}/"
    return url

bad_overview_patterns = [
    r"pardon our interruption",
    r"6\.1\.e\)",
    r"__secure-",
    r"students postdoctoral researchers faculty alumni america's fourth-largest city",
    r"pathology \| mass general brigham false pathology",
    r"memorial sloan kettering cancer center was founded in 1884",
    r"research programs division researchers amass more than \$65 million",
    r"victoria tran is a marine biologist",
    r"fmnd 2026: a first academic conference experience",
    r"at the 10th international workshop on financial markets",
    r"knowledge scaffolding recommendation system for supervising term papers",
]

fixed_count = 0

for person in roster:
    pid = person.get("id")

    # Specific fixes
    if pid == "vp-0191":
        person["undergradInstitution"] = "Temple University"
        if "undergradYear" in person:
            del person["undergradYear"]
        fixed_count += 1

    elif pid == "vp-0194":
        person["phdYear"] = 2013
        fixed_count += 1

    elif pid == "vp-0063":
        if "scholarUrl" in person:
            del person["scholarUrl"]
            fixed_count += 1

    elif pid == "vp-0293":
        person["undergradInstitution"] = "Ho Chi Minh City University of Technology"
        fixed_count += 1

    elif pid == "vp-0521":
        # Tien Zung Nguyen (fix Scholar profileUrl to official IMT URL)
        person["profileUrl"] = "https://www.math.univ-toulouse.fr/~tienzung/"
        person["scholarUrl"] = "https://scholar.google.com/citations?user=r5wQzjYAAAAJ"
        fixed_count += 1

    elif pid == "vp-0667":
        person["profileUrl"] = "https://personal.ntu.edu.sg/phantuan/"
        person["websiteUrl"] = "https://ntufusion.github.io/"
        fixed_count += 1

    elif pid == "vp-1068":
        if "undergradYear" in person:
            del person["undergradYear"]
            fixed_count += 1

    elif pid == "vp-1536":
        # Binh Chi Bui (fix Scholar profileUrl to official UTEP URL)
        person["profileUrl"] = "https://hb2504.utep.edu/Home/Profile?username=bbui"
        if "websiteUrl" in person:
            del person["websiteUrl"]
        fixed_count += 1

    # Clean HTML entities
    string_fields = [
        "name", "vietnameseName", "department", "rank", "university",
        "city", "state", "country", "phdInstitution", "undergradInstitution",
        "msInstitution", "postdocInstitution"
    ]
    for field in string_fields:
        if field in person and isinstance(person[field], str):
            cleaned = clean_html_entities(person[field])
            if cleaned != person[field]:
                person[field] = cleaned
                fixed_count += 1

    # Canonicalize URLs
    if "scholarUrl" in person and person["scholarUrl"]:
        canon = canonicalize_scholar_url(person["scholarUrl"])
        if canon != person["scholarUrl"]:
            person["scholarUrl"] = canon
            fixed_count += 1

    if "linkedinUrl" in person and person["linkedinUrl"]:
        canon = canonicalize_linkedin_url(person["linkedinUrl"])
        if not canon:
            del person["linkedinUrl"]
            fixed_count += 1
        elif canon != person["linkedinUrl"]:
            person["linkedinUrl"] = canon
            fixed_count += 1

    # Overviews
    if "researchOverview" in person and person["researchOverview"] and "text" in person["researchOverview"]:
        overview_text = clean_html_entities(person["researchOverview"]["text"])
        lower_overview = overview_text.lower()

        is_bad = any(re.search(pat, lower_overview) for pat in bad_overview_patterns)
        if is_bad:
            del person["researchOverview"]
            fixed_count += 1
        else:
            if pid == "vp-0458":
                overview_text = "Minh X. Nguyen completed a residency in nuclear medicine at Emory University School of Medicine and a diagnostic radiology residency and cardiovascular imaging fellowship at the University of Florida College of Medicine – Jacksonville."
            elif pid == "vp-0465":
                overview_text = "Lahn Nguyen is a complex and palliative care pediatrician. Nguyen completed a pediatric residency in Brooklyn, NY at Coney Island Hospital, SUNY Downstate Medical Center, and Kings County Hospital in 2019, followed by a Pediatric Hospice and Palliative Care Fellowship at UTHSCSA in 2020."
            elif pid == "vp-0609":
                overview_text = "Tuan T. Nguyen is an Associate Professor of Computer Science at the University of Greenwich. Research focuses on artificial intelligence, software systems, and data science, following doctoral work at the University of Nottingham."
            elif pid == "vp-0991":
                overview_text = "Gia Minh Thao Nguyen is an Associate Professor at Shimane University investigating power electronics, electric motor drives, and renewable energy systems, following doctoral studies and postdoctoral research at Waseda University and Toyota Technological Institute."
            elif pid == "vp-1068":
                overview_text = "Trung Bao Hoang is an Associate Professor of Accounting & Finance at the University of Greenwich and member of the PEGFA Centre, researching corporate governance, banking, syndicated lending, and ESG climate finance."
            elif pid == "vp-1210":
                overview_text = overview_text[:497] + "..." if len(overview_text) > 500 else overview_text

            if overview_text != person["researchOverview"]["text"]:
                person["researchOverview"]["text"] = overview_text
                fixed_count += 1

print(f"Applied fixes to roster dataset.")

with open("public/data.json", "w", encoding="utf-8") as f:
    json.dump(roster, f, indent=2, ensure_ascii=False)
    f.write("\n")
