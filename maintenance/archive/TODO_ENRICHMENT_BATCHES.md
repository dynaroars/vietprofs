# VietProfs Roster Enrichment Task List (30 Batches)

This document organizes the entire VietProfs roster (1,492 faculty) into **30 structured batches** for parallel subagent execution.

---

## Agent Instructions & Rules

Each assigned agent MUST follow these strict guidelines:

### 1. Scouting Personal & Lab Websites
- **`profileUrl`**: Official university faculty/department profile directory page.
- **`websiteUrl`**: Personal academic website or portfolio (e.g. `https://.../~username/`, `https://username.github.io/`, `https://sites.google.com/view/...`, personal domain).
- **`labUrl`**: Research group, laboratory, center, or project website (e.g. `https://roars.dev/`, `https://dong.chem.uci.edu/`, `https://fastmachinelearning.org/`).
- **Deduplication rule**: `profileUrl`, `websiteUrl`, and `labUrl` must all be unique and use HTTPS. If a scholar has only a lab page, set `labUrl`. If a scholar has only a personal page, set `websiteUrl`.

### 2. Deep Research & Interesting Facts (`researchOverview`)
- **Tone & Style**: Neutral, objective, third-person. **DO NOT** use gendered pronouns (*he/she/his/her/him/hers*).
- **Sentence & Length Limits**: Maximum **3 sentences** and maximum **500 characters** for `text`.
- **Embedded Markdown Links**: Include clickable markdown links `[Project Name](https://...)` to notable labs, systems, tools, open-source packages, books, concepts, or initiatives.
- **Sources & Timestamps**: Provide `sources` (array of valid HTTPS URLs) and `verifiedAt` (ISO 8601 string, e.g. `"2026-09-13T00:00:00.000Z"`).
- **Direct Updates**: If an entry has `directFields`, never overwrite or delete protected fields.

### 3. Verification & Safety Gate
After making updates to `public/data.json`, run:
```bash
npm test && npm run build && git diff --check
```

---

## Batch Index & Status

