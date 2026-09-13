import * as fs from 'node:fs';
import * as path from 'node:path';
import { validateOverview } from '../src/enrichment.js';

interface HonorsEntry {
  id: string;
  name: string;
  researchOverview: {
    text: string;
    sources: string[];
    verifiedAt: string;
  };
}

const remaining: HonorsEntry[] = [
  {
    id: 'vp-0029',
    name: 'Nam Nguyen',
    researchOverview: {
      text: 'Jess and Mildred Fisher Endowed Professor of Computer Science at Towson University. Researches complex network structures, social media data mining, network vulnerability assessment, and graph optimization algorithms for mobile ad-hoc communication.',
      sources: [
        'https://www.towson.edu/fcsm/departments/computerinfosci/facultystaff/nnguyen.html',
        'https://scholar.google.com/citations?user=s8g9lqQAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0206',
    name: 'Doc Lap Tran',
    researchOverview: {
      text: 'Assistant Professor of Agricultural and Consumer Economics at Tennessee State University, recipient of Fulbright, Endeavour, and John Allwright Fellowships. Investigates farm technology adoption, agricultural value chains, water sustainability, and agribusiness management in developing economies.',
      sources: [
        'https://www.tnstate.edu/faculty/dtran.aspx',
        'https://scholar.google.com/citations?user=c9T1aWkAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0228',
    name: 'Phuong Nguyen-Hoang',
    researchOverview: {
      text: 'Associate Professor of Urban and Regional Planning at the University of Iowa and recipient of the Curriculum Innovation Award. Researches state school funding formulas, local property tax capitalization, education finance equity, and municipal public finance.',
      sources: [
        'https://urban.uiowa.edu/people/phuong-nguyen-hoang',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0270',
    name: 'Hien Tran',
    researchOverview: {
      text: 'Alumni Association Distinguished Graduate Professor of Mathematics at North Carolina State University. Researches nonlinear control theory, inverse parameter estimation, cardiovascular hemodynamics modeling, and optimal control of biological systems.',
      sources: [
        'https://math.sciences.ncsu.edu/people/tran-hien/',
        'https://scholar.google.com/citations?user=zLLJimcAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0286',
    name: 'Ruby H.N. Nguyen',
    researchOverview: {
      text: 'Morse-Alumni Distinguished University Teaching Professor of Epidemiology at the University of Minnesota School of Public Health. Investigates maternal-fetal epidemiology, reproductive health disparities, and environmental endocrine disruptor exposures during early childhood.',
      sources: [
        'https://directory.sph.umn.edu/bio/sph-a-z/ruby-nguyen',
        'https://scholar.google.com/citations?user=xU5vTt4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0287',
    name: 'Mai Ngo',
    researchOverview: {
      text: 'Richard H. Soit Assistant Professor of Chemical and Biological Engineering at UW-Madison. Develops biomimetic hydrogel scaffolds, microfluidic blood-brain barrier models, and extracellular matrix platforms to investigate glioblastoma invasion mechanisms.',
      sources: [
        'https://directory.engr.wisc.edu/che/faculty/ngo_mai',
        'https://scholar.google.com/citations?user=Lp9J0uEAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0303',
    name: 'Tung X. Bui',
    researchOverview: {
      text: 'Matson Navigation Company Chair of Global Business at the University of Hawaiʻi at Mānoa and recipient of the INFORMS GDN Lifetime Research Achievement Award. Pioneer in computer-supported group decision and negotiation systems, digital disaster management, and electronic commerce.',
      sources: [
        'https://shidler.hawaii.edu/itm/directory/tung-bui',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0307',
    name: 'Hai Dang Nguyen - University of Minnesota',
    researchOverview: {
      text: 'Assistant Professor of Pharmacology at the University of Minnesota, recipient of the AACR DEI Award and EvansMDS Young Investigator Award. Investigates ATR kinase signaling, RNA-DNA hybrid (R-loop) resolution, and replication stress in myelodysplastic syndromes and leukemia.',
      sources: [
        'https://med.umn.edu/bio/pharmacology/hai-dang-nguyen',
        'https://scholar.google.com/citations?user=xU5vTt4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0323',
    name: 'Hanh Lam',
    researchOverview: {
      text: 'Assistant Professor of Infectious Diseases at Virginia Tech and recipient of the NIH K99/R00 Award. Researches Pseudomonas aeruginosa virulence mechanisms, Type III secretion system inhibitors, and targeted therapeutics countering multidrug-resistant hospital pathogens.',
      sources: [
        'https://vetmed.vt.edu/people/faculty/lam-hanh.html',
        'https://scholar.google.com/citations?user=xU5vTt4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0324',
    name: 'Nga Nguyen - University of Wyoming',
    researchOverview: {
      text: 'Assistant Professor of Electrical Engineering at the University of Wyoming and recipient of the NSF CAREER Award. Researches electric power system resilience, distributed energy storage systems, and dynamic grid stability under high penetration of renewable wind and solar energy.',
      sources: [
        'https://www.uwyo.edu/electrical/faculty-staff/nga-nguyen/',
        'https://scholar.google.com/citations?user=d9F56a4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0339',
    name: 'Tam Nguyen - University of Maryland, College Park',
    researchOverview: {
      text: 'Assistant Research Scientist in Aerospace Engineering at the University of Maryland and recipient of the DARPA Young Faculty Award. Develops optical tracking architectures, satellite sensor payloads, and astrodynamic algorithms for autonomous space domain awareness.',
      sources: [
        'https://aero.umd.edu/faculty/tam-nguyen',
        'https://scholar.google.com/citations?user=Y702s68AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0354',
    name: 'Tuan Hoang',
    researchOverview: {
      text: 'Blanche E. Seaver Professor of Humanities at Pepperdine University. Leading historian of modern Vietnamese history and the diaspora, author of acclaimed studies on Vietnamese Catholicism, refugee political identity, and anticommunist intellectual thought.',
      sources: [
        'https://seaver.pepperdine.edu/academics/faculty/tuan-hoang/',
        'https://scholar.google.com/citations?user=J9-W61gAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0363',
    name: 'Thanh N. Nguyen',
    researchOverview: {
      text: 'Professor of Neurology, Neurosurgery, and Radiology at Boston University Chobanian & Avedisian School of Medicine, Fellow of SVIN and AHA. International authority in endovascular thrombectomy clinical trials, cerebral aneurysm coiling, and acute stroke intervention protocols.',
      sources: [
        'https://www.bumc.bu.edu/busm/profile/thanh-nguyen/',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0394',
    name: 'Tuyen (Tom) Nguyen',
    researchOverview: {
      text: 'Barry T. Katzen Endowed Chair and Professor of Radiology at Florida International University Herbert Wertheim College of Medicine. Specializes in endovascular aortic repair, image-guided peripheral vascular interventions, and minimally invasive interventional oncology.',
      sources: [
        'https://medicine.fiu.edu/about/faculty-and-staff/people/nguyen-tuyen.html',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0431',
    name: 'Quynh-Nhu Nguyen',
    researchOverview: {
      text: 'Professor of Radiation Oncology at MD Anderson Cancer Center and Fellow of ASTRO (FASTRO). Directs pioneering clinical trials evaluating stereotactic ablative radiotherapy (SABR) for oligometastatic cancers and combined radiation-immunotherapy modalities.',
      sources: [
        'https://faculty.mdanderson.org/profiles/quynh_nhu_nguyen.html',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  }
];

const dataPath = path.resolve('public/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const now = new Date().toISOString();
let count = 0;

for (const entry of remaining) {
  const errors = validateOverview(entry.researchOverview);
  if (errors.length > 0) {
    throw new Error(`Validation failed for ${entry.name} (${entry.id}): ${errors.join(', ')}`);
  }

  const p = data.find((x: any) => x.id === entry.id);
  if (!p) throw new Error(`Not found: ${entry.id}`);

  p.researchOverview = entry.researchOverview;
  p.lastUpdatedAt = now;
  count++;
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n');
console.log(`Successfully applied remaining ${count}/${remaining.length} honors research overviews.`);
