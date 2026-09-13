import * as fs from 'node:fs';
import * as path from 'node:path';
import { validateOverview } from '../src/enrichment.js';

interface EnrichmentEntry {
  id: string;
  name: string;
  researchOverview: {
    text: string;
    sources: string[];
    verifiedAt: string;
  };
  cleanUrls?: {
    websiteUrl?: string;
    labUrl?: string;
  };
}

const enrichments: EnrichmentEntry[] = [
  {
    id: 'vp-0435',
    name: 'Ngoc Tran',
    researchOverview: {
      text: 'Specializes in tropical geometry, combinatorics, and probability with applications to mathematical biology, economics, and neural coding. Investigates geometric structures underlying combinatorial optimization, neural network architectures, and social choice mechanisms.',
      sources: [
        'https://math.utexas.edu/directory/ngoc-tran',
        'https://princengoc.github.io/about.html'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0478',
    name: 'Anh T. Bui',
    researchOverview: {
      text: 'Develops statistical process control methodologies, industrial data analytics, and machine learning techniques for high-dimensional streaming data. Research addresses anomaly detection and quality engineering in advanced manufacturing systems.',
      sources: [
        'https://mathstat.vcu.edu/directory/anh-bui.html',
        'https://sites.google.com/vcu.edu/anhbui/home'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0524',
    name: 'Viet Hung Nguyen',
    researchOverview: {
      text: 'Focuses on combinatorial optimization, polyhedral combinatorics, and integer linear programming algorithms at LIMOS. Designs exact and approximation methods for telecommunication network design, facility location, and scheduling.',
      sources: [
        'https://limos.fr/detailperson/353',
        'https://perso.isima.fr/~vhnguyen/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0676',
    name: 'Kieu-Trang Nguyen',
    researchOverview: {
      text: 'Investigates political economy, firm dynamics, corporate governance, and tax policy in developing and emerging markets. Examines how institutional incentives and administrative monitoring influence capital allocation and firm growth.',
      sources: [
        'https://sites.google.com/view/kieutrangnguyen/home'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0766',
    name: 'Thanh Van Hoang',
    researchOverview: {
      text: 'Conducts research in geographic information systems, satellite remote sensing, and environmental spatial modeling at Feng Chia University. Focuses on flood risk evaluation, agricultural monitoring, and climate resilience analysis.',
      sources: [
        'https://genedu.fcu.edu.tw/en/teachers-detail/?id=T03050&unit_id=GE00',
        'https://www.gis.tw/en-US/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0998',
    name: 'Muoi Tran',
    researchOverview: {
      text: 'Researches network security and decentralized systems with a focus on blockchain network vulnerabilities, inter-domain routing security, and DDoS mitigation. Analyzed peer-to-peer partition attacks on Bitcoin and designs resilient decentralized infrastructure.',
      sources: [
        'https://www.chalmers.se/en/persons/muoi/',
        'https://muoitran.com/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1005',
    name: 'Tri Vi Dang',
    researchOverview: {
      text: 'Specializes in information economics, banking regulation, financial intermediation, and liquidity creation in financial markets. Known for influential theoretical work on information-insensitive debt and the origins of financial panics.',
      sources: [
        'https://econ.columbia.edu/econpeople/tri-vi-dang/',
        'http://www.columbia.edu/~td2332/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1033',
    name: 'Nam T. Hoang',
    researchOverview: {
      text: 'Focuses on applied time-series econometrics, empirical macroeconomics, and exchange rate dynamics at the UNE Business School. Researches monetary policy mechanisms, financial market co-movements, and international trade in the Asia-Pacific region.',
      sources: [
        'https://www.une.edu.au/staff-profiles/business/nhoang'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1034',
    name: 'Minh Quang Dao',
    researchOverview: {
      text: 'Conducted extensive research in public finance, development economics, and applied econometrics at Eastern Illinois University. Published widely on government expenditure composition, taxation efficiency, and human capital growth in developing economies.',
      sources: [
        'https://eiu.edu/economic/faculty.php?id=mqdao',
        'https://ux1.eiu.edu/~mqdao/MyResume.htm'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1074',
    name: 'Truc Thanh Ngo',
    cleanUrls: {
      websiteUrl: undefined,
      labUrl: undefined
    },
    researchOverview: {
      text: 'Specializes in polymer and composite materials, supercritical fluid extraction, and sustainable manufacturing processes at the University of San Diego. Serves as Associate Dean of Engineering with leadership in humanitarian engineering and STEM education.',
      sources: [
        'https://www.sandiego.edu/directory/biography.php?profile_id=571'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1075',
    name: 'William Phan',
    researchOverview: {
      text: 'Researches microeconomic theory, game theory, and market design at North Carolina State University. Focuses on axiomatic mechanism design, matching theory, and fair allocation algorithms for discrete resources.',
      sources: [
        'https://poole.ncsu.edu/people/wphan/',
        'https://wphan.wordpress.ncsu.edu'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1079',
    name: 'Bao Tan Huynh',
    researchOverview: {
      text: 'Investigates dynamic stochastic general equilibrium models, monetary economics, and fiscal policy design at Singapore Management University. Analyzes business cycle fluctuations, credit frictions, and macroprudential policy responses.',
      sources: [
        'https://economics.smu.edu.sg/faculty/profile/6711/huynh-bao-tan',
        'https://sites.google.com/site/petebaotanhuynh/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1084',
    name: 'Simon Quach',
    researchOverview: {
      text: 'Researches empirical labor economics and organizational economics at the University of Southern California. Examines wage setting mechanisms, internal career progression, and labor market disparities using large-scale matched employer-employee datasets.',
      sources: [
        'https://dornsife.usc.edu/profile/simon-quach/',
        'https://sites.google.com/view/simonquach/home'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1100',
    name: 'Anh D. Ngo',
    researchOverview: {
      text: 'Focuses on corporate finance, executive compensation, merger and acquisition strategies, and banking performance at Norfolk State University. Studies corporate governance structures and financial institution efficiency across global markets.',
      sources: [
        'https://www.nsu.edu/Academics/Faculty-and-Academic-Divisions/Schools-and-Colleges/School-of-Business/Faculty-Staff/files/Dr-Ngo-Anh-CV.aspx',
        'https://nsu.academia.edu/AnhNgo'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1109',
    name: 'Phong Luu',
    researchOverview: {
      text: 'Investigates mathematical finance, stochastic differential equations, and computational methods for derivative pricing at the University of North Georgia. Researches numerical algorithms for jump-diffusion models and optimal stopping problems in financial markets.',
      sources: [
        'https://ung.edu/mathematics/faculty-staff-bio/phong-luu.php',
        'https://sites.google.com/site/pluu66/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1182',
    name: 'Minh Dung Phan',
    researchOverview: {
      text: 'Introduced Dung\'s abstract argumentation framework, establishing foundational theory for non-monotonic reasoning and computational argumentation in artificial intelligence. Research spans logic programming semantics, multi-agent negotiation, and formal legal reasoning.',
      sources: [
        'https://www.cs.ait.ac.th/~dung/',
        'https://ait.ac.th/2026/01/ait-ranked-5-in-thailand-by-scholargps-five-faculty-named-top-scholars/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1246',
    name: 'Tuan Do',
    researchOverview: {
      text: 'Holds the Andrea M. Ghez Centennial Term Chair in Astronomy and Astrophysics at UCLA, directing high-resolution studies of the Milky Way Galactic Center. Uses adaptive optics with Keck Observatory to test general relativity and track stellar orbits around supermassive black holes.',
      sources: [
        'https://www.pa.ucla.edu/faculty/tuan-do.html',
        'https://www.astro.ucla.edu/~tdo/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1265',
    name: 'Van-Hai Bui',
    researchOverview: {
      text: 'Develops energy management systems, resilient microgrid controls, and machine learning solutions for smart power distribution at University of Michigan-Dearborn. Designs decentralized optimization algorithms for renewable integration and electric vehicle charging.',
      sources: [
        'https://umdearborn.edu/users/vhbui',
        'https://buivanhaibk.wixsite.com/van-haibui'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1500',
    name: 'Khac-Hoang Ngo',
    researchOverview: {
      text: 'Researches wireless communication theory, massive random access protocols, and cell-free massive MIMO architectures at Linköping University. Recipient of the Golden Globe Science and Technology Award for advances in non-coherent communications for future 6G networks.',
      sources: [
        'https://liu.se/en/employee/khang43',
        'https://khachoang1412.github.io/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  }
];

const dataPath = path.resolve('public/data.json');
const raw = fs.readFileSync(dataPath, 'utf-8');
const data = JSON.parse(raw);

let count = 0;
for (const entry of enrichments) {
  const errors = validateOverview(entry.researchOverview);
  if (errors.length > 0) {
    throw new Error(`Validation failed for ${entry.name} (${entry.id}): ${errors.join(', ')}`);
  }

  const existing = data.find((p: any) => p.id === entry.id);
  if (!existing) {
    throw new Error(`Entry not found: ${entry.id} (${entry.name})`);
  }

  if (entry.cleanUrls) {
    if (entry.cleanUrls.websiteUrl === undefined) delete existing.websiteUrl;
    if (entry.cleanUrls.labUrl === undefined) delete existing.labUrl;
  }

  existing.researchOverview = entry.researchOverview;
  existing.lastUpdatedAt = new Date().toISOString();
  count++;
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n');
console.log(`Successfully applied ${count}/${enrichments.length} final batch research overviews.`);