### Batch 01 (vp-0001 – vp-0050, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-0001` | [Hieu Bui](https://vietprofs.roars.dev/people/vp-0001.html) | The Catholic University of America | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0002` | [Tommy Dang](https://vietprofs.roars.dev/people/vp-0002.html) | Texas Tech University | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0003` | [Tri Dao](https://vietprofs.roars.dev/people/vp-0003.html) | Princeton University | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0004` | [Thang N. Dinh](https://vietprofs.roars.dev/people/vp-0004.html) | Virginia Commonwealth University | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0005` | [Minh N. Do](https://vietprofs.roars.dev/people/vp-0005.html) | University of Illinois Urbana-Champaign | Electrical and Computer Engineering | ✅ | ✅ | ✅ |
| `vp-0006` | [Tiffany D. Do](https://vietprofs.roars.dev/people/vp-0006.html) | Drexel University | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0007` | [AnHai Doan](https://vietprofs.roars.dev/people/vp-0007.html) | University of Wisconsin-Madison | Computer Sciences | ✅ | ✅ | ✅ |
| `vp-0008` | [Nghia Hoang](https://vietprofs.roars.dev/people/vp-0008.html) | Washington State University | School of Electrical Engineering and Computer Science | ✅ | ⏳ | ✅ |
| `vp-0009` | [Thang Hoang](https://vietprofs.roars.dev/people/vp-0009.html) | Virginia Tech | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0010` | [Viet Tung Hoang](https://vietprofs.roars.dev/people/vp-0010.html) | Florida State University | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0011` | [Dung T. Huynh](https://vietprofs.roars.dev/people/vp-0011.html) | University of Texas at Dallas | Computer Science | ⏳ | ⏳ | ✅ |
| `vp-0012` | [Truong-Son Hy](https://vietprofs.roars.dev/people/vp-0012.html) | University of Alabama at Birmingham | Computer Science | ✅ | ✅ | ✅ |
| `vp-0013` | [Hung Manh La](https://vietprofs.roars.dev/people/vp-0013.html) | University of Nevada, Reno | Computer Science and Engineering | ⏳ | ✅ | ✅ |
| `vp-0014` | [Hung Le - University of Massachusetts Amherst](https://vietprofs.roars.dev/people/vp-0014.html) | University of Massachusetts Amherst | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0015` | [Ngan Hoang Le](https://vietprofs.roars.dev/people/vp-0015.html) | University of Arkansas | Electrical Engineering and Computer Science | ✅ | ✅ | ✅ |
| `vp-0016` | [Thai Le](https://vietprofs.roars.dev/people/vp-0016.html) | Indiana University Bloomington | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0017` | [Tuan Le](https://vietprofs.roars.dev/people/vp-0017.html) | New Mexico State University | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0018` | [Khoa Luu](https://vietprofs.roars.dev/people/vp-0018.html) | University of Arkansas | Electrical Engineering and Computer Science | ✅ | ✅ | ✅ |
| `vp-0019` | [Truong Nghiem](https://vietprofs.roars.dev/people/vp-0019.html) | University of Central Florida | Electrical and Computer Engineering | ✅ | ✅ | ✅ |
| `vp-0020` | [Truong X. Tran](https://vietprofs.roars.dev/people/vp-0020.html) | Pennsylvania State University | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0021` | [Anh Totti Nguyen](https://vietprofs.roars.dev/people/vp-0021.html) | Auburn University | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0022` | [Clark T.-C. Nguyen](https://vietprofs.roars.dev/people/vp-0022.html) | University of California, Berkeley | Electrical Engineering and Computer Sciences | ✅ | ⏳ | ✅ |
| `vp-0023` | [Duong Nguyen - University of Wyoming](https://vietprofs.roars.dev/people/vp-0023.html) | University of Wyoming | Electrical Engineering and Computer Science | ✅ | ⏳ | ✅ |
| `vp-0024` | [Huy Le Nguyen](https://vietprofs.roars.dev/people/vp-0024.html) | Northeastern University | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0025` | [Khanh Nguyen](https://vietprofs.roars.dev/people/vp-0025.html) | Texas A&M University | Computer Science & Engineering | ✅ | ⏳ | ✅ |
| `vp-0026` | [Anh Nguyen - University of Montana](https://vietprofs.roars.dev/people/vp-0026.html) | University of Montana | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0027` | [Hoang Long Nguyen](https://vietprofs.roars.dev/people/vp-0027.html) | University of Louisville | Computer Science and Engineering | ✅ | ⏳ | ✅ |
| `vp-0028` | [Luan V. Nguyen](https://vietprofs.roars.dev/people/vp-0028.html) | University of Dayton | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0029` | [Nam Nguyen](https://vietprofs.roars.dev/people/vp-0029.html) | Towson University | Computer and Information Sciences | ⏳ | ⏳ | ✅ |
| `vp-0030` | [Tam V. Nguyen](https://vietprofs.roars.dev/people/vp-0030.html) | University of Dayton | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0031` | [Thanh Hong Nguyen](https://vietprofs.roars.dev/people/vp-0031.html) | University of Oregon | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0032` | [ThanhVu H. Nguyen](https://vietprofs.roars.dev/people/vp-0032.html) | George Mason University | Computer Science | ✅ | ✅ | ✅ |
| `vp-0033` | [Thien Huu Nguyen](https://vietprofs.roars.dev/people/vp-0033.html) | University of Oregon | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0034` | [Thinh Nguyen - Oregon State University](https://vietprofs.roars.dev/people/vp-0034.html) | Oregon State University | Electrical Engineering and Computer Science | ✅ | ⏳ | ✅ |
| `vp-0035` | [Thu Duc Nguyen](https://vietprofs.roars.dev/people/vp-0035.html) | Rutgers University | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0036` | [Tien Nguyen](https://vietprofs.roars.dev/people/vp-0036.html) | University of Texas at Dallas | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0037` | [Tin Nguyen - Auburn University](https://vietprofs.roars.dev/people/vp-0037.html) | Auburn University | Computer Science and Software Engineering | ⏳ | ✅ | ✅ |
| `vp-0038` | [Tu Nguyen - Kennesaw State University](https://vietprofs.roars.dev/people/vp-0038.html) | Kennesaw State University | Computer Science | ⏳ | ⏳ | ✅ |
| `vp-0039` | [VP (Phuc) Nguyen](https://vietprofs.roars.dev/people/vp-0039.html) | University of Massachusetts Amherst | Computer Science | ✅ | ✅ | ✅ |
| `vp-0040` | [XuanLong Nguyen](https://vietprofs.roars.dev/people/vp-0040.html) | University of Michigan | Statistics | ✅ | ⏳ | ✅ |
| `vp-0041` | [Linh Thi Xuan Phan](https://vietprofs.roars.dev/people/vp-0041.html) | University of Pennsylvania | Computer and Information Science | ✅ | ✅ | ✅ |
| `vp-0042` | [Vinhthuy Phan](https://vietprofs.roars.dev/people/vp-0042.html) | University of Memphis | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0043` | [Phu Phung](https://vietprofs.roars.dev/people/vp-0043.html) | University of Dayton | Computer Science | ✅ | ✅ | ✅ |
| `vp-0044` | [My Thai](https://vietprofs.roars.dev/people/vp-0044.html) | University of Florida | Computer Science | ✅ | ✅ | ✅ |
| `vp-0045` | [Duc (David) Tran](https://vietprofs.roars.dev/people/vp-0045.html) | University of Massachusetts Boston | Computer Science | ⏳ | ✅ | ✅ |
| `vp-0046` | [Dung H. Tran](https://vietprofs.roars.dev/people/vp-0046.html) | University of Florida | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0047` | [Son Tran](https://vietprofs.roars.dev/people/vp-0047.html) | New Mexico State University | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0048` | [Quoc Tran-Dinh](https://vietprofs.roars.dev/people/vp-0048.html) | University of North Carolina at Chapel Hill | Statistics and Operations Research | ✅ | ⏳ | ✅ |
| `vp-0049` | [Ni Trieu](https://vietprofs.roars.dev/people/vp-0049.html) | Arizona State University | School of Computing and Augmented Intelligence | ✅ | ⏳ | ✅ |
| `vp-0050` | [Huy T. Vo](https://vietprofs.roars.dev/people/vp-0050.html) | City College of New York (CUNY) | Computer Science | ✅ | ✅ | ✅ |

---

### Batch 02 (vp-0051 – vp-0100, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-0051` | [Mai Vu](https://vietprofs.roars.dev/people/vp-0051.html) | Tufts University | Electrical and Computer Engineering | ✅ | ✅ | ✅ |
| `vp-0052` | [Tam Vu](https://vietprofs.roars.dev/people/vp-0052.html) | Dartmouth College | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0053` | [Tu Vu](https://vietprofs.roars.dev/people/vp-0053.html) | Virginia Tech | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0054` | [Thuy-Duong Vuong](https://vietprofs.roars.dev/people/vp-0054.html) | University of California, San Diego | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0055` | [Tiep Huu Pham](https://vietprofs.roars.dev/people/vp-0055.html) | Rutgers University | Mathematics | ✅ | ⏳ | ✅ |
| `vp-0056` | [Thang Le](https://vietprofs.roars.dev/people/vp-0056.html) | Georgia Institute of Technology | Mathematics | ✅ | ⏳ | ✅ |
| `vp-0057` | [Phong H. Duong](https://vietprofs.roars.dev/people/vp-0057.html) | Columbia University | Mathematics | ✅ | ⏳ | ✅ |
| `vp-0058` | [Hung V. Tran](https://vietprofs.roars.dev/people/vp-0058.html) | University of Wisconsin-Madison | Mathematics | ✅ | ⏳ | ✅ |
| `vp-0059` | [Toan T. Nguyen](https://vietprofs.roars.dev/people/vp-0059.html) | Pennsylvania State University | Mathematics | ✅ | ⏳ | ✅ |
| `vp-0060` | [Khai T. Nguyen](https://vietprofs.roars.dev/people/vp-0060.html) | North Carolina State University | Mathematics | ✅ | ⏳ | ✅ |
| `vp-0061` | [Nam Q. Le](https://vietprofs.roars.dev/people/vp-0061.html) | Indiana University Bloomington | Mathematics | ✅ | ⏳ | ✅ |
| `vp-0062` | [Hoi H. Nguyen](https://vietprofs.roars.dev/people/vp-0062.html) | The Ohio State University | Mathematics | ✅ | ⏳ | ✅ |
| `vp-0063` | [Anh T. Tran](https://vietprofs.roars.dev/people/vp-0063.html) | University of Texas at Dallas | Mathematics | ⏳ | ✅ | ✅ |
| `vp-0064` | [Minh-Binh Tran](https://vietprofs.roars.dev/people/vp-0064.html) | Texas A&M University | Mathematics | ✅ | ⏳ | ✅ |
| `vp-0065` | [Anh-Khoa Vo](https://vietprofs.roars.dev/people/vp-0065.html) | Texas Tech University | Mathematics | ✅ | ⏳ | ✅ |
| `vp-0066` | [Bao Le Hung](https://vietprofs.roars.dev/people/vp-0066.html) | Northwestern University | Mathematics | ✅ | ⏳ | ✅ |
| `vp-0067` | [Hai-Dang Nguyen](https://vietprofs.roars.dev/people/vp-0067.html) | University of Alabama | Mathematics | ✅ | ⏳ | ✅ |
| `vp-0068` | [Huy Quang Nguyen](https://vietprofs.roars.dev/people/vp-0068.html) | University of Maryland, College Park | Mathematics | ✅ | ⏳ | ✅ |
| `vp-0069` | [Duc Duy Nguyen](https://vietprofs.roars.dev/people/vp-0069.html) | University of Tennessee, Knoxville | Mathematics | ⏳ | ✅ | ✅ |
| `vp-0070` | [Xuan Hien Nguyen](https://vietprofs.roars.dev/people/vp-0070.html) | Iowa State University | Mathematics | ⏳ | ⏳ | ✅ |
| `vp-0071` | [Nghiem V. Nguyen](https://vietprofs.roars.dev/people/vp-0071.html) | Utah State University | Mathematics | ✅ | ⏳ | ✅ |
| `vp-0072` | [Huy Tuan Pham](https://vietprofs.roars.dev/people/vp-0072.html) | California Institute of Technology | Mathematics | ✅ | ⏳ | ✅ |
| `vp-0073` | [Son Thanh Dam](https://vietprofs.roars.dev/people/vp-0073.html) | University of Chicago | Physics | ✅ | ⏳ | ✅ |
| `vp-0074` | [Dien Nguyen](https://vietprofs.roars.dev/people/vp-0074.html) | University of Tennessee, Knoxville | Physics | ✅ | ✅ | ✅ |
| `vp-0075` | [Duy Le](https://vietprofs.roars.dev/people/vp-0075.html) | University of Central Florida | Physics | ⏳ | ⏳ | ✅ |
| `vp-0076` | [Vinh Q. Nguyen - Virginia Tech](https://vietprofs.roars.dev/people/vp-0076.html) | Virginia Tech | Physics | ✅ | ⏳ | ✅ |
| `vp-0077` | [Tho Nguyen](https://vietprofs.roars.dev/people/vp-0077.html) | University of Georgia | Physics | ⏳ | ✅ | ✅ |
| `vp-0078` | [Kim-Anh Do](https://vietprofs.roars.dev/people/vp-0078.html) | The University of Texas MD Anderson Cancer Center | Biostatistics | ⏳ | ⏳ | ✅ |
| `vp-0079` | [Truong Q. Nguyen](https://vietprofs.roars.dev/people/vp-0079.html) | University of California, San Diego | Electrical and Computer Engineering | ✅ | ⏳ | ✅ |
| `vp-0080` | [Anh-Vu Pham](https://vietprofs.roars.dev/people/vp-0080.html) | University of California, Davis | Electrical and Computer Engineering | ✅ | ⏳ | ✅ |
| `vp-0081` | [Hien Van Nguyen](https://vietprofs.roars.dev/people/vp-0081.html) | University of Houston | Electrical and Computer Engineering | ✅ | ⏳ | ✅ |
| `vp-0082` | [Khai D. T. Ngo](https://vietprofs.roars.dev/people/vp-0082.html) | Virginia Tech | Electrical and Computer Engineering | ⏳ | ✅ | ✅ |
| `vp-0083` | [Trac D. Tran](https://vietprofs.roars.dev/people/vp-0083.html) | Johns Hopkins University | Electrical and Computer Engineering | ✅ | ⏳ | ✅ |
| `vp-0084` | [Vy M. Dong](https://vietprofs.roars.dev/people/vp-0084.html) | University of California, Irvine | Chemistry | ⏳ | ✅ | ✅ |
| `vp-0085` | [Thuc-Quyen Nguyen](https://vietprofs.roars.dev/people/vp-0085.html) | University of California, Santa Barbara | Chemistry and Biochemistry | ⏳ | ✅ | ✅ |
| `vp-0086` | [SonBinh T. Nguyen](https://vietprofs.roars.dev/people/vp-0086.html) | Northwestern University | Chemistry | ⏳ | ⏳ | ✅ |
| `vp-0087` | [Hien M. Nguyen](https://vietprofs.roars.dev/people/vp-0087.html) | Wayne State University | Chemistry | ⏳ | ✅ | ✅ |
| `vp-0088` | [Hung T. Nguyen](https://vietprofs.roars.dev/people/vp-0088.html) | University at Buffalo | Chemistry | ⏳ | ✅ | ✅ |
| `vp-0089` | [M. Tuan Trinh](https://vietprofs.roars.dev/people/vp-0089.html) | Utah State University | Chemistry and Biochemistry | ⏳ | ⏳ | ✅ |
| `vp-0090` | [Tuan Vo-Dinh](https://vietprofs.roars.dev/people/vp-0090.html) | Duke University | Biomedical Engineering | ✅ | ⏳ | ✅ |
| `vp-0091` | [Lena H. Nguyen](https://vietprofs.roars.dev/people/vp-0091.html) | University of Texas at Dallas | Neuroscience | ⏳ | ✅ | ✅ |
| `vp-0092` | [Tracy S. Tran](https://vietprofs.roars.dev/people/vp-0092.html) | Rutgers University-Newark | Biological Sciences | ⏳ | ⏳ | ✅ |
| `vp-0093` | [Tuan Minh Tran](https://vietprofs.roars.dev/people/vp-0093.html) | Kansas State University | Plant Pathology | ⏳ | ⏳ | ✅ |
| `vp-0094` | [Thuy Ngo](https://vietprofs.roars.dev/people/vp-0094.html) | Oregon Health & Science University | Molecular and Medical Genetics | ⏳ | ✅ | ✅ |
| `vp-0095` | [Huy Q. Dinh](https://vietprofs.roars.dev/people/vp-0095.html) | University of Wisconsin-Madison | Oncology | ⏳ | ⏳ | ✅ |
| `vp-0096` | [Trung Van Nguyen](https://vietprofs.roars.dev/people/vp-0096.html) | University of Kansas | Chemical & Petroleum Engineering | ⏳ | ✅ | ✅ |
| `vp-0097` | [Ngoc Bui - University of Oklahoma](https://vietprofs.roars.dev/people/vp-0097.html) | University of Oklahoma | School of Sustainable Chemical, Biological and Materials Engineering | ⏳ | ⏳ | ✅ |
| `vp-0098` | [Jonathan T. Pham](https://vietprofs.roars.dev/people/vp-0098.html) | University of Cincinnati | Chemical Engineering | ⏳ | ✅ | ✅ |
| `vp-0099` | [Thi Vo](https://vietprofs.roars.dev/people/vp-0099.html) | Johns Hopkins University | Chemical and Biomolecular Engineering | ⏳ | ✅ | ✅ |
| `vp-0100` | [Nhat Ho](https://vietprofs.roars.dev/people/vp-0100.html) | The University of Texas at Austin | Statistics and Data Sciences | ✅ | ⏳ | ✅ |

---

### Batch 03 (vp-0101 – vp-0150, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-0101` | [Kayla Nguyen](https://vietprofs.roars.dev/people/vp-0101.html) | University of Oregon | Physics | ⏳ | ✅ | ✅ |
| `vp-0102` | [James Huynh](https://vietprofs.roars.dev/people/vp-0102.html) | University of Michigan | Health Management and Policy | ✅ | ⏳ | ✅ |
| `vp-0103` | [Tru Cao](https://vietprofs.roars.dev/people/vp-0103.html) | UTHealth Houston | Biostatistics and Data Science | ⏳ | ⏳ | ✅ |
| `vp-0104` | [Phong Nguyen - University of Virginia](https://vietprofs.roars.dev/people/vp-0104.html) | University of Virginia | School of Data Science | ⏳ | ⏳ | ✅ |
| `vp-0105` | [Tran B. Nguyen](https://vietprofs.roars.dev/people/vp-0105.html) | University of California, Davis | Environmental Toxicology | ⏳ | ✅ | ✅ |
| `vp-0106` | [Trieu Le](https://vietprofs.roars.dev/people/vp-0106.html) | University of Toledo | Mathematics and Statistics | ⏳ | ⏳ | ✅ |
| `vp-0107` | [Dinh-Liem Nguyen](https://vietprofs.roars.dev/people/vp-0107.html) | Kansas State University | Mathematics | ✅ | ⏳ | ✅ |
| `vp-0108` | [Huy Tai Ha](https://vietprofs.roars.dev/people/vp-0108.html) | Tulane University | Mathematics | ✅ | ⏳ | ✅ |
| `vp-0109` | [Khiem T. Tran](https://vietprofs.roars.dev/people/vp-0109.html) | University of Florida | Civil and Coastal Engineering | ✅ | ⏳ | ✅ |
| `vp-0110` | [Thang N. Dao](https://vietprofs.roars.dev/people/vp-0110.html) | University of Alabama | Civil, Construction and Environmental Engineering | ✅ | ⏳ | ✅ |
| `vp-0111` | [Thai Nhan](https://vietprofs.roars.dev/people/vp-0111.html) | Menlo College | Mathematics | ✅ | ⏳ | ✅ |
| `vp-0112` | [Phat Vu](https://vietprofs.roars.dev/people/vp-0112.html) | Soka University of America | Physics | ⏳ | ⏳ | ✅ |
| `vp-0113` | [Thi Hong Diep Dao](https://vietprofs.roars.dev/people/vp-0113.html) | University of Colorado Colorado Springs | Geography and Environmental Studies | ⏳ | ⏳ | ✅ |
| `vp-0114` | [Chanh Kieu](https://vietprofs.roars.dev/people/vp-0114.html) | Indiana University Bloomington | Earth and Atmospheric Sciences | ✅ | ⏳ | ✅ |
| `vp-0115` | [Hoang Pham - Rutgers University](https://vietprofs.roars.dev/people/vp-0115.html) | Rutgers University | Industrial and Systems Engineering | ⏳ | ✅ | ✅ |
| `vp-0116` | [Christine Nguyen - Northern Illinois University](https://vietprofs.roars.dev/people/vp-0116.html) | Northern Illinois University | Industrial and Systems Engineering | ⏳ | ⏳ | ✅ |
| `vp-0117` | [Helen Nguyen](https://vietprofs.roars.dev/people/vp-0117.html) | University of Illinois Urbana-Champaign | Civil and Environmental Engineering | ⏳ | ✅ | ✅ |
| `vp-0118` | [Thang Pham](https://vietprofs.roars.dev/people/vp-0118.html) | Virginia Tech | Materials Science and Engineering | ✅ | ⏳ | ✅ |
| `vp-0119` | [Quan Nguyen](https://vietprofs.roars.dev/people/vp-0119.html) | University of Southern California | Aerospace and Mechanical Engineering | ✅ | ⏳ | ✅ |
| `vp-0120` | [Hoang-Vu Phan](https://vietprofs.roars.dev/people/vp-0120.html) | University of Nevada, Reno | Mechanical Engineering | ⏳ | ⏳ | ✅ |
| `vp-0121` | [Anh-Vu Phan](https://vietprofs.roars.dev/people/vp-0121.html) | University of South Alabama | Mechanical, Aerospace, and Biomedical Engineering | ⏳ | ⏳ | ✅ |
| `vp-0122` | [Nhut Tan Ho](https://vietprofs.roars.dev/people/vp-0122.html) | California State University, Northridge | Mechanical Engineering | ⏳ | ✅ | ✅ |
| `vp-0123` | [Kytai Truong Nguyen](https://vietprofs.roars.dev/people/vp-0123.html) | University of Texas at Arlington | Bioengineering | ⏳ | ✅ | ✅ |
| `vp-0124` | [Nam T. Dinh](https://vietprofs.roars.dev/people/vp-0124.html) | North Carolina State University | Nuclear Engineering | ⏳ | ✅ | ✅ |
| `vp-0125` | [Juliane Nguyen](https://vietprofs.roars.dev/people/vp-0125.html) | University of North Carolina at Chapel Hill | Pharmacoengineering and Molecular Pharmaceutics | ⏳ | ✅ | ✅ |
| `vp-0126` | [The Nguyen](https://vietprofs.roars.dev/people/vp-0126.html) | California State University, Fresno | Mechanical Engineering | ⏳ | ⏳ | ✅ |
| `vp-0127` | [Jacqueline Huynh](https://vietprofs.roars.dev/people/vp-0127.html) | University of California, Irvine | Mechanical and Aerospace Engineering | ⏳ | ✅ | ✅ |
| `vp-0128` | [Trinh Pham](https://vietprofs.roars.dev/people/vp-0128.html) | California State University, Los Angeles | Mechanical Engineering | ⏳ | ⏳ | ✅ |
| `vp-0129` | [Tran N. H. Nguyen](https://vietprofs.roars.dev/people/vp-0129.html) | University of Texas Southwestern Medical Center | Biomedical Engineering | ⏳ | ✅ | ✅ |
| `vp-0130` | [Hung V.-T. Nguyen](https://vietprofs.roars.dev/people/vp-0130.html) | Dartmouth College | Thayer School of Engineering | ⏳ | ✅ | ✅ |
| `vp-0131` | [Huy T. Tran](https://vietprofs.roars.dev/people/vp-0131.html) | University of Illinois Urbana-Champaign | Aerospace Engineering | ✅ | ⏳ | ✅ |
| `vp-0132` | [Thao D. (Vicky) Nguyen](https://vietprofs.roars.dev/people/vp-0132.html) | Johns Hopkins University | Mechanical Engineering | ⏳ | ✅ | ✅ |
| `vp-0133` | [Quang Vuong](https://vietprofs.roars.dev/people/vp-0133.html) | New York University | Economics | ✅ | ⏳ | ✅ |
| `vp-0134` | [Vinh Nguyen - Michigan Technological University](https://vietprofs.roars.dev/people/vp-0134.html) | Michigan Technological University | Mechanical and Aerospace Engineering | ✅ | ⏳ | ✅ |
| `vp-0135` | [Hieu Phan](https://vietprofs.roars.dev/people/vp-0135.html) | University of Massachusetts Lowell | Finance | ✅ | ⏳ | ✅ |
| `vp-0136` | [Du Nguyen](https://vietprofs.roars.dev/people/vp-0136.html) | Bowling Green State University | Finance | ✅ | ⏳ | ✅ |
| `vp-0137` | [Nga Q. Nguyen](https://vietprofs.roars.dev/people/vp-0137.html) | University of North Texas | Finance, Insurance, Real Estate and Law | ⏳ | ⏳ | ✅ |
| `vp-0138` | [Nguyen Nguyen](https://vietprofs.roars.dev/people/vp-0138.html) | Minnesota State University, Mankato | Finance | ⏳ | ⏳ | ✅ |
| `vp-0139` | [Hoang Nguyen - University of Baltimore](https://vietprofs.roars.dev/people/vp-0139.html) | University of Baltimore | Finance | ⏳ | ⏳ | ✅ |
| `vp-0140` | [Julie Ngo](https://vietprofs.roars.dev/people/vp-0140.html) | Loyola Marymount University | Finance | ⏳ | ⏳ | ✅ |
| `vp-0141` | [Thanh Dat Le](https://vietprofs.roars.dev/people/vp-0141.html) | University of Northern Colorado | Finance | ⏳ | ⏳ | ✅ |
| `vp-0142` | [Hai Tran - Loyola Marymount University](https://vietprofs.roars.dev/people/vp-0142.html) | Loyola Marymount University | Finance | ✅ | ⏳ | ✅ |
| `vp-0143` | [Giang Nguyen](https://vietprofs.roars.dev/people/vp-0143.html) | Pennsylvania State University | Finance | ✅ | ⏳ | ✅ |
| `vp-0144` | [Quoc H. Nguyen](https://vietprofs.roars.dev/people/vp-0144.html) | DePaul University | Finance and Real Estate | ⏳ | ⏳ | ✅ |
| `vp-0145` | [Diep Nguyen](https://vietprofs.roars.dev/people/vp-0145.html) | Seattle Pacific University | Finance and Management | ⏳ | ⏳ | ✅ |
| `vp-0146` | [Liem Nguyen - Westfield State University](https://vietprofs.roars.dev/people/vp-0146.html) | Westfield State University | Accounting and Finance | ⏳ | ⏳ | ✅ |
| `vp-0147` | [Anh Le](https://vietprofs.roars.dev/people/vp-0147.html) | Pennsylvania State University | Finance | ✅ | ⏳ | ✅ |
| `vp-0148` | [Arthur Tran](https://vietprofs.roars.dev/people/vp-0148.html) | Southeastern Oklahoma State University | Accounting and Finance | ⏳ | ⏳ | ✅ |
| `vp-0149` | [Trang P. Tran](https://vietprofs.roars.dev/people/vp-0149.html) | East Carolina University | Marketing and Supply Chain Management | ⏳ | ⏳ | ✅ |
| `vp-0150` | [Nguyen Pham](https://vietprofs.roars.dev/people/vp-0150.html) | Monmouth University | Marketing and International Business | ⏳ | ⏳ | ✅ |

---

### Batch 04 (vp-0151 – vp-0200, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-0151` | [Nga Ho-Dac](https://vietprofs.roars.dev/people/vp-0151.html) | San Francisco State University | Marketing | ⏳ | ⏳ | ✅ |
| `vp-0152` | [Adam Nguyen](https://vietprofs.roars.dev/people/vp-0152.html) | Siena University | Marketing | ⏳ | ⏳ | ✅ |
| `vp-0153` | [Michel Tuan Pham](https://vietprofs.roars.dev/people/vp-0153.html) | Columbia University | Marketing | ⏳ | ⏳ | ✅ |
| `vp-0154` | [Thanh (Hans) Nguyen](https://vietprofs.roars.dev/people/vp-0154.html) | Quinnipiac University | Marketing | ⏳ | ⏳ | ✅ |
| `vp-0155` | [Chi Tran](https://vietprofs.roars.dev/people/vp-0155.html) | Texas Christian University | Marketing | ⏳ | ⏳ | ✅ |
| `vp-0156` | [Lan Anh N. Ton](https://vietprofs.roars.dev/people/vp-0156.html) | Texas Christian University | Marketing | ✅ | ⏳ | ✅ |
| `vp-0157` | [Uyen Tran](https://vietprofs.roars.dev/people/vp-0157.html) | Arizona State University | Marketing, Thunderbird School of Global Management | ✅ | ⏳ | ✅ |
| `vp-0158` | [Peter Nguyen](https://vietprofs.roars.dev/people/vp-0158.html) | Miami University | Marketing | ⏳ | ⏳ | ✅ |
| `vp-0159` | [An Tran](https://vietprofs.roars.dev/people/vp-0159.html) | University of La Verne | Marketing | ✅ | ⏳ | ✅ |
| `vp-0160` | [Ha Ta](https://vietprofs.roars.dev/people/vp-0160.html) | Florida International University | Marketing and Logistics | ⏳ | ⏳ | ✅ |
| `vp-0161` | [Long Pham](https://vietprofs.roars.dev/people/vp-0161.html) | Texas A&M University-Corpus Christi | Management and Marketing | ⏳ | ⏳ | ✅ |
| `vp-0162` | [Phuoc Pham](https://vietprofs.roars.dev/people/vp-0162.html) | West Chester University of Pennsylvania | Management | ⏳ | ⏳ | ✅ |
| `vp-0163` | [Minh Nguyen - Florida Atlantic University](https://vietprofs.roars.dev/people/vp-0163.html) | Florida Atlantic University | Information Technology and Operations Management | ✅ | ⏳ | ✅ |
| `vp-0164` | [Thi Tran](https://vietprofs.roars.dev/people/vp-0164.html) | Binghamton University | Management Information Systems | ⏳ | ⏳ | ✅ |
| `vp-0165` | [Phuong Anh Nguyen](https://vietprofs.roars.dev/people/vp-0165.html) | Saint Mary's College of California | Business Analytics | ⏳ | ⏳ | ✅ |
| `vp-0166` | [Thanh Nguyen](https://vietprofs.roars.dev/people/vp-0166.html) | Purdue University | Quantitative Methods, Mitch Daniels School of Business | ⏳ | ⏳ | ✅ |
| `vp-0167` | [Dat-Dao Nguyen](https://vietprofs.roars.dev/people/vp-0167.html) | California State University, Northridge | Accounting and Information Systems | ⏳ | ⏳ | ✅ |
| `vp-0168` | [Thien Dong](https://vietprofs.roars.dev/people/vp-0168.html) | Pennsylvania State University | Management and Organization | ✅ | ⏳ | ✅ |
| `vp-0169` | [Emily Loan Pham](https://vietprofs.roars.dev/people/vp-0169.html) | Pennsylvania State University | Business | ⏳ | ⏳ | ✅ |
| `vp-0170` | [Loi A. Nguyen](https://vietprofs.roars.dev/people/vp-0170.html) | Metropolitan State University | Management, Entrepreneurship and Human Resource Management | ⏳ | ⏳ | ✅ |
| `vp-0171` | [Huy Nguyen - Montclair State University](https://vietprofs.roars.dev/people/vp-0171.html) | Montclair State University | Management | ⏳ | ⏳ | ✅ |
| `vp-0172` | [Hannah-Hanh D. Nguyen](https://vietprofs.roars.dev/people/vp-0172.html) | University of Hawaiʻi at Mānoa | Management and Industrial Relations | ⏳ | ⏳ | ✅ |
| `vp-0173` | [Dan Hieu Vo](https://vietprofs.roars.dev/people/vp-0173.html) | Florida Gulf Coast University | Daveler & Kauanui School of Entrepreneurship | ⏳ | ⏳ | ✅ |
| `vp-0174` | [Linda Nguyen - Seattle University](https://vietprofs.roars.dev/people/vp-0174.html) | Seattle University | Management | ⏳ | ⏳ | ✅ |
| `vp-0175` | [Sang Dinh Tran](https://vietprofs.roars.dev/people/vp-0175.html) | Maryville University | Accounting | ✅ | ⏳ | ✅ |
| `vp-0176` | [Viet Tuan Pham](https://vietprofs.roars.dev/people/vp-0176.html) | Susquehanna University | Accounting | ✅ | ⏳ | ✅ |
| `vp-0177` | [Anthony Le](https://vietprofs.roars.dev/people/vp-0177.html) | University of Chicago | Accounting | ✅ | ⏳ | ✅ |
| `vp-0178` | [Tuong Vu](https://vietprofs.roars.dev/people/vp-0178.html) | University of Oregon | Political Science | ⏳ | ⏳ | ✅ |
| `vp-0179` | [Long T. Bui](https://vietprofs.roars.dev/people/vp-0179.html) | University of California, Irvine | Global and International Studies | ✅ | ⏳ | ✅ |
| `vp-0180` | [Hien Duc Do](https://vietprofs.roars.dev/people/vp-0180.html) | San Jose State University | Sociology and Interdisciplinary Social Sciences | ⏳ | ⏳ | ✅ |
| `vp-0181` | [Y Thien Nguyen](https://vietprofs.roars.dev/people/vp-0181.html) | California State University, Dominguez Hills | Asian-Pacific Studies | ⏳ | ⏳ | ✅ |
| `vp-0182` | [Phi Hong Su](https://vietprofs.roars.dev/people/vp-0182.html) | Williams College | Sociology | ✅ | ⏳ | ✅ |
| `vp-0183` | [Yen Le Espiritu](https://vietprofs.roars.dev/people/vp-0183.html) | University of California, San Diego | Ethnic Studies | ⏳ | ⏳ | ✅ |
| `vp-0184` | [Linh Thuy Nguyen](https://vietprofs.roars.dev/people/vp-0184.html) | University of Washington | American Ethnic Studies | ✅ | ⏳ | ✅ |
| `vp-0185` | [Son Ca Lam](https://vietprofs.roars.dev/people/vp-0185.html) | University of Massachusetts Boston | Asian American Studies | ⏳ | ⏳ | ✅ |
| `vp-0186` | [Thuy Linh Nguyen Tu](https://vietprofs.roars.dev/people/vp-0186.html) | New York University | Social and Cultural Analysis | ⏳ | ⏳ | ✅ |
| `vp-0187` | [Mimi Thi Nguyen](https://vietprofs.roars.dev/people/vp-0187.html) | Dartmouth College | Women's, Gender and Sexuality Studies | ✅ | ⏳ | ✅ |
| `vp-0188` | [Mike Hoa Nguyen](https://vietprofs.roars.dev/people/vp-0188.html) | University of California, Los Angeles | Education | ✅ | ⏳ | ✅ |
| `vp-0189` | [Kevin Lam](https://vietprofs.roars.dev/people/vp-0189.html) | Drake University | Urban and Diversity Education | ⏳ | ⏳ | ✅ |
| `vp-0190` | [Natalie A. Tran](https://vietprofs.roars.dev/people/vp-0190.html) | California State University, Fullerton | Educational Leadership | ⏳ | ⏳ | ✅ |
| `vp-0191` | [Khanh Le](https://vietprofs.roars.dev/people/vp-0191.html) | Queens College, City University of New York | Linguistics and Communication Disorders | ✅ | ⏳ | ✅ |
| `vp-0192` | [Cindy Anh Nguyen](https://vietprofs.roars.dev/people/vp-0192.html) | University of California, Los Angeles | Information Studies | ✅ | ⏳ | ✅ |
| `vp-0193` | [Thuy Vo Dang](https://vietprofs.roars.dev/people/vp-0193.html) | University of California, Los Angeles | Information Studies | ✅ | ⏳ | ✅ |
| `vp-0194` | [Nu-Anh Tran](https://vietprofs.roars.dev/people/vp-0194.html) | University of Connecticut | History | ✅ | ⏳ | ✅ |
| `vp-0195` | [Lien-Hang T. Nguyen](https://vietprofs.roars.dev/people/vp-0195.html) | Columbia University | History | ⏳ | ⏳ | ✅ |
| `vp-0196` | [Hieu Phung](https://vietprofs.roars.dev/people/vp-0196.html) | Rutgers University | Asian Languages and Cultures | ⏳ | ⏳ | ✅ |
| `vp-0197` | [Quynh Nhu Le](https://vietprofs.roars.dev/people/vp-0197.html) | University of South Florida | English | ⏳ | ⏳ | ✅ |
| `vp-0198` | [Ocean Vuong](https://vietprofs.roars.dev/people/vp-0198.html) | New York University | English | ✅ | ⏳ | ✅ |
| `vp-0199` | [Xuan-Thao Nguyen](https://vietprofs.roars.dev/people/vp-0199.html) | University of Washington | Law | ⏳ | ⏳ | ✅ |
| `vp-0200` | [Lan Cao](https://vietprofs.roars.dev/people/vp-0200.html) | Chapman University | Law | ✅ | ⏳ | ✅ |

---

### Batch 05 (vp-0201 – vp-0250, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-0201` | [Trang (Mae) Nguyen](https://vietprofs.roars.dev/people/vp-0201.html) | Temple University | Law | ✅ | ⏳ | ✅ |
| `vp-0202` | [An-My Le](https://vietprofs.roars.dev/people/vp-0202.html) | Bard College | Photography | ✅ | ⏳ | ✅ |
| `vp-0203` | [Lan Duong](https://vietprofs.roars.dev/people/vp-0203.html) | University of Southern California | Cinema and Media Studies | ✅ | ⏳ | ✅ |
| `vp-0204` | [Viet Le](https://vietprofs.roars.dev/people/vp-0204.html) | California College of the Arts | History of Art and Visual Culture | ✅ | ⏳ | ✅ |
| `vp-0205` | [Henry T. Nguyen](https://vietprofs.roars.dev/people/vp-0205.html) | University of Missouri | Division of Plant Science and Technology | ✅ | ⏳ | ✅ |
| `vp-0206` | [Doc Lap Tran](https://vietprofs.roars.dev/people/vp-0206.html) | Tennessee State University | Agribusiness and Education | ⏳ | ⏳ | ✅ |
| `vp-0207` | [Chi L. Nguyen](https://vietprofs.roars.dev/people/vp-0207.html) | Oklahoma State University | Horticulture and Landscape Architecture | ✅ | ⏳ | ✅ |
| `vp-0208` | [Thanh D. Nguyen](https://vietprofs.roars.dev/people/vp-0208.html) | University of Connecticut | Mechanical, Aerospace, and Manufacturing Engineering | ⏳ | ⏳ | ✅ |
| `vp-0209` | [Oanh Nguyen](https://vietprofs.roars.dev/people/vp-0209.html) | Brown University | Division of Applied Mathematics | ✅ | ⏳ | ✅ |
| `vp-0210` | [Tuan Pham](https://vietprofs.roars.dev/people/vp-0210.html) | Brigham Young University-Hawaii | Mathematics and Computing | ⏳ | ✅ | ✅ |
| `vp-0211` | [Trang Nguyen](https://vietprofs.roars.dev/people/vp-0211.html) | South Dakota State University | Mathematics and Statistics | ✅ | ⏳ | ✅ |
| `vp-0212` | [Manh-Huong Phan](https://vietprofs.roars.dev/people/vp-0212.html) | University of South Florida | Physics | ⏳ | ✅ | ✅ |
| `vp-0213` | [Duy Nguyen](https://vietprofs.roars.dev/people/vp-0213.html) | Marist University | Mathematics | ✅ | ⏳ | ✅ |
| `vp-0214` | [Chi Van Dang](https://vietprofs.roars.dev/people/vp-0214.html) | Johns Hopkins University | Biochemistry and Molecular Biology | ⏳ | ⏳ | ✅ |
| `vp-0215` | [Vu Q. Nguyen - University of California, San Diego](https://vietprofs.roars.dev/people/vp-0215.html) | University of California, San Diego | Molecular Biology | ⏳ | ✅ | ✅ |
| `vp-0216` | [Trang T.H. Nguyen](https://vietprofs.roars.dev/people/vp-0216.html) | Arkansas State University | Biological Sciences | ⏳ | ⏳ | ✅ |
| `vp-0217` | [Timothea Vo](https://vietprofs.roars.dev/people/vp-0217.html) | Binghamton University | Nursing | ⏳ | ⏳ | ✅ |
| `vp-0218` | [Uyen Minh Le](https://vietprofs.roars.dev/people/vp-0218.html) | California Northstate University | Pharmaceutics and Pharmacokinetics | ⏳ | ⏳ | ✅ |
| `vp-0219` | [Hiep X. Nguyen](https://vietprofs.roars.dev/people/vp-0219.html) | California Northstate University | Pharmaceutics and Pharmacokinetics | ⏳ | ⏳ | ✅ |
| `vp-0220` | [Ngoc-Khanh Tran](https://vietprofs.roars.dev/people/vp-0220.html) | Virginia Tech | Finance, Insurance, and Business Law | ✅ | ⏳ | ✅ |
| `vp-0221` | [Isabelle Thuy Pelaud](https://vietprofs.roars.dev/people/vp-0221.html) | San Francisco State University | Asian American Studies | ⏳ | ⏳ | ✅ |
| `vp-0222` | [Loan K. Le](https://vietprofs.roars.dev/people/vp-0222.html) | San Francisco State University | Asian American Studies | ⏳ | ⏳ | ✅ |
| `vp-0223` | [Mai-Nhung Le](https://vietprofs.roars.dev/people/vp-0223.html) | San Francisco State University | Asian American Studies | ⏳ | ⏳ | ✅ |
| `vp-0224` | [Victoria Tran](https://vietprofs.roars.dev/people/vp-0224.html) | Reed College | Sociology and Comparative Race and Ethnicity Studies | ✅ | ⏳ | ✅ |
| `vp-0225` | [Chi Nguyen](https://vietprofs.roars.dev/people/vp-0225.html) | University of Arizona | Educational Policy Studies and Practice | ✅ | ⏳ | ✅ |
| `vp-0226` | [Mariam B. Lam](https://vietprofs.roars.dev/people/vp-0226.html) | University of California, Riverside | Comparative Literature and Languages | ⏳ | ⏳ | ✅ |
| `vp-0227` | [Duy Lap Nguyen](https://vietprofs.roars.dev/people/vp-0227.html) | University of Houston | World Cultures and Literatures | ⏳ | ⏳ | ✅ |
| `vp-0228` | [Phuong Nguyen-Hoang](https://vietprofs.roars.dev/people/vp-0228.html) | University of Iowa | School of Planning and Public Affairs | ⏳ | ⏳ | ✅ |
| `vp-0229` | [Huyen Pham - Texas A&M University](https://vietprofs.roars.dev/people/vp-0229.html) | Texas A&M University | Law | ⏳ | ⏳ | ✅ |
| `vp-0230` | [T. Kim-Trang Tran](https://vietprofs.roars.dev/people/vp-0230.html) | Scripps College | Art and Media Studies | ✅ | ⏳ | ✅ |
| `vp-0231` | [Michael Dao](https://vietprofs.roars.dev/people/vp-0231.html) | San Jose State University | Kinesiology | ⏳ | ⏳ | ✅ |
| `vp-0232` | [Connie Kim Yen Nguyen-Truong](https://vietprofs.roars.dev/people/vp-0232.html) | Washington State University | Nursing | ⏳ | ✅ | ✅ |
| `vp-0233` | [Angelina Nguyen](https://vietprofs.roars.dev/people/vp-0233.html) | Baylor University | Nursing | ⏳ | ✅ | ✅ |
| `vp-0234` | [Tomas Vu-Daniel](https://vietprofs.roars.dev/people/vp-0234.html) | Columbia University | Visual Arts | ✅ | ⏳ | ✅ |
| `vp-0235` | [H. Lan Thao Lam](https://vietprofs.roars.dev/people/vp-0235.html) | The New School | Fine Arts | ✅ | ✅ | ✅ |
| `vp-0236` | [Anh Q. Tran](https://vietprofs.roars.dev/people/vp-0236.html) | Santa Clara University | Jesuit School of Theology | ⏳ | ⏳ | ✅ |
| `vp-0237` | [Jonathan Tran](https://vietprofs.roars.dev/people/vp-0237.html) | Duke University | Theological Ethics, Divinity School | ⏳ | ⏳ | ✅ |
| `vp-0238` | [Nguyen Phan](https://vietprofs.roars.dev/people/vp-0238.html) | University of Houston | Computer Science | ⏳ | ⏳ | ✅ |
| `vp-0239` | [N. Rich Nguyen](https://vietprofs.roars.dev/people/vp-0239.html) | University of Virginia | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0240` | [Truong Hoang](https://vietprofs.roars.dev/people/vp-0240.html) | University of Colorado Boulder | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0241` | [Vincent Nguyen](https://vietprofs.roars.dev/people/vp-0241.html) | University of Maryland | Mechanical Engineering | ⏳ | ⏳ | ✅ |
| `vp-0242` | [Win PV Nguyen](https://vietprofs.roars.dev/people/vp-0242.html) | Virginia Tech | Industrial and Systems Engineering | ⏳ | ⏳ | ✅ |
| `vp-0243` | [Huy Nguyen - University of Missouri](https://vietprofs.roars.dev/people/vp-0243.html) | University of Missouri | Mechanical and Aerospace Engineering | ✅ | ⏳ | ✅ |
| `vp-0244` | [B. Audrey Nguyen](https://vietprofs.roars.dev/people/vp-0244.html) | University of Akron | Biomedical Engineering | ⏳ | ⏳ | ✅ |
| `vp-0245` | [Vy Nguyen - University of Tennessee, Knoxville](https://vietprofs.roars.dev/people/vp-0245.html) | University of Tennessee, Knoxville | Mathematics | ⏳ | ⏳ | ✅ |
| `vp-0246` | [Hung Duong](https://vietprofs.roars.dev/people/vp-0246.html) | University of Tennessee, Knoxville | Mathematics | ⏳ | ⏳ | ✅ |
| `vp-0247` | [Hung Le - University of Tennessee, Knoxville](https://vietprofs.roars.dev/people/vp-0247.html) | University of Tennessee, Knoxville | Mathematics | ⏳ | ⏳ | ✅ |
| `vp-0248` | [Mylinh Nguyen](https://vietprofs.roars.dev/people/vp-0248.html) | University of Texas at Dallas | Mathematical Sciences | ⏳ | ⏳ | ✅ |
| `vp-0249` | [Thuan L. Nguyen](https://vietprofs.roars.dev/people/vp-0249.html) | University of North Texas | Data Analytics and Statistics | ⏳ | ⏳ | ✅ |
| `vp-0250` | [Lesa Tran Lu](https://vietprofs.roars.dev/people/vp-0250.html) | Rice University | Chemistry | ⏳ | ⏳ | ✅ |

---

### Batch 06 (vp-0251 – vp-0300, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-0251` | [Thu Nguyen](https://vietprofs.roars.dev/people/vp-0251.html) | University of Michigan | Chemistry | ⏳ | ⏳ | ✅ |
| `vp-0252` | [Huong Nguyen - University of Minnesota](https://vietprofs.roars.dev/people/vp-0252.html) | University of Minnesota | Nursing | ⏳ | ⏳ | ✅ |
| `vp-0253` | [Linda Nguyen - University of Florida](https://vietprofs.roars.dev/people/vp-0253.html) | University of Florida | Applied Physiology and Kinesiology | ⏳ | ⏳ | ✅ |
| `vp-0254` | [Khoa Nguyen](https://vietprofs.roars.dev/people/vp-0254.html) | University of Florida | Pharmacotherapy and Translational Research | ⏳ | ⏳ | ✅ |
| `vp-0255` | [Khiem Pham-Nguyen](https://vietprofs.roars.dev/people/vp-0255.html) | Boston University | Orthodontics & Dentofacial Orthopedics | ⏳ | ⏳ | ✅ |
| `vp-0256` | [Christopher Paul Nguyen](https://vietprofs.roars.dev/people/vp-0256.html) | University of New Mexico | Management | ⏳ | ⏳ | ✅ |
| `vp-0257` | [Cuong Nguyen Le](https://vietprofs.roars.dev/people/vp-0257.html) | University of Massachusetts Amherst | Sociology | ✅ | ⏳ | ✅ |
| `vp-0258` | [Huyen Nguyen - Kansas State University](https://vietprofs.roars.dev/people/vp-0258.html) | Kansas State University | Media and Communication | ⏳ | ⏳ | ✅ |
| `vp-0259` | [Hoa T.H. Nguyen](https://vietprofs.roars.dev/people/vp-0259.html) | Columbia University | Applied Linguistics and TESOL | ⏳ | ⏳ | ✅ |
| `vp-0260` | [Ngan Nguyen](https://vietprofs.roars.dev/people/vp-0260.html) | Texas Tech University | Curriculum & Instruction | ⏳ | ⏳ | ✅ |
| `vp-0261` | [Yen Kim Nguyen](https://vietprofs.roars.dev/people/vp-0261.html) | University of Washington | Asian Languages & Literature | ⏳ | ⏳ | ✅ |
| `vp-0262` | [Thuy D. Tranviet](https://vietprofs.roars.dev/people/vp-0262.html) | Cornell University | Asian Studies | ⏳ | ⏳ | ✅ |
| `vp-0263` | [Quang Phu Van](https://vietprofs.roars.dev/people/vp-0263.html) | Yale University | Council on Southeast Asia Studies | ⏳ | ⏳ | ✅ |
| `vp-0264` | [Thinh Nguyen - University of Florida](https://vietprofs.roars.dev/people/vp-0264.html) | University of Florida | Law | ⏳ | ⏳ | ✅ |
| `vp-0265` | [Tim Nguyen](https://vietprofs.roars.dev/people/vp-0265.html) | Middlebury College | Business & Finance | ⏳ | ⏳ | ✅ |
| `vp-0266` | [Han Duc Tran](https://vietprofs.roars.dev/people/vp-0266.html) | Texas A&M University | Computer Science & Engineering | ⏳ | ⏳ | ✅ |
| `vp-0267` | [Tung Thanh Nguyen](https://vietprofs.roars.dev/people/vp-0267.html) | Texas A&M University | Computer Science & Engineering | ⏳ | ⏳ | ✅ |
| `vp-0268` | [Quyen Di Chuc Bui](https://vietprofs.roars.dev/people/vp-0268.html) | University of California, Los Angeles | Asian Languages and Cultures | ⏳ | ⏳ | ✅ |
| `vp-0269` | [Thu-Ba Nguyen Hoai](https://vietprofs.roars.dev/people/vp-0269.html) | University of California, Los Angeles | Asian Languages and Cultures | ⏳ | ⏳ | ✅ |
| `vp-0270` | [Hien Tran](https://vietprofs.roars.dev/people/vp-0270.html) | North Carolina State University | Mathematics | ⏳ | ⏳ | ✅ |
| `vp-0271` | [Thi Mai Anh Nguyen](https://vietprofs.roars.dev/people/vp-0271.html) | New York University | Economics | ✅ | ⏳ | ✅ |
| `vp-0272` | [Lan Nguyen Chaplin](https://vietprofs.roars.dev/people/vp-0272.html) | Northwestern University | Integrated Marketing Communications | ✅ | ⏳ | ✅ |
| `vp-0273` | [Bach Mai Dolly Nguyen](https://vietprofs.roars.dev/people/vp-0273.html) | Oregon State University | Education | ⏳ | ⏳ | ✅ |
| `vp-0274` | [Hoang Pham - Oregon State University](https://vietprofs.roars.dev/people/vp-0274.html) | Oregon State University | Economics | ⏳ | ⏳ | ✅ |
| `vp-0275` | [Thang N. Bui](https://vietprofs.roars.dev/people/vp-0275.html) | Penn State Harrisburg | Computer Science | ⏳ | ⏳ | ✅ |
| `vp-0276` | [Triet Pham](https://vietprofs.roars.dev/people/vp-0276.html) | Rutgers University | Mathematics | ⏳ | ⏳ | ✅ |
| `vp-0277` | [Long Thai Bui](https://vietprofs.roars.dev/people/vp-0277.html) | Saint Mary's College of California | Accounting | ⏳ | ⏳ | ✅ |
| `vp-0278` | [Tan Van Nguyen](https://vietprofs.roars.dev/people/vp-0278.html) | San Jose State University | Electrical Engineering | ⏳ | ⏳ | ✅ |
| `vp-0279` | [Christopher Pham](https://vietprofs.roars.dev/people/vp-0279.html) | San Jose State University | Electrical Engineering | ⏳ | ⏳ | ✅ |
| `vp-0280` | [Hau Nguyen](https://vietprofs.roars.dev/people/vp-0280.html) | Seattle Pacific University | Economics | ⏳ | ⏳ | ✅ |
| `vp-0281` | [Dung Trung Nguyen](https://vietprofs.roars.dev/people/vp-0281.html) | Seattle Pacific University | Mechanical Engineering | ⏳ | ⏳ | ✅ |
| `vp-0282` | [Phuong Nguyen](https://vietprofs.roars.dev/people/vp-0282.html) | South Dakota State University | Construction and Concrete Industry Management | ⏳ | ⏳ | ✅ |
| `vp-0283` | [Son Phan Lam Tran](https://vietprofs.roars.dev/people/vp-0283.html) | Texas Tech University | Plant and Soil Science | ⏳ | ⏳ | ✅ |
| `vp-0284` | [Xuong Nguyen-Huu](https://vietprofs.roars.dev/people/vp-0284.html) | University of California, San Diego | Chemistry and Biochemistry | ⏳ | ⏳ | ✅ |
| `vp-0285` | [Anh Tran](https://vietprofs.roars.dev/people/vp-0285.html) | University of Massachusetts Lowell | Electrical and Computer Engineering | ⏳ | ⏳ | ✅ |
| `vp-0286` | [Ruby H.N. Nguyen](https://vietprofs.roars.dev/people/vp-0286.html) | University of Minnesota | Epidemiology and Community Health | ⏳ | ⏳ | ✅ |
| `vp-0287` | [Mai Ngo](https://vietprofs.roars.dev/people/vp-0287.html) | University of Wisconsin-Madison | Chemical and Biological Engineering | ⏳ | ✅ | ✅ |
| `vp-0288` | [Beth Nguyen](https://vietprofs.roars.dev/people/vp-0288.html) | University of Wisconsin-Madison | English | ⏳ | ⏳ | ✅ |
| `vp-0289` | [Duc-Huy Nguyen](https://vietprofs.roars.dev/people/vp-0289.html) | University of Wisconsin-Madison | Biomedical Engineering | ⏳ | ⏳ | ✅ |
| `vp-0290` | [Diem M. Nguyen](https://vietprofs.roars.dev/people/vp-0290.html) | Bowling Green State University | Mathematics and Statistics | ⏳ | ⏳ | ✅ |
| `vp-0291` | [Hau Pham](https://vietprofs.roars.dev/people/vp-0291.html) | Boston University | Surgery | ⏳ | ⏳ | ✅ |
| `vp-0292` | [Carolyn T. Dang](https://vietprofs.roars.dev/people/vp-0292.html) | Pennsylvania State University | Management and Organization | ⏳ | ⏳ | ✅ |
| `vp-0293` | [Trung Nguyen](https://vietprofs.roars.dev/people/vp-0293.html) | San Jose State University | Sociology and Interdisciplinary Social Sciences | ⏳ | ⏳ | ✅ |
| `vp-0294` | [Luan Hoang](https://vietprofs.roars.dev/people/vp-0294.html) | Texas Tech University | Mathematics and Statistics | ⏳ | ⏳ | ✅ |
| `vp-0295` | [Thai Luan Vu](https://vietprofs.roars.dev/people/vp-0295.html) | Texas Tech University | Mathematics and Statistics | ⏳ | ⏳ | ✅ |
| `vp-0296` | [Hung Tran - Texas Tech University](https://vietprofs.roars.dev/people/vp-0296.html) | Texas Tech University | Mathematics and Statistics | ⏳ | ⏳ | ✅ |
| `vp-0297` | [Hanh-Phuc Le](https://vietprofs.roars.dev/people/vp-0297.html) | University of California, San Diego | Electrical and Computer Engineering | ⏳ | ⏳ | ✅ |
| `vp-0298` | [Hoang Nguyen - University of California, San Diego](https://vietprofs.roars.dev/people/vp-0298.html) | University of California, San Diego | Literature | ⏳ | ⏳ | ✅ |
| `vp-0299` | [Lily Hoang](https://vietprofs.roars.dev/people/vp-0299.html) | University of California, San Diego | Literature | ⏳ | ⏳ | ✅ |
| `vp-0300` | [Thu-Huong Nguyen-Vo](https://vietprofs.roars.dev/people/vp-0300.html) | University of California, Los Angeles | Asian Languages and Cultures | ⏳ | ⏳ | ✅ |

---

### Batch 07 (vp-0301 – vp-0350, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-0301` | [Thuy-Ngoc Nguyen](https://vietprofs.roars.dev/people/vp-0301.html) | University of Dayton | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0302` | [Thanh Thai Nguyen](https://vietprofs.roars.dev/people/vp-0302.html) | University of Dayton | Mathematics | ⏳ | ⏳ | ✅ |
| `vp-0303` | [Tung X. Bui](https://vietprofs.roars.dev/people/vp-0303.html) | University of Hawaiʻi at Mānoa | Information Technology Management | ⏳ | ⏳ | ✅ |
| `vp-0304` | [Hieu Tran](https://vietprofs.roars.dev/people/vp-0304.html) | University of Massachusetts Boston | Accounting and Finance | ✅ | ⏳ | ✅ |
| `vp-0305` | [Matthew Bui](https://vietprofs.roars.dev/people/vp-0305.html) | University of Michigan | Information Science | ✅ | ✅ | ✅ |
| `vp-0306` | [Trân Huỳnh](https://vietprofs.roars.dev/people/vp-0306.html) | University of Minnesota | Environmental Health Sciences | ⏳ | ⏳ | ✅ |
| `vp-0307` | [Hai Dang Nguyen - University of Minnesota](https://vietprofs.roars.dev/people/vp-0307.html) | University of Minnesota | Pharmacology | ⏳ | ✅ | ✅ |
| `vp-0308` | [Tuan D. Nguyen](https://vietprofs.roars.dev/people/vp-0308.html) | University of Missouri | Educational Leadership and Policy Analysis | ✅ | ⏳ | ✅ |
| `vp-0309` | [Nghiem Q. Huynh](https://vietprofs.roars.dev/people/vp-0309.html) | University of Oklahoma | Economics | ✅ | ⏳ | ✅ |
| `vp-0310` | [Hung T. Luyen](https://vietprofs.roars.dev/people/vp-0310.html) | University of North Texas | Electrical Engineering | ⏳ | ✅ | ✅ |
| `vp-0311` | [Thuy D. Nguyen](https://vietprofs.roars.dev/people/vp-0311.html) | University of North Texas | Marketing | ⏳ | ⏳ | ✅ |
| `vp-0312` | [Nhung Nguyen](https://vietprofs.roars.dev/people/vp-0312.html) | University of South Alabama | Communication | ⏳ | ⏳ | ✅ |
| `vp-0313` | [Mai Thi Nguyen](https://vietprofs.roars.dev/people/vp-0313.html) | University of California, San Diego | Urban Studies and Planning | ✅ | ✅ | ✅ |
| `vp-0314` | [Dan Nguyen](https://vietprofs.roars.dev/people/vp-0314.html) | University of Texas Southwestern Medical Center | Radiation Oncology | ⏳ | ✅ | ✅ |
| `vp-0315` | [An Binh Nguyen](https://vietprofs.roars.dev/people/vp-0315.html) | University of Texas Southwestern Medical Center | Biophysics | ⏳ | ✅ | ✅ |
| `vp-0316` | [Vuvi H. Nguyen](https://vietprofs.roars.dev/people/vp-0316.html) | UTHealth Houston | Diagnostic and Biomedical Sciences | ⏳ | ⏳ | ✅ |
| `vp-0317` | [Leanna Rubio](https://vietprofs.roars.dev/people/vp-0317.html) | UTHealth Houston | Periodontics and Dental Hygiene | ⏳ | ⏳ | ✅ |
| `vp-0318` | [Mai Dao](https://vietprofs.roars.dev/people/vp-0318.html) | University of Toledo | Accounting | ⏳ | ⏳ | ✅ |
| `vp-0319` | [An Dinh](https://vietprofs.roars.dev/people/vp-0319.html) | University of Toledo | Speech-Language Pathology | ⏳ | ⏳ | ✅ |
| `vp-0320` | [T. Hoang Nguyen](https://vietprofs.roars.dev/people/vp-0320.html) | Virginia Commonwealth University | Psychiatry | ✅ | ✅ | ✅ |
| `vp-0321` | [Kevin Duong](https://vietprofs.roars.dev/people/vp-0321.html) | University of Virginia | Politics | ✅ | ⏳ | ✅ |
| `vp-0322` | [Ha Nguyen - University of Washington](https://vietprofs.roars.dev/people/vp-0322.html) | University of Washington | Asian Languages and Literature | ⏳ | ⏳ | ✅ |
| `vp-0323` | [Hanh Lam](https://vietprofs.roars.dev/people/vp-0323.html) | Virginia Tech | Biological Sciences | ⏳ | ✅ | ✅ |
| `vp-0324` | [Nga Nguyen - University of Wyoming](https://vietprofs.roars.dev/people/vp-0324.html) | University of Wyoming | Electrical Engineering and Computer Science | ⏳ | ⏳ | ✅ |
| `vp-0325` | [Quan Tran](https://vietprofs.roars.dev/people/vp-0325.html) | Yale University | Ethnicity, Race, and Migration and American Studies | ⏳ | ⏳ | ✅ |
| `vp-0326` | [Tu Anh Huynh](https://vietprofs.roars.dev/people/vp-0326.html) | University of Wisconsin-Madison | Food Science | ⏳ | ✅ | ✅ |
| `vp-0327` | [Juliet Huynh](https://vietprofs.roars.dev/people/vp-0327.html) | University of Wisconsin-Madison | English | ⏳ | ✅ | ✅ |
| `vp-0328` | [Athena Nghiem](https://vietprofs.roars.dev/people/vp-0328.html) | University of Wisconsin-Madison | Geoscience | ✅ | ✅ | ✅ |
| `vp-0329` | [Cac Nguyen](https://vietprofs.roars.dev/people/vp-0329.html) | University of Iowa | Mathematics | ⏳ | ⏳ | ✅ |
| `vp-0330` | [Dinh Van Huynh](https://vietprofs.roars.dev/people/vp-0330.html) | Ohio University | Mathematics | ⏳ | ⏳ | ✅ |
| `vp-0331` | [Taihung Duong](https://vietprofs.roars.dev/people/vp-0331.html) | Indiana University School of Medicine | Anatomy, Cell Biology and Physiology | ✅ | ⏳ | ✅ |
| `vp-0332` | [Thanh N. Truong](https://vietprofs.roars.dev/people/vp-0332.html) | University of Utah | Chemistry | ⏳ | ⏳ | ✅ |
| `vp-0333` | [Thuy Linh Nguyen](https://vietprofs.roars.dev/people/vp-0333.html) | Mount Saint Mary College | History | ⏳ | ⏳ | ✅ |
| `vp-0334` | [Hung M. Nguyen](https://vietprofs.roars.dev/people/vp-0334.html) | George Mason University | Government and Politics | ⏳ | ⏳ | ✅ |
| `vp-0335` | [Tuan A. Le](https://vietprofs.roars.dev/people/vp-0335.html) | Nicholls State University | Accounting and Finance | ⏳ | ⏳ | ✅ |
| `vp-0336` | [Trong Nguyen](https://vietprofs.roars.dev/people/vp-0336.html) | Middle Georgia State University | Aviation Science and Management | ⏳ | ⏳ | ✅ |
| `vp-0337` | [Vy Nguyen - Augusta University](https://vietprofs.roars.dev/people/vp-0337.html) | Augusta University | Psychological Sciences | ⏳ | ✅ | ✅ |
| `vp-0338` | [Nhu Nguyen - University of Rhode Island](https://vietprofs.roars.dev/people/vp-0338.html) | University of Rhode Island | Mathematics and Applied Mathematical Sciences | ✅ | ⏳ | ✅ |
| `vp-0339` | [Tam Nguyen - University of Maryland, College Park](https://vietprofs.roars.dev/people/vp-0339.html) | University of Maryland, College Park | Aerospace Engineering | ⏳ | ✅ | ✅ |
| `vp-0340` | [Josef Nguyen](https://vietprofs.roars.dev/people/vp-0340.html) | University of Michigan | Film, Television, and Media | ✅ | ⏳ | ✅ |
| `vp-0341` | [Linh Huynh](https://vietprofs.roars.dev/people/vp-0341.html) | Texas Tech University | Applied Mathematics | ✅ | ⏳ | ✅ |
| `vp-0342` | [Hy Huynh](https://vietprofs.roars.dev/people/vp-0342.html) | Duke University | Global Health | ✅ | ⏳ | ✅ |
| `vp-0343` | [Thy N. Huynh](https://vietprofs.roars.dev/people/vp-0343.html) | University of Mississippi Medical Center | Dermatology | ⏳ | ⏳ | ✅ |
| `vp-0344` | [Tina I. Bui-Bullock](https://vietprofs.roars.dev/people/vp-0344.html) | University of Alabama at Birmingham | Pathology | ⏳ | ⏳ | ✅ |
| `vp-0345` | [Carol M. Huynh](https://vietprofs.roars.dev/people/vp-0345.html) | North Carolina Central University | Criminal Justice | ⏳ | ⏳ | ✅ |
| `vp-0346` | [Victoria Huynh](https://vietprofs.roars.dev/people/vp-0346.html) | University of Alabama at Birmingham | Surgery | ⏳ | ⏳ | ✅ |
| `vp-0347` | [Alex Van Huynh](https://vietprofs.roars.dev/people/vp-0347.html) | DeSales University | Biology | ⏳ | ✅ | ✅ |
| `vp-0348` | [Huy M. Dao](https://vietprofs.roars.dev/people/vp-0348.html) | University of Louisiana Monroe | Pharmaceutical Sciences | ⏳ | ✅ | ✅ |
| `vp-0349` | [Phuong Ngo](https://vietprofs.roars.dev/people/vp-0349.html) | Bard College | Asian Studies | ⏳ | ⏳ | ✅ |
| `vp-0350` | [Natalia Duong](https://vietprofs.roars.dev/people/vp-0350.html) | University of California, Davis | Asian American Studies and Science and Technology Studies | ✅ | ⏳ | ✅ |

---

### Batch 08 (vp-0351 – vp-0400, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-0351` | [Nguyen-Truc-Dao Nguyen](https://vietprofs.roars.dev/people/vp-0351.html) | San Diego State University | Mathematics and Statistics | ⏳ | ✅ | ✅ |
| `vp-0352` | [Thai-Hoang Pham](https://vietprofs.roars.dev/people/vp-0352.html) | Texas State University | Computer Science | ⏳ | ⏳ | ✅ |
| `vp-0353` | [Van C. Tran](https://vietprofs.roars.dev/people/vp-0353.html) | CUNY Graduate Center | Sociology | ⏳ | ⏳ | ✅ |
| `vp-0354` | [Tuan Hoang](https://vietprofs.roars.dev/people/vp-0354.html) | Pepperdine University | Great Books | ⏳ | ⏳ | ✅ |
| `vp-0355` | [Paul Anh Tran-Hoang](https://vietprofs.roars.dev/people/vp-0355.html) | University of Illinois Urbana-Champaign | Philosophy | ✅ | ⏳ | ✅ |
| `vp-0356` | [Cao Le](https://vietprofs.roars.dev/people/vp-0356.html) | George Mason University | Accounting | ⏳ | ⏳ | ✅ |
| `vp-0357` | [Qui-Phiet Tran](https://vietprofs.roars.dev/people/vp-0357.html) | Schreiner University | English | ⏳ | ⏳ | ✅ |
| `vp-0358` | [Duong Nguyen - Arizona State University](https://vietprofs.roars.dev/people/vp-0358.html) | Arizona State University | Electrical, Computer and Energy Engineering | ✅ | ⏳ | ✅ |
| `vp-0359` | [Thuy-Kim Le](https://vietprofs.roars.dev/people/vp-0359.html) | Arizona State University | School of International Letters and Cultures | ⏳ | ⏳ | ✅ |
| `vp-0360` | [Linh Vu](https://vietprofs.roars.dev/people/vp-0360.html) | Arizona State University | Historical, Philosophical and Religious Studies | ⏳ | ⏳ | ✅ |
| `vp-0361` | [Hoang Van Pham](https://vietprofs.roars.dev/people/vp-0361.html) | Baylor University | Economics | ✅ | ✅ | ✅ |
| `vp-0362` | [Phuongthao Dinh Le](https://vietprofs.roars.dev/people/vp-0362.html) | Boston University | Community Health Sciences | ⏳ | ⏳ | ✅ |
| `vp-0363` | [Thanh N. Nguyen](https://vietprofs.roars.dev/people/vp-0363.html) | Boston University | Neurology, Neurosurgery and Radiology | ⏳ | ⏳ | ✅ |
| `vp-0364` | [Kinh T. Vu](https://vietprofs.roars.dev/people/vp-0364.html) | Boston University | Music Education | ✅ | ⏳ | ✅ |
| `vp-0365` | [Tuan Tran - California Northstate University](https://vietprofs.roars.dev/people/vp-0365.html) | California Northstate University | Clinical and Administrative Sciences, College of Pharmacy | ⏳ | ⏳ | ✅ |
| `vp-0366` | [Ha Nguyen - California State University, Dominguez Hills](https://vietprofs.roars.dev/people/vp-0366.html) | California State University, Dominguez Hills | Mathematics | ⏳ | ⏳ | ✅ |
| `vp-0367` | [Hannah Nguyen](https://vietprofs.roars.dev/people/vp-0367.html) | California State University, Dominguez Hills | Human Services | ⏳ | ⏳ | ✅ |
| `vp-0368` | [Paul Quang Duong Tran](https://vietprofs.roars.dev/people/vp-0368.html) | California State University, Dominguez Hills | Social Work | ⏳ | ⏳ | ✅ |
| `vp-0369` | [Khang Tran](https://vietprofs.roars.dev/people/vp-0369.html) | California State University, Fresno | Mathematics | ⏳ | ⏳ | ✅ |
| `vp-0370` | [Tu-Uyen Nguyen](https://vietprofs.roars.dev/people/vp-0370.html) | California State University, Fullerton | Asian American Studies | ⏳ | ✅ | ✅ |
| `vp-0371` | [Angela-MinhTu D. Nguyen](https://vietprofs.roars.dev/people/vp-0371.html) | California State University, Fullerton | Psychology | ⏳ | ✅ | ✅ |
| `vp-0372` | [Linh K. Nguyen](https://vietprofs.roars.dev/people/vp-0372.html) | California State University, Fullerton | Modern Languages and Literatures | ✅ | ⏳ | ✅ |
| `vp-0373` | [Nga Nguyen - California State University, Fullerton](https://vietprofs.roars.dev/people/vp-0373.html) | California State University, Fullerton | Anthropology | ⏳ | ✅ | ✅ |
| `vp-0374` | [Truyen D. Nguyen](https://vietprofs.roars.dev/people/vp-0374.html) | California State University, Fullerton | Human Services | ⏳ | ⏳ | ✅ |
| `vp-0375` | [Justin Tran](https://vietprofs.roars.dev/people/vp-0375.html) | California State University, Fullerton | Mechanical Engineering | ⏳ | ⏳ | ✅ |
| `vp-0376` | [Lisa Tran](https://vietprofs.roars.dev/people/vp-0376.html) | California State University, Fullerton | History | ⏳ | ⏳ | ✅ |
| `vp-0377` | [Loan Dao](https://vietprofs.roars.dev/people/vp-0377.html) | California State University, Los Angeles | Asian and Asian American Studies | ⏳ | ⏳ | ✅ |
| `vp-0378` | [Juily Iyn Vo Phun](https://vietprofs.roars.dev/people/vp-0378.html) | California State University, Los Angeles | Asian and Asian American Studies | ⏳ | ✅ | ✅ |
| `vp-0379` | [Boone Nguyen](https://vietprofs.roars.dev/people/vp-0379.html) | California State University, Los Angeles | Asian and Asian American Studies | ⏳ | ⏳ | ✅ |
| `vp-0380` | [Phung Huynh](https://vietprofs.roars.dev/people/vp-0380.html) | California State University, Los Angeles | Art | ⏳ | ⏳ | ✅ |
| `vp-0381` | [Uy Nguyen](https://vietprofs.roars.dev/people/vp-0381.html) | California State University, Los Angeles | Mathematics and Computer Science | ⏳ | ⏳ | ✅ |
| `vp-0382` | [Que-Lam Huynh](https://vietprofs.roars.dev/people/vp-0382.html) | California State University, Northridge | Psychology | ✅ | ⏳ | ✅ |
| `vp-0383` | [Virginia Huynh](https://vietprofs.roars.dev/people/vp-0383.html) | California State University, Northridge | Child and Adolescent Development | ⏳ | ✅ | ✅ |
| `vp-0384` | [Viet-Huong Nguyen](https://vietprofs.roars.dev/people/vp-0384.html) | Chapman University | Pharmacy Practice | ✅ | ⏳ | ✅ |
| `vp-0385` | [Truong-Thao Nguyen](https://vietprofs.roars.dev/people/vp-0385.html) | City College of New York (CUNY) | Electrical Engineering | ⏳ | ⏳ | ✅ |
| `vp-0386` | [Raymond S. Tu](https://vietprofs.roars.dev/people/vp-0386.html) | City College of New York (CUNY) | Chemical Engineering | ⏳ | ✅ | ✅ |
| `vp-0387` | [John Phan](https://vietprofs.roars.dev/people/vp-0387.html) | Columbia University | East Asian Languages and Cultures | ⏳ | ⏳ | ✅ |
| `vp-0388` | [Phuong Chung Nguyen](https://vietprofs.roars.dev/people/vp-0388.html) | Columbia University | East Asian Languages and Cultures | ⏳ | ⏳ | ✅ |
| `vp-0389` | [Quynh A. Truong](https://vietprofs.roars.dev/people/vp-0389.html) | Cornell University | Radiology, Weill Cornell Medicine | ⏳ | ⏳ | ✅ |
| `vp-0390` | [Hai Tran - DePaul University](https://vietprofs.roars.dev/people/vp-0390.html) | DePaul University | Communication | ⏳ | ⏳ | ✅ |
| `vp-0391` | [Tuan Tran - East Carolina University](https://vietprofs.roars.dev/people/vp-0391.html) | East Carolina University | Psychology | ⏳ | ✅ | ✅ |
| `vp-0392` | [Long Duy Nguyen](https://vietprofs.roars.dev/people/vp-0392.html) | Florida Gulf Coast University | Construction Management | ✅ | ⏳ | ✅ |
| `vp-0393` | [Andy V. Pham](https://vietprofs.roars.dev/people/vp-0393.html) | Florida International University | Counseling, Recreation and School Psychology | ⏳ | ⏳ | ✅ |
| `vp-0394` | [Tuyen (Tom) Nguyen](https://vietprofs.roars.dev/people/vp-0394.html) | Florida International University | Cardiovascular Sciences | ⏳ | ⏳ | ✅ |
| `vp-0395` | [Anh Pham](https://vietprofs.roars.dev/people/vp-0395.html) | George Mason University | Public Policy, Schar School of Policy and Government | ✅ | ⏳ | ✅ |
| `vp-0396` | [Michelle Tram Nguyen](https://vietprofs.roars.dev/people/vp-0396.html) | George Mason University | English | ⏳ | ⏳ | ✅ |
| `vp-0397` | [Anh Ngoc Tran](https://vietprofs.roars.dev/people/vp-0397.html) | Indiana University Bloomington | Public and Environmental Affairs | ⏳ | ⏳ | ✅ |
| `vp-0398` | [Hoa Vo](https://vietprofs.roars.dev/people/vp-0398.html) | Indiana University Bloomington | Interior Design | ✅ | ⏳ | ✅ |
| `vp-0399` | [Truong Duong](https://vietprofs.roars.dev/people/vp-0399.html) | Iowa State University | Finance | ⏳ | ⏳ | ✅ |
| `vp-0400` | [Lan Ngo](https://vietprofs.roars.dev/people/vp-0400.html) | Loyola Marymount University | Asian and Asian American Studies | ⏳ | ⏳ | ✅ |

---

### Batch 09 (vp-0401 – vp-0450, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-0401` | [John Bui](https://vietprofs.roars.dev/people/vp-0401.html) | Maryville University | Computer Science | ⏳ | ⏳ | ⏳ |
| `vp-0402` | [Minh Vo](https://vietprofs.roars.dev/people/vp-0402.html) | Metropolitan State University | Economics and Finance | ⏳ | ⏳ | ⏳ |
| `vp-0403` | [Nam T. Vu](https://vietprofs.roars.dev/people/vp-0403.html) | Miami University | Economics | ⏳ | ⏳ | ⏳ |
| `vp-0404` | [Quang Ngoc Vinh Tran](https://vietprofs.roars.dev/people/vp-0404.html) | Michigan Technological University | Civil, Environmental, and Geospatial Engineering | ⏳ | ✅ | ✅ |
| `vp-0405` | [Lam D. Pham](https://vietprofs.roars.dev/people/vp-0405.html) | North Carolina State University | Educational Leadership, Policy, and Human Development | ⏳ | ⏳ | ✅ |
| `vp-0406` | [Vy Nguyen - Northeastern University](https://vietprofs.roars.dev/people/vp-0406.html) | Northeastern University | Mathematics | ⏳ | ⏳ | ✅ |
| `vp-0407` | [Mai Van Tran](https://vietprofs.roars.dev/people/vp-0407.html) | Northern Illinois University | Political Science | ✅ | ⏳ | ✅ |
| `vp-0408` | [Keva X. Bui](https://vietprofs.roars.dev/people/vp-0408.html) | Northwestern University | Asian American Studies | ⏳ | ⏳ | ✅ |
| `vp-0409` | [Thuan Nguyen](https://vietprofs.roars.dev/people/vp-0409.html) | Oregon Health & Science University | Biostatistics | ⏳ | ⏳ | ✅ |
| `vp-0410` | [Trang Huynh](https://vietprofs.roars.dev/people/vp-0410.html) | Oregon Health & Science University | Pediatrics, Neonatology | ⏳ | ⏳ | ⏳ |
| `vp-0411` | [Khanh P. Nguyen](https://vietprofs.roars.dev/people/vp-0411.html) | Oregon Health & Science University | Surgery, Vascular Surgery | ⏳ | ⏳ | ✅ |
| `vp-0412` | [Khoa A. Nguyen](https://vietprofs.roars.dev/people/vp-0412.html) | Oregon Health & Science University | Medicine, Cardiovascular Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0413` | [Angela-Tu Nguyen](https://vietprofs.roars.dev/people/vp-0413.html) | Oregon Health & Science University | Pediatrics, General Pediatrics | ⏳ | ⏳ | ⏳ |
| `vp-0415` | [Elizabeth Tran](https://vietprofs.roars.dev/people/vp-0415.html) | Purdue University | Biochemistry | ⏳ | ⏳ | ⏳ |
| `vp-0416` | [Thao Bui](https://vietprofs.roars.dev/people/vp-0416.html) | Queens College, City University of New York | Economics | ✅ | ⏳ | ✅ |
| `vp-0417` | [Thanh Tran](https://vietprofs.roars.dev/people/vp-0417.html) | Rice University | Electrical and Computer Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0418` | [Kim-Phuong Le](https://vietprofs.roars.dev/people/vp-0418.html) | Rutgers University | Chemistry and Chemical Biology | ⏳ | ⏳ | ⏳ |
| `vp-0419` | [Yvonne N. Bui](https://vietprofs.roars.dev/people/vp-0419.html) | San Francisco State University | Special Education | ⏳ | ⏳ | ⏳ |
| `vp-0420` | [Minh Pham](https://vietprofs.roars.dev/people/vp-0420.html) | San Francisco State University | Decision Sciences | ⏳ | ⏳ | ⏳ |
| `vp-0421` | [Thuy T. Le](https://vietprofs.roars.dev/people/vp-0421.html) | San Jose State University | Electrical Engineering | ⏳ | ⏳ | ✅ |
| `vp-0422` | [Nicholas Q. Tran](https://vietprofs.roars.dev/people/vp-0422.html) | Santa Clara University | Mathematics and Computer Science | ⏳ | ⏳ | ⏳ |
| `vp-0423` | [Dat Tran, S.J.](https://vietprofs.roars.dev/people/vp-0423.html) | Santa Clara University | Electrical and Computer Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0424` | [Xuan Hy Le](https://vietprofs.roars.dev/people/vp-0424.html) | Seattle University | Psychology | ⏳ | ⏳ | ✅ |
| `vp-0425` | [Nguyen P. Nguyen](https://vietprofs.roars.dev/people/vp-0425.html) | Texas A&M University | Educational Psychology | ⏳ | ⏳ | ⏳ |
| `vp-0426` | [Aurora Le](https://vietprofs.roars.dev/people/vp-0426.html) | Texas A&M University | Health Behavior | ⏳ | ⏳ | ⏳ |
| `vp-0427` | [Minhhuyen T. Nguyen](https://vietprofs.roars.dev/people/vp-0427.html) | Temple University | Medicine | ⏳ | ⏳ | ✅ |
| `vp-0428` | [Phuoc T. Tran](https://vietprofs.roars.dev/people/vp-0428.html) | The University of Texas MD Anderson Cancer Center | Genitourinary Radiation Oncology | ⏳ | ✅ | ✅ |
| `vp-0429` | [Thao P. Bui](https://vietprofs.roars.dev/people/vp-0429.html) | The University of Texas MD Anderson Cancer Center | Anesthesiology and Perioperative Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0430` | [Hop S. Tran Cao](https://vietprofs.roars.dev/people/vp-0430.html) | The University of Texas MD Anderson Cancer Center | Surgical Oncology | ⏳ | ⏳ | ⏳ |
| `vp-0431` | [Quynh-Nhu Nguyen](https://vietprofs.roars.dev/people/vp-0431.html) | The University of Texas MD Anderson Cancer Center | Thoracic Radiation Oncology | ⏳ | ⏳ | ✅ |
| `vp-0432` | [Christopher Nguyen](https://vietprofs.roars.dev/people/vp-0432.html) | The University of Texas MD Anderson Cancer Center | Plastic Surgery | ⏳ | ⏳ | ⏳ |
| `vp-0433` | [Sydney Pham](https://vietprofs.roars.dev/people/vp-0433.html) | The University of Texas MD Anderson Cancer Center | Anesthesiology and Perioperative Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0434` | [An Ngo-Huang](https://vietprofs.roars.dev/people/vp-0434.html) | The University of Texas MD Anderson Cancer Center | Palliative, Rehabilitation, and Integrative Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0435` | [Ngoc Tran](https://vietprofs.roars.dev/people/vp-0435.html) | The University of Texas at Austin | Mathematics | ✅ | ⏳ | ✅ |
| `vp-0436` | [Khanh-Hoa Tran-Ba](https://vietprofs.roars.dev/people/vp-0436.html) | Towson University | Chemistry and Forensic Science | ⏳ | ⏳ | ✅ |
| `vp-0437` | [Khoa Tran](https://vietprofs.roars.dev/people/vp-0437.html) | Tufts University | Biology | ⏳ | ⏳ | ✅ |
| `vp-0438` | [Mai Do](https://vietprofs.roars.dev/people/vp-0438.html) | Tulane University | International Health and Sustainable Development | ⏳ | ⏳ | ⏳ |
| `vp-0439` | [Jeremy Binh Nguyen](https://vietprofs.roars.dev/people/vp-0439.html) | Tulane University | Radiology | ⏳ | ⏳ | ✅ |
| `vp-0440` | [Trung L. Nguyen](https://vietprofs.roars.dev/people/vp-0440.html) | Tulane University | PreK-12 Education | ⏳ | ⏳ | ⏳ |
| `vp-0441` | [Long D. Tran](https://vietprofs.roars.dev/people/vp-0441.html) | UTHealth Houston | General Practice and Dental Public Health | ⏳ | ⏳ | ⏳ |
| `vp-0442` | [Nghi H. Tran](https://vietprofs.roars.dev/people/vp-0442.html) | University of Akron | Electrical and Computer Engineering | ⏳ | ⏳ | ✅ |
| `vp-0443` | [Hung Nguyen - University of Akron](https://vietprofs.roars.dev/people/vp-0443.html) | University of Akron | Mathematics | ⏳ | ⏳ | ⏳ |
| `vp-0444` | [Vu Q. Nguyen - University of Alabama at Birmingham](https://vietprofs.roars.dev/people/vp-0444.html) | University of Alabama at Birmingham | Physical Medicine and Rehabilitation | ⏳ | ⏳ | ✅ |
| `vp-0445` | [Brittany Huynh](https://vietprofs.roars.dev/people/vp-0445.html) | University of Alabama at Birmingham | Pediatrics | ⏳ | ⏳ | ✅ |
| `vp-0446` | [Kelly Nguyen](https://vietprofs.roars.dev/people/vp-0446.html) | University of California, Los Angeles | Classics | ⏳ | ⏳ | ✅ |
| `vp-0447` | [Diu-Huong Nguyen](https://vietprofs.roars.dev/people/vp-0447.html) | University of California, Irvine | History | ⏳ | ⏳ | ✅ |
| `vp-0448` | [Ninh Tuan Nguyen](https://vietprofs.roars.dev/people/vp-0448.html) | University of California, Irvine | Surgery | ⏳ | ⏳ | ✅ |
| `vp-0449` | [Danh V. Nguyen](https://vietprofs.roars.dev/people/vp-0449.html) | University of California, Irvine | Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0450` | [An H. Do](https://vietprofs.roars.dev/people/vp-0450.html) | University of California, Irvine | Neurology | ⏳ | ⏳ | ⏳ |

---

### Batch 10 (vp-0451 – vp-0500, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-0451` | [Linda Trinh Vo](https://vietprofs.roars.dev/people/vp-0451.html) | University of California, Irvine | Asian American Studies | ⏳ | ⏳ | ✅ |
| `vp-0452` | [Thu Elizabeth Duong](https://vietprofs.roars.dev/people/vp-0452.html) | University of California, San Diego | Pediatrics | ⏳ | ⏳ | ✅ |
| `vp-0453` | [Vu Tran](https://vietprofs.roars.dev/people/vp-0453.html) | University of Chicago | English Language and Literature | ⏳ | ⏳ | ✅ |
| `vp-0454` | [Giao Q. Tran](https://vietprofs.roars.dev/people/vp-0454.html) | University of Cincinnati | Psychology | ⏳ | ⏳ | ✅ |
| `vp-0455` | [Alexandra Nguyen](https://vietprofs.roars.dev/people/vp-0455.html) | University of Colorado Boulder | Music | ⏳ | ⏳ | ✅ |
| `vp-0456` | [Cuong Nguyen](https://vietprofs.roars.dev/people/vp-0456.html) | University of Florida | Infectious Diseases and Immunology | ⏳ | ⏳ | ✅ |
| `vp-0457` | [Lien T. Nguyen](https://vietprofs.roars.dev/people/vp-0457.html) | University of Florida | Molecular Genetics and Microbiology | ⏳ | ⏳ | ✅ |
| `vp-0458` | [Minh X. Nguyen](https://vietprofs.roars.dev/people/vp-0458.html) | University of Florida | Radiology | ⏳ | ⏳ | ⏳ |
| `vp-0459` | [Nhu Nguyen - University of Hawaiʻi at Mānoa](https://vietprofs.roars.dev/people/vp-0459.html) | University of Hawaiʻi at Mānoa | Tropical Plant and Soil Sciences | ⏳ | ⏳ | ✅ |
| `vp-0460` | [Lan Chi Nguyen](https://vietprofs.roars.dev/people/vp-0460.html) | University of Houston | Clinical Sciences, College of Optometry | ⏳ | ⏳ | ✅ |
| `vp-0461` | [Ngoc Bui - University of La Verne](https://vietprofs.roars.dev/people/vp-0461.html) | University of La Verne | Psychology | ⏳ | ⏳ | ⏳ |
| `vp-0462` | [Thu Thi Xuan Nguyen](https://vietprofs.roars.dev/people/vp-0462.html) | University of Maryland, College Park | Epidemiology and Biostatistics | ⏳ | ⏳ | ✅ |
| `vp-0463` | [Thao Tran](https://vietprofs.roars.dev/people/vp-0463.html) | University of Massachusetts Lowell | Mathematics and Statistics | ⏳ | ⏳ | ⏳ |
| `vp-0464` | [Albert Nguyen](https://vietprofs.roars.dev/people/vp-0464.html) | University of Memphis | Music | ⏳ | ⏳ | ✅ |
| `vp-0465` | [Lahn Nguyen](https://vietprofs.roars.dev/people/vp-0465.html) | University of Minnesota | Pediatrics | ⏳ | ⏳ | ⏳ |
| `vp-0466` | [Mai Nguyen - University of Minnesota](https://vietprofs.roars.dev/people/vp-0466.html) | University of Minnesota | Orthopaedic Surgery | ⏳ | ⏳ | ✅ |
| `vp-0467` | [Tung Nguyen](https://vietprofs.roars.dev/people/vp-0467.html) | University of North Carolina at Chapel Hill | Orthodontics | ⏳ | ⏳ | ✅ |
| `vp-0468` | [Minh-Huy L. Huynh](https://vietprofs.roars.dev/people/vp-0468.html) | University of Pennsylvania | Radiology | ⏳ | ⏳ | ⏳ |
| `vp-0469` | [Hung Tran - University of South Florida](https://vietprofs.roars.dev/people/vp-0469.html) | University of South Florida | Neurology | ⏳ | ⏳ | ⏳ |
| `vp-0470` | [Johanna Tran](https://vietprofs.roars.dev/people/vp-0470.html) | University of South Florida | Neurology | ⏳ | ⏳ | ⏳ |
| `vp-0471` | [Nam D. Tran](https://vietprofs.roars.dev/people/vp-0471.html) | University of South Florida | Neurology | ⏳ | ⏳ | ⏳ |
| `vp-0472` | [Tuan Vu](https://vietprofs.roars.dev/people/vp-0472.html) | University of South Florida | Neurology | ⏳ | ⏳ | ✅ |
| `vp-0473` | [Liem Thanh Tran](https://vietprofs.roars.dev/people/vp-0473.html) | University of Tennessee, Knoxville | Geography | ⏳ | ⏳ | ⏳ |
| `vp-0474` | [Bau P. Tran](https://vietprofs.roars.dev/people/vp-0474.html) | University of Texas Southwestern Medical Center | Physician Assistant Studies | ⏳ | ⏳ | ✅ |
| `vp-0475` | [Benjamin Nguyen](https://vietprofs.roars.dev/people/vp-0475.html) | University of Texas Southwestern Medical Center | Physical Medicine and Rehabilitation | ⏳ | ⏳ | ⏳ |
| `vp-0476` | [C. Thi Nguyen](https://vietprofs.roars.dev/people/vp-0476.html) | University of Utah | Philosophy | ✅ | ⏳ | ✅ |
| `vp-0477` | [Patricia Nguyen](https://vietprofs.roars.dev/people/vp-0477.html) | University of Virginia | American Studies | ⏳ | ⏳ | ⏳ |
| `vp-0478` | [Anh T. Bui](https://vietprofs.roars.dev/people/vp-0478.html) | Virginia Commonwealth University | Statistical Sciences and Operations Research | ✅ | ⏳ | ✅ |
| `vp-0479` | [Linh Ngo](https://vietprofs.roars.dev/people/vp-0479.html) | West Chester University of Pennsylvania | Computer Science | ⏳ | ⏳ | ✅ |
| `vp-0480` | [Don X. Nguyen](https://vietprofs.roars.dev/people/vp-0480.html) | Yale University | Pathology and Medical Oncology | ⏳ | ⏳ | ✅ |
| `vp-0481` | [Phuong Dao](https://vietprofs.roars.dev/people/vp-0481.html) | The University of Texas at Austin | Integrative Biology | ⏳ | ⏳ | ✅ |
| `vp-0482` | [Bao Chau Ngo](https://vietprofs.roars.dev/people/vp-0482.html) | The University of Hong Kong | Department of Mathematics | ✅ | ⏳ | ✅ |
| `vp-0483` | [Kimberly Kay Hoang](https://vietprofs.roars.dev/people/vp-0483.html) | University of Chicago | Sociology | ⏳ | ⏳ | ✅ |
| `vp-0484` | [T. Minh-ha Trinh](https://vietprofs.roars.dev/people/vp-0484.html) | University of California, Berkeley | Gender and Women's Studies | ⏳ | ⏳ | ✅ |
| `vp-0485` | [Hue-Tam Ho Tai](https://vietprofs.roars.dev/people/vp-0485.html) | Harvard University | History | ⏳ | ⏳ | ✅ |
| `vp-0486` | [Bich-Ngoc Turner](https://vietprofs.roars.dev/people/vp-0486.html) | University of Washington | Asian Languages and Literature | ⏳ | ⏳ | ✅ |
| `vp-0487` | [Nhan Phan-Thien](https://vietprofs.roars.dev/people/vp-0487.html) | National University of Singapore | Mechanical Engineering | ⏳ | ⏳ | ✅ |
| `vp-0488` | [Hai Minh Duong](https://vietprofs.roars.dev/people/vp-0488.html) | National University of Singapore | Mechanical Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0489` | [Han Vinh Huynh](https://vietprofs.roars.dev/people/vp-0489.html) | National University of Singapore | Chemistry | ⏳ | ⏳ | ⏳ |
| `vp-0490` | [Thai Tran](https://vietprofs.roars.dev/people/vp-0490.html) | National University of Singapore | Physiology | ⏳ | ⏳ | ⏳ |
| `vp-0491` | [Toan Thang Phan](https://vietprofs.roars.dev/people/vp-0491.html) | National University of Singapore | Surgery | ⏳ | ⏳ | ⏳ |
| `vp-0492` | [Minh Khuong Vu](https://vietprofs.roars.dev/people/vp-0492.html) | National University of Singapore | Lee Kuan Yew School of Public Policy | ⏳ | ⏳ | ✅ |
| `vp-0493` | [Quang-Cuong Pham](https://vietprofs.roars.dev/people/vp-0493.html) | Nanyang Technological University | Mechanical and Aerospace Engineering | ⏳ | ⏳ | ✅ |
| `vp-0494` | [Tuan Tran - Nanyang Technological University](https://vietprofs.roars.dev/people/vp-0494.html) | Nanyang Technological University | Mechanical and Aerospace Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0495` | [Hung Dinh Nguyen](https://vietprofs.roars.dev/people/vp-0495.html) | Nanyang Technological University | Electrical and Electronic Engineering | ⏳ | ⏳ | ✅ |
| `vp-0496` | [Viet Ha Hoang](https://vietprofs.roars.dev/people/vp-0496.html) | Nanyang Technological University | Mathematical Sciences | ⏳ | ⏳ | ⏳ |
| `vp-0497` | [Tien Mai](https://vietprofs.roars.dev/people/vp-0497.html) | Singapore Management University | Computing and Information Systems | ⏳ | ⏳ | ✅ |
| `vp-0498` | [Don Ta](https://vietprofs.roars.dev/people/vp-0498.html) | Singapore Management University | Computing and Information Systems | ⏳ | ⏳ | ⏳ |
| `vp-0499` | [San H. Thang](https://vietprofs.roars.dev/people/vp-0499.html) | Monash University | School of Chemistry | ⏳ | ✅ | ✅ |
| `vp-0500` | [Dinh Phung](https://vietprofs.roars.dev/people/vp-0500.html) | Monash University | Faculty of Information Technology | ⏳ | ⏳ | ✅ |

---

### Batch 11 (vp-0501 – vp-0550, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-0501` | [Nam-Trung Nguyen](https://vietprofs.roars.dev/people/vp-0501.html) | Griffith University | School of Engineering and Built Environment | ⏳ | ✅ | ✅ |
| `vp-0502` | [Tuan Van Nguyen](https://vietprofs.roars.dev/people/vp-0502.html) | University of Technology Sydney | School of Electrical, Mechanical and Biomedical Engineering | ⏳ | ⏳ | ✅ |
| `vp-0503` | [Nguyen Tran](https://vietprofs.roars.dev/people/vp-0503.html) | The University of Sydney | School of Computer Science | ⏳ | ⏳ | ⏳ |
| `vp-0504` | [Hoang-Phuong Phan](https://vietprofs.roars.dev/people/vp-0504.html) | University of New South Wales | School of Mechanical and Manufacturing Engineering | ⏳ | ✅ | ✅ |
| `vp-0505` | [Hoa Nguyen - University of New South Wales](https://vietprofs.roars.dev/people/vp-0505.html) | University of New South Wales | School of Education | ⏳ | ⏳ | ✅ |
| `vp-0506` | [Son Hoang Dau](https://vietprofs.roars.dev/people/vp-0506.html) | RMIT University | School of Computing Technologies | ⏳ | ⏳ | ✅ |
| `vp-0507` | [Tho Le-Ngoc](https://vietprofs.roars.dev/people/vp-0507.html) | McGill University | Department of Electrical and Computer Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0508` | [Helen Tran](https://vietprofs.roars.dev/people/vp-0508.html) | University of Toronto | Department of Chemistry | ⏳ | ⏳ | ⏳ |
| `vp-0509` | [Nguyen Phong Hoang](https://vietprofs.roars.dev/people/vp-0509.html) | The University of British Columbia | Department of Computer Science | ⏳ | ⏳ | ✅ |
| `vp-0510` | [Ly Vu](https://vietprofs.roars.dev/people/vp-0510.html) | The University of British Columbia | Faculty of Pharmaceutical Sciences | ⏳ | ⏳ | ✅ |
| `vp-0511` | [Duong Bui](https://vietprofs.roars.dev/people/vp-0511.html) | University of Waterloo | Department of Chemistry | ⏳ | ⏳ | ✅ |
| `vp-0512` | [Chinh T. Hoang](https://vietprofs.roars.dev/people/vp-0512.html) | Wilfrid Laurier University | Department of Physics and Computer Science | ⏳ | ⏳ | ✅ |
| `vp-0513` | [Vinh Nguyen - University of Waterloo](https://vietprofs.roars.dev/people/vp-0513.html) | University of Waterloo | Department of English Language and Literature | ⏳ | ⏳ | ✅ |
| `vp-0514` | [Huong Nguyen - McGill University](https://vietprofs.roars.dev/people/vp-0514.html) | McGill University | Department of Plant Science | ⏳ | ⏳ | ✅ |
| `vp-0515` | [Thi Kim Thanh Nguyen](https://vietprofs.roars.dev/people/vp-0515.html) | University College London | Department of Physics and Astronomy | ⏳ | ✅ | ✅ |
| `vp-0516` | [Trung Q. Duong](https://vietprofs.roars.dev/people/vp-0516.html) | Memorial University of Newfoundland | Faculty of Engineering and Applied Science | ⏳ | ✅ | ✅ |
| `vp-0517` | [Xuan-Vinh Doan](https://vietprofs.roars.dev/people/vp-0517.html) | University of Warwick | Warwick Business School | ⏳ | ⏳ | ⏳ |
| `vp-0518` | [Phung Dao](https://vietprofs.roars.dev/people/vp-0518.html) | University of Cambridge | Faculty of Education | ⏳ | ⏳ | ✅ |
| `vp-0519` | [Van Tan Le](https://vietprofs.roars.dev/people/vp-0519.html) | University of Oxford | Nuffield Department of Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0520` | [Vuong Phan](https://vietprofs.roars.dev/people/vp-0520.html) | University of Southampton | School of Mathematical Sciences | ⏳ | ⏳ | ✅ |
| `vp-0521` | [Tien Zung Nguyen](https://vietprofs.roars.dev/people/vp-0521.html) | Université Toulouse III - Paul Sabatier | Institut de Mathématiques de Toulouse | ⏳ | ⏳ | ⏳ |
| `vp-0522` | [Duong Hieu Phan](https://vietprofs.roars.dev/people/vp-0522.html) | Télécom Paris | Computer Science and Networks | ⏳ | ⏳ | ✅ |
| `vp-0523` | [Phu Nguyen-Van](https://vietprofs.roars.dev/people/vp-0523.html) | Université Paris Nanterre | EconomiX (Department of Economics) | ⏳ | ⏳ | ✅ |
| `vp-0524` | [Viet Hung Nguyen](https://vietprofs.roars.dev/people/vp-0524.html) | Université Clermont Auvergne | Laboratoire d'Informatique, de Modélisation et d'Optimisation des Systèmes (LIMOS) | ✅ | ⏳ | ✅ |
| `vp-0525` | [Kim Nguyen](https://vietprofs.roars.dev/people/vp-0525.html) | Université Paris-Saclay | Laboratoire Méthodes Formelles (Computer Science) | ✅ | ⏳ | ✅ |
| `vp-0526` | [Phong Nguyen - École Normale Supérieure PSL](https://vietprofs.roars.dev/people/vp-0526.html) | École Normale Supérieure PSL | Département d'Informatique | ⏳ | ⏳ | ✅ |
| `vp-0527` | [Suong Nguyen](https://vietprofs.roars.dev/people/vp-0527.html) | École Polytechnique Fédérale de Lausanne | Institute of Chemical Sciences and Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0528` | [Minh Quang Tran](https://vietprofs.roars.dev/people/vp-0528.html) | École Polytechnique Fédérale de Lausanne | Institute of Physics | ⏳ | ⏳ | ✅ |
| `vp-0529` | [Kevin Pham](https://vietprofs.roars.dev/people/vp-0529.html) | University of Amsterdam | Department of Political Science | ⏳ | ⏳ | ✅ |
| `vp-0530` | [Minh Tho Nguyen](https://vietprofs.roars.dev/people/vp-0530.html) | KU Leuven | Department of Chemistry | ⏳ | ⏳ | ✅ |
| `vp-0531` | [Ngoc Thanh Nguyen](https://vietprofs.roars.dev/people/vp-0531.html) | Wrocław University of Science and Technology | Department of Applied Informatics | ⏳ | ⏳ | ✅ |
| `vp-0532` | [Le Minh Nguyen](https://vietprofs.roars.dev/people/vp-0532.html) | Japan Advanced Institute of Science and Technology | School of Information Science | ⏳ | ⏳ | ⏳ |
| `vp-0533` | [Tu Bao Ho](https://vietprofs.roars.dev/people/vp-0533.html) | Japan Advanced Institute of Science and Technology | School of Information Science | ⏳ | ⏳ | ⏳ |
| `vp-0534` | [Viet Anh Nguyen](https://vietprofs.roars.dev/people/vp-0534.html) | The Chinese University of Hong Kong | Department of Systems Engineering and Engineering Management | ⏳ | ⏳ | ✅ |
| `vp-0535` | [Le Bin Ho](https://vietprofs.roars.dev/people/vp-0535.html) | Tohoku University | Frontier Research Institute for Interdisciplinary Sciences | ⏳ | ⏳ | ✅ |
| `vp-0536` | [Tuan Q. Phan](https://vietprofs.roars.dev/people/vp-0536.html) | The University of Hong Kong | HKU Business School | ⏳ | ⏳ | ✅ |
| `vp-0537` | [Xuan-Bach Le](https://vietprofs.roars.dev/people/vp-0537.html) | University of Melbourne | School of Computing and Information Systems | ✅ | ⏳ | ✅ |
| `vp-0538` | [Ha Hong Bui](https://vietprofs.roars.dev/people/vp-0538.html) | Monash University | Department of Civil and Environmental Engineering | ⏳ | ⏳ | ✅ |
| `vp-0539` | [Tuan Ngo](https://vietprofs.roars.dev/people/vp-0539.html) | University of Melbourne | Department of Infrastructure Engineering | ⏳ | ✅ | ✅ |
| `vp-0540` | [Minh-Ngoc Tran](https://vietprofs.roars.dev/people/vp-0540.html) | The University of Sydney | Discipline of Business Analytics | ⏳ | ⏳ | ⏳ |
| `vp-0541` | [Thuc Duy Le](https://vietprofs.roars.dev/people/vp-0541.html) | Adelaide University | School of Computer and Mathematical Sciences | ⏳ | ⏳ | ⏳ |
| `vp-0542` | [Duc Truong Pham](https://vietprofs.roars.dev/people/vp-0542.html) | University of Birmingham | Department of Mechanical Engineering | ⏳ | ⏳ | ✅ |
| `vp-0543` | [Le-Nam Tran](https://vietprofs.roars.dev/people/vp-0543.html) | University College Dublin | School of Electrical and Electronic Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0544` | [Anh Khoa Doan](https://vietprofs.roars.dev/people/vp-0544.html) | Delft University of Technology | Faculty of Aerospace Engineering | ✅ | ⏳ | ✅ |
| `vp-0545` | [Van-Thanh-Van Nguyen](https://vietprofs.roars.dev/people/vp-0545.html) | McGill University | Department of Civil Engineering and Applied Mechanics | ⏳ | ⏳ | ✅ |
| `vp-0546` | [Long Nghiem](https://vietprofs.roars.dev/people/vp-0546.html) | University of Technology Sydney | School of Civil and Environmental Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0547` | [Duong Tuan Hoang](https://vietprofs.roars.dev/people/vp-0547.html) | University of Technology Sydney | School of Electrical and Data Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0548` | [Diep N. Nguyen](https://vietprofs.roars.dev/people/vp-0548.html) | University of Technology Sydney | School of Electrical and Data Engineering | ⏳ | ⏳ | ✅ |
| `vp-0549` | [Quang Ha](https://vietprofs.roars.dev/people/vp-0549.html) | University of Technology Sydney | School of Electrical, Mechanical and Mechatronic Systems | ⏳ | ⏳ | ✅ |
| `vp-0550` | [Sonny Pham](https://vietprofs.roars.dev/people/vp-0550.html) | Curtin University | School of Electrical Engineering, Computing and Mathematical Sciences | ⏳ | ⏳ | ⏳ |

---

### Batch 12 (vp-0551 – vp-0600, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-0551` | [Minh Nguyen - Auckland University of Technology](https://vietprofs.roars.dev/people/vp-0551.html) | Auckland University of Technology | Department of Computer and Information Sciences | ⏳ | ⏳ | ⏳ |
| `vp-0552` | [Kenneth Tran](https://vietprofs.roars.dev/people/vp-0552.html) | The University of Auckland | Auckland Bioengineering Institute | ⏳ | ⏳ | ⏳ |
| `vp-0553` | [Gia Khanh Tran](https://vietprofs.roars.dev/people/vp-0553.html) | Tokyo Institute of Technology | Department of Electrical and Electronic Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0554` | [Duc-Manh Nguyen](https://vietprofs.roars.dev/people/vp-0554.html) | Université de Tours | Département de Mathématiques | ⏳ | ⏳ | ⏳ |
| `vp-0555` | [Viet-Chi Tran](https://vietprofs.roars.dev/people/vp-0555.html) | Université Gustave Eiffel | Laboratoire d’Analyse et de Mathématiques Appliquées | ⏳ | ⏳ | ✅ |
| `vp-0556` | [Dinh-Tuan Pham](https://vietprofs.roars.dev/people/vp-0556.html) | Université Grenoble Alpes | Laboratoire Jean Kuntzmann (Applied Mathematics) | ⏳ | ⏳ | ⏳ |
| `vp-0557` | [Quang Minh Bui](https://vietprofs.roars.dev/people/vp-0557.html) | Australian National University | School of Computing | ⏳ | ⏳ | ⏳ |
| `vp-0558` | [Minh Hoai Nguyen](https://vietprofs.roars.dev/people/vp-0558.html) | Adelaide University | Australian Institute for Machine Learning | ⏳ | ⏳ | ⏳ |
| `vp-0559` | [Thanh-Toan Do](https://vietprofs.roars.dev/people/vp-0559.html) | Monash University | Department of Data Science and AI | ⏳ | ⏳ | ✅ |
| `vp-0560` | [Trung Le](https://vietprofs.roars.dev/people/vp-0560.html) | Monash University | Department of Data Science and AI | ⏳ | ⏳ | ✅ |
| `vp-0561` | [Van-Thuan Pham](https://vietprofs.roars.dev/people/vp-0561.html) | University of Melbourne | School of Computing and Information Systems | ⏳ | ⏳ | ⏳ |
| `vp-0562` | [Quang Vinh Nguyen](https://vietprofs.roars.dev/people/vp-0562.html) | Western Sydney University | School of Computer, Data and Mathematical Sciences | ⏳ | ⏳ | ✅ |
| `vp-0563` | [Dong Nguyen - Utrecht University](https://vietprofs.roars.dev/people/vp-0563.html) | Utrecht University | Department of Information and Computing Sciences | ⏳ | ⏳ | ✅ |
| `vp-0564` | [Duc Viet Le](https://vietprofs.roars.dev/people/vp-0564.html) | University of Twente | Department of Computer Science | ⏳ | ⏳ | ✅ |
| `vp-0565` | [Duc-Tien Dang-Nguyen](https://vietprofs.roars.dev/people/vp-0565.html) | University of Bergen | Department of Information Science and Media Studies | ⏳ | ⏳ | ✅ |
| `vp-0566` | [Hoai Phuong Ha](https://vietprofs.roars.dev/people/vp-0566.html) | UiT The Arctic University of Norway | Department of Computer Science | ⏳ | ⏳ | ✅ |
| `vp-0567` | [Hien Quoc Ngo](https://vietprofs.roars.dev/people/vp-0567.html) | Queen's University Belfast | School of Electronics, Electrical Engineering and Computer Science | ⏳ | ⏳ | ✅ |
| `vp-0568` | [Ngoc Khanh Nguyen](https://vietprofs.roars.dev/people/vp-0568.html) | King's College London | Department of Informatics | ⏳ | ⏳ | ⏳ |
| `vp-0569` | [Thai Son Hoang](https://vietprofs.roars.dev/people/vp-0569.html) | University of Southampton | School of Electronics and Computer Science | ⏳ | ⏳ | ✅ |
| `vp-0570` | [Ngoc Thang Vu](https://vietprofs.roars.dev/people/vp-0570.html) | University of Stuttgart | Institute for Natural Language Processing | ⏳ | ⏳ | ✅ |
| `vp-0571` | [Van Bang Le](https://vietprofs.roars.dev/people/vp-0571.html) | University of Rostock | Institute of Computer Science | ⏳ | ⏳ | ⏳ |
| `vp-0572` | [Hung Son Nguyen](https://vietprofs.roars.dev/people/vp-0572.html) | University of Warsaw | Faculty of Mathematics, Informatics, and Mechanics | ⏳ | ⏳ | ⏳ |
| `vp-0573` | [Linh Anh Nguyen](https://vietprofs.roars.dev/people/vp-0573.html) | University of Warsaw | Faculty of Mathematics, Informatics, and Mechanics | ⏳ | ⏳ | ⏳ |
| `vp-0574` | [Hung Viet Pham](https://vietprofs.roars.dev/people/vp-0574.html) | York University | Department of Electrical Engineering and Computer Science | ✅ | ⏳ | ✅ |
| `vp-0575` | [Tien D. Bui](https://vietprofs.roars.dev/people/vp-0575.html) | Concordia University | Department of Computer Science and Software Engineering | ⏳ | ⏳ | ✅ |
| `vp-0576` | [Tien Tuan Anh Dinh](https://vietprofs.roars.dev/people/vp-0576.html) | Singapore University of Technology and Design | Information Systems Technology and Design Pillar | ✅ | ✅ | ✅ |
| `vp-0577` | [Nathalie Nguyen](https://vietprofs.roars.dev/people/vp-0577.html) | Monash University | School of Languages, Literatures, Cultures and Linguistics | ⏳ | ⏳ | ✅ |
| `vp-0578` | [Cuc Nguyen](https://vietprofs.roars.dev/people/vp-0578.html) | University of Melbourne | Melbourne Graduate School of Education | ⏳ | ⏳ | ⏳ |
| `vp-0579` | [Thanh Pham](https://vietprofs.roars.dev/people/vp-0579.html) | Monash University | School of Curriculum, Student Learning and Teacher Education | ⏳ | ⏳ | ✅ |
| `vp-0580` | [Nga Pham](https://vietprofs.roars.dev/people/vp-0580.html) | Monash University | Monash Centre for Financial Studies | ⏳ | ⏳ | ✅ |
| `vp-0581` | [Alex Nguyen Ba](https://vietprofs.roars.dev/people/vp-0581.html) | University of Toronto | Department of Cell & Systems Biology | ⏳ | ⏳ | ✅ |
| `vp-0582` | [Long Nguyen](https://vietprofs.roars.dev/people/vp-0582.html) | University of Toronto | Department of Medical Biophysics | ⏳ | ⏳ | ✅ |
| `vp-0583` | [Binh Tran-Nam](https://vietprofs.roars.dev/people/vp-0583.html) | UNSW Sydney | School of Accounting, Auditing and Taxation | ⏳ | ⏳ | ✅ |
| `vp-0584` | [Honghi Tran](https://vietprofs.roars.dev/people/vp-0584.html) | University of Toronto | Department of Chemical Engineering & Applied Chemistry | ⏳ | ⏳ | ⏳ |
| `vp-0585` | [Thanh Tran-Cong](https://vietprofs.roars.dev/people/vp-0585.html) | University of Southern Queensland | School of Engineering | ⏳ | ⏳ | ✅ |
| `vp-0586` | [Minh-Hiên Lê](https://vietprofs.roars.dev/people/vp-0586.html) | University of Toronto | Leslie Dan Faculty of Pharmacy | ⏳ | ⏳ | ✅ |
| `vp-0587` | [Christine Tran](https://vietprofs.roars.dev/people/vp-0587.html) | University of Toronto | Institute of Communication, Culture, Information and Technology | ⏳ | ⏳ | ⏳ |
| `vp-0588` | [Jennifer Nguyen](https://vietprofs.roars.dev/people/vp-0588.html) | The University of British Columbia | Department of Family Practice | ⏳ | ⏳ | ✅ |
| `vp-0589` | [Hung Nguyen - University of Technology Sydney](https://vietprofs.roars.dev/people/vp-0589.html) | University of Technology Sydney | School of Biomedical Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0590` | [Ngoc Son Bui](https://vietprofs.roars.dev/people/vp-0590.html) | University of Oxford | Faculty of Law | ⏳ | ⏳ | ✅ |
| `vp-0591` | [Bang Dang Nguyen](https://vietprofs.roars.dev/people/vp-0591.html) | University of Cambridge | Cambridge Judge Business School | ⏳ | ⏳ | ⏳ |
| `vp-0592` | [Minh-Son Pham](https://vietprofs.roars.dev/people/vp-0592.html) | Imperial College London | Department of Materials | ⏳ | ⏳ | ✅ |
| `vp-0593` | [Huyen Nguyen - King's College London](https://vietprofs.roars.dev/people/vp-0593.html) | King's College London | Department of Accounting and Financial Management | ⏳ | ⏳ | ⏳ |
| `vp-0594` | [Tri-Dung Nguyen](https://vietprofs.roars.dev/people/vp-0594.html) | University of Kent | Kent Business School | ⏳ | ⏳ | ✅ |
| `vp-0595` | [Khuong An Nguyen](https://vietprofs.roars.dev/people/vp-0595.html) | Royal Holloway, University of London | Department of Computer Science | ⏳ | ⏳ | ✅ |
| `vp-0596` | [Hoang Nga Nguyen](https://vietprofs.roars.dev/people/vp-0596.html) | Swansea University | Computer Science | ⏳ | ⏳ | ✅ |
| `vp-0597` | [Anh Nguyen - University of Liverpool](https://vietprofs.roars.dev/people/vp-0597.html) | University of Liverpool | School of Computer Science and Informatics | ⏳ | ⏳ | ⏳ |
| `vp-0598` | [Hoa Le Minh](https://vietprofs.roars.dev/people/vp-0598.html) | Northumbria University | School of Engineering, Physics and Mathematics | ⏳ | ⏳ | ✅ |
| `vp-0599` | [Vu Trinh](https://vietprofs.roars.dev/people/vp-0599.html) | Newcastle University | Newcastle University Business School | ⏳ | ⏳ | ✅ |
| `vp-0600` | [Dong Nguyen - University of Macau](https://vietprofs.roars.dev/people/vp-0600.html) | University of Macau | Faculty of Education | ⏳ | ⏳ | ✅ |

---

### Batch 13 (vp-0601 – vp-0651, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-0601` | [Yen Dang](https://vietprofs.roars.dev/people/vp-0601.html) | University of Leeds | School of Education | ⏳ | ⏳ | ✅ |
| `vp-0602` | [Hoa Do](https://vietprofs.roars.dev/people/vp-0602.html) | University of Leicester | School of Management | ⏳ | ⏳ | ⏳ |
| `vp-0603` | [Quyen Nguyen](https://vietprofs.roars.dev/people/vp-0603.html) | University of Reading | Henley Business School | ⏳ | ⏳ | ✅ |
| `vp-0604` | [Linh Hoai Nguyen](https://vietprofs.roars.dev/people/vp-0604.html) | University of St Andrews | University of St Andrews Business School | ⏳ | ⏳ | ✅ |
| `vp-0605` | [Hoang Nguyen - Heriot-Watt University](https://vietprofs.roars.dev/people/vp-0605.html) | Heriot-Watt University | Edinburgh Business School | ⏳ | ⏳ | ✅ |
| `vp-0606` | [Mai Nguyen - Manchester Metropolitan University](https://vietprofs.roars.dev/people/vp-0606.html) | Manchester Metropolitan University | Department of Languages, Information and Communications | ⏳ | ⏳ | ✅ |
| `vp-0607` | [Chi Hieu Le](https://vietprofs.roars.dev/people/vp-0607.html) | University of Greenwich | School of Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0608` | [Hai Nguyen](https://vietprofs.roars.dev/people/vp-0608.html) | University of Greenwich | School of Management and Marketing | ⏳ | ⏳ | ⏳ |
| `vp-0609` | [Tuan T. Nguyen](https://vietprofs.roars.dev/people/vp-0609.html) | University of Greenwich | School of Computing and Mathematical Sciences | ⏳ | ⏳ | ⏳ |
| `vp-0610` | [Chau Duong](https://vietprofs.roars.dev/people/vp-0610.html) | University of East London | Department of Business, Entrepreneurship and Finance | ⏳ | ⏳ | ⏳ |
| `vp-0611` | [Tam Nguyen - Nottingham Trent University](https://vietprofs.roars.dev/people/vp-0611.html) | Nottingham Trent University | Department of Accounting and Finance | ⏳ | ⏳ | ⏳ |
| `vp-0612` | [Thao Ngoc Nguyen](https://vietprofs.roars.dev/people/vp-0612.html) | Nottingham Trent University | Department of Accounting and Finance | ⏳ | ⏳ | ⏳ |
| `vp-0613` | [Hai Dang Nguyen - Nottingham Trent University](https://vietprofs.roars.dev/people/vp-0613.html) | Nottingham Trent University | Nottingham Business School | ⏳ | ⏳ | ⏳ |
| `vp-0614` | [Thuy Nguyen](https://vietprofs.roars.dev/people/vp-0614.html) | University of Northampton | School of Accounting, Analytics and Finance | ⏳ | ⏳ | ✅ |
| `vp-0615` | [Nguyen Viet Dang](https://vietprofs.roars.dev/people/vp-0615.html) | Université de Strasbourg | Institut de Recherche Mathématique Avancée | ✅ | ⏳ | ✅ |
| `vp-0616` | [Nguyen Bac Dang](https://vietprofs.roars.dev/people/vp-0616.html) | Université Paris-Saclay | Laboratoire de Mathématiques d'Orsay | ⏳ | ⏳ | ✅ |
| `vp-0617` | [Ngoc Diep Lai](https://vietprofs.roars.dev/people/vp-0617.html) | École Normale Supérieure Paris-Saclay | Department of Physics | ⏳ | ⏳ | ✅ |
| `vp-0618` | [Quoc-Nghi Pham](https://vietprofs.roars.dev/people/vp-0618.html) | Université Paris-Saclay | Institut de Chimie Moléculaire et des Matériaux d'Orsay | ⏳ | ⏳ | ⏳ |
| `vp-0619` | [Thuy Tran](https://vietprofs.roars.dev/people/vp-0619.html) | Université Paris-Saclay | Institut Galien Paris-Saclay (Biopharmaceutical & Health Sciences) | ⏳ | ⏳ | ✅ |
| `vp-0620` | [Linh Tran-Dieu](https://vietprofs.roars.dev/people/vp-0620.html) | Université Paris-Saclay | RITM (Economics & Management), Faculté Jean Monnet | ⏳ | ⏳ | ✅ |
| `vp-0621` | [Quang-Trung Luu](https://vietprofs.roars.dev/people/vp-0621.html) | CentraleSupélec | Laboratoire des Signaux et Systèmes (Engineering) | ⏳ | ⏳ | ⏳ |
| `vp-0622` | [Van-Tam Nguyen](https://vietprofs.roars.dev/people/vp-0622.html) | Télécom Paris | Computer Science and Networks Department | ⏳ | ⏳ | ⏳ |
| `vp-0623` | [Viet Khoa Tran Nguyen](https://vietprofs.roars.dev/people/vp-0623.html) | Université Paris Cité | Unité de Biologie Fonctionnelle et Adaptative | ⏳ | ⏳ | ✅ |
| `vp-0624` | [Thi Thu Trang Do](https://vietprofs.roars.dev/people/vp-0624.html) | Université Paris Cité | Department of East Asian Languages and Civilizations | ⏳ | ⏳ | ⏳ |
| `vp-0625` | [Hai Son Nguyen](https://vietprofs.roars.dev/people/vp-0625.html) | École Centrale de Lyon | Institut des Nanotechnologies de Lyon | ✅ | ⏳ | ✅ |
| `vp-0626` | [Thanh Mai Pham Ngoc](https://vietprofs.roars.dev/people/vp-0626.html) | Université Sorbonne Paris Nord | Laboratoire Analyse, Géométrie et Applications | ⏳ | ⏳ | ⏳ |
| `vp-0627` | [Thanh-Phuong Nguyen](https://vietprofs.roars.dev/people/vp-0627.html) | Université Côte d'Azur | Laboratoire d'Informatique, Signaux et Systèmes de Sophia Antipolis (I3S) | ⏳ | ⏳ | ✅ |
| `vp-0628` | [Thach Ngoc Dinh](https://vietprofs.roars.dev/people/vp-0628.html) | Conservatoire National des Arts et Métiers | Computer Science and Digital Technologies | ⏳ | ⏳ | ⏳ |
| `vp-0629` | [Kim Phuc Tran](https://vietprofs.roars.dev/people/vp-0629.html) | University of Lille | ENSAIT / GEMTEX Laboratory (Textile Engineering) | ⏳ | ⏳ | ✅ |
| `vp-0630` | [Liem Nguyen - ESSEC Business School](https://vietprofs.roars.dev/people/vp-0630.html) | ESSEC Business School | Management Department | ⏳ | ⏳ | ⏳ |
| `vp-0631` | [Cam Thi Doan](https://vietprofs.roars.dev/people/vp-0631.html) | Institut National des Langues et Civilisations Orientales | Department of Southeast Asia and the Pacific | ⏳ | ⏳ | ✅ |
| `vp-0632` | [Thành Nam Phan](https://vietprofs.roars.dev/people/vp-0632.html) | Ludwig Maximilian University of Munich | Mathematical Institute | ✅ | ⏳ | ✅ |
| `vp-0633` | [Giang T. Nguyen](https://vietprofs.roars.dev/people/vp-0633.html) | TU Dresden | Faculty of Electrical and Computer Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0634` | [Giang Nghiem](https://vietprofs.roars.dev/people/vp-0634.html) | Leibniz University Hannover | Institute of Money and International Finance | ⏳ | ⏳ | ⏳ |
| `vp-0635` | [Lan Nguyen](https://vietprofs.roars.dev/people/vp-0635.html) | Utrecht University | Department of International and European Law | ⏳ | ⏳ | ✅ |
| `vp-0636` | [Dennis Nguyen](https://vietprofs.roars.dev/people/vp-0636.html) | Utrecht University | Department of Media and Culture Studies | ⏳ | ⏳ | ✅ |
| `vp-0637` | [Ngoc Hân Nguyen](https://vietprofs.roars.dev/people/vp-0637.html) | University of Groningen | Department of Human Resource Management and Organizational Behaviour | ⏳ | ⏳ | ✅ |
| `vp-0638` | [Phuong H. Nguyen](https://vietprofs.roars.dev/people/vp-0638.html) | Eindhoven University of Technology | Department of Electrical Engineering | ⏳ | ⏳ | ✅ |
| `vp-0639` | [Quynh Nguyen](https://vietprofs.roars.dev/people/vp-0639.html) | University of Bern | Institute of Political Science | ⏳ | ⏳ | ✅ |
| `vp-0640` | [James Nguyen](https://vietprofs.roars.dev/people/vp-0640.html) | Stockholm University | Department of Philosophy | ⏳ | ⏳ | ✅ |
| `vp-0641` | [Nhung Tuyet Tran](https://vietprofs.roars.dev/people/vp-0641.html) | University of Toronto | Department of History | ⏳ | ⏳ | ✅ |
| `vp-0642` | [Thy Phu](https://vietprofs.roars.dev/people/vp-0642.html) | University of Toronto | Department of Arts, Culture and Media | ⏳ | ⏳ | ✅ |
| `vp-0643` | [John Tran](https://vietprofs.roars.dev/people/vp-0643.html) | University of Toronto | Division of Anatomy, Department of Surgery | ⏳ | ⏳ | ✅ |
| `vp-0644` | [Jason Nguyen](https://vietprofs.roars.dev/people/vp-0644.html) | University of Toronto | John H. Daniels Faculty of Architecture, Landscape, and Design | ⏳ | ⏳ | ⏳ |
| `vp-0645` | [Martino Tran](https://vietprofs.roars.dev/people/vp-0645.html) | The University of British Columbia | School of Community and Regional Planning | ⏳ | ✅ | ✅ |
| `vp-0646` | [Kim Chi Nguyen](https://vietprofs.roars.dev/people/vp-0646.html) | The University of British Columbia | Division of Medical Oncology | ⏳ | ⏳ | ✅ |
| `vp-0647` | [Tu Nguyen - University of Waterloo](https://vietprofs.roars.dev/people/vp-0647.html) | University of Waterloo | School of Accounting and Finance | ⏳ | ⏳ | ✅ |
| `vp-0649` | [Dao Nguyen](https://vietprofs.roars.dev/people/vp-0649.html) | McGill University | Department of Medicine / Microbiology and Immunology | ⏳ | ✅ | ✅ |
| `vp-0650` | [Lily H. P. Nguyen](https://vietprofs.roars.dev/people/vp-0650.html) | McGill University | Department of Otolaryngology - Head and Neck Surgery | ⏳ | ⏳ | ✅ |
| `vp-0651` | [Thomas T. Nguyen](https://vietprofs.roars.dev/people/vp-0651.html) | McGill University | Faculty of Dental Medicine and Oral Health Sciences | ✅ | ⏳ | ✅ |

---

### Batch 14 (vp-0652 – vp-0702, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-0652` | [Tuong Vi Nguyen](https://vietprofs.roars.dev/people/vp-0652.html) | McGill University | Department of Psychiatry | ⏳ | ⏳ | ✅ |
| `vp-0653` | [Peter V. Nguyen](https://vietprofs.roars.dev/people/vp-0653.html) | University of Alberta | Department of Physiology | ⏳ | ⏳ | ⏳ |
| `vp-0654` | [Thanh Binh Nguyen](https://vietprofs.roars.dev/people/vp-0654.html) | University of Ottawa | Department of Radiology | ⏳ | ⏳ | ⏳ |
| `vp-0655` | [Minh Dang Nguyen](https://vietprofs.roars.dev/people/vp-0655.html) | University of Calgary | Department of Clinical Neurosciences | ⏳ | ⏳ | ✅ |
| `vp-0656` | [Tuan Trang](https://vietprofs.roars.dev/people/vp-0656.html) | University of Calgary | Faculty of Veterinary Medicine | ⏳ | ⏳ | ✅ |
| `vp-0657` | [Vivian Nguyen](https://vietprofs.roars.dev/people/vp-0657.html) | Carleton University | Department of Biology | ⏳ | ⏳ | ✅ |
| `vp-0658` | [Xuan Thuy Nguyen](https://vietprofs.roars.dev/people/vp-0658.html) | Carleton University | Institute of Interdisciplinary Studies (Disability & Inclusive Education) | ⏳ | ⏳ | ✅ |
| `vp-0659` | [Nhat Truong Nguyen](https://vietprofs.roars.dev/people/vp-0659.html) | Concordia University | Department of Chemical and Materials Engineering | ⏳ | ⏳ | ✅ |
| `vp-0660` | [Hoa Nguyen - Toronto Metropolitan University](https://vietprofs.roars.dev/people/vp-0660.html) | Toronto Metropolitan University | Department of English | ✅ | ⏳ | ✅ |
| `vp-0661` | [Dang Khoa Nguyen](https://vietprofs.roars.dev/people/vp-0661.html) | Université de Montréal | Département de neurosciences | ⏳ | ⏳ | ✅ |
| `vp-0662` | [Bich Ngoc Nguyen](https://vietprofs.roars.dev/people/vp-0662.html) | Université de Montréal | Département de pathologie et biologie cellulaire | ⏳ | ⏳ | ⏳ |
| `vp-0663` | [Caroline Nguyen Ngoc](https://vietprofs.roars.dev/people/vp-0663.html) | Université de Montréal | Département de dentisterie de restauration | ⏳ | ⏳ | ⏳ |
| `vp-0664` | [Chau Pham](https://vietprofs.roars.dev/people/vp-0664.html) | University of Manitoba | Department of Emergency Medicine | ⏳ | ⏳ | ✅ |
| `vp-0665` | [Nam Long Nguyen](https://vietprofs.roars.dev/people/vp-0665.html) | National University of Singapore | Department of Biochemistry, Yong Loo Lin School of Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0666` | [Thi Nguyet Minh Le](https://vietprofs.roars.dev/people/vp-0666.html) | National University of Singapore | Pharmacology | ⏳ | ⏳ | ⏳ |
| `vp-0667` | [Anh Tuan Phan](https://vietprofs.roars.dev/people/vp-0667.html) | Nanyang Technological University | School of Physical and Mathematical Sciences | ✅ | ⏳ | ✅ |
| `vp-0668` | [Cuong Dang](https://vietprofs.roars.dev/people/vp-0668.html) | Nanyang Technological University | School of Electrical and Electronic Engineering | ⏳ | ⏳ | ✅ |
| `vp-0669` | [Li Nguyen](https://vietprofs.roars.dev/people/vp-0669.html) | Nanyang Technological University | Linguistics and Multilingual Studies, School of Humanities | ⏳ | ⏳ | ⏳ |
| `vp-0670` | [Thi Qui Nguyen](https://vietprofs.roars.dev/people/vp-0670.html) | Singapore Institute of Technology | Engineering Cluster | ⏳ | ⏳ | ⏳ |
| `vp-0671` | [Vinh Q. Nguyen - The University of Hong Kong](https://vietprofs.roars.dev/people/vp-0671.html) | The University of Hong Kong | HKU Business School | ⏳ | ⏳ | ⏳ |
| `vp-0672` | [Quoc-Anh Do](https://vietprofs.roars.dev/people/vp-0672.html) | Monash University | Department of Economics | ⏳ | ⏳ | ⏳ |
| `vp-0673` | [Lan K. Nguyen](https://vietprofs.roars.dev/people/vp-0673.html) | Monash University | Department of Biochemistry and Molecular Biology | ⏳ | ⏳ | ✅ |
| `vp-0674` | [Van Nguyen](https://vietprofs.roars.dev/people/vp-0674.html) | Monash University | School of Nursing and Midwifery | ⏳ | ⏳ | ✅ |
| `vp-0675` | [Viet Hoang Nguyen](https://vietprofs.roars.dev/people/vp-0675.html) | University of Melbourne | Melbourne Institute: Applied Economic & Social Research | ⏳ | ⏳ | ⏳ |
| `vp-0676` | [Kieu-Trang Nguyen](https://vietprofs.roars.dev/people/vp-0676.html) | University of Melbourne | Department of Economics | ✅ | ⏳ | ✅ |
| `vp-0677` | [Linh Nguyen](https://vietprofs.roars.dev/people/vp-0677.html) | University of Melbourne | Department of Finance | ⏳ | ⏳ | ⏳ |
| `vp-0678` | [Christine Nguyen - University of Melbourne](https://vietprofs.roars.dev/people/vp-0678.html) | University of Melbourne | Department of Optometry and Vision Sciences | ⏳ | ⏳ | ⏳ |
| `vp-0679` | [Bao Nguyen](https://vietprofs.roars.dev/people/vp-0679.html) | University of Melbourne | Department of Optometry and Vision Sciences | ⏳ | ⏳ | ⏳ |
| `vp-0680` | [Helena Nguyen](https://vietprofs.roars.dev/people/vp-0680.html) | The University of Sydney | Discipline of Work and Organisational Studies | ⏳ | ⏳ | ✅ |
| `vp-0681` | [Nam Ho-Nguyen](https://vietprofs.roars.dev/people/vp-0681.html) | The University of Sydney | School of Business Analytics and Marketing | ✅ | ⏳ | ✅ |
| `vp-0682` | [Vinh Nguyen - UNSW Sydney](https://vietprofs.roars.dev/people/vp-0682.html) | UNSW Sydney | School of Chemistry | ⏳ | ⏳ | ✅ |
| `vp-0683` | [Hoa Nguyen - Australian National University](https://vietprofs.roars.dev/people/vp-0683.html) | Australian National University | Arndt-Corden Department of Economics, Crawford School of Public Policy | ⏳ | ⏳ | ✅ |
| `vp-0684` | [Anh Nguyen - The University of Queensland](https://vietprofs.roars.dev/people/vp-0684.html) | The University of Queensland | School of Chemical Engineering | ⏳ | ⏳ | ✅ |
| `vp-0685` | [Vinh Dao](https://vietprofs.roars.dev/people/vp-0685.html) | The University of Queensland | School of Civil Engineering | ⏳ | ⏳ | ✅ |
| `vp-0686` | [Dung Phung](https://vietprofs.roars.dev/people/vp-0686.html) | The University of Queensland | School of Public Health | ⏳ | ⏳ | ✅ |
| `vp-0687` | [Phong Thai](https://vietprofs.roars.dev/people/vp-0687.html) | The University of Queensland | School of Pharmacy and Pharmaceutical Sciences | ⏳ | ⏳ | ✅ |
| `vp-0688` | [Ngoc Nguyen](https://vietprofs.roars.dev/people/vp-0688.html) | The University of Queensland | School of Chemical Engineering | ⏳ | ⏳ | ✅ |
| `vp-0689` | [Thao Nguyen](https://vietprofs.roars.dev/people/vp-0689.html) | Adelaide University | School of Dentistry | ⏳ | ⏳ | ⏳ |
| `vp-0690` | [Natalie (Nhung) Le](https://vietprofs.roars.dev/people/vp-0690.html) | University of Melbourne | Department of Finance | ⏳ | ⏳ | ⏳ |
| `vp-0691` | [Quinn Nguyen](https://vietprofs.roars.dev/people/vp-0691.html) | Flinders University | College of Business, Creative Arts, Law and Social Sciences | ⏳ | ⏳ | ⏳ |
| `vp-0692` | [Cung Nguyen](https://vietprofs.roars.dev/people/vp-0692.html) | University of Salford | Civil Engineering | ⏳ | ⏳ | ✅ |
| `vp-0693` | [Emma Nguyen](https://vietprofs.roars.dev/people/vp-0693.html) | Newcastle University | English Literature, Language and Linguistics | ⏳ | ⏳ | ✅ |
| `vp-0694` | [Kim Nguyen - University of Sheffield](https://vietprofs.roars.dev/people/vp-0694.html) | University of Sheffield | School of Economics | ⏳ | ⏳ | ✅ |
| `vp-0695` | [Thach Nguyen](https://vietprofs.roars.dev/people/vp-0695.html) | University of Sheffield | Sheffield University Management School | ⏳ | ⏳ | ✅ |
| `vp-0696` | [Duy Tan Nguyen](https://vietprofs.roars.dev/people/vp-0696.html) | University of Greenwich | School of Business, Operations and Strategy | ⏳ | ⏳ | ⏳ |
| `vp-0697` | [Maya Nguyen](https://vietprofs.roars.dev/people/vp-0697.html) | SOAS University of London | Department of Politics and International Studies | ⏳ | ⏳ | ✅ |
| `vp-0698` | [Quyen Nguyen - Brunel University London](https://vietprofs.roars.dev/people/vp-0698.html) | Brunel University London | Brunel Business School | ⏳ | ⏳ | ✅ |
| `vp-0699` | [Andy Tran](https://vietprofs.roars.dev/people/vp-0699.html) | The University of Sydney | School of Mathematics and Statistics | ⏳ | ⏳ | ⏳ |
| `vp-0700` | [Linh Tran](https://vietprofs.roars.dev/people/vp-0700.html) | Monash University | School of Education and Culture | ⏳ | ⏳ | ✅ |
| `vp-0702` | [Hieu P. T. Nguyen](https://vietprofs.roars.dev/people/vp-0702.html) | New Jersey Institute of Technology | Electrical and Computer Engineering | ⏳ | ⏳ | ✅ |

---

### Batch 15 (vp-0703 – vp-0752, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-0703` | [Thanh Nguyen (Nguyen-Tang Thanh)](https://vietprofs.roars.dev/people/vp-0703.html) | New Jersey Institute of Technology | Data Science | ✅ | ⏳ | ✅ |
| `vp-0704` | [Hai Phan](https://vietprofs.roars.dev/people/vp-0704.html) | New Jersey Institute of Technology | Data Science | ⏳ | ⏳ | ⏳ |
| `vp-0705` | [Phung Lai](https://vietprofs.roars.dev/people/vp-0705.html) | University at Albany | Cybersecurity | ⏳ | ⏳ | ✅ |
| `vp-0706` | [Hieu Pham Trung Nguyen](https://vietprofs.roars.dev/people/vp-0706.html) | Texas Tech University | Electrical and Computer Engineering | ⏳ | ✅ | ✅ |
| `vp-0707` | [Duy H. N. Nguyen](https://vietprofs.roars.dev/people/vp-0707.html) | San Diego State University | Electrical and Computer Engineering | ✅ | ⏳ | ✅ |
| `vp-0708` | [Quynh-Thu Le](https://vietprofs.roars.dev/people/vp-0708.html) | Stanford University | Radiation Oncology | ⏳ | ⏳ | ✅ |
| `vp-0709` | [Charles C. Nguyen](https://vietprofs.roars.dev/people/vp-0709.html) | The Catholic University of America | Electrical and Computer Engineering | ⏳ | ⏳ | ✅ |
| `vp-0710` | [Caroline Cao](https://vietprofs.roars.dev/people/vp-0710.html) | University of Illinois Urbana-Champaign | Biomedical and Translational Sciences, Carle Illinois College of Medicine | ⏳ | ⏳ | ✅ |
| `vp-0711` | [Van H. Vu](https://vietprofs.roars.dev/people/vp-0711.html) | The University of Hong Kong | Department of Mathematics | ⏳ | ⏳ | ✅ |
| `vp-0712` | [Jane X. Luu](https://vietprofs.roars.dev/people/vp-0712.html) | Tufts University | Physics and Astronomy | ⏳ | ⏳ | ✅ |
| `vp-0713` | [Xuan Thuan Trinh](https://vietprofs.roars.dev/people/vp-0713.html) | University of Virginia | Astronomy | ⏳ | ⏳ | ✅ |
| `vp-0714` | [Andy I. Nguyen](https://vietprofs.roars.dev/people/vp-0714.html) | University of Illinois Chicago | Chemistry | ⏳ | ✅ | ✅ |
| `vp-0715` | [Tran Duc Le](https://vietprofs.roars.dev/people/vp-0715.html) | University of Wisconsin-Stout | Mathematics, Statistics & Computer Science | ⏳ | ⏳ | ✅ |
| `vp-0716` | [Trung Le - North Dakota State University](https://vietprofs.roars.dev/people/vp-0716.html) | North Dakota State University | Civil, Construction and Environmental Engineering | ⏳ | ✅ | ✅ |
| `vp-0717` | [Kim-Doang Nguyen](https://vietprofs.roars.dev/people/vp-0717.html) | Florida Institute of Technology | Mechanical and Civil Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0718` | [Hai T. Tran](https://vietprofs.roars.dev/people/vp-0718.html) | Point Park University | Natural Sciences and Engineering Technology | ⏳ | ⏳ | ⏳ |
| `vp-0719` | [Hai Tran - Embry-Riddle Aeronautical University](https://vietprofs.roars.dev/people/vp-0719.html) | Embry-Riddle Aeronautical University | Mechanical Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0720` | [Hoang Nguyen - Washburn University](https://vietprofs.roars.dev/people/vp-0720.html) | Washburn University | Chemistry | ⏳ | ⏳ | ⏳ |
| `vp-0721` | [Tin Nguyen - University of Nebraska Omaha](https://vietprofs.roars.dev/people/vp-0721.html) | University of Nebraska at Omaha | Psychology | ⏳ | ⏳ | ✅ |
| `vp-0722` | [Duy Duong-Tran](https://vietprofs.roars.dev/people/vp-0722.html) | United States Naval Academy | Mathematics | ⏳ | ✅ | ✅ |
| `vp-0723` | [Thuy Dao](https://vietprofs.roars.dev/people/vp-0723.html) | IPAG Business School | Finance | ⏳ | ⏳ | ✅ |
| `vp-0724` | [Minh Cuong Ha](https://vietprofs.roars.dev/people/vp-0724.html) | Université Paris-Saclay | Mechanical Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0725` | [Phuong Tra Tran](https://vietprofs.roars.dev/people/vp-0725.html) | Audencia Business School | Organization Studies and Ethics | ⏳ | ⏳ | ✅ |
| `vp-0726` | [Quan Dong Nguyen](https://vietprofs.roars.dev/people/vp-0726.html) | Stanford University | Ophthalmology | ⏳ | ⏳ | ✅ |
| `vp-0727` | [Thao L. Nguyen](https://vietprofs.roars.dev/people/vp-0727.html) | UTHealth Houston | Pediatric Critical Care Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0728` | [Hung Luu](https://vietprofs.roars.dev/people/vp-0728.html) | University of Texas Southwestern Medical Center | Pathology | ⏳ | ⏳ | ✅ |
| `vp-0729` | [Hanh Huynh](https://vietprofs.roars.dev/people/vp-0729.html) | The University of British Columbia | Pathology and Laboratory Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0730` | [Lan Bui](https://vietprofs.roars.dev/people/vp-0730.html) | Palm Beach Atlantic University | Pharmacy Practice and Administration | ⏳ | ⏳ | ✅ |
| `vp-0731` | [Giang Vu](https://vietprofs.roars.dev/people/vp-0731.html) | University of Central Florida | Global Health Management and Informatics | ⏳ | ⏳ | ✅ |
| `vp-0732` | [Melanie N. Truong Le](https://vietprofs.roars.dev/people/vp-0732.html) | University of Mississippi Medical Center | Ophthalmology and Neurology | ⏳ | ⏳ | ⏳ |
| `vp-0733` | [Tuong Vi Ho](https://vietprofs.roars.dev/people/vp-0733.html) | Texas Woman's University | Nursing | ⏳ | ⏳ | ⏳ |
| `vp-0734` | [Thi Viet Ha Nguyen](https://vietprofs.roars.dev/people/vp-0734.html) | IPAG Business School | Law | ⏳ | ⏳ | ⏳ |
| `vp-0735` | [Trai Le](https://vietprofs.roars.dev/people/vp-0735.html) | University of Notre Dame | Law | ⏳ | ⏳ | ⏳ |
| `vp-0736` | [Thi-Mai-Trang Nguyen](https://vietprofs.roars.dev/people/vp-0736.html) | Université Sorbonne Paris Nord | Computer Engineering | ⏳ | ⏳ | ✅ |
| `vp-0737` | [Thao Nguyen - Haverford College](https://vietprofs.roars.dev/people/vp-0737.html) | Haverford College | Computer Science | ⏳ | ⏳ | ✅ |
| `vp-0738` | [Hien Nguyen](https://vietprofs.roars.dev/people/vp-0738.html) | University of Wisconsin-Whitewater | Computer Science | ⏳ | ⏳ | ⏳ |
| `vp-0739` | [Trang Vu](https://vietprofs.roars.dev/people/vp-0739.html) | Monash University | Department of Data Science and Artificial Intelligence | ⏳ | ⏳ | ✅ |
| `vp-0740` | [Loan Bui](https://vietprofs.roars.dev/people/vp-0740.html) | University of Dayton | Biology | ⏳ | ⏳ | ✅ |
| `vp-0741` | [Catherine H. Nguyen](https://vietprofs.roars.dev/people/vp-0741.html) | Emerson College | Writing, Literature and Publishing | ⏳ | ⏳ | ✅ |
| `vp-0742` | [Jean Tran Thanh Van](https://vietprofs.roars.dev/people/vp-0742.html) | California Institute of Technology | Physics | ⏳ | ⏳ | ✅ |
| `vp-0743` | [Tien-Cuong Dinh](https://vietprofs.roars.dev/people/vp-0743.html) | National University of Singapore | Department of Mathematics | ⏳ | ⏳ | ✅ |
| `vp-0744` | [Tri Lai](https://vietprofs.roars.dev/people/vp-0744.html) | University of Nebraska–Lincoln | Mathematics | ⏳ | ⏳ | ✅ |
| `vp-0745` | [Thanh Le-Cong](https://vietprofs.roars.dev/people/vp-0745.html) | Singapore University of Technology and Design | Information Systems Technology and Design | ✅ | ⏳ | ✅ |
| `vp-0746` | [Trang Bui](https://vietprofs.roars.dev/people/vp-0746.html) | University of Saskatchewan | Department of Mathematics and Statistics | ✅ | ⏳ | ✅ |
| `vp-0747` | [Tho Pham](https://vietprofs.roars.dev/people/vp-0747.html) | University of York | Department of Economics and Related Studies | ✅ | ⏳ | ✅ |
| `vp-0748` | [Long Tran-Thanh](https://vietprofs.roars.dev/people/vp-0748.html) | University of Warwick | Department of Computer Science | ✅ | ⏳ | ✅ |
| `vp-0749` | [Nguyen Ho](https://vietprofs.roars.dev/people/vp-0749.html) | Loyola University Maryland | Computer Science | ⏳ | ⏳ | ✅ |
| `vp-0750` | [Nguyen Khoi Nguyen](https://vietprofs.roars.dev/people/vp-0750.html) | Loyola University Maryland | Visual & Performing Arts | ⏳ | ⏳ | ⏳ |
| `vp-0751` | [Thieu Ngoc Vo](https://vietprofs.roars.dev/people/vp-0751.html) | University of Bath | Computer Science | ⏳ | ⏳ | ⏳ |
| `vp-0752` | [Tam Le](https://vietprofs.roars.dev/people/vp-0752.html) | Institute of Statistical Mathematics | Department of Advanced Data Science | ⏳ | ⏳ | ✅ |

---

### Batch 16 (vp-0753 – vp-0803, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-0753` | [Hieu Le](https://vietprofs.roars.dev/people/vp-0753.html) | University of North Carolina at Charlotte | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0754` | [Ha Nguyen - University of North Carolina at Chapel Hill](https://vietprofs.roars.dev/people/vp-0754.html) | University of North Carolina at Chapel Hill | Learning Sciences and Psychological Studies | ✅ | ⏳ | ✅ |
| `vp-0755` | [Minh-Tu Cao](https://vietprofs.roars.dev/people/vp-0755.html) | National Yang Ming Chiao Tung University | Civil Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0756` | [Duc-Thang Vo](https://vietprofs.roars.dev/people/vp-0756.html) | National Taiwan University of Science and Technology | College of Engineering | ✅ | ⏳ | ✅ |
| `vp-0757` | [Quoc-Thai Pham](https://vietprofs.roars.dev/people/vp-0757.html) | National Ilan University | Chemical and Materials Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0758` | [Trong-Nghia Le](https://vietprofs.roars.dev/people/vp-0758.html) | National Taiwan Normal University | Chemistry | ⏳ | ✅ | ✅ |
| `vp-0759` | [Phuong V. Pham](https://vietprofs.roars.dev/people/vp-0759.html) | National Sun Yat-sen University | Physics | ⏳ | ✅ | ✅ |
| `vp-0760` | [Tuyen Van Duong](https://vietprofs.roars.dev/people/vp-0760.html) | Taipei Medical University | School of Nutrition and Health Sciences | ⏳ | ⏳ | ⏳ |
| `vp-0761` | [Phung Anh Nguyen](https://vietprofs.roars.dev/people/vp-0761.html) | Taipei Medical University | Graduate Institute of Data Science | ⏳ | ⏳ | ⏳ |
| `vp-0762` | [Thi-Nham Le](https://vietprofs.roars.dev/people/vp-0762.html) | National Chengchi University | Southeast Asian Languages and Cultures | ⏳ | ⏳ | ✅ |
| `vp-0763` | [Van-Linh Nguyen](https://vietprofs.roars.dev/people/vp-0763.html) | National Chung Cheng University | Computer Science and Information Engineering | ✅ | ⏳ | ✅ |
| `vp-0764` | [Quang Thai Truong](https://vietprofs.roars.dev/people/vp-0764.html) | National Taipei University | MBA in Finance | ⏳ | ⏳ | ✅ |
| `vp-0765` | [Thanh Nhat Trung Tran](https://vietprofs.roars.dev/people/vp-0765.html) | Tamkang University | Mechanical and Electro-Mechanical Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0766` | [Thanh Van Hoang](https://vietprofs.roars.dev/people/vp-0766.html) | Feng Chia University | Center for General Education | ✅ | ⏳ | ✅ |
| `vp-0767` | [Hai-Dung Do](https://vietprofs.roars.dev/people/vp-0767.html) | Ming Chi University of Technology | International MBA Program | ⏳ | ⏳ | ⏳ |
| `vp-0768` | [Ngoc-Mai Nguyen](https://vietprofs.roars.dev/people/vp-0768.html) | Minghsin University of Science and Technology | Civil Engineering and Environmental Resource Management | ⏳ | ⏳ | ⏳ |
| `vp-0769` | [Thi-Phuong Nguyen](https://vietprofs.roars.dev/people/vp-0769.html) | National Chin-Yi University of Technology | Industrial Engineering and Management | ⏳ | ⏳ | ⏳ |
| `vp-0770` | [Thu Dung Doan](https://vietprofs.roars.dev/people/vp-0770.html) | National Pingtung University of Science and Technology | International Degree Program in Animal Vaccine Technology | ⏳ | ⏳ | ⏳ |
| `vp-0771` | [Lan Tran](https://vietprofs.roars.dev/people/vp-0771.html) | National University of Kaohsiung | East Asian Languages and Literature | ⏳ | ⏳ | ✅ |
| `vp-0772` | [Van-Phung Mai](https://vietprofs.roars.dev/people/vp-0772.html) | National Yunlin University of Science and Technology | Mechanical Engineering | ⏳ | ⏳ | ✅ |
| `vp-0773` | [Nghi Nhan Nguyen](https://vietprofs.roars.dev/people/vp-0773.html) | National Formosa University | Materials Engineering and Science | ⏳ | ⏳ | ✅ |
| `vp-0774` | [Yen Do](https://vietprofs.roars.dev/people/vp-0774.html) | Nanhua University | International Business | ⏳ | ⏳ | ⏳ |
| `vp-0775` | [Nam-Tien Duong](https://vietprofs.roars.dev/people/vp-0775.html) | Ming Chi University of Technology | International Master of Business Administration | ⏳ | ⏳ | ✅ |
| `vp-0776` | [Alex-Thai Dinh Vo](https://vietprofs.roars.dev/people/vp-0776.html) | Texas Tech University | Vietnam Center and Sam Johnson Vietnam Archive | ⏳ | ⏳ | ⏳ |
| `vp-0777` | [Van Hellerslia](https://vietprofs.roars.dev/people/vp-0777.html) | Temple University | Pharmacy Practice | ✅ | ⏳ | ✅ |
| `vp-0778` | [Daniella Zalcman](https://vietprofs.roars.dev/people/vp-0778.html) | Tulane University | Communication | ✅ | ⏳ | ✅ |
| `vp-0779` | [Trang Nguyen - University at Albany](https://vietprofs.roars.dev/people/vp-0779.html) | University at Albany, State University of New York | Epidemiology & Biostatistics | ⏳ | ⏳ | ✅ |
| `vp-0780` | [Patrick Nguyen](https://vietprofs.roars.dev/people/vp-0780.html) | University of Texas Health Science Center at San Antonio | Surgery | ⏳ | ⏳ | ⏳ |
| `vp-0781` | [Elizabeth Nguyen](https://vietprofs.roars.dev/people/vp-0781.html) | Texas A&M University | Pediatrics | ⏳ | ⏳ | ⏳ |
| `vp-0782` | [Quoc-Viet Dang](https://vietprofs.roars.dev/people/vp-0782.html) | University of California, Irvine | Electrical Engineering and Computer Science | ⏳ | ⏳ | ✅ |
| `vp-0784` | [Hien Thi Thu Nguyen](https://vietprofs.roars.dev/people/vp-0784.html) | Aalborg University | Department of Molecular Diagnostics, Department of Clinical Medicine | ⏳ | ⏳ | ✅ |
| `vp-0785` | [Cuong Nguyen - Massachusetts Institute of Technology](https://vietprofs.roars.dev/people/vp-0785.html) | Massachusetts Institute of Technology | Aeronautics and Astronautics | ⏳ | ⏳ | ✅ |
| `vp-0786` | [Teresa Phuongtram Nguyen](https://vietprofs.roars.dev/people/vp-0786.html) | Stanford University | Anesthesiology, Perioperative and Pain Medicine | ⏳ | ⏳ | ✅ |
| `vp-0787` | [Minhtri Khac Nguyen](https://vietprofs.roars.dev/people/vp-0787.html) | University of California, Los Angeles | Medicine, Nephrology | ⏳ | ⏳ | ⏳ |
| `vp-0788` | [Tran Nguyen](https://vietprofs.roars.dev/people/vp-0788.html) | The Ohio State University | Internal Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0789` | [Huyen Q. Pham](https://vietprofs.roars.dev/people/vp-0789.html) | University of Southern California | Obstetrics & Gynecology | ⏳ | ⏳ | ⏳ |
| `vp-0790` | [Thao T. Dang](https://vietprofs.roars.dev/people/vp-0790.html) | Indiana University | Medical & Molecular Genetics | ⏳ | ⏳ | ⏳ |
| `vp-0791` | [Uyen L. Tran](https://vietprofs.roars.dev/people/vp-0791.html) | Vanderbilt University | Ophthalmology and Visual Sciences | ⏳ | ⏳ | ✅ |
| `vp-0792` | [An Nguyen](https://vietprofs.roars.dev/people/vp-0792.html) | King's College London | King's Business School | ⏳ | ⏳ | ⏳ |
| `vp-0793` | [Hoang D. Nguyen](https://vietprofs.roars.dev/people/vp-0793.html) | University College Cork | School of Computer Science and Information Technology | ⏳ | ⏳ | ✅ |
| `vp-0794` | [Tri Nguyen-Quang](https://vietprofs.roars.dev/people/vp-0794.html) | Dalhousie University | Engineering, Faculty of Agriculture | ⏳ | ⏳ | ✅ |
| `vp-0795` | [Phuong-Anh Nguyen](https://vietprofs.roars.dev/people/vp-0795.html) | York University | School of Administrative Studies | ✅ | ⏳ | ✅ |
| `vp-0796` | [My Nguyen](https://vietprofs.roars.dev/people/vp-0796.html) | RMIT University | Economics, Finance and Marketing | ⏳ | ⏳ | ✅ |
| `vp-0797` | [Truyen Tran](https://vietprofs.roars.dev/people/vp-0797.html) | Deakin University | Applied Artificial Intelligence Institute | ✅ | ⏳ | ✅ |
| `vp-0798` | [Hoa Van Nguyen](https://vietprofs.roars.dev/people/vp-0798.html) | Curtin University | School of Electrical Engineering, Computing and Mathematical Sciences | ✅ | ⏳ | ✅ |
| `vp-0799` | [Huyen Pham - École Polytechnique](https://vietprofs.roars.dev/people/vp-0799.html) | École Polytechnique | Centre de Mathématiques Appliquées (CMAP) | ✅ | ⏳ | ✅ |
| `vp-0800` | [Quy Nguyen Huy](https://vietprofs.roars.dev/people/vp-0800.html) | INSEAD | Strategy | ⏳ | ⏳ | ✅ |
| `vp-0801` | [Huyen C. Nguyen](https://vietprofs.roars.dev/people/vp-0801.html) | Université Paris-Saclay | LISN/CNRS | ✅ | ⏳ | ✅ |
| `vp-0802` | [Tan Minh Nguyen](https://vietprofs.roars.dev/people/vp-0802.html) | National University of Singapore | Mathematics | ✅ | ⏳ | ✅ |
| `vp-0803` | [Anh Tuan Tran](https://vietprofs.roars.dev/people/vp-0803.html) | Nanyang Technological University | School of Mechanical and Aerospace Engineering | ⏳ | ⏳ | ⏳ |

---

### Batch 17 (vp-0804 – vp-0858, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-0804` | [Thuy Tram Dang](https://vietprofs.roars.dev/people/vp-0804.html) | Nanyang Technological University | School of Chemistry, Chemical Engineering and Biotechnology | ⏳ | ⏳ | ⏳ |
| `vp-0805` | [Tuan Anh Nguyen](https://vietprofs.roars.dev/people/vp-0805.html) | Hong Kong University of Science and Technology | Division of Life Science | ⏳ | ✅ | ✅ |
| `vp-0806` | [Thanh Phuc Nguyen](https://vietprofs.roars.dev/people/vp-0806.html) | Kyoto University | Graduate School of Engineering, Department of Molecular Engineering | ⏳ | ⏳ | ✅ |
| `vp-0807` | [Thi Thuy Minh Nguyen](https://vietprofs.roars.dev/people/vp-0807.html) | University of Otago | English and Linguistics | ⏳ | ⏳ | ⏳ |
| `vp-0808` | [Viet Quoc Pham](https://vietprofs.roars.dev/people/vp-0808.html) | Trinity College Dublin | School of Computer Science and Statistics | ✅ | ⏳ | ✅ |
| `vp-0809` | [Tran Nguyen Le](https://vietprofs.roars.dev/people/vp-0809.html) | Technical University of Denmark | Department of Engineering Technology and Didactics | ⏳ | ⏳ | ⏳ |
| `vp-0810` | [Ninh Dang Pham](https://vietprofs.roars.dev/people/vp-0810.html) | University of Southern Denmark | Department of Mathematics and Computer Science | ⏳ | ⏳ | ✅ |
| `vp-0811` | [Dung Tran](https://vietprofs.roars.dev/people/vp-0811.html) | Federation University Australia | Institute of Education, Arts and Community | ⏳ | ⏳ | ✅ |
| `vp-0812` | [Nghia Tran](https://vietprofs.roars.dev/people/vp-0812.html) | Australian National University | Research School of Management | ⏳ | ⏳ | ✅ |
| `vp-0813` | [Andrew Nguyen](https://vietprofs.roars.dev/people/vp-0813.html) | University of Michigan | Neurosurgery and Neurology | ⏳ | ⏳ | ⏳ |
| `vp-0814` | [Phuong D. Nguyen](https://vietprofs.roars.dev/people/vp-0814.html) | University of Colorado | Surgery, Plastic Surgery | ⏳ | ⏳ | ⏳ |
| `vp-0815` | [Dao M. Nguyen](https://vietprofs.roars.dev/people/vp-0815.html) | University of Miami | Surgery, Cardiothoracic Surgery | ⏳ | ⏳ | ✅ |
| `vp-0816` | [Liem Nguyen - Case Western Reserve University](https://vietprofs.roars.dev/people/vp-0816.html) | Case Western Reserve University | Molecular Biology and Microbiology | ⏳ | ✅ | ✅ |
| `vp-0819` | [Mylinh T. Nguyen](https://vietprofs.roars.dev/people/vp-0819.html) | University of California, San Diego | Pediatrics | ⏳ | ⏳ | ⏳ |
| `vp-0820` | [Margaret Nguyen](https://vietprofs.roars.dev/people/vp-0820.html) | University of California, San Diego | Pediatrics | ⏳ | ⏳ | ✅ |
| `vp-0821` | [Minh-Ha Tran](https://vietprofs.roars.dev/people/vp-0821.html) | University of California, Irvine | Pathology and Laboratory Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0823` | [Tien Hung Nguyen](https://vietprofs.roars.dev/people/vp-0823.html) | Howard University | Economics | ⏳ | ⏳ | ⏳ |
| `vp-0824` | [Pipo Nguyen-duy](https://vietprofs.roars.dev/people/vp-0824.html) | Oberlin College | Art | ⏳ | ⏳ | ✅ |
| `vp-0826` | [Van Tho Tran](https://vietprofs.roars.dev/people/vp-0826.html) | Waseda University | Social Sciences | ⏳ | ⏳ | ✅ |
| `vp-0827` | [Anh Nguyen-Tuong](https://vietprofs.roars.dev/people/vp-0827.html) | University of Virginia | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0828` | [Dzung L. Pham](https://vietprofs.roars.dev/people/vp-0828.html) | Uniformed Services University of the Health Sciences | Radiology and Bioengineering | ⏳ | ⏳ | ✅ |
| `vp-0829` | [Phu Tran](https://vietprofs.roars.dev/people/vp-0829.html) | University of Minnesota | Pediatrics, Neonatology | ⏳ | ⏳ | ✅ |
| `vp-0830` | [Tuan M. Nguyen](https://vietprofs.roars.dev/people/vp-0830.html) | Northwestern University | Obstetrics and Gynecology | ⏳ | ⏳ | ⏳ |
| `vp-0831` | [Tai Tan Mai](https://vietprofs.roars.dev/people/vp-0831.html) | Dublin City University | School of Computing | ⏳ | ⏳ | ✅ |
| `vp-0832` | [Thi Ha Nguyen](https://vietprofs.roars.dev/people/vp-0832.html) | University of Connecticut | Electrical and Computer Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0833` | [Duc Tung Nguyen](https://vietprofs.roars.dev/people/vp-0833.html) | Helmut Schmidt University | Civil Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0834` | [Trung Thanh Nguyen](https://vietprofs.roars.dev/people/vp-0834.html) | Leibniz University Hannover | Institute of Environmental Economics and World Trade | ⏳ | ⏳ | ✅ |
| `vp-0835` | [Hieu T. Nguyen](https://vietprofs.roars.dev/people/vp-0835.html) | University of South-Eastern Norway | Department of Science and Industry Systems | ⏳ | ⏳ | ✅ |
| `vp-0836` | [Hoang Vu Nguyen](https://vietprofs.roars.dev/people/vp-0836.html) | University of South-Eastern Norway | Department of Microsystems | ⏳ | ⏳ | ⏳ |
| `vp-0837` | [Minh Hao Nguyen](https://vietprofs.roars.dev/people/vp-0837.html) | University of Amsterdam | Amsterdam School of Communication Research (ASCoR) | ⏳ | ⏳ | ✅ |
| `vp-0838` | [Dang Xuan Tran](https://vietprofs.roars.dev/people/vp-0838.html) | Hiroshima University | Center for Planetary Health and Innovation Science (PHIS), IDEC Institute | ⏳ | ⏳ | ⏳ |
| `vp-0839` | [Binh-Son Hua](https://vietprofs.roars.dev/people/vp-0839.html) | Trinity College Dublin | School of Computer Science and Statistics | ⏳ | ⏳ | ✅ |
| `vp-0840` | [Van-Dinh Nguyen](https://vietprofs.roars.dev/people/vp-0840.html) | Trinity College Dublin | School of Computer Science and Statistics | ⏳ | ⏳ | ⏳ |
| `vp-0841` | [Dinh Thai Hoang](https://vietprofs.roars.dev/people/vp-0841.html) | University of Technology Sydney | School of Electrical and Data Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0842` | [Nhu Truong](https://vietprofs.roars.dev/people/vp-0842.html) | University of Wisconsin-Madison | Asian Languages and Cultures | ⏳ | ⏳ | ✅ |
| `vp-0843` | [Van-Nam Huynh](https://vietprofs.roars.dev/people/vp-0843.html) | Japan Advanced Institute of Science and Technology | School of Knowledge Science | ⏳ | ⏳ | ⏳ |
| `vp-0845` | [Thanh Thi Nguyen](https://vietprofs.roars.dev/people/vp-0845.html) | University of the Sunshine Coast | School of Science, Technology and Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0846` | [Minh Quang Ta](https://vietprofs.roars.dev/people/vp-0846.html) | University of West Florida | Department of Electrical and Computer Engineering | ⏳ | ⏳ | ✅ |
| `vp-0847` | [Hue Duong](https://vietprofs.roars.dev/people/vp-0847.html) | Georgia State University | Department of Communication | ⏳ | ⏳ | ⏳ |
| `vp-0848` | [An Nguyen - City of Hope](https://vietprofs.roars.dev/people/vp-0848.html) | City of Hope | Diabetes, Endocrinology and Metabolism | ⏳ | ⏳ | ⏳ |
| `vp-0849` | [Andrew H. Nguyen](https://vietprofs.roars.dev/people/vp-0849.html) | City of Hope | Division of Surgical Oncology | ⏳ | ⏳ | ⏳ |
| `vp-0850` | [Alexander H. Nguyen](https://vietprofs.roars.dev/people/vp-0850.html) | University of California, Los Angeles | Division of Digestive Diseases | ⏳ | ⏳ | ✅ |
| `vp-0851` | [Anh-Thuy Nguyen](https://vietprofs.roars.dev/people/vp-0851.html) | The University of Texas MD Anderson Cancer Center | Anesthesiology and Perioperative Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0852` | [Tung Nguyen - University of California, San Francisco](https://vietprofs.roars.dev/people/vp-0852.html) | University of California, San Francisco | Medicine | ⏳ | ⏳ | ✅ |
| `vp-0853` | [Sen Nguyen](https://vietprofs.roars.dev/people/vp-0853.html) | University of California, San Francisco | Family and Community Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0854` | [Thuong Hien Vu Tran](https://vietprofs.roars.dev/people/vp-0854.html) | University of Pennsylvania | Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0855` | [Nam Duy Nguyen](https://vietprofs.roars.dev/people/vp-0855.html) | University of Pennsylvania | Medicine | ⏳ | ⏳ | ✅ |
| `vp-0856` | [Pearl Nguyen](https://vietprofs.roars.dev/people/vp-0856.html) | University of Washington | Pediatrics | ⏳ | ⏳ | ⏳ |
| `vp-0857` | [George Nguyen](https://vietprofs.roars.dev/people/vp-0857.html) | University of Arizona | Internal Medicine, College of Medicine – Phoenix | ⏳ | ⏳ | ⏳ |
| `vp-0858` | [Lan Nguyen - University of Illinois Urbana-Champaign](https://vietprofs.roars.dev/people/vp-0858.html) | University of Illinois Urbana-Champaign | Clinical Sciences, Carle Illinois College of Medicine | ⏳ | ⏳ | ⏳ |

---

### Batch 18 (vp-0859 – vp-0909, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-0859` | [Kim-Phung Thi Nguyen](https://vietprofs.roars.dev/people/vp-0859.html) | University of Illinois Urbana-Champaign | Clinical Sciences, Carle Illinois College of Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0860` | [Anh C. Tran](https://vietprofs.roars.dev/people/vp-0860.html) | Loma Linda University | Psychiatry | ⏳ | ⏳ | ⏳ |
| `vp-0861` | [Thuy-Huynh Nguyen](https://vietprofs.roars.dev/people/vp-0861.html) | Loma Linda University | Psychiatry | ⏳ | ⏳ | ⏳ |
| `vp-0862` | [Caroline T. Nguyen](https://vietprofs.roars.dev/people/vp-0862.html) | University of Southern California | Medicine, Division of Endocrinology, Diabetes, and Metabolism | ⏳ | ⏳ | ⏳ |
| `vp-0863` | [The Anh Han](https://vietprofs.roars.dev/people/vp-0863.html) | Teesside University | Computing, Engineering and Digital Technologies | ⏳ | ⏳ | ✅ |
| `vp-0864` | [Duy Pham](https://vietprofs.roars.dev/people/vp-0864.html) | University of Utah | Psychiatry | ⏳ | ⏳ | ⏳ |
| `vp-0865` | [Van T. Pham](https://vietprofs.roars.dev/people/vp-0865.html) | University of Cincinnati | Psychiatry and Behavioral Neuroscience | ⏳ | ⏳ | ⏳ |
| `vp-0866` | [Minh Thu T. Nguyen](https://vietprofs.roars.dev/people/vp-0866.html) | New York University | Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0867` | [Tuan Nguyen](https://vietprofs.roars.dev/people/vp-0867.html) | New York University | Pediatrics, NYU Grossman Long Island School of Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0869` | [Trang T. Ho](https://vietprofs.roars.dev/people/vp-0869.html) | University of Kansas | Internal Medicine, Hospital Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0870` | [Phuong H. Nguyen - University of Kansas](https://vietprofs.roars.dev/people/vp-0870.html) | University of Kansas | Anesthesiology | ⏳ | ⏳ | ⏳ |
| `vp-0871` | [Than Pham](https://vietprofs.roars.dev/people/vp-0871.html) | University of Iowa | Orthopedics and Rehabilitation | ⏳ | ⏳ | ⏳ |
| `vp-0872` | [Huy Nguyen - Brown University](https://vietprofs.roars.dev/people/vp-0872.html) | Brown University | Orthopaedics | ⏳ | ⏳ | ⏳ |
| `vp-0873` | [Anh Phuong Nguyen](https://vietprofs.roars.dev/people/vp-0873.html) | University of California, Davis | Pediatrics, Division of Pediatric Allergy, Immunology and Rheumatology | ⏳ | ⏳ | ⏳ |
| `vp-0874` | [Kimloan Nguyen](https://vietprofs.roars.dev/people/vp-0874.html) | University of Texas Southwestern Medical Center | Family and Community Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0875` | [Cam-Tu Nguyen](https://vietprofs.roars.dev/people/vp-0875.html) | University of Florida | College of Pharmacy | ⏳ | ⏳ | ⏳ |
| `vp-0876` | [Kimberly A. Nguyen](https://vietprofs.roars.dev/people/vp-0876.html) | University of Houston | Pharmacy Practice and Translational Research | ⏳ | ⏳ | ⏳ |
| `vp-0877` | [Michael O. Nguyen](https://vietprofs.roars.dev/people/vp-0877.html) | University of California, Los Angeles | Dermatology | ⏳ | ⏳ | ⏳ |
| `vp-0878` | [Vinh Nguyen - University of Pittsburgh](https://vietprofs.roars.dev/people/vp-0878.html) | University of Pittsburgh | Anesthesiology and Perioperative Medicine | ⏳ | ⏳ | ✅ |
| `vp-0879` | [Van-Hong Nguyen](https://vietprofs.roars.dev/people/vp-0879.html) | Icahn School of Medicine at Mount Sinai | Cardiovascular Institute | ⏳ | ⏳ | ⏳ |
| `vp-0880` | [Matthew Thai-Khang Nguyen](https://vietprofs.roars.dev/people/vp-0880.html) | Weill Cornell Medicine | Emergency Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0881` | [De Tran](https://vietprofs.roars.dev/people/vp-0881.html) | Stanford University | Medicine, Primary Care and Population Health | ⏳ | ⏳ | ⏳ |
| `vp-0882` | [Tridu Huynh](https://vietprofs.roars.dev/people/vp-0882.html) | Stanford University | Medicine, Division of Hospital Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0883` | [Lisa Huynh](https://vietprofs.roars.dev/people/vp-0883.html) | Stanford University | Orthopaedic Surgery, PM&R Division | ⏳ | ⏳ | ⏳ |
| `vp-0884` | [Mai Thy Truong](https://vietprofs.roars.dev/people/vp-0884.html) | Stanford University | Otolaryngology - Head and Neck Surgery, Division of Pediatric Otolaryngology | ⏳ | ⏳ | ✅ |
| `vp-0885` | [Nam Quoc Bui](https://vietprofs.roars.dev/people/vp-0885.html) | Stanford University | Medicine, Oncology (Stanford Cancer Institute) | ⏳ | ⏳ | ✅ |
| `vp-0886` | [Hanh Nguyen](https://vietprofs.roars.dev/people/vp-0886.html) | University of California, Riverside | Family Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0887` | [Thien H. Nguyen](https://vietprofs.roars.dev/people/vp-0887.html) | Kaiser Permanente Bernard J. Tyson School of Medicine | Clinical Science | ⏳ | ⏳ | ⏳ |
| `vp-0888` | [Monika Dao Nguyen](https://vietprofs.roars.dev/people/vp-0888.html) | Kaiser Permanente Bernard J. Tyson School of Medicine | Clinical Science | ⏳ | ⏳ | ⏳ |
| `vp-0889` | [Nathan K. Nguyen](https://vietprofs.roars.dev/people/vp-0889.html) | Kaiser Permanente Bernard J. Tyson School of Medicine | Clinical Science | ⏳ | ⏳ | ⏳ |
| `vp-0890` | [Tina A. Nguyen](https://vietprofs.roars.dev/people/vp-0890.html) | Kaiser Permanente Bernard J. Tyson School of Medicine | Clinical Science | ⏳ | ⏳ | ⏳ |
| `vp-0891` | [Carolyn V. Nguyen](https://vietprofs.roars.dev/people/vp-0891.html) | Kaiser Permanente Bernard J. Tyson School of Medicine | Clinical Science | ⏳ | ⏳ | ⏳ |
| `vp-0892` | [Andrew C. Nguyen](https://vietprofs.roars.dev/people/vp-0892.html) | Kaiser Permanente Bernard J. Tyson School of Medicine | Clinical Science | ⏳ | ⏳ | ⏳ |
| `vp-0893` | [Harrison B. Nguyen](https://vietprofs.roars.dev/people/vp-0893.html) | Kaiser Permanente Bernard J. Tyson School of Medicine | Clinical Science | ⏳ | ⏳ | ⏳ |
| `vp-0894` | [Von Ta Nguyen](https://vietprofs.roars.dev/people/vp-0894.html) | Kaiser Permanente Bernard J. Tyson School of Medicine | Clinical Science | ⏳ | ⏳ | ⏳ |
| `vp-0895` | [Bich-May Nguyen](https://vietprofs.roars.dev/people/vp-0895.html) | University of Houston | Health Systems and Population Health Sciences | ⏳ | ⏳ | ⏳ |
| `vp-0896` | [Thanh Tran - University of South Carolina](https://vietprofs.roars.dev/people/vp-0896.html) | University of South Carolina School of Medicine Greenville | Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0897` | [Ngoc Lien Minh Nguyen](https://vietprofs.roars.dev/people/vp-0897.html) | University of South Carolina School of Medicine Greenville | Family Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0898` | [Minh Vu](https://vietprofs.roars.dev/people/vp-0898.html) | Stanford University | Cardiothoracic Surgery | ⏳ | ⏳ | ⏳ |
| `vp-0899` | [Hai Hiep Hoang](https://vietprofs.roars.dev/people/vp-0899.html) | Weill Cornell Medicine | Neurology | ⏳ | ⏳ | ⏳ |
| `vp-0900` | [Kim Hoang](https://vietprofs.roars.dev/people/vp-0900.html) | Stanford University | Pediatrics, Hospital Medicine | ⏳ | ⏳ | ✅ |
| `vp-0901` | [Tuan Mai](https://vietprofs.roars.dev/people/vp-0901.html) | University of Southern California | Anesthesiology | ⏳ | ⏳ | ⏳ |
| `vp-0902` | [Phuong Khuu](https://vietprofs.roars.dev/people/vp-0902.html) | Stanford University | Dermatology | ⏳ | ⏳ | ⏳ |
| `vp-0903` | [Phuong Le](https://vietprofs.roars.dev/people/vp-0903.html) | Stanford University | Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0904` | [Phuong-Chi Pham](https://vietprofs.roars.dev/people/vp-0904.html) | University of California, Los Angeles | Medicine, Nephrology | ⏳ | ⏳ | ✅ |
| `vp-0905` | [Tony Tuan H. Nguyen](https://vietprofs.roars.dev/people/vp-0905.html) | Kaiser Permanente Bernard J. Tyson School of Medicine | Clinical Science | ⏳ | ⏳ | ⏳ |
| `vp-0906` | [Ngoc M. Nguyen-Famulare](https://vietprofs.roars.dev/people/vp-0906.html) | New York University | Anesthesiology, Perioperative Care, and Pain Medicine, NYU Grossman Long Island School of Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0907` | [Ngoc Nguyen - Yale University](https://vietprofs.roars.dev/people/vp-0907.html) | Yale University | Therapeutic Radiology | ⏳ | ⏳ | ⏳ |
| `vp-0908` | [Eddie Quan](https://vietprofs.roars.dev/people/vp-0908.html) | University of California, Irvine | Pediatrics | ⏳ | ⏳ | ⏳ |
| `vp-0909` | [Thanh T. Van](https://vietprofs.roars.dev/people/vp-0909.html) | University of Texas Health Science Center at San Antonio | Radiology | ⏳ | ⏳ | ⏳ |

---

### Batch 19 (vp-0910 – vp-0959, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-0910` | [Nam X. Nguyen](https://vietprofs.roars.dev/people/vp-0910.html) | University of Southern California | Surgery | ⏳ | ⏳ | ⏳ |
| `vp-0911` | [Andrew Dinh](https://vietprofs.roars.dev/people/vp-0911.html) | Stanford University | Anesthesiology, Perioperative and Pain Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0912` | [Linh T. Dinh](https://vietprofs.roars.dev/people/vp-0912.html) | New York University | Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0913` | [Julie Ngoc Thai](https://vietprofs.roars.dev/people/vp-0913.html) | Stanford University | Medicine, Primary Care and Population Health | ⏳ | ⏳ | ✅ |
| `vp-0914` | [Quoc-Anh Thai](https://vietprofs.roars.dev/people/vp-0914.html) | Weill Cornell Medicine | Neurosurgery | ⏳ | ⏳ | ✅ |
| `vp-0915` | [Hieu M. Doan](https://vietprofs.roars.dev/people/vp-0915.html) | University of Kansas | Internal Medicine, Hospital Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0916` | [Truc-Anh Nguyen](https://vietprofs.roars.dev/people/vp-0916.html) | University of Arizona | Anesthesiology | ⏳ | ⏳ | ⏳ |
| `vp-0917` | [Anh T. Pham](https://vietprofs.roars.dev/people/vp-0917.html) | The University of Aizu | Department of Computer Science and Engineering | ⏳ | ✅ | ✅ |
| `vp-0918` | [Kien Nguyen](https://vietprofs.roars.dev/people/vp-0918.html) | Chiba University | Graduate School of Informatics | ⏳ | ✅ | ✅ |
| `vp-0919` | [Thanh V. Pham](https://vietprofs.roars.dev/people/vp-0919.html) | Shizuoka University | Department of Mathematical and Systems Engineering | ✅ | ⏳ | ✅ |
| `vp-0920` | [Xuan Tan Phan](https://vietprofs.roars.dev/people/vp-0920.html) | Shibaura Institute of Technology | College of Engineering, Innovative Global Program | ✅ | ⏳ | ✅ |
| `vp-0921` | [Cong Thang Truong](https://vietprofs.roars.dev/people/vp-0921.html) | The University of Aizu | Department of Computer Science and Engineering | ✅ | ⏳ | ✅ |
| `vp-0922` | [Khanh N. Dang](https://vietprofs.roars.dev/people/vp-0922.html) | The University of Aizu | Department of Computer Science and Engineering | ✅ | ⏳ | ✅ |
| `vp-0923` | [Hoang D. Le](https://vietprofs.roars.dev/people/vp-0923.html) | The University of Aizu | Department of Computer Science and Engineering | ✅ | ⏳ | ✅ |
| `vp-0924` | [Dai Hai Nguyen](https://vietprofs.roars.dev/people/vp-0924.html) | Hokkaido University | Graduate School of Information Science and Technology | ✅ | ⏳ | ✅ |
| `vp-0925` | [Thong Pham](https://vietprofs.roars.dev/people/vp-0925.html) | Osaka University | SANKEN, Department of Reasoning for Intelligence | ✅ | ⏳ | ✅ |
| `vp-0926` | [Thi Hong Tran](https://vietprofs.roars.dev/people/vp-0926.html) | Osaka Metropolitan University | Graduate School of Informatics | ⏳ | ⏳ | ✅ |
| `vp-0927` | [Van Anh Ho](https://vietprofs.roars.dev/people/vp-0927.html) | Japan Advanced Institute of Science and Technology | School of Information Science | ⏳ | ⏳ | ✅ |
| `vp-0928` | [Hieu Chi Dam](https://vietprofs.roars.dev/people/vp-0928.html) | Japan Advanced Institute of Science and Technology | School of Knowledge Science | ⏳ | ⏳ | ⏳ |
| `vp-0929` | [Nhan Huu Nguyen](https://vietprofs.roars.dev/people/vp-0929.html) | Japan Advanced Institute of Science and Technology | School of Information Science | ⏳ | ✅ | ✅ |
| `vp-0930` | [Canh Minh Do](https://vietprofs.roars.dev/people/vp-0930.html) | Japan Advanced Institute of Science and Technology | School of Information Science | ⏳ | ⏳ | ✅ |
| `vp-0931` | [Vu Duc Tran](https://vietprofs.roars.dev/people/vp-0931.html) | Japan Advanced Institute of Science and Technology | School of Information Science | ⏳ | ✅ | ✅ |
| `vp-0932` | [Hoai Luan Pham](https://vietprofs.roars.dev/people/vp-0932.html) | Nara Institute of Science and Technology | Division of Information Science | ⏳ | ✅ | ✅ |
| `vp-0933` | [Vu Trung Duong Le](https://vietprofs.roars.dev/people/vp-0933.html) | Nara Institute of Science and Technology | Division of Information Science | ⏳ | ✅ | ✅ |
| `vp-0934` | [Tyler Nguyen](https://vietprofs.roars.dev/people/vp-0934.html) | Indiana University School of Medicine | Anesthesia | ⏳ | ⏳ | ✅ |
| `vp-0935` | [Chi Mai Nguyen](https://vietprofs.roars.dev/people/vp-0935.html) | Indiana University School of Medicine | Biostatistics and Health Data Science | ⏳ | ⏳ | ⏳ |
| `vp-0936` | [Paul C. Dinh](https://vietprofs.roars.dev/people/vp-0936.html) | Indiana University School of Medicine | Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0937` | [Annalee Nguyen](https://vietprofs.roars.dev/people/vp-0937.html) | The University of Texas at Austin | Chemical Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0938` | [Van Vo](https://vietprofs.roars.dev/people/vp-0938.html) | University of Nevada, Las Vegas | Nevada Institute of Personalized Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0939` | [Thanh Lam Nguyen](https://vietprofs.roars.dev/people/vp-0939.html) | University of Florida | Chemistry | ⏳ | ⏳ | ✅ |
| `vp-0940` | [Van Tuan Dinh](https://vietprofs.roars.dev/people/vp-0940.html) | University of Rochester | Electrical and Computer Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0941` | [Nam Tran](https://vietprofs.roars.dev/people/vp-0941.html) | Auburn University | National Center for Asphalt Technology | ⏳ | ⏳ | ⏳ |
| `vp-0942` | [Huy Q. Ta](https://vietprofs.roars.dev/people/vp-0942.html) | University of Virginia | Surgery | ⏳ | ⏳ | ⏳ |
| `vp-0943` | [Luu Duc Toan Huynh](https://vietprofs.roars.dev/people/vp-0943.html) | Queen Mary University of London | Business Analytics and Applied Economics | ✅ | ⏳ | ✅ |
| `vp-0944` | [Kiet Duong](https://vietprofs.roars.dev/people/vp-0944.html) | University of York | School for Business and Society | ⏳ | ⏳ | ✅ |
| `vp-0945` | [Daniel Dao](https://vietprofs.roars.dev/people/vp-0945.html) | Regent's University London | Business, Finance and Entrepreneurship | ⏳ | ⏳ | ⏳ |
| `vp-0946` | [Thuy Hang Do](https://vietprofs.roars.dev/people/vp-0946.html) | University of Southampton | Strategy, Innovation and Entrepreneurship | ⏳ | ⏳ | ✅ |
| `vp-0947` | [Quoc Tuan Ho](https://vietprofs.roars.dev/people/vp-0947.html) | University of Bristol | University of Bristol Business School | ⏳ | ⏳ | ✅ |
| `vp-0948` | [Linh H. Nguyen](https://vietprofs.roars.dev/people/vp-0948.html) | University of Nottingham | Finance, Accounting and Banking | ⏳ | ⏳ | ✅ |
| `vp-0949` | [Linh Pham](https://vietprofs.roars.dev/people/vp-0949.html) | Lake Forest College | Economics, Business and Finance | ⏳ | ⏳ | ✅ |
| `vp-0950` | [Cuong Nguyen - Lincoln University](https://vietprofs.roars.dev/people/vp-0950.html) | Lincoln University | Department of Financial and Business Systems | ⏳ | ⏳ | ⏳ |
| `vp-0951` | [Quang David Evansluong](https://vietprofs.roars.dev/people/vp-0951.html) | Umeå University | Business Administration, Entrepreneurship | ⏳ | ⏳ | ✅ |
| `vp-0952` | [Thi Hong Van Hoang](https://vietprofs.roars.dev/people/vp-0952.html) | MBS School of Business | Finance & Accounting | ⏳ | ⏳ | ✅ |
| `vp-0953` | [Quang Loc Le](https://vietprofs.roars.dev/people/vp-0953.html) | University College London | Computer Science | ✅ | ⏳ | ✅ |
| `vp-0954` | [Tan Vo-Thanh](https://vietprofs.roars.dev/people/vp-0954.html) | EMLV Business School | Marketing | ⏳ | ⏳ | ✅ |
| `vp-0955` | [Hung Do](https://vietprofs.roars.dev/people/vp-0955.html) | Massey University | School of Accountancy, Economics and Finance | ⏳ | ⏳ | ⏳ |
| `vp-0956` | [Duc Khuong Nguyen](https://vietprofs.roars.dev/people/vp-0956.html) | EMLV Business School | Finance | ✅ | ⏳ | ✅ |
| `vp-0957` | [Hung T. T. Nguyen](https://vietprofs.roars.dev/people/vp-0957.html) | University of Illinois Urbana-Champaign | Earth Science & Environmental Change | ⏳ | ⏳ | ✅ |
| `vp-0958` | [Tammy Vo Nguyen](https://vietprofs.roars.dev/people/vp-0958.html) | Wesleyan University | Art and Art History | ⏳ | ⏳ | ✅ |
| `vp-0959` | [Holly Nguyen](https://vietprofs.roars.dev/people/vp-0959.html) | Pennsylvania State University | Sociology and Criminology | ⏳ | ⏳ | ✅ |

---

### Batch 20 (vp-0960 – vp-1007, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-0960` | [Hong-An Truong](https://vietprofs.roars.dev/people/vp-0960.html) | University of North Carolina at Chapel Hill | Art and Art History | ⏳ | ⏳ | ✅ |
| `vp-0961` | [Dinh Loc Duong](https://vietprofs.roars.dev/people/vp-0961.html) | University of Maine | Physics and Astronomy | ⏳ | ⏳ | ✅ |
| `vp-0962` | [Tra Huynh](https://vietprofs.roars.dev/people/vp-0962.html) | Western Washington University | Physics and Astronomy | ⏳ | ⏳ | ✅ |
| `vp-0963` | [Tran Nguyen Templeton](https://vietprofs.roars.dev/people/vp-0963.html) | Teachers College, Columbia University | Curriculum and Teaching | ⏳ | ⏳ | ✅ |
| `vp-0964` | [Quynh N. Pham](https://vietprofs.roars.dev/people/vp-0964.html) | University of San Francisco | International Studies | ⏳ | ⏳ | ⏳ |
| `vp-0965` | [Quynh Anh Nguyen](https://vietprofs.roars.dev/people/vp-0965.html) | Vanderbilt University | Pharmacology | ⏳ | ⏳ | ✅ |
| `vp-0966` | [Quynh Hoang](https://vietprofs.roars.dev/people/vp-0966.html) | University of Leicester | Marketing and Strategy | ⏳ | ⏳ | ⏳ |
| `vp-0967` | [Khanh Dao Duc](https://vietprofs.roars.dev/people/vp-0967.html) | University of British Columbia | Mathematics | ✅ | ⏳ | ✅ |
| `vp-0968` | [Quan M. P. Nguyen](https://vietprofs.roars.dev/people/vp-0968.html) | University of Sussex | Accounting and Finance | ⏳ | ⏳ | ⏳ |
| `vp-0969` | [Binh Vu](https://vietprofs.roars.dev/people/vp-0969.html) | University of Houston | William A. Brookshire Department of Chemical and Biomolecular Engineering | ⏳ | ⏳ | ✅ |
| `vp-0970` | [Phuong Nguyen - University of Miami](https://vietprofs.roars.dev/people/vp-0970.html) | University of Miami | Computer Science / Institute for Data Science and Computing | ⏳ | ⏳ | ✅ |
| `vp-0971` | [Truc Tran](https://vietprofs.roars.dev/people/vp-0971.html) | Weill Cornell Medicine | Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0972` | [Katherine Nguyen](https://vietprofs.roars.dev/people/vp-0972.html) | University of California, San Diego | Medicine (Rheumatology) | ⏳ | ⏳ | ⏳ |
| `vp-0973` | [Katherine Nguyen Williams](https://vietprofs.roars.dev/people/vp-0973.html) | University of California, San Diego | Psychiatry | ⏳ | ⏳ | ⏳ |
| `vp-0974` | [Jennifer H. Pham](https://vietprofs.roars.dev/people/vp-0974.html) | University of Illinois Chicago | Pharmacy Practice | ⏳ | ⏳ | ✅ |
| `vp-0975` | [Thanh Tran - University of Texas Southwestern Medical Center](https://vietprofs.roars.dev/people/vp-0975.html) | University of Texas Southwestern Medical Center | Internal Medicine (Division of Hospital Medicine) | ⏳ | ⏳ | ✅ |
| `vp-0976` | [Christian Nguyen](https://vietprofs.roars.dev/people/vp-0976.html) | University of Texas Health Science Center at San Antonio | Medicine (Division of Hospital Medicine) | ⏳ | ⏳ | ⏳ |
| `vp-0977` | [Susan Nguyen](https://vietprofs.roars.dev/people/vp-0977.html) | Ohio State University | Pharmacy Practice and Science | ⏳ | ⏳ | ✅ |
| `vp-0978` | [Katrina Nguyen](https://vietprofs.roars.dev/people/vp-0978.html) | Xavier University of Louisiana | Clinical and Administrative Sciences | ⏳ | ⏳ | ⏳ |
| `vp-0979` | [Nam Nguyen - Xavier University of Louisiana](https://vietprofs.roars.dev/people/vp-0979.html) | Xavier University of Louisiana | Clinical and Administrative Sciences | ⏳ | ⏳ | ⏳ |
| `vp-0980` | [H. Bryant Nguyen](https://vietprofs.roars.dev/people/vp-0980.html) | Loma Linda University | Medicine | ⏳ | ⏳ | ⏳ |
| `vp-0981` | [Ba D. Nguyen](https://vietprofs.roars.dev/people/vp-0981.html) | Mayo Clinic College of Medicine and Science | Radiology | ⏳ | ⏳ | ⏳ |
| `vp-0982` | [Cuong C. Nguyen](https://vietprofs.roars.dev/people/vp-0982.html) | Mayo Clinic College of Medicine and Science | Gastroenterology and Hepatology | ⏳ | ⏳ | ✅ |
| `vp-0983` | [Nguyen H. Tran](https://vietprofs.roars.dev/people/vp-0983.html) | Mayo Clinic College of Medicine and Science | Oncology | ⏳ | ⏳ | ✅ |
| `vp-0984` | [Michelle C. Nguyen](https://vietprofs.roars.dev/people/vp-0984.html) | Mayo Clinic College of Medicine and Science | Surgery (Division of Transplant Surgery) | ⏳ | ⏳ | ⏳ |
| `vp-0985` | [Aivi T. Nguyen](https://vietprofs.roars.dev/people/vp-0985.html) | Mayo Clinic College of Medicine and Science | Laboratory Medicine and Pathology | ⏳ | ⏳ | ✅ |
| `vp-0986` | [Long H. Nguyen](https://vietprofs.roars.dev/people/vp-0986.html) | Harvard Medical School | Medicine (Massachusetts General Hospital, Gastroenterology) | ⏳ | ⏳ | ⏳ |
| `vp-0987` | [Nam Hai Pham](https://vietprofs.roars.dev/people/vp-0987.html) | Institute of Science Tokyo | Electrical and Electronic Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0988` | [Duc Anh Le](https://vietprofs.roars.dev/people/vp-0988.html) | University of Tokyo | Electrical Engineering and Information Systems | ⏳ | ⏳ | ✅ |
| `vp-0989` | [Quan Manh Phung](https://vietprofs.roars.dev/people/vp-0989.html) | Nagoya University | Chemistry | ⏳ | ⏳ | ✅ |
| `vp-0990` | [Viet Ton Ta](https://vietprofs.roars.dev/people/vp-0990.html) | Kyushu University | Faculty of Agriculture | ⏳ | ⏳ | ✅ |
| `vp-0991` | [Gia Minh Thao Nguyen](https://vietprofs.roars.dev/people/vp-0991.html) | Shimane University | Mechanical, Electrical and Electronic Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0992` | [Hien Duy Nguyen](https://vietprofs.roars.dev/people/vp-0992.html) | Kyushu University | Institute of Mathematics for Industry | ✅ | ⏳ | ✅ |
| `vp-0993` | [Quoc Hung Nguyen](https://vietprofs.roars.dev/people/vp-0993.html) | Aoyama Gakuin University | International Economics | ⏳ | ⏳ | ⏳ |
| `vp-0994` | [Giang Dinh Nguyen](https://vietprofs.roars.dev/people/vp-0994.html) | Adelaide University | School of Civil Engineering and Construction | ✅ | ⏳ | ✅ |
| `vp-0995` | [Tan Bui-Thanh](https://vietprofs.roars.dev/people/vp-0995.html) | The University of Texas at Austin | Aerospace Engineering and Engineering Mechanics | ✅ | ⏳ | ✅ |
| `vp-0996` | [Andy Nguyen](https://vietprofs.roars.dev/people/vp-0996.html) | University of Southern Queensland | School of Science, Engineering and Digital Technologies | ⏳ | ⏳ | ✅ |
| `vp-0783` | [Chat Le Nguyen](https://vietprofs.roars.dev/people/vp-0783.html) | University of Canterbury | Faculty of Law | ⏳ | ⏳ | ⏳ |
| `vp-0817` | [Thi Ngoc Lam Tran](https://vietprofs.roars.dev/people/vp-0817.html) | Chalmers University of Technology | Department of Microtechnology and Nanoscience (MC2) | ⏳ | ⏳ | ⏳ |
| `vp-0997` | [Anh Tuan Le](https://vietprofs.roars.dev/people/vp-0997.html) | Chalmers University of Technology | Electric Power Engineering, Electrical Engineering | ⏳ | ⏳ | ⏳ |
| `vp-0998` | [Muoi Tran](https://vietprofs.roars.dev/people/vp-0998.html) | Chalmers University of Technology | Computer and Network Systems, Computer Science and Engineering | ✅ | ⏳ | ✅ |
| `vp-0999` | [Dan Cao](https://vietprofs.roars.dev/people/vp-0999.html) | Georgetown University | Economics | ⏳ | ⏳ | ⏳ |
| `vp-1000` | [Cuong Le Van](https://vietprofs.roars.dev/people/vp-1000.html) | Paris School of Economics | Economics | ⏳ | ⏳ | ⏳ |
| `vp-1001` | [Dinh Hoang Bach Phan](https://vietprofs.roars.dev/people/vp-1001.html) | La Trobe University | Department of Accounting, Data Analytics, Economics and Finance | ⏳ | ⏳ | ⏳ |
| `vp-1002` | [Thanh Huynh](https://vietprofs.roars.dev/people/vp-1002.html) | Monash University | Banking and Finance | ⏳ | ⏳ | ✅ |
| `vp-1003` | [Nhut Hoang Nguyen](https://vietprofs.roars.dev/people/vp-1003.html) | Auckland University of Technology | Finance | ⏳ | ⏳ | ✅ |
| `vp-1004` | [Cong S. Pham](https://vietprofs.roars.dev/people/vp-1004.html) | Deakin University | Economics | ✅ | ⏳ | ✅ |
| `vp-1005` | [Tri Vi Dang](https://vietprofs.roars.dev/people/vp-1005.html) | Columbia University | Economics | ✅ | ⏳ | ✅ |
| `vp-1006` | [Son Hong Nghiem](https://vietprofs.roars.dev/people/vp-1006.html) | The University of Queensland | Centre for Health Services Research, School of Public Health | ⏳ | ⏳ | ✅ |
| `vp-1007` | [Viet-Ngu Hoang](https://vietprofs.roars.dev/people/vp-1007.html) | Queensland University of Technology | School of Economics and Finance | ⏳ | ⏳ | ⏳ |

---

### Batch 21 (vp-1008 – vp-1058, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-1008` | [Kien C. Tran](https://vietprofs.roars.dev/people/vp-1008.html) | University of Lethbridge | Economics | ⏳ | ⏳ | ✅ |
| `vp-1009` | [Dien Giau Bui](https://vietprofs.roars.dev/people/vp-1009.html) | National Chengchi University | International Business, College of Commerce | ✅ | ⏳ | ✅ |
| `vp-1010` | [Kim-Huong Nguyen](https://vietprofs.roars.dev/people/vp-1010.html) | The University of Queensland | School of Public Health | ⏳ | ⏳ | ✅ |
| `vp-1011` | [Duc D. Nguyen](https://vietprofs.roars.dev/people/vp-1011.html) | Durham University | Durham University Business School | ✅ | ⏳ | ✅ |
| `vp-1012` | [Linda Bui](https://vietprofs.roars.dev/people/vp-1012.html) | Brandeis University | Economics | ⏳ | ⏳ | ⏳ |
| `vp-1013` | [Phong T. H. Ngo](https://vietprofs.roars.dev/people/vp-1013.html) | Australian National University | Research School of Finance, Actuarial Studies and Statistics | ✅ | ⏳ | ✅ |
| `vp-1014` | [Elisabeth Huynh](https://vietprofs.roars.dev/people/vp-1014.html) | Australian National University | National Centre for Epidemiology and Population Health | ⏳ | ⏳ | ⏳ |
| `vp-1015` | [Khanh Hoang](https://vietprofs.roars.dev/people/vp-1015.html) | Lincoln University | Finance | ⏳ | ⏳ | ⏳ |
| `vp-1016` | [Hoai-Luu Q. Nguyen](https://vietprofs.roars.dev/people/vp-1016.html) | University of California, Berkeley | Haas School of Business | ⏳ | ⏳ | ⏳ |
| `vp-1018` | [Huong Thi Thu Le](https://vietprofs.roars.dev/people/vp-1018.html) | Northeastern Illinois University | College of Business and Technology | ⏳ | ⏳ | ✅ |
| `vp-1019` | [Duy-Minh Dang](https://vietprofs.roars.dev/people/vp-1019.html) | The University of Queensland | School of Mathematics and Physics | ✅ | ⏳ | ✅ |
| `vp-1020` | [Tuan Anh Luong](https://vietprofs.roars.dev/people/vp-1020.html) | De Montfort University | Leicester Castle Business School | ✅ | ⏳ | ✅ |
| `vp-1021` | [Kim Cuong Ly](https://vietprofs.roars.dev/people/vp-1021.html) | University of Nottingham | Finance, Risk and Banking | ⏳ | ⏳ | ⏳ |
| `vp-1022` | [Binh Do](https://vietprofs.roars.dev/people/vp-1022.html) | Monash University | Banking and Finance | ⏳ | ⏳ | ✅ |
| `vp-1023` | [Hanh Q. Trinh](https://vietprofs.roars.dev/people/vp-1023.html) | University of Wisconsin-Milwaukee | Health Care Administration | ⏳ | ⏳ | ⏳ |
| `vp-1024` | [Nhan Huynh](https://vietprofs.roars.dev/people/vp-1024.html) | Griffith University | Accounting, Finance and Economics | ✅ | ⏳ | ✅ |
| `vp-1025` | [Thao Le](https://vietprofs.roars.dev/people/vp-1025.html) | Georgia State University | Real Estate | ⏳ | ⏳ | ✅ |
| `vp-1026` | [Khoa Dang Truong](https://vietprofs.roars.dev/people/vp-1026.html) | Clemson University | Public Health Sciences | ⏳ | ⏳ | ✅ |
| `vp-1027` | [Kevin H. Nguyen](https://vietprofs.roars.dev/people/vp-1027.html) | Boston University | Health Law, Policy & Management | ✅ | ⏳ | ✅ |
| `vp-1028` | [Hai Anh La](https://vietprofs.roars.dev/people/vp-1028.html) | University of Canberra | National Centre for Social and Economic Modelling (NATSEM) | ⏳ | ⏳ | ⏳ |
| `vp-1029` | [Lai Trung Hoang](https://vietprofs.roars.dev/people/vp-1029.html) | The University of Western Australia | Accounting and Finance | ✅ | ⏳ | ✅ |
| `vp-1030` | [Nguyet Nguyen](https://vietprofs.roars.dev/people/vp-1030.html) | Youngstown State University | Mathematics and Statistics | ✅ | ⏳ | ✅ |
| `vp-1031` | [Viet Do](https://vietprofs.roars.dev/people/vp-1031.html) | Monash University | Banking and Finance | ⏳ | ⏳ | ⏳ |
| `vp-1032` | [Chung Tran](https://vietprofs.roars.dev/people/vp-1032.html) | Australian National University | Research School of Economics | ✅ | ⏳ | ✅ |
| `vp-1033` | [Nam T. Hoang](https://vietprofs.roars.dev/people/vp-1033.html) | University of New England | UNE Business School | ✅ | ⏳ | ✅ |
| `vp-1034` | [Minh Quang Dao](https://vietprofs.roars.dev/people/vp-1034.html) | Eastern Illinois University | Economics | ✅ | ⏳ | ✅ |
| `vp-1035` | [Van Anh Vuong](https://vietprofs.roars.dev/people/vp-1035.html) | Maastricht University | Organisation and Strategy | ✅ | ⏳ | ✅ |
| `vp-1036` | [Phong Truong](https://vietprofs.roars.dev/people/vp-1036.html) | Pennsylvania State University | Accounting | ⏳ | ⏳ | ✅ |
| `vp-1037` | [Anh Nguyet Vu](https://vietprofs.roars.dev/people/vp-1037.html) | University of Sussex | Accounting and Finance | ⏳ | ⏳ | ⏳ |
| `vp-1038` | [Tram Vu](https://vietprofs.roars.dev/people/vp-1038.html) | Monash University | Banking and Finance | ⏳ | ⏳ | ✅ |
| `vp-1039` | [Van Thuan Nguyen](https://vietprofs.roars.dev/people/vp-1039.html) | Morgan State University | Accounting and Finance | ⏳ | ⏳ | ⏳ |
| `vp-1040` | [Huong Dieu Dang](https://vietprofs.roars.dev/people/vp-1040.html) | University of Canterbury | Economics and Finance | ⏳ | ⏳ | ⏳ |
| `vp-1041` | [Thach Ngoc Pham](https://vietprofs.roars.dev/people/vp-1041.html) | Edith Cowan University | Finance | ⏳ | ⏳ | ⏳ |
| `vp-1042` | [Lanh Tat Tran](https://vietprofs.roars.dev/people/vp-1042.html) | Indiana University Bloomington | Statistics | ⏳ | ⏳ | ⏳ |
| `vp-1043` | [Edward C. Hoang](https://vietprofs.roars.dev/people/vp-1043.html) | University of Colorado Colorado Springs | Economics | ⏳ | ⏳ | ✅ |
| `vp-1044` | [Joseph Vu](https://vietprofs.roars.dev/people/vp-1044.html) | DePaul University | Finance & Real Estate | ⏳ | ⏳ | ⏳ |
| `vp-1045` | [Hao Manh Quach](https://vietprofs.roars.dev/people/vp-1045.html) | University of Lincoln | Lincoln Business School | ⏳ | ⏳ | ⏳ |
| `vp-1046` | [Giang Phung](https://vietprofs.roars.dev/people/vp-1046.html) | ISC Paris Business School | Finance-Audit | ✅ | ⏳ | ✅ |
| `vp-1047` | [Chu V. Nguyen](https://vietprofs.roars.dev/people/vp-1047.html) | University of Houston-Downtown | Finance, Accounting and Enterprise Information Systems | ⏳ | ⏳ | ⏳ |
| `vp-1048` | [Ha Truong](https://vietprofs.roars.dev/people/vp-1048.html) | RMIT University | Economics, Finance and Marketing | ⏳ | ⏳ | ✅ |
| `vp-1049` | [Huong Vu](https://vietprofs.roars.dev/people/vp-1049.html) | University of Aberdeen | Accountancy and Finance | ⏳ | ⏳ | ⏳ |
| `vp-1050` | [Tuyet Nhung Vu](https://vietprofs.roars.dev/people/vp-1050.html) | Loughborough University | Accounting and Finance | ⏳ | ⏳ | ✅ |
| `vp-1051` | [Khoa Hoang](https://vietprofs.roars.dev/people/vp-1051.html) | The University of Queensland | UQ Business School | ⏳ | ⏳ | ✅ |
| `vp-1052` | [Ca Nguyen](https://vietprofs.roars.dev/people/vp-1052.html) | University of Arkansas | Finance | ⏳ | ⏳ | ✅ |
| `vp-1053` | [Johnny Huynh](https://vietprofs.roars.dev/people/vp-1053.html) | Dartmouth College | The Dartmouth Institute for Health Policy and Clinical Practice | ✅ | ⏳ | ✅ |
| `vp-1054` | [Chi Truong](https://vietprofs.roars.dev/people/vp-1054.html) | Macquarie University | Department of Actuarial Studies and Business Analytics | ⏳ | ⏳ | ✅ |
| `vp-1055` | [Manh Cuong Pham](https://vietprofs.roars.dev/people/vp-1055.html) | Lancaster University | Accounting and Finance | ⏳ | ⏳ | ✅ |
| `vp-1056` | [Quoc Bao Pham](https://vietprofs.roars.dev/people/vp-1056.html) | University of Silesia in Katowice | Institute of Earth Sciences | ⏳ | ⏳ | ⏳ |
| `vp-1057` | [Duy Dao](https://vietprofs.roars.dev/people/vp-1057.html) | University of Calgary | Business Technology Management | ⏳ | ⏳ | ✅ |
| `vp-1058` | [Viet Anh Dang](https://vietprofs.roars.dev/people/vp-1058.html) | University of Manchester | Accounting and Finance, Alliance Manchester Business School | ⏳ | ⏳ | ✅ |

---

### Batch 22 (vp-1059 – vp-1108, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-1059` | [Nhan Le](https://vietprofs.roars.dev/people/vp-1059.html) | Australian National University | Research School of Finance, Actuarial Studies and Statistics | ✅ | ⏳ | ✅ |
| `vp-1060` | [Long Chu](https://vietprofs.roars.dev/people/vp-1060.html) | Australian National University | Arndt-Corden Department of Economics, Crawford School of Public Policy | ⏳ | ⏳ | ✅ |
| `vp-1061` | [Nhung Nghiem](https://vietprofs.roars.dev/people/vp-1061.html) | Australian National University | Department of Genome Sciences, John Curtin School of Medical Research | ⏳ | ⏳ | ⏳ |
| `vp-1062` | [Thong Dao](https://vietprofs.roars.dev/people/vp-1062.html) | Nottingham Trent University | Accounting and Finance, Nottingham Business School | ⏳ | ⏳ | ⏳ |
| `vp-1063` | [Nancy Tran](https://vietprofs.roars.dev/people/vp-1063.html) | University of Richmond | Finance, Robins School of Business | ⏳ | ⏳ | ⏳ |
| `vp-1064` | [Annette Nguyen](https://vietprofs.roars.dev/people/vp-1064.html) | Deakin University | Finance, Deakin Business School | ⏳ | ⏳ | ✅ |
| `vp-1065` | [Khoa Le](https://vietprofs.roars.dev/people/vp-1065.html) | University of Leeds | School of Mathematics | ⏳ | ⏳ | ✅ |
| `vp-1066` | [Thanh Hoang](https://vietprofs.roars.dev/people/vp-1066.html) | University of Michigan | Ophthalmology and Visual Sciences | ⏳ | ✅ | ✅ |
| `vp-1067` | [Huy Chau](https://vietprofs.roars.dev/people/vp-1067.html) | University of Manchester | Mathematics | ✅ | ⏳ | ✅ |
| `vp-1068` | [Trung Bao Hoang](https://vietprofs.roars.dev/people/vp-1068.html) | University of Greenwich | Accounting & Finance | ⏳ | ⏳ | ⏳ |
| `vp-1069` | [Minh Thi Hong Dinh](https://vietprofs.roars.dev/people/vp-1069.html) | University of Inland Norway | Business Administration | ⏳ | ⏳ | ✅ |
| `vp-1070` | [Ruby (Hong Ngoc) Nguyen](https://vietprofs.roars.dev/people/vp-1070.html) | Adelaide University | School of Economics | ⏳ | ⏳ | ✅ |
| `vp-1071` | [Long The Nguyen](https://vietprofs.roars.dev/people/vp-1071.html) | Washington State University | Department of Management, Information Systems, and Entrepreneurship | ⏳ | ⏳ | ⏳ |
| `vp-1072` | [Duong Anh Lam Tran](https://vietprofs.roars.dev/people/vp-1072.html) | University of Tsukuba | Faculty of Engineering, Information and Systems | ✅ | ⏳ | ✅ |
| `vp-1073` | [Minh-Tam Thi Bui](https://vietprofs.roars.dev/people/vp-1073.html) | Srinakharinwirot University | Economics | ⏳ | ⏳ | ⏳ |
| `vp-1074` | [Truc Thanh Ngo](https://vietprofs.roars.dev/people/vp-1074.html) | University of San Diego | Industrial and Systems Engineering | ⏳ | ⏳ | ✅ |
| `vp-1075` | [William Phan](https://vietprofs.roars.dev/people/vp-1075.html) | North Carolina State University | Economics | ✅ | ⏳ | ✅ |
| `vp-1076` | [Canh Thien Dang](https://vietprofs.roars.dev/people/vp-1076.html) | King's College London | Economics | ✅ | ⏳ | ✅ |
| `vp-1077` | [Thach-Thao Duong](https://vietprofs.roars.dev/people/vp-1077.html) | Murdoch University | Computer Science | ⏳ | ⏳ | ⏳ |
| `vp-1078` | [Duc Anh Pham](https://vietprofs.roars.dev/people/vp-1078.html) | University of Cincinnati | Department of Electrical and Computer Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1079` | [Bao Tan Huynh](https://vietprofs.roars.dev/people/vp-1079.html) | Singapore Management University | Economics | ✅ | ⏳ | ✅ |
| `vp-1080` | [Thuy-Duong To](https://vietprofs.roars.dev/people/vp-1080.html) | University of New South Wales | School of Banking and Finance | ⏳ | ⏳ | ✅ |
| `vp-1081` | [Thuy D. Bui](https://vietprofs.roars.dev/people/vp-1081.html) | University of Pittsburgh | General Internal Medicine | ⏳ | ⏳ | ✅ |
| `vp-1082` | [Huong (Hana) Nguyen](https://vietprofs.roars.dev/people/vp-1082.html) | California State University, Northridge | Business Law | ⏳ | ⏳ | ⏳ |
| `vp-1083` | [Linh N. Bui](https://vietprofs.roars.dev/people/vp-1083.html) | California State University, Bakersfield | Public Health | ⏳ | ⏳ | ✅ |
| `vp-1084` | [Simon Quach](https://vietprofs.roars.dev/people/vp-1084.html) | University of Southern California | Economics | ✅ | ⏳ | ✅ |
| `vp-1085` | [Tony H. Truong](https://vietprofs.roars.dev/people/vp-1085.html) | University of Calgary | Departments of Oncology and Pediatrics, Cumming School of Medicine | ⏳ | ✅ | ✅ |
| `vp-1086` | [Quyen D. Chu](https://vietprofs.roars.dev/people/vp-1086.html) | Howard University | Department of Surgery (Surgical Oncology), College of Medicine | ⏳ | ⏳ | ✅ |
| `vp-1087` | [Anh Thu Mai](https://vietprofs.roars.dev/people/vp-1087.html) | Purdue University Northwest | Finance, College of Business | ✅ | ⏳ | ✅ |
| `vp-1088` | [Hung Viet Chu](https://vietprofs.roars.dev/people/vp-1088.html) | Washington and Lee University | Mathematics | ✅ | ⏳ | ✅ |
| `vp-1089` | [Kiet Tieu](https://vietprofs.roars.dev/people/vp-1089.html) | University of Wollongong | School of Mechanical, Materials, Mechatronic and Biomedical Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1090` | [Thuong Nguyen](https://vietprofs.roars.dev/people/vp-1090.html) | Victoria University of Wellington | School of Mathematics and Statistics | ⏳ | ⏳ | ⏳ |
| `vp-1091` | [Liet Vo](https://vietprofs.roars.dev/people/vp-1091.html) | The University of Texas Rio Grande Valley | School of Mathematical and Statistical Sciences | ✅ | ⏳ | ✅ |
| `vp-1092` | [Jo (Chau) Vu](https://vietprofs.roars.dev/people/vp-1092.html) | Victoria University | Victoria University Business School | ⏳ | ⏳ | ⏳ |
| `vp-1093` | [Nguyet Thi Khanh Cao](https://vietprofs.roars.dev/people/vp-1093.html) | Kyoto University of Advanced Science | Department of Economics | ⏳ | ⏳ | ✅ |
| `vp-1094` | [Viet-Dung Doan](https://vietprofs.roars.dev/people/vp-1094.html) | Hong Kong Baptist University | Department of Accountancy, Economics and Finance | ⏳ | ⏳ | ✅ |
| `vp-1095` | [Mai Tuyet Pho](https://vietprofs.roars.dev/people/vp-1095.html) | University of Chicago | Section of Infectious Diseases and Global Health | ⏳ | ⏳ | ✅ |
| `vp-1096` | [Phat Vinh Luong](https://vietprofs.roars.dev/people/vp-1096.html) | The University of Texas Permian Basin | Department of Management, Marketing, & Industrial Technology | ⏳ | ⏳ | ⏳ |
| `vp-1097` | [Sylvia Pham](https://vietprofs.roars.dev/people/vp-1097.html) | Kutztown University of Pennsylvania | Rohrbach Library | ⏳ | ⏳ | ⏳ |
| `vp-1098` | [Ha Phuong Luong](https://vietprofs.roars.dev/people/vp-1098.html) | University of Reading | International Business and Strategy, Henley Business School | ⏳ | ⏳ | ✅ |
| `vp-1099` | [Thomy Phan](https://vietprofs.roars.dev/people/vp-1099.html) | University of Bayreuth | Institute of Computer Science | ✅ | ⏳ | ✅ |
| `vp-1100` | [Anh D. Ngo](https://vietprofs.roars.dev/people/vp-1100.html) | Norfolk State University | Finance | ✅ | ⏳ | ✅ |
| `vp-1101` | [Thuy Bui](https://vietprofs.roars.dev/people/vp-1101.html) | Slippery Rock University of Pennsylvania | Finance | ⏳ | ⏳ | ⏳ |
| `vp-1102` | [David Hoa Khoa Nguyen](https://vietprofs.roars.dev/people/vp-1102.html) | Indiana University Indianapolis | Urban Education Counseling, Leadership & Policy Studies | ⏳ | ⏳ | ✅ |
| `vp-1103` | [Van Thanh Huynh](https://vietprofs.roars.dev/people/vp-1103.html) | Deakin University | School of Engineering | ✅ | ⏳ | ✅ |
| `vp-1104` | [Trang Thi Kieu Tran](https://vietprofs.roars.dev/people/vp-1104.html) | Deakin University | Deakin Law School | ⏳ | ⏳ | ✅ |
| `vp-1105` | [Quynh Do](https://vietprofs.roars.dev/people/vp-1105.html) | Lancaster University | Management Science | ⏳ | ⏳ | ✅ |
| `vp-1106` | [Hien Phan](https://vietprofs.roars.dev/people/vp-1106.html) | Boise State University | Art, Design and Visual Studies | ✅ | ⏳ | ✅ |
| `vp-1107` | [Diane Nguyen](https://vietprofs.roars.dev/people/vp-1107.html) | Baylor College of Medicine | Pediatrics | ⏳ | ⏳ | ⏳ |
| `vp-1108` | [Ellie Luu](https://vietprofs.roars.dev/people/vp-1108.html) | University of Strathclyde | Accounting and Finance | ⏳ | ⏳ | ⏳ |

---

### Batch 23 (vp-1109 – vp-1162, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-1109` | [Phong Luu](https://vietprofs.roars.dev/people/vp-1109.html) | University of North Georgia | Mathematics | ✅ | ⏳ | ✅ |
| `vp-1110` | [Hang Le](https://vietprofs.roars.dev/people/vp-1110.html) | University of Nottingham | Finance, Accounting and Banking | ⏳ | ⏳ | ✅ |
| `vp-1111` | [Kim-Ngan Le](https://vietprofs.roars.dev/people/vp-1111.html) | Monash University | School of Mathematics | ⏳ | ⏳ | ⏳ |
| `vp-1112` | [Ngoc-Yen Tran](https://vietprofs.roars.dev/people/vp-1112.html) | Seattle University | Lemieux Library and McGoldrick Learning Commons | ⏳ | ⏳ | ⏳ |
| `vp-1113` | [Tony Nguyen](https://vietprofs.roars.dev/people/vp-1113.html) | Rutgers University | George F. Smith Library of the Health Sciences | ⏳ | ⏳ | ⏳ |
| `vp-1114` | [Clara Tran](https://vietprofs.roars.dev/people/vp-1114.html) | Stony Brook University | University Libraries | ⏳ | ⏳ | ⏳ |
| `vp-1115` | [Tracy T. Nguyen](https://vietprofs.roars.dev/people/vp-1115.html) | SUNY College of Optometry | Optometry | ⏳ | ⏳ | ⏳ |
| `vp-1116` | [Kevin Nguyen](https://vietprofs.roars.dev/people/vp-1116.html) | Drexel University | Physician Assistant Department | ⏳ | ⏳ | ✅ |
| `vp-1117` | [Thuy Dieu Nguyen](https://vietprofs.roars.dev/people/vp-1117.html) | University of Michigan | Health Management and Policy | ⏳ | ⏳ | ⏳ |
| `vp-1118` | [Thuy-Anh T. Nguyen](https://vietprofs.roars.dev/people/vp-1118.html) | University of Michigan | Asian Languages and Cultures | ⏳ | ⏳ | ⏳ |
| `vp-1119` | [Uyen T. Nguyen](https://vietprofs.roars.dev/people/vp-1119.html) | Harvard University | History and East Asian Languages and Civilizations | ⏳ | ⏳ | ✅ |
| `vp-1120` | [Linda Nguyen](https://vietprofs.roars.dev/people/vp-1120.html) | Stanford University | Medicine - Gastroenterology & Hepatology | ⏳ | ⏳ | ✅ |
| `vp-1121` | [Vinh Nguyen](https://vietprofs.roars.dev/people/vp-1121.html) | The University of Texas at Austin | School of Nursing | ⏳ | ⏳ | ⏳ |
| `vp-1122` | [Luc Nguyen](https://vietprofs.roars.dev/people/vp-1122.html) | University of Oxford | Mathematical Institute | ⏳ | ⏳ | ⏳ |
| `vp-1124` | [Quynh Doan](https://vietprofs.roars.dev/people/vp-1124.html) | University of British Columbia | Department of Pediatrics | ⏳ | ⏳ | ⏳ |
| `vp-1125` | [Ngoc Cuong Nguyen](https://vietprofs.roars.dev/people/vp-1125.html) | KAIST | Department of Mathematical Sciences | ⏳ | ⏳ | ⏳ |
| `vp-1126` | [Cam Nguyen](https://vietprofs.roars.dev/people/vp-1126.html) | Texas A&M University | Electrical and Computer Engineering | ⏳ | ⏳ | ✅ |
| `vp-1127` | [Phong Q. Nguyen](https://vietprofs.roars.dev/people/vp-1127.html) | Inria | Computer Science Department, ENS / CASCADE project-team, Inria Paris | ⏳ | ⏳ | ✅ |
| `vp-1128` | [Benjamin Nguyen - INSA Centre Val de Loire](https://vietprofs.roars.dev/people/vp-1128.html) | INSA Centre Val de Loire | Laboratoire d'Informatique Fondamentale d'Orléans (LIFO), Computer Science | ⏳ | ⏳ | ✅ |
| `vp-1129` | [Nha Nguyen](https://vietprofs.roars.dev/people/vp-1129.html) | Université de Moncton | Faculty of Business Administration | ⏳ | ⏳ | ⏳ |
| `vp-1130` | [Thu Pham-Gia](https://vietprofs.roars.dev/people/vp-1130.html) | Université de Moncton | Department of Mathematics and Statistics | ⏳ | ⏳ | ⏳ |
| `vp-1131` | [Nhan Nguyen](https://vietprofs.roars.dev/people/vp-1131.html) | University of Oulu | Centre for Wireless Communications, Faculty of Information Technology and Electrical Engineering | ⏳ | ⏳ | ✅ |
| `vp-1132` | [Hieu Nguyen](https://vietprofs.roars.dev/people/vp-1132.html) | University of South-Eastern Norway | Department of Natural Science and Industrial Systems, Electrical Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1133` | [Dong Trong Nguyen](https://vietprofs.roars.dev/people/vp-1133.html) | Norwegian University of Science and Technology | Department of Marine Technology, Marine Engineering | ⏳ | ⏳ | ✅ |
| `vp-1134` | [Laurent Pham-Van](https://vietprofs.roars.dev/people/vp-1134.html) | Commissariat à l'énergie atomique et aux énergies alternatives (CEA) | Laboratoire d'Électronique et Photonique Organique (LEPO), CEA-SPEC, Electrical Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1135` | [Tuan Minh Nguyen](https://vietprofs.roars.dev/people/vp-1135.html) | Lawrence Livermore National Laboratory | Materials Science Division, Physical and Life Sciences Directorate | ⏳ | ⏳ | ✅ |
| `vp-1136` | [Ngoc A. Nguyen](https://vietprofs.roars.dev/people/vp-1136.html) | Oak Ridge National Laboratory | Chemical Sciences Division, Materials Science | ⏳ | ⏳ | ⏳ |
| `vp-1137` | [My-Le Nguyen](https://vietprofs.roars.dev/people/vp-1137.html) | National Heart, Lung, and Blood Institute | Division of Intramural Research, Echocardiography Laboratory, Cardiovascular Medicine | ⏳ | ⏳ | ✅ |
| `vp-1138` | [Ruby Nguyen](https://vietprofs.roars.dev/people/vp-1138.html) | Idaho National Laboratory | Resilience Optimization Center, Systems Dynamics and Modeling, Operations Research | ⏳ | ⏳ | ⏳ |
| `vp-1140` | [Vu Nguyen](https://vietprofs.roars.dev/people/vp-1140.html) | CSIRO | Manufacturing and Materials | ⏳ | ⏳ | ✅ |
| `vp-1141` | [Chuong Nguyen](https://vietprofs.roars.dev/people/vp-1141.html) | CSIRO | Data61, Computer Vision and Machine Learning | ⏳ | ⏳ | ✅ |
| `vp-1142` | [Anthony Nguyen](https://vietprofs.roars.dev/people/vp-1142.html) | CSIRO | Australian e-Health Research Centre, Health Data and Text Analytics | ⏳ | ⏳ | ✅ |
| `vp-1143` | [Minh Tam Truong](https://vietprofs.roars.dev/people/vp-1143.html) | Boston University | Radiation Oncology | ⏳ | ⏳ | ✅ |
| `vp-1145` | [Hoang Tran](https://vietprofs.roars.dev/people/vp-1145.html) | Oak Ridge National Laboratory | Computer Science and Mathematics Division | ⏳ | ⏳ | ✅ |
| `vp-1146` | [Dinh C. Nguyen](https://vietprofs.roars.dev/people/vp-1146.html) | SLAC National Accelerator Laboratory | Accelerator Directorate | ⏳ | ✅ | ✅ |
| `vp-1147` | [Nghi Q. Lam](https://vietprofs.roars.dev/people/vp-1147.html) | Argonne National Laboratory | Materials Science Division | ⏳ | ⏳ | ✅ |
| `vp-1148` | [Hao Phan](https://vietprofs.roars.dev/people/vp-1148.html) | Northern Illinois University | University Libraries | ⏳ | ⏳ | ⏳ |
| `vp-1149` | [Amy Pham](https://vietprofs.roars.dev/people/vp-1149.html) | University of San Diego | Copley Library | ⏳ | ⏳ | ⏳ |
| `vp-1151` | [Ann Hoang](https://vietprofs.roars.dev/people/vp-1151.html) | New Jersey Institute of Technology | Robert W. Van Houten Library | ⏳ | ⏳ | ⏳ |
| `vp-1152` | [Hung Trung Nguyen](https://vietprofs.roars.dev/people/vp-1152.html) | New Mexico State University | Department of Mathematical Sciences | ⏳ | ⏳ | ✅ |
| `vp-1153` | [Trien Nguyen](https://vietprofs.roars.dev/people/vp-1153.html) | University of Waterloo | Department of Economics | ⏳ | ⏳ | ⏳ |
| `vp-1154` | [Minh-Ha Pham](https://vietprofs.roars.dev/people/vp-1154.html) | CNRS (Centre National de la Recherche Scientifique) | Direction Europe et International | ⏳ | ⏳ | ⏳ |
| `vp-1155` | [My Hang Huynh](https://vietprofs.roars.dev/people/vp-1155.html) | Los Alamos National Laboratory | High Explosives Science and Technology Group, Materials Chemistry | ⏳ | ⏳ | ✅ |
| `vp-1156` | [Ly Thi Tran](https://vietprofs.roars.dev/people/vp-1156.html) | Deakin University | School of Education | ⏳ | ⏳ | ✅ |
| `vp-1157` | [Hien Trong Nguyen](https://vietprofs.roars.dev/people/vp-1157.html) | NASA Jet Propulsion Laboratory | Astrophysics and Space Sciences Section | ⏳ | ⏳ | ✅ |
| `vp-1158` | [Frédéric Pham](https://vietprofs.roars.dev/people/vp-1158.html) | Université Côte d'Azur | Laboratoire J.A. Dieudonné, Département de Mathématiques | ⏳ | ⏳ | ✅ |
| `vp-1159` | [Tuong-Phong Bui](https://vietprofs.roars.dev/people/vp-1159.html) | Stanford University | Computer Science | ⏳ | ⏳ | ✅ |
| `vp-1160` | [Buu-Hoi Nguyen-Phuc](https://vietprofs.roars.dev/people/vp-1160.html) | CNRS (Centre National de la Recherche Scientifique) | Institut du Radium, Chimie Organique et Cancérologie, Biological & Biomedical Sciences | ⏳ | ⏳ | ✅ |
| `vp-1161` | [Trang Dung Le](https://vietprofs.roars.dev/people/vp-1161.html) | Université Paris Cité | Département de Mathématiques, Institut de Mathématiques de Jussieu | ⏳ | ⏳ | ✅ |
| `vp-1162` | [Dong Ngo](https://vietprofs.roars.dev/people/vp-1162.html) | University of Florida | Department of Entomology and Nematology | ⏳ | ⏳ | ⏳ |

---

### Batch 24 (vp-1163 – vp-1215, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-1163` | [Hai Quang Tran](https://vietprofs.roars.dev/people/vp-1163.html) | CNRS (Centre National de la Recherche Scientifique) | Laboratoire d'Ethnomusicologie, Musée de l'Homme, Arts & Design | ⏳ | ⏳ | ✅ |
| `vp-1164` | [Ha Bui](https://vietprofs.roars.dev/people/vp-1164.html) | Grinnell College | Economics | ✅ | ⏳ | ✅ |
| `vp-1165` | [Joy Marie Doan](https://vietprofs.roars.dev/people/vp-1165.html) | University of Tennessee, Knoxville | School of Information Sciences | ✅ | ⏳ | ✅ |
| `vp-1166` | [Viet Thanh Nguyen](https://vietprofs.roars.dev/people/vp-1166.html) | University of Southern California | English, American Studies and Ethnicity, and Comparative Literature | ⏳ | ⏳ | ✅ |
| `vp-1167` | [Thuy Le](https://vietprofs.roars.dev/people/vp-1167.html) | Duke University | Medicine and Molecular Genetics and Microbiology | ⏳ | ⏳ | ⏳ |
| `vp-1170` | [Minh Bui](https://vietprofs.roars.dev/people/vp-1170.html) | Australian National University | School of Computing | ⏳ | ⏳ | ✅ |
| `vp-1171` | [Dinh Phan](https://vietprofs.roars.dev/people/vp-1171.html) | La Trobe University | La Trobe Business School | ⏳ | ⏳ | ⏳ |
| `vp-1172` | [Sara Quach Thaichon](https://vietprofs.roars.dev/people/vp-1172.html) | Griffith University | Department of Tourism and Marketing | ⏳ | ⏳ | ⏳ |
| `vp-1173` | [Huu Hao Ngo](https://vietprofs.roars.dev/people/vp-1173.html) | University of Technology Sydney | School of Civil, Environmental and Sociotechnical Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1174` | [Xuan Thinh Duong](https://vietprofs.roars.dev/people/vp-1174.html) | Macquarie University | School of Mathematical and Physical Sciences | ⏳ | ⏳ | ✅ |
| `vp-1175` | [Thong Pham - Adelaide University](https://vietprofs.roars.dev/people/vp-1175.html) | Adelaide University | School of Civil Engineering and Construction | ⏳ | ⏳ | ⏳ |
| `vp-1176` | [Tuan Anh Nguyen - Swinburne University of Technology](https://vietprofs.roars.dev/people/vp-1176.html) | Swinburne University of Technology | Iverson Health Innovation Research Institute | ⏳ | ⏳ | ⏳ |
| `vp-1177` | [Ly Tran](https://vietprofs.roars.dev/people/vp-1177.html) | Deakin University | School of Education | ⏳ | ⏳ | ✅ |
| `vp-1178` | [Van Ly Nguyen](https://vietprofs.roars.dev/people/vp-1178.html) | University of Kansas | Electrical Engineering and Computer Science | ✅ | ⏳ | ✅ |
| `vp-1179` | [Long Bao Le](https://vietprofs.roars.dev/people/vp-1179.html) | INRS (Institut national de la recherche scientifique) | Centre Énergie Matériaux Télécommunications | ✅ | ⏳ | ✅ |
| `vp-1180` | [Minh N. Vu](https://vietprofs.roars.dev/people/vp-1180.html) | Los Alamos National Laboratory | Theoretical Division, Computing and Artificial Intelligence | ⏳ | ⏳ | ⏳ |
| `vp-1181` | [Brian Kha Tran](https://vietprofs.roars.dev/people/vp-1181.html) | California State University, Long Beach | Mathematics and Statistics | ✅ | ⏳ | ✅ |
| `vp-1182` | [Minh Dung Phan](https://vietprofs.roars.dev/people/vp-1182.html) | Asian Institute of Technology | Information and Communication Technologies | ✅ | ⏳ | ✅ |
| `vp-1183` | [Hong-Linh Truong](https://vietprofs.roars.dev/people/vp-1183.html) | Aalto University | Computer Science | ⏳ | ✅ | ✅ |
| `vp-1184` | [Thi-Kien Dao](https://vietprofs.roars.dev/people/vp-1184.html) | Fuzhou Institute of Technology | Electronic Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1185` | [Thang Xuan Vu](https://vietprofs.roars.dev/people/vp-1185.html) | University of Luxembourg | Interdisciplinary Centre for Security, Reliability and Trust | ✅ | ⏳ | ✅ |
| `vp-1186` | [Trieu-Kien Truong](https://vietprofs.roars.dev/people/vp-1186.html) | National Cheng Kung University | Engineering Science | ⏳ | ⏳ | ✅ |
| `vp-1187` | [Bao Q. Truong](https://vietprofs.roars.dev/people/vp-1187.html) | Northern Michigan University | Mathematics and Computer Science | ⏳ | ⏳ | ⏳ |
| `vp-1188` | [Quoc Bao Vo](https://vietprofs.roars.dev/people/vp-1188.html) | Swinburne University of Technology | School of Science, Computing and Emerging Technologies | ⏳ | ⏳ | ⏳ |
| `vp-1189` | [Dung Hoang Duong](https://vietprofs.roars.dev/people/vp-1189.html) | University of Wollongong | School of Computing and Information Technology | ⏳ | ⏳ | ⏳ |
| `vp-1190` | [Thanh V. Tran](https://vietprofs.roars.dev/people/vp-1190.html) | Boston College | School of Social Work | ⏳ | ⏳ | ⏳ |
| `vp-1191` | [Kim-Phuong L. Vu](https://vietprofs.roars.dev/people/vp-1191.html) | California State University, Long Beach | Department of Psychology | ⏳ | ⏳ | ✅ |
| `vp-1192` | [Hai L. Vu](https://vietprofs.roars.dev/people/vp-1192.html) | Monash University | Department of Civil Engineering | ⏳ | ⏳ | ✅ |
| `vp-1193` | [Huy P. Phan](https://vietprofs.roars.dev/people/vp-1193.html) | University of New England | School of Education | ⏳ | ⏳ | ⏳ |
| `vp-1194` | [Hong Tien Vu](https://vietprofs.roars.dev/people/vp-1194.html) | University of Colorado Boulder | Department of Journalism | ⏳ | ⏳ | ⏳ |
| `vp-1195` | [Vinh N. Dang](https://vietprofs.roars.dev/people/vp-1195.html) | Paul Scherrer Institute | Laboratory for Energy Systems Analysis | ⏳ | ⏳ | ⏳ |
| `vp-1196` | [Long Tien Truong](https://vietprofs.roars.dev/people/vp-1196.html) | La Trobe University | Department of Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1197` | [Thanh Ngo](https://vietprofs.roars.dev/people/vp-1197.html) | Massey University | School of Aviation | ⏳ | ⏳ | ⏳ |
| `vp-1198` | [Lam Thi Mai Huynh](https://vietprofs.roars.dev/people/vp-1198.html) | University of Tsukuba | Faculty of Humanities and Social Sciences | ⏳ | ⏳ | ⏳ |
| `vp-1199` | [Son Truong](https://vietprofs.roars.dev/people/vp-1199.html) | Dalhousie University | School of Health and Human Performance | ⏳ | ⏳ | ⏳ |
| `vp-1200` | [Manh Hong Duong](https://vietprofs.roars.dev/people/vp-1200.html) | University of Birmingham | School of Mathematics | ⏳ | ⏳ | ⏳ |
| `vp-1201` | [Huong Thanh Bui](https://vietprofs.roars.dev/people/vp-1201.html) | Ritsumeikan Asia Pacific University | College of Asia Pacific Studies | ⏳ | ⏳ | ⏳ |
| `vp-1202` | [Anh Van Vo](https://vietprofs.roars.dev/people/vp-1202.html) | Queensland University of Technology | School of Mathematical Sciences | ⏳ | ⏳ | ⏳ |
| `vp-1203` | [Anh-Huy Phan](https://vietprofs.roars.dev/people/vp-1203.html) | Skolkovo Institute of Science and Technology | Center for Artificial Intelligence Technology | ⏳ | ⏳ | ⏳ |
| `vp-1205` | [Tao Pham Dinh](https://vietprofs.roars.dev/people/vp-1205.html) | INSA Rouen Normandie | Laboratoire de Mathématiques de l'INSA | ⏳ | ⏳ | ⏳ |
| `vp-1206` | [Tuan Kim Vu](https://vietprofs.roars.dev/people/vp-1206.html) | University of West Georgia | Department of Mathematics | ⏳ | ⏳ | ✅ |
| `vp-1207` | [The Anh Bui](https://vietprofs.roars.dev/people/vp-1207.html) | Macquarie University | School of Mathematical and Physical Sciences | ⏳ | ⏳ | ⏳ |
| `vp-1208` | [Hoa Huu Phuc Nguyen](https://vietprofs.roars.dev/people/vp-1208.html) | Ruhr University Bochum | Department of Human Genetics | ⏳ | ⏳ | ⏳ |
| `vp-1209` | [Tri Giang Phan](https://vietprofs.roars.dev/people/vp-1209.html) | UNSW Sydney | School of Clinical Medicine | ⏳ | ⏳ | ⏳ |
| `vp-1210` | [Thien Thanh Dang-Vu](https://vietprofs.roars.dev/people/vp-1210.html) | Concordia University | Department of Health, Kinesiology and Applied Physiology | ⏳ | ⏳ | ⏳ |
| `vp-1211` | [My-Chan Pham Dang](https://vietprofs.roars.dev/people/vp-1211.html) | CNRS (Centre National de la Recherche Scientifique) | Centre de Recherche sur l'Inflammation | ⏳ | ⏳ | ⏳ |
| `vp-1212` | [Patrice Tran Ba Huy](https://vietprofs.roars.dev/people/vp-1212.html) | Université Paris Cité | Faculté de Santé | ⏳ | ⏳ | ✅ |
| `vp-1213` | [Thien-Phong Vu Manh](https://vietprofs.roars.dev/people/vp-1213.html) | CNRS (Centre National de la Recherche Scientifique) | Centre d'Immunologie de Marseille-Luminy (CIML) | ⏳ | ⏳ | ⏳ |
| `vp-1214` | [Hong-Viet V. Ngo](https://vietprofs.roars.dev/people/vp-1214.html) | University of Essex | Department of Psychology | ⏳ | ⏳ | ⏳ |
| `vp-1215` | [Hieu Pham](https://vietprofs.roars.dev/people/vp-1215.html) | University of Alabama in Huntsville | Department of Accounting, Economics and Finance | ⏳ | ⏳ | ⏳ |

---

### Batch 25 (vp-1216 – vp-1266, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-1216` | [Phuong Hong Nguyen](https://vietprofs.roars.dev/people/vp-1216.html) | International Food Policy Research Institute | Nutrition, Diets, and Health Unit | ⏳ | ⏳ | ⏳ |
| `vp-1217` | [Hoai-Nam Truong](https://vietprofs.roars.dev/people/vp-1217.html) | INRAE (Institut National de Recherche pour l'Agriculture, l'Alimentation et l'Environnement) | UMR Agroécologie | ⏳ | ⏳ | ⏳ |
| `vp-1218` | [Bao-Lam Huynh](https://vietprofs.roars.dev/people/vp-1218.html) | University of California, Riverside | Department of Nematology | ⏳ | ⏳ | ⏳ |
| `vp-1219` | [Anh Phan - University of Surrey](https://vietprofs.roars.dev/people/vp-1219.html) | University of Surrey | School of Chemistry and Chemical Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1220` | [Anh-Vu Vo](https://vietprofs.roars.dev/people/vp-1220.html) | University College Dublin | School of Computer Science | ⏳ | ⏳ | ⏳ |
| `vp-1221` | [Duc-Anh An-Vo](https://vietprofs.roars.dev/people/vp-1221.html) | University of Southern Queensland | School of Business, Law, Humanities and Pathways | ⏳ | ⏳ | ⏳ |
| `vp-1222` | [Minh Duc Bui](https://vietprofs.roars.dev/people/vp-1222.html) | Technical University of Munich | Chair of Hydraulic and Water Resources Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1223` | [Cuong Pham-Huu](https://vietprofs.roars.dev/people/vp-1223.html) | CNRS (Centre National de la Recherche Scientifique) | Institut de Chimie et Procédés pour l'Énergie, l'Environnement et la Santé | ⏳ | ⏳ | ⏳ |
| `vp-1224` | [Phuong Nguyen-Tri](https://vietprofs.roars.dev/people/vp-1224.html) | Université du Québec à Trois-Rivières | Department of Chemistry, Biochemistry and Physics | ⏳ | ⏳ | ⏳ |
| `vp-1225` | [Doan Pham Minh](https://vietprofs.roars.dev/people/vp-1225.html) | IMT Mines Albi | Centre RAPSODEE | ⏳ | ⏳ | ⏳ |
| `vp-1226` | [Toan Trong Tran](https://vietprofs.roars.dev/people/vp-1226.html) | University of Technology Sydney | School of Electrical and Data Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1227` | [Yen Bach Truong](https://vietprofs.roars.dev/people/vp-1227.html) | CSIRO (Commonwealth Scientific and Industrial Research Organisation) | CSIRO Manufacturing | ⏳ | ⏳ | ✅ |
| `vp-1228` | [Thuy-Duong Nguyen-Phan](https://vietprofs.roars.dev/people/vp-1228.html) | National Energy Technology Laboratory | Materials Engineering and Manufacturing | ⏳ | ⏳ | ⏳ |
| `vp-1229` | [Nong Van Ngo](https://vietprofs.roars.dev/people/vp-1229.html) | Nagoya University | Center for Low-temperature Plasma Sciences | ⏳ | ⏳ | ⏳ |
| `vp-1230` | [Toi Van Vo](https://vietprofs.roars.dev/people/vp-1230.html) | Tufts University | Department of Biomedical Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1231` | [Thanh-Tuan Bui](https://vietprofs.roars.dev/people/vp-1231.html) | CY Cergy Paris Université | Laboratoire de Physicochimie des Polymères et des Interfaces | ⏳ | ⏳ | ⏳ |
| `vp-1232` | [Giang Vo-Thanh](https://vietprofs.roars.dev/people/vp-1232.html) | Université Paris-Saclay | Institut de Chimie Moléculaire et des Matériaux d'Orsay | ⏳ | ⏳ | ⏳ |
| `vp-1233` | [Anh-Thy Bui](https://vietprofs.roars.dev/people/vp-1233.html) | CNRS (Centre National de la Recherche Scientifique) | Institut des Sciences Moléculaires | ⏳ | ⏳ | ⏳ |
| `vp-1234` | [Kim-Anh Lê Cao](https://vietprofs.roars.dev/people/vp-1234.html) | The University of Melbourne | School of Mathematics and Statistics | ⏳ | ✅ | ✅ |
| `vp-1235` | [Vi Khanh Truong](https://vietprofs.roars.dev/people/vp-1235.html) | Flinders University | College of Medicine and Public Health | ⏳ | ⏳ | ⏳ |
| `vp-1236` | [Nhan Viet Tran](https://vietprofs.roars.dev/people/vp-1236.html) | Fermi National Accelerator Laboratory | AI Coordination Office and Particle Physics Division | ⏳ | ✅ | ✅ |
| `vp-1237` | [Vân Anh Huynh-Thu](https://vietprofs.roars.dev/people/vp-1237.html) | University of Liège | Department of Electrical Engineering and Computer Science | ⏳ | ⏳ | ⏳ |
| `vp-1238` | [Tuan A. Duong](https://vietprofs.roars.dev/people/vp-1238.html) | University of Pretoria | Department of Biochemistry, Genetics and Microbiology | ⏳ | ⏳ | ⏳ |
| `vp-1239` | [Quang-Dé Nguyen](https://vietprofs.roars.dev/people/vp-1239.html) | Dana-Farber Cancer Institute | Lurie Family Imaging Center | ⏳ | ⏳ | ⏳ |
| `vp-1240` | [Kim-Vy Tran](https://vietprofs.roars.dev/people/vp-1240.html) | Harvard University | Department of Astronomy | ✅ | ⏳ | ✅ |
| `vp-1241` | [Minh Huynh](https://vietprofs.roars.dev/people/vp-1241.html) | CSIRO | Space and Astronomy | ⏳ | ⏳ | ⏳ |
| `vp-1242` | [Khanh Huy Bui](https://vietprofs.roars.dev/people/vp-1242.html) | McGill University | Department of Anatomy and Cell Biology | ⏳ | ⏳ | ⏳ |
| `vp-1243` | [Minh-Duy Phan](https://vietprofs.roars.dev/people/vp-1243.html) | The University of Queensland | School of Chemistry and Molecular Biosciences | ⏳ | ⏳ | ⏳ |
| `vp-1244` | [Guy Tran Van Nhieu](https://vietprofs.roars.dev/people/vp-1244.html) | Université Paris-Saclay | Institute for Integrative Biology of the Cell | ⏳ | ⏳ | ⏳ |
| `vp-1246` | [Tuan Do](https://vietprofs.roars.dev/people/vp-1246.html) | University of California, Los Angeles | Department of Physics and Astronomy | ✅ | ⏳ | ✅ |
| `vp-1247` | [Mai-Linh Doan](https://vietprofs.roars.dev/people/vp-1247.html) | Université Grenoble Alpes | Institut des Sciences de la Terre | ⏳ | ⏳ | ⏳ |
| `vp-1248` | [Thi Hoang Duong Nguyen](https://vietprofs.roars.dev/people/vp-1248.html) | MRC Laboratory of Molecular Biology | Structural Studies Division | ⏳ | ✅ | ✅ |
| `vp-1249` | [Nguyen Dinh Dang](https://vietprofs.roars.dev/people/vp-1249.html) | RIKEN | Nishina Center for Accelerator-Based Science | ⏳ | ⏳ | ⏳ |
| `vp-1250` | [Lap Van Dao](https://vietprofs.roars.dev/people/vp-1250.html) | Swinburne University of Technology | Centre for Atom Optics and Ultrafast Spectroscopy | ⏳ | ⏳ | ⏳ |
| `vp-1251` | [Tuan V. Bui](https://vietprofs.roars.dev/people/vp-1251.html) | University of Ottawa | Department of Biology | ⏳ | ✅ | ✅ |
| `vp-1252` | [Viet Giang Truong](https://vietprofs.roars.dev/people/vp-1252.html) | Okinawa Institute of Science and Technology | Light-Matter Interactions for Quantum Technologies Unit | ⏳ | ⏳ | ⏳ |
| `vp-1253` | [T. Thang Vo-Doan](https://vietprofs.roars.dev/people/vp-1253.html) | The University of Queensland | School of Mechanical and Mining Engineering | ⏳ | ✅ | ✅ |
| `vp-1254` | [Kien Xuan Ngo](https://vietprofs.roars.dev/people/vp-1254.html) | Kanazawa University | Nano Life Science Institute | ⏳ | ⏳ | ⏳ |
| `vp-1255` | [Van A. Ngo](https://vietprofs.roars.dev/people/vp-1255.html) | Oak Ridge National Laboratory | National Center for Computational Sciences | ⏳ | ⏳ | ⏳ |
| `vp-1256` | [Tam Huynh-Dinh](https://vietprofs.roars.dev/people/vp-1256.html) | Institut Pasteur | Unité de Chimie Organique | ⏳ | ⏳ | ⏳ |
| `vp-1257` | [Thuy Le Toan](https://vietprofs.roars.dev/people/vp-1257.html) | CNRS (Centre National de la Recherche Scientifique) | Centre d'Études Spatiales de la Biosphère | ⏳ | ⏳ | ⏳ |
| `vp-1258` | [Anh-Tu Nguyen](https://vietprofs.roars.dev/people/vp-1258.html) | Université Polytechnique Hauts-de-France | Laboratoire d'Automatique, de Mécanique et d'Informatique Industrielles et Humaines | ⏳ | ⏳ | ✅ |
| `vp-1259` | [Khanh-Quang Tran](https://vietprofs.roars.dev/people/vp-1259.html) | Norwegian University of Science and Technology | Department of Energy and Process Engineering | ⏳ | ⏳ | ✅ |
| `vp-1260` | [Trang N. T. Phan](https://vietprofs.roars.dev/people/vp-1260.html) | Aix-Marseille Université | Institut de Chimie Radicalaire | ⏳ | ⏳ | ⏳ |
| `vp-1261` | [Dinh Quang Truong](https://vietprofs.roars.dev/people/vp-1261.html) | University of Warwick | WMG | ⏳ | ⏳ | ⏳ |
| `vp-1262` | [Nhu-Ngoc Dao](https://vietprofs.roars.dev/people/vp-1262.html) | Sejong University | Department of Computer Science and Engineering | ✅ | ⏳ | ✅ |
| `vp-1263` | [Tien Tuan Dao](https://vietprofs.roars.dev/people/vp-1263.html) | Centrale Lille Institut | Laboratoire de Mécanique, Multiphysique, Multiéchelle | ⏳ | ⏳ | ⏳ |
| `vp-1264` | [Van Huynh Nguyen](https://vietprofs.roars.dev/people/vp-1264.html) | University of Liverpool | Department of Electrical Engineering and Electronics | ⏳ | ⏳ | ⏳ |
| `vp-1265` | [Van-Hai Bui](https://vietprofs.roars.dev/people/vp-1265.html) | University of Michigan–Dearborn | Department of Electrical and Computer Engineering | ✅ | ⏳ | ✅ |
| `vp-1266` | [Vu-Hieu Nguyen](https://vietprofs.roars.dev/people/vp-1266.html) | Université Paris-Est Créteil | Laboratoire Modélisation et Simulation Multi Echelle | ⏳ | ⏳ | ⏳ |

---

### Batch 26 (vp-1267 – vp-1317, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-1267` | [Van Khang Huynh](https://vietprofs.roars.dev/people/vp-1267.html) | University of Agder | Department of Engineering Sciences | ⏳ | ⏳ | ✅ |
| `vp-1268` | [Khac Tuan Huynh](https://vietprofs.roars.dev/people/vp-1268.html) | Université de Technologie de Troyes | LIST3N | ⏳ | ⏳ | ⏳ |
| `vp-1269` | [Kien Phan Huy](https://vietprofs.roars.dev/people/vp-1269.html) | Supmicrotech-ENSMM | FEMTO-ST Institute | ⏳ | ⏳ | ⏳ |
| `vp-1270` | [Tuan Anh Pham](https://vietprofs.roars.dev/people/vp-1270.html) | Lawrence Livermore National Laboratory | Materials Science Division | ⏳ | ⏳ | ⏳ |
| `vp-1271` | [Khanh Pham](https://vietprofs.roars.dev/people/vp-1271.html) | Air Force Research Laboratory | Space Vehicles Directorate | ⏳ | ⏳ | ✅ |
| `vp-1272` | [Mai P. Hoang](https://vietprofs.roars.dev/people/vp-1272.html) | Harvard University | Department of Pathology | ⏳ | ⏳ | ⏳ |
| `vp-1273` | [Nam H. Dang](https://vietprofs.roars.dev/people/vp-1273.html) | University of Florida | Division of Hematology and Oncology | ⏳ | ⏳ | ⏳ |
| `vp-1274` | [Jeanne Tran Van Nhieu](https://vietprofs.roars.dev/people/vp-1274.html) | Université Paris-Est Créteil | Département de Pathologie | ⏳ | ⏳ | ⏳ |
| `vp-1275` | [M. Hong Nguyen](https://vietprofs.roars.dev/people/vp-1275.html) | University of Pittsburgh | Division of Infectious Diseases | ⏳ | ⏳ | ⏳ |
| `vp-1276` | [Binh Bui](https://vietprofs.roars.dev/people/vp-1276.html) | Macquarie University | Department of Accounting and Corporate Governance | ⏳ | ⏳ | ✅ |
| `vp-1277` | [Jean-Paul Duong Van Huyen](https://vietprofs.roars.dev/people/vp-1277.html) | Université Paris Cité | Service de Pathologie | ⏳ | ⏳ | ⏳ |
| `vp-1278` | [Thao Huynh](https://vietprofs.roars.dev/people/vp-1278.html) | McGill University | Division of Cardiology | ⏳ | ⏳ | ⏳ |
| `vp-1279` | [Thao Pham](https://vietprofs.roars.dev/people/vp-1279.html) | Aix-Marseille Université | Service de Rhumatologie | ⏳ | ⏳ | ⏳ |
| `vp-1280` | [Long Ngo](https://vietprofs.roars.dev/people/vp-1280.html) | Harvard University | Department of Medicine | ⏳ | ⏳ | ⏳ |
| `vp-1281` | [Viet-Thi Tran](https://vietprofs.roars.dev/people/vp-1281.html) | Université Paris Cité | Centre de Recherche en Épidémiologie et Statistiques | ⏳ | ⏳ | ⏳ |
| `vp-1282` | [Thuy Mai Luu](https://vietprofs.roars.dev/people/vp-1282.html) | Université de Montréal | Département de Pédiatrie | ⏳ | ⏳ | ⏳ |
| `vp-1283` | [Thuy Do](https://vietprofs.roars.dev/people/vp-1283.html) | University of Leeds | School of Dentistry | ⏳ | ⏳ | ⏳ |
| `vp-1284` | [Thanh G. Phan](https://vietprofs.roars.dev/people/vp-1284.html) | Monash University | Department of Medicine | ⏳ | ⏳ | ✅ |
| `vp-1285` | [Long P. Le](https://vietprofs.roars.dev/people/vp-1285.html) | Harvard University | Department of Pathology | ⏳ | ⏳ | ⏳ |
| `vp-1286` | [Chau T. Dang](https://vietprofs.roars.dev/people/vp-1286.html) | Cornell University | Department of Medicine | ⏳ | ⏳ | ⏳ |
| `vp-1287` | [Quan Huynh](https://vietprofs.roars.dev/people/vp-1287.html) | Baker Heart and Diabetes Institute | Baker Department of Cardiometabolic Health | ⏳ | ⏳ | ⏳ |
| `vp-1288` | [Lan Vu](https://vietprofs.roars.dev/people/vp-1288.html) | University of California, San Francisco | Department of Surgery | ⏳ | ⏳ | ⏳ |
| `vp-1289` | [Thanh-Huyen T. Vu](https://vietprofs.roars.dev/people/vp-1289.html) | Northwestern University | Department of Preventive Medicine | ⏳ | ⏳ | ⏳ |
| `vp-1290` | [Binh An P. Phan](https://vietprofs.roars.dev/people/vp-1290.html) | University of California, San Francisco | Division of Cardiology | ⏳ | ⏳ | ✅ |
| `vp-1291` | [Mai Anh Huynh](https://vietprofs.roars.dev/people/vp-1291.html) | Harvard University | Department of Radiation Oncology | ⏳ | ⏳ | ⏳ |
| `vp-1292` | [Hong-Ha M. Truong](https://vietprofs.roars.dev/people/vp-1292.html) | University of California, San Francisco | Department of Medicine | ⏳ | ⏳ | ✅ |
| `vp-1293` | [Quan M. Bui](https://vietprofs.roars.dev/people/vp-1293.html) | University of California, San Diego | Division of Cardiovascular Medicine | ⏳ | ⏳ | ⏳ |
| `vp-1294` | [Cuong J. Bui](https://vietprofs.roars.dev/people/vp-1294.html) | Tulane University | Department of Neurosurgery | ⏳ | ⏳ | ⏳ |
| `vp-1295` | [Phuong-Anh T. Duong](https://vietprofs.roars.dev/people/vp-1295.html) | New York University | Department of Radiology | ⏳ | ⏳ | ⏳ |
| `vp-1296` | [Nu Viet Vu](https://vietprofs.roars.dev/people/vp-1296.html) | University of Geneva | Unit of Development and Research in Medical Education | ⏳ | ⏳ | ⏳ |
| `vp-1297` | [Nguyet-Thanh Ha-Duong](https://vietprofs.roars.dev/people/vp-1297.html) | Université Paris Cité | Laboratoire ITODYS | ⏳ | ⏳ | ⏳ |
| `vp-1298` | [Nam Vo](https://vietprofs.roars.dev/people/vp-1298.html) | University of Pittsburgh | Department of Orthopaedic Surgery | ⏳ | ⏳ | ⏳ |
| `vp-1299` | [Nicole Ngo-Giang-Huong](https://vietprofs.roars.dev/people/vp-1299.html) | Institut de Recherche pour le Développement | Laboratoire MIVEGEC | ⏳ | ⏳ | ✅ |
| `vp-1300` | [Vu Thuy Khanh Le-Trilling](https://vietprofs.roars.dev/people/vp-1300.html) | University of Duisburg-Essen | Institute for Virology | ⏳ | ⏳ | ⏳ |
| `vp-1301` | [Linh H. Nghiem](https://vietprofs.roars.dev/people/vp-1301.html) | The University of Sydney | School of Mathematics and Statistics | ⏳ | ⏳ | ⏳ |
| `vp-1302` | [Thi Minh Tam Ta](https://vietprofs.roars.dev/people/vp-1302.html) | Charité – Universitätsmedizin Berlin | Department of Psychiatry and Psychotherapy | ⏳ | ⏳ | ⏳ |
| `vp-1303` | [Nhi-Ha T. Trinh](https://vietprofs.roars.dev/people/vp-1303.html) | Harvard University | Department of Psychiatry, Harvard Medical School | ⏳ | ⏳ | ⏳ |
| `vp-1304` | [Khanh T. Dinh](https://vietprofs.roars.dev/people/vp-1304.html) | University of Massachusetts Lowell | Department of Psychology | ⏳ | ⏳ | ✅ |
| `vp-1305` | [Long Doan](https://vietprofs.roars.dev/people/vp-1305.html) | University of Maryland, College Park | Department of Sociology | ⏳ | ⏳ | ⏳ |
| `vp-1306` | [Lan Anh Nguyen Luu](https://vietprofs.roars.dev/people/vp-1306.html) | Eötvös Loránd University | Institute of Intercultural Psychology and Education | ⏳ | ⏳ | ✅ |
| `vp-1307` | [Binh Nghiem-Phu](https://vietprofs.roars.dev/people/vp-1307.html) | University of Hyogo | School of Economics and Management | ⏳ | ⏳ | ⏳ |
| `vp-1308` | [Hien Van Doan](https://vietprofs.roars.dev/people/vp-1308.html) | Chiang Mai University | Department of Animal and Aquatic Sciences | ⏳ | ⏳ | ⏳ |
| `vp-1309` | [Quoc C. Vuong](https://vietprofs.roars.dev/people/vp-1309.html) | Newcastle University | School of Psychology | ⏳ | ⏳ | ✅ |
| `vp-1310` | [Bao Q. Vuong](https://vietprofs.roars.dev/people/vp-1310.html) | City College of New York, CUNY | Department of Biology | ⏳ | ⏳ | ✅ |
| `vp-1311` | [Thanh Pierre Doan](https://vietprofs.roars.dev/people/vp-1311.html) | Norwegian University of Science and Technology | Department of Neuromedicine and Movement Science | ⏳ | ⏳ | ✅ |
| `vp-1312` | [Trang-Anh Estelle Nghiem](https://vietprofs.roars.dev/people/vp-1312.html) | University of Tübingen | Hertie Institute for AI in Brain Health | ⏳ | ⏳ | ⏳ |
| `vp-1313` | [Marilyn Phung](https://vietprofs.roars.dev/people/vp-1313.html) | Western University | Department of Medicine, Schulich School of Medicine & Dentistry | ⏳ | ⏳ | ⏳ |
| `vp-1315` | [Son Lam Phung](https://vietprofs.roars.dev/people/vp-1315.html) | University of Wollongong | School of Electrical, Computer and Telecommunications Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1316` | [Hai Q. Dinh](https://vietprofs.roars.dev/people/vp-1316.html) | Kent State University | Department of Mathematical Sciences | ⏳ | ⏳ | ⏳ |
| `vp-1317` | [Phan Tu Vuong](https://vietprofs.roars.dev/people/vp-1317.html) | University of Southampton | School of Mathematical Sciences | ⏳ | ⏳ | ⏳ |

---

### Batch 27 (vp-1318 – vp-1367, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-1318` | [Anh Tuan Luu](https://vietprofs.roars.dev/people/vp-1318.html) | Nanyang Technological University | College of Computing and Data Science | ⏳ | ⏳ | ⏳ |
| `vp-1319` | [Doan B. Hoang](https://vietprofs.roars.dev/people/vp-1319.html) | University of Technology Sydney | School of Electrical and Data Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1320` | [Thai Doan Chuong](https://vietprofs.roars.dev/people/vp-1320.html) | Brunel University London | Department of Mathematics | ⏳ | ⏳ | ⏳ |
| `vp-1321` | [Nghia Duong-Trung](https://vietprofs.roars.dev/people/vp-1321.html) | German Research Center for Artificial Intelligence | Educational Technology Lab | ⏳ | ⏳ | ⏳ |
| `vp-1322` | [Thinh T. Doan](https://vietprofs.roars.dev/people/vp-1322.html) | The University of Texas at Austin | Department of Aerospace Engineering and Engineering Mechanics | ✅ | ✅ | ✅ |
| `vp-1323` | [Cao-Thang Dinh](https://vietprofs.roars.dev/people/vp-1323.html) | Queen's University | Department of Chemical Engineering | ⏳ | ✅ | ✅ |
| `vp-1324` | [Tu C. Le](https://vietprofs.roars.dev/people/vp-1324.html) | RMIT University | School of Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1325` | [Bich-Thuy Doan](https://vietprofs.roars.dev/people/vp-1325.html) | CNRS (Centre National de la Recherche Scientifique) | Institute of Chemistry for Life and Health Sciences (Chimie ParisTech - PSL) | ⏳ | ⏳ | ⏳ |
| `vp-1326` | [Doan-Trung Luu](https://vietprofs.roars.dev/people/vp-1326.html) | CNRS (Centre National de la Recherche Scientifique) | Biochimie et Physiologie Moléculaire des Plantes (BPMP) | ⏳ | ⏳ | ⏳ |
| `vp-1327` | [Loc Huu Ho](https://vietprofs.roars.dev/people/vp-1327.html) | Wageningen University & Research | Water Resources Management Group | ⏳ | ⏳ | ⏳ |
| `vp-1328` | [Huu Doan](https://vietprofs.roars.dev/people/vp-1328.html) | Toronto Metropolitan University | Department of Chemical Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1329` | [Van Schepler-Luu](https://vietprofs.roars.dev/people/vp-1329.html) | International Rice Research Institute | Plant Pathology and Host Plant Resistance Group | ⏳ | ⏳ | ⏳ |
| `vp-1330` | [Quang-Van Doan](https://vietprofs.roars.dev/people/vp-1330.html) | University of Tsukuba | Center for Computational Sciences | ⏳ | ⏳ | ⏳ |
| `vp-1331` | [Trong-Anh Trinh](https://vietprofs.roars.dev/people/vp-1331.html) | Monash University | Centre for Health Economics | ⏳ | ⏳ | ⏳ |
| `vp-1332` | [Luc Duc Phung](https://vietprofs.roars.dev/people/vp-1332.html) | Yamagata University | Department of Food, Life and Environmental Sciences, Faculty of Agriculture | ⏳ | ⏳ | ⏳ |
| `vp-1333` | [Kim Ta Phuoc](https://vietprofs.roars.dev/people/vp-1333.html) | CNRS (Centre National de la Recherche Scientifique) | Laboratoire d'Optique Appliquée (LOA) | ⏳ | ⏳ | ⏳ |
| `vp-1334` | [Minh T. N. Le](https://vietprofs.roars.dev/people/vp-1334.html) | National University of Singapore | Department of Pharmacology | ⏳ | ⏳ | ⏳ |
| `vp-1335` | [Tran Trung Luu](https://vietprofs.roars.dev/people/vp-1335.html) | The University of Hong Kong | Department of Physics | ⏳ | ⏳ | ⏳ |
| `vp-1336` | [Le A. Trinh](https://vietprofs.roars.dev/people/vp-1336.html) | University of Southern California | Department of Biological Sciences | ⏳ | ⏳ | ⏳ |
| `vp-1337` | [Phuong Mai Dinh](https://vietprofs.roars.dev/people/vp-1337.html) | CNRS (Centre National de la Recherche Scientifique) | Laboratoire de Physique Théorique | ⏳ | ⏳ | ⏳ |
| `vp-1338` | [Trung Nghia Vu](https://vietprofs.roars.dev/people/vp-1338.html) | Karolinska Institutet | Department of Medical Epidemiology and Biostatistics | ⏳ | ⏳ | ⏳ |
| `vp-1339` | [Van An Dinh](https://vietprofs.roars.dev/people/vp-1339.html) | Osaka University | Graduate School of Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1340` | [Dinh Ho Tong Minh](https://vietprofs.roars.dev/people/vp-1340.html) | INRAE (Institut National de Recherche pour l'Agriculture, l'Alimentation et l'Environnement) | UMR TETIS | ⏳ | ⏳ | ⏳ |
| `vp-1341` | [Tan-Phu Vuong](https://vietprofs.roars.dev/people/vp-1341.html) | Institut polytechnique de Grenoble | Laboratoire de Conception et d'Intégration des Systèmes (LCIS) | ⏳ | ⏳ | ⏳ |
| `vp-1342` | [Cao Hung Pham](https://vietprofs.roars.dev/people/vp-1342.html) | The University of Sydney | School of Civil Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1343` | [Anh Dinh](https://vietprofs.roars.dev/people/vp-1343.html) | University of Saskatchewan | Department of Electrical and Computer Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1344` | [Huu Duc Vo](https://vietprofs.roars.dev/people/vp-1344.html) | Polytechnique Montréal | Département de Génie Mécanique | ⏳ | ⏳ | ⏳ |
| `vp-1345` | [Quoc Lam Vuong](https://vietprofs.roars.dev/people/vp-1345.html) | Université de Mons | Biomedical Physics Group, Department of Experimental and Biological Physics | ⏳ | ⏳ | ⏳ |
| `vp-1346` | [Quoc Viet Phung](https://vietprofs.roars.dev/people/vp-1346.html) | Edith Cowan University | School of Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1347` | [Kim Dang Phung](https://vietprofs.roars.dev/people/vp-1347.html) | Université d'Orléans | Institut Denis Poisson, Département de Mathématiques | ⏳ | ⏳ | ⏳ |
| `vp-1348` | [Luong-Viet Phung](https://vietprofs.roars.dev/people/vp-1348.html) | INSA Lyon | Laboratoire Ampère, Département de Génie Électrique | ⏳ | ⏳ | ⏳ |
| `vp-1349` | [Ngan Thi Luong](https://vietprofs.roars.dev/people/vp-1349.html) | London South Bank University | School of Business | ⏳ | ⏳ | ⏳ |
| `vp-1350` | [Khê Hoang-Xuan](https://vietprofs.roars.dev/people/vp-1350.html) | Sorbonne Université | Department of Neurology, Pitié-Salpêtrière Hospital / Paris Brain Institute (ICM) | ⏳ | ⏳ | ⏳ |
| `vp-1351` | [Quoc-Dien Trinh](https://vietprofs.roars.dev/people/vp-1351.html) | University of Pittsburgh | Department of Urology, School of Medicine | ⏳ | ⏳ | ⏳ |
| `vp-1352` | [Anh-Tuan Dinh-Xuan](https://vietprofs.roars.dev/people/vp-1352.html) | Université Paris Cité | Department of Physiology, Cochin Hospital | ⏳ | ⏳ | ⏳ |
| `vp-1353` | [Nhu D. Le](https://vietprofs.roars.dev/people/vp-1353.html) | University of British Columbia | Cancer Control Research, BC Cancer Research Centre / Department of Statistics | ⏳ | ⏳ | ⏳ |
| `vp-1354` | [Hai Phung](https://vietprofs.roars.dev/people/vp-1354.html) | Griffith University | School of Medicine and Dentistry | ⏳ | ⏳ | ⏳ |
| `vp-1355` | [Quan V. Vuong](https://vietprofs.roars.dev/people/vp-1355.html) | University of Technology Sydney | School of Life Sciences, Faculty of Science | ⏳ | ⏳ | ⏳ |
| `vp-1356` | [Chau Trinh-Shevrin](https://vietprofs.roars.dev/people/vp-1356.html) | New York University | Department of Population Health, Grossman School of Medicine | ⏳ | ⏳ | ⏳ |
| `vp-1357` | [Thuy Doan](https://vietprofs.roars.dev/people/vp-1357.html) | University of California, San Francisco | Department of Ophthalmology & Francis I. Proctor Foundation | ⏳ | ⏳ | ⏳ |
| `vp-1358` | [Steven-Huy B. Han](https://vietprofs.roars.dev/people/vp-1358.html) | University of California, Los Angeles | Division of Digestive Diseases, David Geffen School of Medicine | ⏳ | ⏳ | ⏳ |
| `vp-1359` | [Kien Trinh](https://vietprofs.roars.dev/people/vp-1359.html) | McMaster University | Michael G. DeGroote School of Medicine | ⏳ | ⏳ | ⏳ |
| `vp-1360` | [Thuy L. Phung](https://vietprofs.roars.dev/people/vp-1360.html) | University of Texas Health Science Center at San Antonio | Department of Pathology and Laboratory Medicine, Long School of Medicine | ⏳ | ⏳ | ⏳ |
| `vp-1361` | [Q. Thai Dinh](https://vietprofs.roars.dev/people/vp-1361.html) | Saarland University | Department of Internal Medicine / Experimental Pneumology | ⏳ | ⏳ | ⏳ |
| `vp-1362` | [Le Mai Tu](https://vietprofs.roars.dev/people/vp-1362.html) | Université de Sherbrooke | Département de chirurgie, Faculté de médecine et des sciences de la santé | ⏳ | ⏳ | ⏳ |
| `vp-1363` | [Huynh-Nhu Le](https://vietprofs.roars.dev/people/vp-1363.html) | George Washington University | Department of Psychological and Brain Sciences, Columbian College of Arts and Sciences | ⏳ | ⏳ | ✅ |
| `vp-1364` | [Vincent Quoc-Huy Trinh](https://vietprofs.roars.dev/people/vp-1364.html) | Université de Montréal | Department of Pathology and Cellular Biology & Institute for Research in Immunology and Cancer (IRIC) | ⏳ | ⏳ | ⏳ |
| `vp-1365` | [Xuan Bich Trinh](https://vietprofs.roars.dev/people/vp-1365.html) | University of Antwerp | Center for Oncological Research (CORE) & Antwerp University Hospital (UZA) | ⏳ | ⏳ | ⏳ |
| `vp-1366` | [Hung Q. Doan](https://vietprofs.roars.dev/people/vp-1366.html) | University of Texas MD Anderson Cancer Center | Department of Dermatology, Division of Internal Medicine | ⏳ | ⏳ | ⏳ |
| `vp-1367` | [Thanh Dinh](https://vietprofs.roars.dev/people/vp-1367.html) | Harvard University | Department of Surgery, Beth Israel Deaconess Medical Center, Harvard Medical School | ⏳ | ⏳ | ⏳ |

---

### Batch 28 (vp-1368 – vp-1418, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-1368` | [Phuong L. Doan](https://vietprofs.roars.dev/people/vp-1368.html) | Duke University | Division of Hematologic Malignancies and Cellular Therapy, Department of Medicine | ⏳ | ⏳ | ⏳ |
| `vp-1369` | [Yen Hai Doan](https://vietprofs.roars.dev/people/vp-1369.html) | Japan Institute for Health Security (JIHS) | Department of Virology II | ⏳ | ⏳ | ⏳ |
| `vp-1370` | [Quôc Dinh Nguyên](https://vietprofs.roars.dev/people/vp-1370.html) | Université de Montréal | Department of Medicine & Centre de recherche du CHUM | ⏳ | ⏳ | ⏳ |
| `vp-1371` | [Minh-Son To](https://vietprofs.roars.dev/people/vp-1371.html) | Flinders University | College of Medicine and Public Health & Flinders Health and Medical Research Institute | ⏳ | ⏳ | ⏳ |
| `vp-1372` | [Nhung T. H. Trinh](https://vietprofs.roars.dev/people/vp-1372.html) | UiT The Arctic University of Norway | Department of Pharmacy, Faculty of Health Sciences | ⏳ | ⏳ | ⏳ |
| `vp-1373` | [Nghiem B. Ha](https://vietprofs.roars.dev/people/vp-1373.html) | University of California, San Francisco | Division of Gastroenterology and Hepatology, Department of Medicine | ⏳ | ⏳ | ⏳ |
| `vp-1374` | [Trang D. Trinh](https://vietprofs.roars.dev/people/vp-1374.html) | University of California, San Francisco | Department of Clinical Pharmacy, School of Pharmacy | ⏳ | ⏳ | ⏳ |
| `vp-1375` | [Tri A. Dinh](https://vietprofs.roars.dev/people/vp-1375.html) | Mayo Clinic Alix School of Medicine | Department of Medical and Surgical Gynecology, Mayo Clinic Florida | ⏳ | ⏳ | ⏳ |
| `vp-1376` | [Binh N. Trinh](https://vietprofs.roars.dev/people/vp-1376.html) | University of California, San Francisco | Department of Surgery, Division of Adult Cardiothoracic Surgery | ⏳ | ⏳ | ⏳ |
| `vp-1377` | [Tam T. Doan](https://vietprofs.roars.dev/people/vp-1377.html) | Baylor College of Medicine | Department of Pediatrics, Section of Pediatric Cardiology & Texas Children's Hospital | ⏳ | ⏳ | ⏳ |
| `vp-1378` | [Minh Tung Phung](https://vietprofs.roars.dev/people/vp-1378.html) | University of Wisconsin–Madison | Department of Population Health Sciences, School of Medicine and Public Health & Carbone Cancer Center | ⏳ | ⏳ | ✅ |
| `vp-1379` | [Cat Khanh Vuong](https://vietprofs.roars.dev/people/vp-1379.html) | University of Tsukuba | Faculty of Medicine | ⏳ | ⏳ | ⏳ |
| `vp-1380` | [Quoc Vuong Tran](https://vietprofs.roars.dev/people/vp-1380.html) | University of Yamanashi | Department of Immunology, Faculty of Medicine & Yamanashi GLIA Center | ⏳ | ⏳ | ⏳ |
| `vp-1381` | [Nhu Khue Vuong](https://vietprofs.roars.dev/people/vp-1381.html) | Agency for Science, Technology and Research | Institute for Infocomm Research (I2R) | ⏳ | ⏳ | ⏳ |
| `vp-1382` | [Kiên Kiêu](https://vietprofs.roars.dev/people/vp-1382.html) | INRAE (Institut National de Recherche pour l'Agriculture, l'Alimentation et l'Environnement) | MaIAGE (Mathématiques et Informatique Appliquées du Génome à l'Environnement) | ⏳ | ⏳ | ⏳ |
| `vp-1383` | [Trang Quynh Nguyen](https://vietprofs.roars.dev/people/vp-1383.html) | Johns Hopkins University | Department of Mental Health | ⏳ | ⏳ | ⏳ |
| `vp-1384` | [Bao Quoc Tang](https://vietprofs.roars.dev/people/vp-1384.html) | University of Graz | Department of Mathematics and Scientific Computing | ⏳ | ⏳ | ⏳ |
| `vp-1385` | [Tuyen Pham](https://vietprofs.roars.dev/people/vp-1385.html) | Ohio University | Center for Economic Development and Community Resilience | ✅ | ⏳ | ✅ |
| `vp-1386` | [Ngoc Dieu Linh Vi](https://vietprofs.roars.dev/people/vp-1386.html) | Aston University | Economics, Finance and Entrepreneurship | ✅ | ⏳ | ✅ |
| `vp-1387` | [Christel Tran](https://vietprofs.roars.dev/people/vp-1387.html) | University of Lausanne | Medical Genetics | ⏳ | ⏳ | ⏳ |
| `vp-1388` | [Michel Le Van Quyen](https://vietprofs.roars.dev/people/vp-1388.html) | Inserm (Institut National de la Santé et de la Recherche Médicale) | Laboratoire d'Imagerie Biomédicale (LIB) | ⏳ | ⏳ | ⏳ |
| `vp-1389` | [Ha Thanh Dong](https://vietprofs.roars.dev/people/vp-1389.html) | Asian Institute of Technology | Department of Food, Agriculture and Bioresources | ⏳ | ⏳ | ⏳ |
| `vp-1390` | [Ngoc Tuan Tran](https://vietprofs.roars.dev/people/vp-1390.html) | Shantou University | Marine Biology Institute | ⏳ | ⏳ | ⏳ |
| `vp-1391` | [Nhat-Tu Le](https://vietprofs.roars.dev/people/vp-1391.html) | Weill Cornell Medicine | Department of Cardiovascular Sciences, Houston Methodist Academic Institute | ⏳ | ⏳ | ⏳ |
| `vp-1392` | [Dinh Ha Duy Thuy](https://vietprofs.roars.dev/people/vp-1392.html) | Kyoto University | Human Brain Research Center, Graduate School of Medicine | ⏳ | ⏳ | ⏳ |
| `vp-1393` | [Chinh Ho](https://vietprofs.roars.dev/people/vp-1393.html) | The University of Sydney | Institute of Transport and Logistics Studies, University of Sydney Business School | ⏳ | ⏳ | ⏳ |
| `vp-1394` | [Thao Ha](https://vietprofs.roars.dev/people/vp-1394.html) | Arizona State University | Department of Psychology | ⏳ | ⏳ | ⏳ |
| `vp-1395` | [Huyen Le](https://vietprofs.roars.dev/people/vp-1395.html) | The Ohio State University | Department of Geography | ⏳ | ⏳ | ⏳ |
| `vp-1396` | [Thuan Thai](https://vietprofs.roars.dev/people/vp-1396.html) | The University of Notre Dame Australia | School of Education | ⏳ | ⏳ | ⏳ |
| `vp-1397` | [Duc Thanh Nguyen](https://vietprofs.roars.dev/people/vp-1397.html) | Deakin University | School of Information Technology | ⏳ | ⏳ | ⏳ |
| `vp-1398` | [Anh Nguyen-Duc](https://vietprofs.roars.dev/people/vp-1398.html) | University of South-Eastern Norway | Department of Science and Industry Systems | ⏳ | ⏳ | ⏳ |
| `vp-1399` | [Quoc-Tuan Vien](https://vietprofs.roars.dev/people/vp-1399.html) | Middlesex University | Faculty of Science and Technology | ⏳ | ⏳ | ⏳ |
| `vp-1401` | [Kim Khoa Nguyen](https://vietprofs.roars.dev/people/vp-1401.html) | École de technologie supérieure | Department of Electrical Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1402` | [Duy-Tai Dinh](https://vietprofs.roars.dev/people/vp-1402.html) | The Kyoto College of Graduate Studies for Informatics | Graduate School of Applied Information Technology | ⏳ | ⏳ | ⏳ |
| `vp-1403` | [Cuong Pham](https://vietprofs.roars.dev/people/vp-1403.html) | Wentworth Institute of Technology | School of Computing and Data Science | ⏳ | ⏳ | ⏳ |
| `vp-1404` | [Triet H. M. Le](https://vietprofs.roars.dev/people/vp-1404.html) | University of Adelaide | School of Computer Science and Information Technology | ⏳ | ⏳ | ⏳ |
| `vp-1405` | [Cuong Ton-That](https://vietprofs.roars.dev/people/vp-1405.html) | University of Technology Sydney | School of Mathematical and Physical Sciences | ⏳ | ⏳ | ⏳ |
| `vp-1406` | [Tuan Hung Nguyen](https://vietprofs.roars.dev/people/vp-1406.html) | Tohoku University | Frontier Research Institute for Interdisciplinary Sciences | ⏳ | ⏳ | ⏳ |
| `vp-1407` | [Quoc Duy Ho](https://vietprofs.roars.dev/people/vp-1407.html) | University of Stavanger | Department of Mathematics and Physics | ⏳ | ⏳ | ⏳ |
| `vp-1408` | [Quoc Khanh Tran](https://vietprofs.roars.dev/people/vp-1408.html) | Technical University of Darmstadt | Department of Electrical Engineering and Information Technology | ⏳ | ⏳ | ⏳ |
| `vp-1409` | [Thao M. Ho](https://vietprofs.roars.dev/people/vp-1409.html) | Häme University of Applied Sciences | HAMK Bio | ⏳ | ⏳ | ⏳ |
| `vp-1410` | [Lap-Cuong Hua](https://vietprofs.roars.dev/people/vp-1410.html) | IHE Delft Institute for Water Education | Department of Water Supply, Sanitation, and Environmental Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1411` | [Nhat Tram Phan-Le](https://vietprofs.roars.dev/people/vp-1411.html) | RMIT University | School of Media and Communication | ⏳ | ⏳ | ⏳ |
| `vp-1412` | [Nguyen Quoc Khanh Le](https://vietprofs.roars.dev/people/vp-1412.html) | Taipei Medical University | Professional Master Program in Artificial Intelligence in Medicine | ⏳ | ⏳ | ⏳ |
| `vp-1413` | [Hung Ton-That](https://vietprofs.roars.dev/people/vp-1413.html) | University of California, Los Angeles | Division of Oral and Systemic Health Sciences | ⏳ | ⏳ | ⏳ |
| `vp-1414` | [Khanh Kieu](https://vietprofs.roars.dev/people/vp-1414.html) | University of Arizona | Wyant College of Optical Sciences | ⏳ | ⏳ | ✅ |
| `vp-1415` | [Tung B. K. Le](https://vietprofs.roars.dev/people/vp-1415.html) | John Innes Centre | Department of Molecular Microbiology | ⏳ | ⏳ | ✅ |
| `vp-1416` | [Cuong Cao](https://vietprofs.roars.dev/people/vp-1416.html) | Queen's University Belfast | School of Biological Sciences | ⏳ | ⏳ | ✅ |
| `vp-1417` | [Lam Si Tung Ho](https://vietprofs.roars.dev/people/vp-1417.html) | Dalhousie University | Department of Mathematics and Statistics | ⏳ | ⏳ | ✅ |
| `vp-1418` | [Duc Huy Dang](https://vietprofs.roars.dev/people/vp-1418.html) | Trent University | Trent School of the Environment and Department of Chemistry | ✅ | ⏳ | ✅ |

---

### Batch 29 (vp-1419 – vp-1468, 50 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-1419` | [Trung Hieu Tran](https://vietprofs.roars.dev/people/vp-1419.html) | Loughborough University | Loughborough Business School | ⏳ | ⏳ | ✅ |
| `vp-1420` | [Huong Giang T. Nguyen](https://vietprofs.roars.dev/people/vp-1420.html) | National Institute of Standards and Technology | Chemical Sciences Division | ⏳ | ⏳ | ✅ |
| `vp-1421` | [Hieu Trinh](https://vietprofs.roars.dev/people/vp-1421.html) | Deakin University | School of Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1422` | [Toan Dinh](https://vietprofs.roars.dev/people/vp-1422.html) | University of Southern Queensland | School of Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1423` | [Van Thanh Dau](https://vietprofs.roars.dev/people/vp-1423.html) | Griffith University | School of Engineering and Built Environment | ⏳ | ⏳ | ⏳ |
| `vp-1424` | [Nam Mai-Duy](https://vietprofs.roars.dev/people/vp-1424.html) | University of Southern Queensland | School of Engineering | ⏳ | ⏳ | ✅ |
| `vp-1425` | [Linh Cao Hoang](https://vietprofs.roars.dev/people/vp-1425.html) | Technical University of Denmark | Department of Civil and Mechanical Engineering | ⏳ | ⏳ | ✅ |
| `vp-1426` | [Ngoc Duy Nguyen](https://vietprofs.roars.dev/people/vp-1426.html) | University of Liège | Department of Physics | ⏳ | ⏳ | ⏳ |
| `vp-1427` | [Duc-Kien Thai](https://vietprofs.roars.dev/people/vp-1427.html) | Sejong University | Department of Civil and Environmental Engineering | ⏳ | ⏳ | ✅ |
| `vp-1428` | [Quoc-Hung Phan](https://vietprofs.roars.dev/people/vp-1428.html) | National Cheng Kung University | Department of Mechanical Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1429` | [Thanh Hai Nguyen](https://vietprofs.roars.dev/people/vp-1429.html) | Higher Colleges of Technology | Department of Electrical Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1430` | [Anh Minh Tang](https://vietprofs.roars.dev/people/vp-1430.html) | École des Ponts ParisTech | Laboratoire Navier | ⏳ | ⏳ | ⏳ |
| `vp-1431` | [Minh-Quyen Le](https://vietprofs.roars.dev/people/vp-1431.html) | INSA Lyon | Laboratoire de Génie Électrique et Ferroélectricité (LGEF) | ⏳ | ⏳ | ⏳ |
| `vp-1432` | [Quoc Tuan Tran](https://vietprofs.roars.dev/people/vp-1432.html) | Commissariat à l'Énergie Atomique et aux Énergies Alternatives | CEA Tech / LITEN | ⏳ | ⏳ | ⏳ |
| `vp-1433` | [Tuan A. Ho](https://vietprofs.roars.dev/people/vp-1433.html) | Sandia National Laboratories | Geochemistry Department | ⏳ | ⏳ | ⏳ |
| `vp-1434` | [Huyen N. Dinh](https://vietprofs.roars.dev/people/vp-1434.html) | National Renewable Energy Laboratory | Chemistry and Nanoscience Center | ⏳ | ⏳ | ⏳ |
| `vp-1435` | [Trang Hoang](https://vietprofs.roars.dev/people/vp-1435.html) | Université de Montréal | Department of Pharmacology and Physiology | ⏳ | ⏳ | ⏳ |
| `vp-1436` | [Thuan V. Ly](https://vietprofs.roars.dev/people/vp-1436.html) | Harvard University | Department of Orthopaedic Surgery | ⏳ | ⏳ | ⏳ |
| `vp-1437` | [Quyen Q. Hoang](https://vietprofs.roars.dev/people/vp-1437.html) | Indiana University Indianapolis | Department of Biochemistry and Molecular Biology | ⏳ | ⏳ | ⏳ |
| `vp-1438` | [Nhu Thao Nguyen Galván](https://vietprofs.roars.dev/people/vp-1438.html) | Baylor College of Medicine | Michael E. DeBakey Department of Surgery | ⏳ | ⏳ | ⏳ |
| `vp-1439` | [Thao-Ly T. Phan](https://vietprofs.roars.dev/people/vp-1439.html) | Thomas Jefferson University | Department of Pediatrics | ⏳ | ⏳ | ⏳ |
| `vp-1440` | [Thao Ho](https://vietprofs.roars.dev/people/vp-1440.html) | University of South Florida | Department of Pediatrics | ⏳ | ⏳ | ✅ |
| `vp-1441` | [Thi Dan Linh Nguyen-Kim](https://vietprofs.roars.dev/people/vp-1441.html) | University of Zurich | Institute of Radiology and Nuclear Medicine, Stadtspital Zürich (Waid/Triemli) | ⏳ | ⏳ | ⏳ |
| `vp-1442` | [Hung Q. Ly](https://vietprofs.roars.dev/people/vp-1442.html) | Université de Montréal | Department of Medicine | ⏳ | ⏳ | ⏳ |
| `vp-1443` | [Minh Cuong Duong](https://vietprofs.roars.dev/people/vp-1443.html) | University of New South Wales | School of Population Health | ⏳ | ⏳ | ⏳ |
| `vp-1444` | [Hoai An Le Thi](https://vietprofs.roars.dev/people/vp-1444.html) | Université de Lorraine | Department of Computer Science | ✅ | ⏳ | ✅ |
| `vp-1445` | [Khanh Duy Trinh](https://vietprofs.roars.dev/people/vp-1445.html) | Waseda University | Global Center for Science and Engineering | ⏳ | ⏳ | ✅ |
| `vp-1446` | [Van Thinh Nguyen](https://vietprofs.roars.dev/people/vp-1446.html) | Seoul National University | Department of Civil and Environmental Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1447` | [Cam Ha T. Tran](https://vietprofs.roars.dev/people/vp-1447.html) | University of Nevada, Reno | Department of Physiology and Cell Biology | ⏳ | ⏳ | ⏳ |
| `vp-1448` | [Thien-Tri Lam](https://vietprofs.roars.dev/people/vp-1448.html) | University of Würzburg | Institute for Hygiene and Microbiology | ⏳ | ⏳ | ⏳ |
| `vp-1449` | [Vy Hong-Diep Kim](https://vietprofs.roars.dev/people/vp-1449.html) | University of Toronto | Department of Paediatrics | ⏳ | ⏳ | ⏳ |
| `vp-1450` | [Thanh Luu](https://vietprofs.roars.dev/people/vp-1450.html) | Rosalind Franklin University of Medicine and Science | Department of Obstetrics and Gynecology | ⏳ | ⏳ | ⏳ |
| `vp-1451` | [Hieu Van Ngo](https://vietprofs.roars.dev/people/vp-1451.html) | University of Calgary | Faculty of Social Work | ⏳ | ⏳ | ⏳ |
| `vp-1452` | [Anh-Luu T. Huynh-Hohnbaum](https://vietprofs.roars.dev/people/vp-1452.html) | California State University, Los Angeles | School of Social Work | ⏳ | ⏳ | ⏳ |
| `vp-1453` | [Vinh To](https://vietprofs.roars.dev/people/vp-1453.html) | University of Tasmania | School of Education | ⏳ | ⏳ | ⏳ |
| `vp-1454` | [Anh Phan - University of Kent](https://vietprofs.roars.dev/people/vp-1454.html) | University of Kent | Centre for the Study of Higher Education | ⏳ | ⏳ | ⏳ |
| `vp-1455` | [Phan Le Ha](https://vietprofs.roars.dev/people/vp-1455.html) | Universiti Brunei Darussalam | Sultan Hassanal Bolkiah Institute of Education | ⏳ | ⏳ | ⏳ |
| `vp-1456` | [Huong Le](https://vietprofs.roars.dev/people/vp-1456.html) | Central Queensland University | School of Business and Law | ⏳ | ⏳ | ⏳ |
| `vp-1457` | [Minh Kieu](https://vietprofs.roars.dev/people/vp-1457.html) | University of Auckland | Department of Civil and Environmental Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1458` | [Huy Phung](https://vietprofs.roars.dev/people/vp-1458.html) | University of North Carolina at Chapel Hill | Department of Asian and Middle Eastern Studies | ⏳ | ⏳ | ⏳ |
| `vp-1459` | [Bach Hoai Nguyen](https://vietprofs.roars.dev/people/vp-1459.html) | Victoria University of Wellington | School of Engineering and Computer Science | ⏳ | ⏳ | ⏳ |
| `vp-1460` | [Vinh-Thong Ta](https://vietprofs.roars.dev/people/vp-1460.html) | Edge Hill University | Department of Computer Science | ⏳ | ⏳ | ⏳ |
| `vp-1461` | [Thi-Bich-Hanh Dao](https://vietprofs.roars.dev/people/vp-1461.html) | Université d'Orléans | Laboratoire d'Informatique Fondamentale d'Orléans (LIFO) | ⏳ | ⏳ | ✅ |
| `vp-1462` | [Ngoc-Son Vu](https://vietprofs.roars.dev/people/vp-1462.html) | CY Cergy Paris Université | ETIS Laboratory | ⏳ | ⏳ | ⏳ |
| `vp-1463` | [Bich-Lien Doan](https://vietprofs.roars.dev/people/vp-1463.html) | CentraleSupélec | Department of Computer Science | ⏳ | ⏳ | ⏳ |
| `vp-1464` | [Binh-Minh Bui-Xuan](https://vietprofs.roars.dev/people/vp-1464.html) | CNRS (Centre National de la Recherche Scientifique) | Laboratoire d'Informatique de Paris 6 (LIP6) / Sorbonne Université | ⏳ | ⏳ | ⏳ |
| `vp-1465` | [Thinh Kieu](https://vietprofs.roars.dev/people/vp-1465.html) | University of North Georgia | Department of Mathematics | ⏳ | ⏳ | ⏳ |
| `vp-1466` | [Mai T. Lam](https://vietprofs.roars.dev/people/vp-1466.html) | Wayne State University | Department of Biomedical Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1467` | [Minh-Huong Ha-Thi](https://vietprofs.roars.dev/people/vp-1467.html) | CNRS (Centre National de la Recherche Scientifique) | Institut des Sciences Moléculaires d'Orsay (ISMO) / Université Paris-Saclay | ⏳ | ⏳ | ⏳ |
| `vp-1468` | [Minh-Tan Ton-That](https://vietprofs.roars.dev/people/vp-1468.html) | National Research Council Canada | Automotive and Surface Transportation Research Centre | ⏳ | ⏳ | ⏳ |

---

### Batch 30 (vp-1469 – vp-1536, 42 faculty)

| ID | Name | Institution | Department | Website | Lab | Overview |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `vp-1469` | [Kim-Oanh Thi Nguyen](https://vietprofs.roars.dev/people/vp-1469.html) | Asian Institute of Technology | Environmental Engineering and Management, Department of Water Resources and Environmental Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1470` | [Thi-Thanh-Hien Pham](https://vietprofs.roars.dev/people/vp-1470.html) | Université du Québec à Montréal | Département d'études urbaines et touristiques | ⏳ | ⏳ | ⏳ |
| `vp-1471` | [Hong-Minh Hoang](https://vietprofs.roars.dev/people/vp-1471.html) | INRAE (Institut National de Recherche pour l'Agriculture, l'Alimentation et l'Environnement) | Unité FRISE (Génie des Procédés Frigorifiques pour la Sécurité Alimentaire et l'Environnement) / Université Paris-Saclay | ⏳ | ⏳ | ⏳ |
| `vp-1472` | [Uyen Thuy Xuan Phan](https://vietprofs.roars.dev/people/vp-1472.html) | Chapman University | Food Science, Schmid College of Science and Technology | ⏳ | ⏳ | ⏳ |
| `vp-1473` | [Ha Vinh Lam Nguyen](https://vietprofs.roars.dev/people/vp-1473.html) | Université Paris-Est Créteil | Laboratoire Interuniversitaire des Systèmes Atmosphériques (LISA) | ⏳ | ⏳ | ⏳ |
| `vp-1474` | [Bach-Lien Hua](https://vietprofs.roars.dev/people/vp-1474.html) | CNRS (Centre National de la Recherche Scientifique) | Laboratoire de Physique des Océans (LPO) | ⏳ | ⏳ | ⏳ |
| `vp-1475` | [Kim-Yen Phan-Thien](https://vietprofs.roars.dev/people/vp-1475.html) | The University of Sydney | School of Life and Environmental Sciences | ⏳ | ⏳ | ⏳ |
| `vp-1476` | [Thu-Hien To](https://vietprofs.roars.dev/people/vp-1476.html) | Norwegian University of Life Sciences | Department of Animal and Aquacultural Sciences, Faculty of Biosciences | ⏳ | ⏳ | ⏳ |
| `vp-1477` | [Mai Lan Nguyen](https://vietprofs.roars.dev/people/vp-1477.html) | Université Gustave Eiffel | Laboratoire Auscultation et Modélisation des Structures (LAMES), Département Matériaux et Structures (MAST) | ⏳ | ⏳ | ⏳ |
| `vp-1478` | [Xuan Hong Vu](https://vietprofs.roars.dev/people/vp-1478.html) | Université Claude Bernard Lyon 1 | Laboratoire des Matériaux Composites pour la Construction (LMC2) | ⏳ | ⏳ | ⏳ |
| `vp-1479` | [Minh-Tan Pham](https://vietprofs.roars.dev/people/vp-1479.html) | Université Bretagne Sud | IRISA (Institut de Recherche en Informatique et Systèmes Aléatoires) | ⏳ | ⏳ | ⏳ |
| `vp-1480` | [Ngoc-Tam Bui](https://vietprofs.roars.dev/people/vp-1480.html) | Shibaura Institute of Technology | Innovative Global Program, College of Engineering | ⏳ | ⏳ | ⏳ |
| `vp-1481` | [Thiên-My Dao](https://vietprofs.roars.dev/people/vp-1481.html) | École de Technologie Supérieure | Department of Mechanical Engineering | ⏳ | ⏳ | ✅ |
| `vp-1482` | [Chau Le](https://vietprofs.roars.dev/people/vp-1482.html) | University of North Carolina at Charlotte | Department of Engineering Technology and Construction Management | ⏳ | ⏳ | ⏳ |
| `vp-1483` | [Tan-Hoa Vuong](https://vietprofs.roars.dev/people/vp-1483.html) | Toulouse INP | Laboratoire Plasma et Conversion d'Énergie (LAPLACE), ENSEEIHT | ⏳ | ⏳ | ⏳ |
| `vp-1484` | [Ngoc P. Ly](https://vietprofs.roars.dev/people/vp-1484.html) | University of California, San Francisco | Department of Pediatrics, Division of Pediatric Pulmonology | ⏳ | ⏳ | ✅ |
| `vp-1485` | [Vinh-Kim Nguyen](https://vietprofs.roars.dev/people/vp-1485.html) | Geneva Graduate Institute | Department of Anthropology and Sociology & Global Health Centre | ⏳ | ⏳ | ✅ |
| `vp-1486` | [Minh Ly Nguyen](https://vietprofs.roars.dev/people/vp-1486.html) | Emory University | Division of Infectious Diseases, Department of Medicine | ⏳ | ⏳ | ⏳ |
| `vp-1487` | [Georges Ha Van](https://vietprofs.roars.dev/people/vp-1487.html) | Sorbonne Université | Service de Diabétologie, Métabolisme et Endocrinologie, Hôpital Pitié-Salpêtrière | ⏳ | ⏳ | ⏳ |
| `vp-1488` | [Thi Hà Châu Tran](https://vietprofs.roars.dev/people/vp-1488.html) | Université de Picardie Jules Verne | Service d'Ophtalmologie, CHU Amiens-Picardie | ⏳ | ⏳ | ⏳ |
| `vp-1489` | [Minh Ha Quang](https://vietprofs.roars.dev/people/vp-1489.html) | RIKEN | Center for Advanced Intelligence Project (AIP) | ⏳ | ⏳ | ⏳ |
| `vp-1490` | [Ly Nguyen](https://vietprofs.roars.dev/people/vp-1490.html) | Florida Agricultural and Mechanical University | Agribusiness Program, College of Agriculture and Food Sciences | ⏳ | ⏳ | ⏳ |
| `vp-1491` | [Ton An Bui](https://vietprofs.roars.dev/people/vp-1491.html) | University of British Columbia | Mathematics | ⏳ | ⏳ | ✅ |
| `vp-1492` | [Nam V. Phan](https://vietprofs.roars.dev/people/vp-1492.html) | The University of Western Australia | Economics | ✅ | ⏳ | ✅ |
| `vp-1493` | [Jon Doan](https://vietprofs.roars.dev/people/vp-1493.html) | University of Lethbridge | Kinesiology & Physical Education | ⏳ | ⏳ | ⏳ |
| `vp-1494` | [Marguerite Nguyen](https://vietprofs.roars.dev/people/vp-1494.html) | Duke University | Department of English | ⏳ | ⏳ | ⏳ |
| `vp-1495` | [Phuong Tran Nguyen](https://vietprofs.roars.dev/people/vp-1495.html) | California State University, Monterey Bay | Department of Humanities and Communication | ⏳ | ⏳ | ⏳ |
| `vp-1496` | [Howie Tam](https://vietprofs.roars.dev/people/vp-1496.html) | Brandeis University | Department of English | ⏳ | ⏳ | ⏳ |
| `vp-1497` | [Tess Do](https://vietprofs.roars.dev/people/vp-1497.html) | University of Melbourne | School of Languages and Linguistics | ⏳ | ⏳ | ⏳ |
| `vp-1500` | [Khac-Hoang Ngo](https://vietprofs.roars.dev/people/vp-1500.html) | Linköping University | Department of Electrical Engineering (Division of Communication Systems) | ✅ | ⏳ | ✅ |
| `vp-1501` | [Viet Huynh](https://vietprofs.roars.dev/people/vp-1501.html) | Edith Cowan University | Computer Science | ⏳ | ⏳ | ⏳ |
| `vp-1502` | [Duc Thi Luu](https://vietprofs.roars.dev/people/vp-1502.html) | École Supérieure d'Ingénieurs Léonard de Vinci | Finance | ⏳ | ⏳ | ⏳ |
| `vp-1527` | [Nam Trang](https://vietprofs.roars.dev/people/vp-1527.html) | University of North Texas | Mathematics | ⏳ | ⏳ | ✅ |
| `vp-1528` | [Binh P. Nguyen](https://vietprofs.roars.dev/people/vp-1528.html) | Victoria University of Wellington | School of Mathematics and Statistics | ⏳ | ⏳ | ✅ |
| `vp-1529` | [Bon Trinh](https://vietprofs.roars.dev/people/vp-1529.html) | University of Virginia | Pathology | ⏳ | ⏳ | ✅ |
| `vp-1530` | [Hieu Trung Nguyen](https://vietprofs.roars.dev/people/vp-1530.html) | North Carolina Agricultural and Technical State University | Electrical and Computer Engineering | ⏳ | ⏳ | ✅ |
| `vp-1531` | [Thinh Pham](https://vietprofs.roars.dev/people/vp-1531.html) | University of Glasgow | School of Psychology and Neuroscience | ⏳ | ⏳ | ✅ |
| `vp-1532` | [Dat Tran](https://vietprofs.roars.dev/people/vp-1532.html) | Rowan University | Mathematics | ⏳ | ⏳ | ✅ |
| `vp-1533` | [Minh Hieu Nguyen](https://vietprofs.roars.dev/people/vp-1533.html) | Université de Lorraine | Operations Research & Optimization | ⏳ | ⏳ | ✅ |
| `vp-1534` | [TuongThuy Vu](https://vietprofs.roars.dev/people/vp-1534.html) | Curtin University | Civil and Construction Engineering | ⏳ | ⏳ | ✅ |
| `vp-1535` | [Thai Nguyen](https://vietprofs.roars.dev/people/vp-1535.html) | Université Laval | École d'actuariat | ⏳ | ⏳ | ✅ |
| `vp-1536` | [Binh Chi Bui](https://vietprofs.roars.dev/people/vp-1536.html) | University of Texas at El Paso | College of Education | ⏳ | ⏳ | ⏳ |

---

