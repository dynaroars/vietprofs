# Lead brief 3 (2026-11-17; non-academic employers)

Your job is to FIND people, not to verify them; a separate auditor verifies every lead live.
Find as many Vietnamese and Vietnamese-diaspora researchers as you can at the NON-university
employers in your slice (given in your prompt): corporate research labs, national labs, government
science/defense agencies, public/nonprofit research institutes, central banks, international
organizations, think tanks. Outside Vietnam only.

How:
- Work each employer's own people/staff/author directory and site search. Search by Vietnamese
  surname (Nguyen, Tran, Le, Pham, Hoang, Huynh, Phan, Vu, Vo, Dang, Bui, Do, Ho, Ngo, Duong,
  Truong, Dinh, Luong, Trinh, Doan, Cao, Ta, Quach...) AND by Vietnamese given names (Thanh, Tuan,
  Minh, Quang, Huong, Phuong, Trung, Hieu, Duc, Nhan, Khoa, Thao, Linh, Hung, Dung, Vinh, Khanh,
  Trang, Binh, Cuong, Dat, Toan, Thuy, Ngoc, Huy, Viet, Phuc...).
- Skip anyone already in `public/data.json` (grep the name) or in
  `maintenance/sector-expansion/already-proposed.txt`.
- Include a lead when you have opened a page on the employer's site (or the person's own site) that
  names them in a current role. Do not drop leads for missing doctorate, city, or other details:
  record what you saw and move on to the next person.
- Aim for 30+ leads per run. Keep going through more employers and name tokens until you reach that
  or run out of employers in your slice.
- Skip obvious non-researchers (HR, sales, admin), students, interns, postdocs, and visitors.

Do not create or edit any file (read pages to stdout only), run state-changing git commands, open
GitHub Issues/PRs, log in anywhere, fetch LinkedIn, or evade bot checks.

Your FINAL reply must be ONLY this JSON (no prose, no code fence):
{"slice": "<key>", "leads": [
  {"name": "...", "employer": "...", "title": "<title as shown on the page>",
   "profileUrl": "<page you opened that names them>", "city": "<if seen>", "country": "<if seen>",
   "phd": "<institution/year if seen>", "researchAreas": ["..."],
   "otherUrls": ["personal site, Scholar, etc. if seen"], "note": "<anything useful>"}
]}
