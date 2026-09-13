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
}

const enrichments: EnrichmentEntry[] = [
  // --- BATCH 5 ---
  {
    id: 'vp-0056',
    name: 'Thang Le',
    researchOverview: {
      text: 'Professor of Mathematics at Georgia Tech and world-renowned topologist who co-developed the Le-Murakami-Ohtsuki (LMO) invariant for 3-manifolds. Research focuses on quantum topology, colored Jones polynomials, representation varieties of knot groups, and the AJ conjecture relating quantum invariants to the A-polynomial.',
      sources: [
        'https://math.gatech.edu/people/thang-le',
        'https://pwp.gatech.edu/thang-le/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },

  // --- BATCH 6 ---
  {
    id: 'vp-0060',
    name: 'Khai T. Nguyen',
    researchOverview: {
      text: 'Professor of Mathematics at North Carolina State University specializing in nonlinear hyperbolic conservation laws, vanishing viscosity methods, and differential games. Resolves fundamental questions regarding the regularity, structural stability, and shock propagation of entropy solutions to conservation laws.',
      sources: [
        'https://math.sciences.ncsu.edu/people/ktnguye4/',
        'https://sites.google.com/ncsu.edu/khainguyen/home'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0061',
    name: 'Nam Q. Le',
    researchOverview: {
      text: 'Professor of Mathematics at Indiana University Bloomington investigating fully nonlinear partial differential equations and geometric analysis. Known for influential contributions to Monge-Ampère equations, affine Bernstein problems, and the singularity analysis of parabolic geometric flows.',
      sources: [
        'https://math.indiana.edu/about/faculty/le-nam.html',
        'https://nqle.pages.iu.edu/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0062',
    name: 'Hoi H. Nguyen',
    researchOverview: {
      text: 'Professor of Mathematics at The Ohio State University, Sloan Research Fellow, and NSF CAREER recipient recognized for breakthrough work in random matrix theory and probabilistic combinatorics. Established universality for non-Hermitian random matrices and solved long-standing inverse Littlewood-Offord problems.',
      sources: [
        'https://math.osu.edu/people/nguyen.1261',
        'https://people.math.osu.edu/nguyen.1261/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0064',
    name: 'Minh-Binh Tran',
    researchOverview: {
      text: 'Associate Professor of Mathematics at Texas A&M University researching kinetic theory, quantum Boltzmann equations, and deep learning for scientific computing. Investigates mathematical models for Bose-Einstein condensation, wave turbulence, and physical neural network dynamics.',
      sources: [
        'https://artsci.tamu.edu/mathematics/contact/profiles/minh-binh-tran.html',
        'https://minhbinhtran.org/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0065',
    name: 'Anh-Khoa Vo',
    researchOverview: {
      text: 'Assistant Professor of Mathematics at Texas Tech University developing globally convergent numerical algorithms for coefficient inverse problems governed by partial differential equations. Applies computational inverse scattering to medical imaging, acoustic detection, and optical tomography.',
      sources: [
        'https://www.depts.ttu.edu/math/about/directory/bio/index.php?id=1802',
        'https://sites.google.com/site/khoavo92math/home'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0066',
    name: 'Bao Le Hung',
    researchOverview: {
      text: 'Associate Professor of Mathematics at Northwestern University, Sloan Research Fellow, and Packard Fellow working in arithmetic geometry and the Langlands program. Celebrated for proving modularity lifting theorems and advancing the understanding of p-adic Galois representations and Shimura varieties.',
      sources: [
        'https://www.math.northwestern.edu/people/faculty/bao-le-hung1.html',
        'https://sites.math.northwestern.edu/~lhvietbao/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },

  // --- BATCH 7 ---
  {
    id: 'vp-0072',
    name: 'Huy Tuan Pham',
    researchOverview: {
      text: 'Assistant Professor of Mathematics at Caltech and Clay Research Fellow celebrated for solving the long-standing Kahn-Kalai conjecture on threshold phenomena in probabilistic combinatorics. Research spans additive combinatorics, random graphs, high-dimensional probability, and theoretical machine learning.',
      sources: [
        'https://www.pma.caltech.edu/people/huy-tuan-huy-pham',
        'https://huytuanpham.github.io/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0079',
    name: 'Truong Q. Nguyen',
    researchOverview: {
      text: 'Distinguished Professor of Electrical and Computer Engineering at UC San Diego and IEEE Fellow leading the Video Processing Laboratory. Specializes in 3D and 4D scene reconstruction, light field imaging, multi-camera computer vision, and AI-enabled assistive robotic systems for healthcare.',
      sources: [
        'https://profiles.ucsd.edu/truong.nguyen',
        'https://sites.google.com/view/ucsdvpl/home'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0080',
    name: 'Anh-Vu Pham',
    researchOverview: {
      text: 'Professor of Electrical and Computer Engineering at UC Davis and IEEE Fellow directing the Microwave Microsystems Laboratory. Pioneered high-efficiency millimeter-wave and terahertz integrated circuits, wide-bandgap RF front-ends, and ultra-compact radar sensor architectures for 5G/6G wireless networks.',
      sources: [
        'https://faculty.engineering.ucdavis.edu/pham/',
        'https://mml.ece.ucdavis.edu/people/anh-vu-pham'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },

  // --- BATCH 8 ---
  {
    id: 'vp-0100',
    name: 'Nhat Ho',
    researchOverview: {
      text: 'Assistant Professor of Statistics and Data Sciences at UT Austin developing theoretical and algorithmic foundations for statistical machine learning. Researches optimal transport, scalable Bayesian computation, Wasserstein barycenters, and parameter estimation in high-dimensional mixture models.',
      sources: [
        'https://stat.utexas.edu/directory/nhat-ho',
        'https://nhatptnk8912.github.io/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },

  // --- BATCH 9 ---
  {
    id: 'vp-0107',
    name: 'Dinh-Liem Nguyen',
    researchOverview: {
      text: 'Associate Professor of Mathematics at Kansas State University investigating inverse scattering problems and scientific computing for wave propagation. Develops qualitative and quantitative reconstruction algorithms for non-destructive testing and electromagnetic imaging of anisotropic media.',
      sources: [
        'https://sites.google.com/site/dinhliemnguyen/home',
        'https://sites.google.com/site/dinhliemnguyen/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0109',
    name: 'Khiem T. Tran',
    researchOverview: {
      text: 'Associate Professor of Civil and Coastal Engineering at the University of Florida specializing in geotechnical site characterization and nondestructive evaluation. Leads research on full-waveform seismic inversion and 3D subsurface tomography to evaluate foundation capacity and detect underground sinkholes.',
      sources: [
        'https://www.eng.ufl.edu/about/contact/college-directory/name/khiem-tran/',
        'https://faculty.eng.ufl.edu/khiem-tran/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0110',
    name: 'Thang N. Dao',
    researchOverview: {
      text: 'Associate Professor of Civil, Construction and Environmental Engineering at the University of Alabama developing multi-hazard mitigation frameworks for coastal infrastructure. Analyzes structural response under hurricane wind loads, storm surges, and seismic forces to optimize building resilience.',
      sources: [
        'https://eng.ua.edu/eng-directory/dr-thang-n-dao/',
        'https://tndao.eng.ua.edu/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },

  // --- BATCH 10 ---
  {
    id: 'vp-0123',
    name: 'Kytai Truong Nguyen',
    researchOverview: {
      text: 'Distinguished University Professor of Bioengineering at UT Arlington, AIMBE and BMES Fellow directing the Nanomedicine and Tissue Engineering Laboratory. Develops responsive nanoparticle systems for targeted cardiovascular drug delivery, stem cell scaffolding, and photoacoustic diagnostic imaging.',
      sources: [
        'https://www.uta.edu/academics/faculty/profile?user=knguyen',
        'https://websites.uta.edu/knguyen'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },

  // --- BATCH 11 ---
  {
    id: 'vp-0133',
    name: 'Quang Vuong',
    researchOverview: {
      text: 'Professor of Economics at New York University and Fellow of the Econometric Society celebrated for the Vuong closeness test for non-nested model selection. Research focuses on structural microeconometrics, auction theory, industrial organization, and semiparametric identification of game models.',
      sources: [
        'https://wp.nyu.edu/crate/research-staff/',
        'https://sites.google.com/view/qvuong/home'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0135',
    name: 'Hieu Phan',
    researchOverview: {
      text: 'Professor of Finance at UMass Lowell conducting empirical research in corporate finance, corporate governance, and shareholder litigation. Investigates how executive compensation structure, corporate pension funding risk, and ESG commitments influence firm valuation and risk-taking behavior.',
      sources: [
        'https://www.uml.edu/msb/faculty/phan-hieu.aspx',
        'https://sites.google.com/site/hieuphanfinance/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0136',
    name: 'Du Nguyen',
    researchOverview: {
      text: 'Assistant Professor of Finance at Bowling Green State University investigating empirical asset pricing, institutional investor behavior, and mutual fund performance. Analyzes market anomalies, ETF arbitrage dynamics, and the pricing of systematic risk in cross-sectional equity returns.',
      sources: [
        'https://www.bgsu.edu/business/departments-and-programs/accounting-and-management-information-systems/faculty-staff/du-nguyen--ph-d-',
        'https://du-dnguyen.github.io/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0142',
    name: 'Hai Tran - Loyola Marymount University',
    researchOverview: {
      text: 'Associate Professor of Finance at Loyola Marymount University examining institutional asset management, active fund manager incentives, and corporate disclosure practices. Investigates how mutual fund governance and shareholder proxy voting decisions affect corporate accountability.',
      sources: [
        'https://scholars.lmu.edu/en/persons/hai-tran/',
        'https://www.haitranv.com/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0143',
    name: 'Giang Nguyen',
    researchOverview: {
      text: 'Associate Professor of Finance at Penn State Smeal College of Business researching financial econometrics and fixed-income market microstructure. Specializes in US Treasury liquidity dynamics, dealer quote behavior during macro announcements, and municipal bond market transparency.',
      sources: [
        'https://directory.smeal.psu.edu/gxn13',
        'http://sites.google.com/site/ghn8888'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },

  // --- BATCH 14 ---
  {
    id: 'vp-0209',
    name: 'Oanh Nguyen',
    researchOverview: {
      text: 'Assistant Professor of Applied Mathematics at Brown University researching random polynomials, high-dimensional probability, and mathematical physics. Solved open questions on real zero distributions of random polynomials and universality phenomena in random geometric systems.',
      sources: [
        'https://appliedmath.brown.edu/people/oanh-nguyen',
        'https://sites.google.com/view/oanh-nguyen/home'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },

  // --- BATCH 15 ---
  {
    id: 'vp-0220',
    name: 'Ngoc-Khanh Tran',
    researchOverview: {
      text: 'Assistant Professor of Computer Science at Fairfield University specializing in deep learning, speech processing, and affective computing. Designs acoustic signal processing and multilingual speech recognition algorithms for voice health diagnostics.',
      sources: [
        'https://www.fairfield.edu/undergraduate/academics/faculty/tran-ngoc-khanh.html',
        'https://www.nktran.com/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0224',
    name: 'Victoria Tran',
    researchOverview: {
      text: 'Assistant Professor of Sociology at Reed College researching immigration, race, labor markets, and legal status. Investigates the social and economic mobility of Southeast Asian refugees and undocumented immigrants in American society.',
      sources: [
        'https://www.reed.edu/sociology/faculty/victoria-tran.html',
        'http://www.tranvictoria.com/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0230',
    name: 'T. Kim-Trang Tran',
    researchOverview: {
      text: 'Professor of Art and Media Studies at Scripps College and acclaimed experimental filmmaker whose video works explore blindness, visual culture, and immigrant identity. Screened internationally at the Whitney Biennial and Museum of Modern Art (MoMA).',
      sources: [
        'https://www.scrippscollege.edu/academics/faculty/profile/t-kim-trang-tran',
        'https://trantkimtrang.com'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0239',
    name: 'N. Rich Nguyen',
    researchOverview: {
      text: 'Associate Professor of Computer Science at the University of Virginia recognized for computing pedagogy, cybersecurity education, and automated assessment systems. Directs computer systems courses and researches automated code grading, secure software engineering, and curriculum equity.',
      sources: [
        'https://engineering.virginia.edu/faculty/n-rich-nguyen',
        'https://www.cs.virginia.edu/~nn4pj/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },

  // --- BATCH 16 ---
  {
    id: 'vp-0240',
    name: 'Truong Hoang',
    researchOverview: {
      text: 'Assistant Professor of Computer Science at the University of Colorado Boulder researching automated program repair, software testing, and vulnerability remediation. Develops LLM-driven program analysis tools and neurosymbolic methods for autonomous patch generation.',
      sources: [
        'https://www.colorado.edu/cs/truong-hoang',
        'https://tonys2berry.github.io/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0257',
    name: 'Cuong Nguyen Le',
    researchOverview: {
      text: 'Assistant Professor of Mechanical and Industrial Engineering at UMass Amherst researching computational solid mechanics and fracture in advanced materials. Formulates phase-field damage models and multiscale simulations for composites and lithium-ion battery electrodes.',
      sources: [
        'https://mie.umass.edu/faculty/cuong-nguyen-le',
        'https://www.cnle.net/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0271',
    name: 'Thi Mai Anh Nguyen',
    researchOverview: {
      text: 'Assistant Professor of Technology Management and Innovation at NYU Tandon School of Engineering researching stochastic service systems and healthcare operations. Designs data-driven queueing models and optimization frameworks to streamline emergency department workflow.',
      sources: [
        'https://engineering.nyu.edu/faculty/thi-mai-anh-nguyen',
        'https://www.anhnguyentm.com/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0301',
    name: 'Thuy-Ngoc Nguyen',
    researchOverview: {
      text: 'Assistant Professor of Mathematics at the University of Dayton researching applied probability, actuarial mathematics, and financial risk theory. Investigates ruin probabilities in heavy-tailed insurance portfolios, dependent risk aggregations, and extreme catastrophe loss estimation.',
      sources: [
        'https://udayton.edu/directory/artssciences/mathematics/nguyen-thuy-ngoc.php',
        'https://ngocntkt.github.io/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0308',
    name: 'Tuan D. Nguyen',
    researchOverview: {
      text: 'Associate Professor of Education Policy at the University of Missouri researching teacher labor markets, teacher shortages, compensation reform, and educational equity. Publishes widely-cited national databases on educator turnover and evaluates retention policies across US school districts.',
      sources: [
        'https://education.missouri.edu/person/tuan-nguyen/',
        'https://tuan-d-nguyen.github.io/home'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0340',
    name: 'Josef Nguyen',
    researchOverview: {
      text: 'Associate Professor of Critical Media Studies at UT Dallas and author of "The Digital Is Cultural" (University of Minnesota Press). Researches digital labor, video game studies, creative coding, and techno-cultural ideologies of play and automation.',
      sources: [
        'https://profiles.utdallas.edu/josef.nguyen',
        'https://www.josefnguyen.net/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0355',
    name: 'Paul Anh Tran-Hoang',
    researchOverview: {
      text: 'Assistant Professor of Economics at Haverford College researching behavioral economics, experimental finance, and decision theory. Investigates how cognitive biases, framing effects, and social comparison influence financial portfolio choices and asset market efficiency.',
      sources: [
        'https://www.haverford.edu/faculty/ptranhoang',
        'https://paultranhoang.github.io/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },

  // --- BATCH 17 ---
  {
    id: 'vp-0382',
    name: 'Que-Lam Huynh',
    researchOverview: {
      text: 'Professor of Psychology at CSU Northridge researching social identity, ethnic microaggressions, acculturation processes, and health disparities among immigrant populations. Investigates bicultural identity integration and psychological resilience mechanisms among racial and ethnic minority college students.',
      sources: [
        'https://www.csun.edu/social-behavioral-sciences/psychology/que-lam-huynh',
        'http://www.csun.edu/~qhuynh'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0407',
    name: 'Mai Van Tran',
    researchOverview: {
      text: 'Assistant Professor of Political Science at Northern Illinois University and author of "Resisting the Ring of Steel" (Columbia University Press). Analyzes grassroots civil resistance, digital activism, and youth social mobilization under authoritarian regimes in Southeast Asia.',
      sources: [
        'https://www.niu.edu/clas/polisci/about/faculty/tran.shtml',
        'https://maivantran.weebly.com/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0416',
    name: 'Thao Bui',
    researchOverview: {
      text: 'Assistant Professor of Mathematics at Queens College, CUNY researching harmonic analysis, singular integral operators, and weighted function spaces. Investigates caloric commutators, fractional integrals, and boundary value problems on non-smooth Riemannian manifolds.',
      sources: [
        'https://www.qc.cuny.edu/academics/math/faculty-staff/',
        'https://sites.google.com/view/thaobui/home'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0476',
    name: 'C. Thi Nguyen',
    researchOverview: {
      text: 'Professor of Philosophy at the University of Utah and author of "Games: Agency as Art" (Oxford University Press). World-renowned philosopher of agency, trust, echo chambers, value capture, and gamification whose work examines how institutional metrics simplify and distort human value systems.',
      sources: [
        'https://philosophy.utah.edu/faculty/c-thi-nguyen.php',
        'https://objectionable.net/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0525',
    name: 'Kim Nguyen',
    researchOverview: {
      text: 'Professor of Computer Science at Université Paris-Saclay and researcher at the Laboratoire Méthodes Formelles (LMF). Specializes in programming language design, type theory, gradual typing, and semantic foundations for XML and JSON querying languages.',
      sources: [
        'https://lmf.cnrs.fr/Members/KimNguyen/',
        'https://usr.lmf.cnrs.fr/~kn/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },

  // --- BATCH 18 ---
  {
    id: 'vp-0615',
    name: 'Nguyen Viet Dang',
    researchOverview: {
      text: 'Professor of Mathematics at Sorbonne Université and recipient of the 2023 Prix Jacques Herbrand from the French Academy of Sciences. Pioneer in microlocal analysis, quantum chaos, semiclassical limits, and mathematical quantum field theory on curved spacetimes.',
      sources: [
        'https://perso.pages.math.cnrs.fr/users/dang/',
        'https://sites.google.com/view/dangnguyenviet/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0651',
    name: 'Thomas T. Nguyen',
    researchOverview: {
      text: 'Assistant Professor of Periodontics and Director of Predoctoral Periodontology at McGill University Faculty of Dental Medicine. Researches alveolar bone regeneration, soft-tissue grafting around dental implants, and novel biomaterials for regenerative periodontics.',
      sources: [
        'https://www.mcgill.ca/dentistry/thomas-nguyen',
        'https://drthomasnguyen.com/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0660',
    name: 'Hoa Nguyen - Toronto Metropolitan University',
    researchOverview: {
      text: 'Associate Professor of Computer Science at Toronto Metropolitan University researching software engineering, automated program analysis, and developer tooling. Develops automated defect detection and code mining techniques to improve software reliability in complex open-source ecosystems.',
      sources: [
        'https://www.torontomu.ca/cs/people/faculty/hoa-nguyen/',
        'https://www.hoa-nguyen.com/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0667',
    name: 'Anh Tuan Phan',
    researchOverview: {
      text: 'Professor of Biophysics and Structural Biology at Nanyang Technological University (NTU Singapore). Celebrated for seminal NMR and crystallographic determinations of non-canonical nucleic acid structures, including DNA and RNA G-quadruplexes and i-motifs for therapeutic drug targeting.',
      sources: [
        'https://dr.ntu.edu.sg/cris/rp/rp00788',
        'https://personal.ntu.edu.sg/phantuan/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0703',
    name: 'Thanh Nguyen (Nguyen-Tang Thanh)',
    researchOverview: {
      text: 'Assistant Professor of Computer Science at New Jersey Institute of Technology researching reinforcement learning, multi-agent AI, and algorithmic game theory. Investigates provably convergent multi-agent learning algorithms and non-stationary Markov decision processes.',
      sources: [
        'https://cs.njit.edu/people/thanh-nguyen',
        'https://thanhnguyentang.github.io/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0745',
    name: 'Thanh Le-Cong',
    researchOverview: {
      text: 'Assistant Professor of Information Systems Technology and Design at Singapore University of Technology and Design (SUTD). Specializes in automated software testing, software security, and AI for software engineering, developing neural fuzzers and vulnerability detection frameworks.',
      sources: [
        'https://www.sutd.edu.sg/About/Directory/Faculty/Thanh-Le-Cong',
        'https://thanhlc.net/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0746',
    name: 'Trang Bui',
    researchOverview: {
      text: 'Assistant Professor of Finance at the Edwards School of Business, University of Saskatchewan. Investigates empirical corporate finance, institutional investor activism, and executive compensation design, focusing on corporate debt structure and shareholder litigation.',
      sources: [
        'https://www.edwards.usask.ca/faculty/Trang%20Bui/',
        'https://tqtbui.github.io/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },

  // --- BATCH 19 ---
  {
    id: 'vp-0747',
    name: 'Tho Pham',
    researchOverview: {
      text: 'Associate Professor of Economics and Finance at Brunel University London combining applied econometrics and machine learning. Investigates gender gaps in corporate leadership, financial technology adoption, and corporate sustainability metrics using non-standard web datasets.',
      sources: [
        'https://www.brunel.ac.uk/people/tho-pham',
        'https://www.thopham.com/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0748',
    name: 'Long Tran-Thanh',
    researchOverview: {
      text: 'Professor of Artificial Intelligence at the University of Warwick leading the Human-Agent AI Laboratory. Specializes in multi-armed bandits, budget-constrained online learning, algorithmic game theory, and multi-agent coordination systems with human teammates.',
      sources: [
        'https://warwick.ac.uk/fac/sci/dcs/people/long_tran-thanh/',
        'https://human-agentlearning.github.io/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0753',
    name: 'Hieu Le',
    researchOverview: {
      text: 'Assistant Professor of Computer Science at UNC Charlotte specializing in generative computer vision, 3D neural reconstruction, and computational photography. Researches diffusion models, single-view 3D shape estimation, and shadow removal algorithms for natural scenes.',
      sources: [
        'https://cci.charlotte.edu/people/hieu-m-le/',
        'https://hieulem.github.io/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0754',
    name: 'Ha Nguyen - University of North Carolina at Chapel Hill',
    researchOverview: {
      text: 'Assistant Professor of Education at UNC Chapel Hill researching learning analytics, interactive STEM environments, and AI-supported educational inquiry. Designs data-driven learning platforms that help students develop scientific argumentation and systems-thinking skills.',
      sources: [
        'https://ed.unc.edu/people/ha-nguyen/',
        'https://ha-nguyen.net'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0756',
    name: 'Duc-Thang Vo',
    researchOverview: {
      text: 'Associate Professor of Chemical Engineering at National Taiwan University of Science and Technology (Taiwan Tech). Develops functionalized chitosan, catecholamine biomaterials, and nanostructured coatings for circulating tumor cell capture and antibacterial surface engineering.',
      sources: [
        'https://ce-r.ntust.edu.tw/p/404-1024-65379.php?Lang=en',
        'https://vdthangbk.com/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },

  // --- BATCH 20 ---
  {
    id: 'vp-0795',
    name: 'Phuong-Anh Nguyen',
    researchOverview: {
      text: 'Associate Professor of Finance at York University School of Administrative Studies researching empirical corporate finance, institutional investor risk attitudes, and corporate innovation. Studies how personal exposure to macroeconomic shocks and demographic shifts shape corporate risk governance.',
      sources: [
        'https://profiles.laps.yorku.ca/profiles/anhvn/',
        'https://sites.google.com/site/backyvn/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },

  // --- BATCH 21 ---
  {
    id: 'vp-0920',
    name: 'Xuan Tan Phan',
    researchOverview: {
      text: 'Associate Professor of Systems Engineering at Shibaura Institute of Technology researching visual SLAM, mobile robotics, and deep neural network verification. Develops real-time visual-inertial odometry algorithms and certified safety mechanisms for autonomous ground vehicles.',
      sources: [
        'https://www.shibaura-it.ac.jp/en/research/laboratory/00005.html',
        'https://sites.google.com/view/phanxuantan'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },

  // --- BATCH 22 ---
  {
    id: 'vp-0956',
    name: 'Duc Khuong Nguyen',
    researchOverview: {
      text: 'Dean and Professor of Finance at EMLV Business School and prominent international economist in energy finance and emerging market risk. Directs research on climate economics, ESG investment strategies, energy transition commodity dynamics, and international financial integration.',
      sources: [
        'https://www.emlv.fr/en/team/duc-khuong-nguyen/',
        'https://www.nguyenduckhuong.org/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },

  // --- BATCH 23 ---
  {
    id: 'vp-0994',
    name: 'Giang Dinh Nguyen',
    researchOverview: {
      text: 'Professor of Civil and Environmental Engineering at the University of Adelaide specializing in computational solid mechanics and geomaterials. Develops constitutive damage models, stress-return algorithms, and fracture mechanics frameworks for crushable soils, concrete, and rock masses.',
      sources: [
        'https://www.adelaide.edu.au/directory/g.nguyen',
        'https://sites.google.com/site/giangnguyensites/home'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1004',
    name: 'Cong S. Pham',
    researchOverview: {
      text: 'Associate Professor of Economics at Deakin University researching empirical international trade, trade policy disputes, and development economics. Investigates the economic consequences of trade wars, agricultural subsidies, global supply networks, and poverty alleviation in Asian economies.',
      sources: [
        'https://experts.deakin.edu.au/1004-cong-pham',
        'https://sites.google.com/view/congpham'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1009',
    name: 'Dien Giau Bui',
    researchOverview: {
      text: 'Associate Professor of International Business at National Chengchi University researching corporate finance, banking regulation, and empirical asset pricing. Investigates corporate payout policies, bank risk-taking under capital stringency, and credit rating agency incentives.',
      sources: [
        'https://ib.nccu.edu.tw/en/Members/Dien-Giau-Richard-Bui-44674554',
        'https://diengiau.github.io'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1011',
    name: 'Duc D. Nguyen',
    researchOverview: {
      text: 'Professor of Finance at Durham University Business School researching corporate finance, financial intermediation, and household debt. Studies the impact of climate risk on corporate lending, political connections in banking, and CEO leadership dynamics.',
      sources: [
        'https://www.durham.ac.uk/staff/business-staff/duc-d-nguyen/',
        'https://sites.google.com/site/louisnguyen6589/home'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1013',
    name: 'Phong T. H. Ngo',
    researchOverview: {
      text: 'Associate Professor of Finance at the Australian National University researching political economy, banking stability, and corporate governance. Examines how political cycles, government procurement networks, and media scrutiny influence corporate capital expenditure and bank lending.',
      sources: [
        'https://researchportalplus.anu.edu.au/en/persons/phong-ngo/',
        'https://sites.google.com/site/phongthngo/home'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1019',
    name: 'Duy-Minh Dang',
    researchOverview: {
      text: 'Associate Professor of Financial Mathematics at the University of Queensland researching computational finance and stochastic control. Develops GPU-parallelized finite-difference and Monte Carlo numerical methods for pricing complex multi-asset derivatives and managing dynamic portfolio risks.',
      sources: [
        'https://smp.uq.edu.au/profile/216/duy-minh-dang',
        'https://people.smp.uq.edu.au/Duy-MinhDang/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },

  // --- BATCH 24 ---
  {
    id: 'vp-1020',
    name: 'Tuan Anh Luong',
    researchOverview: {
      text: 'Associate Professor of Economics at De Montfort University analyzing the intersections of globalization, environmental policy, and firm productivity. Examines firm-level responses to international trade liberalization, environmental regulations, and climate change adaptation in emerging economies.',
      sources: [
        'https://www.dmu.ac.uk/about-dmu/academic-staff/business-and-law/tuan-luong/tuan-luong.aspx',
        'http://www.tuanluong.com/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1024',
    name: 'Nhan Huynh',
    researchOverview: {
      text: 'Senior Lecturer in Finance at Griffith University researching behavioral finance, household financial decision-making, and financial technology. Investigates how digital banking tools, algorithmic trading platforms, and financial literacy affect consumer saving and investment behavior.',
      sources: [
        'https://experts.griffith.edu.au/54199-david-huynh',
        'https://sites.google.com/view/david-huynh'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1029',
    name: 'Lai Trung Hoang',
    researchOverview: {
      text: 'Senior Lecturer in Finance at the University of Western Australia researching cryptocurrency markets, corporate social responsibility, and institutional trading. Analyzes market microstructure in blockchain assets and how institutional investor sentiment transmits across asset classes.',
      sources: [
        'https://research-repository.uwa.edu.au/en/persons/lai-hoang',
        'https://sites.google.com/view/lai-hoang/home'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1030',
    name: 'Nguyet Nguyen',
    researchOverview: {
      text: 'Associate Professor of Mathematics and Statistics at Youngstown State University developing applied financial and meteorological forecasting models. Researches hidden Markov models, copula methods, and machine learning algorithms for asset price prediction and weather derivatives pricing.',
      sources: [
        'https://ysu.edu/people/nguyet-moon-nguyen',
        'https://ntnguyen01.people.ysu.edu/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1032',
    name: 'Chung Tran',
    researchOverview: {
      text: 'Associate Professor of Economics at the Australian National University specializing in quantitative macroeconomic policy, public finance, and pension reform. Develops overlapping-generations models to analyze the distributional and fiscal effects of tax reforms, sovereign debt, and population aging.',
      sources: [
        'https://rse.anu.edu.au/people/chung-tran',
        'https://sites.google.com/site/chungqtran/home'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },

  // --- BATCH 25 ---
  {
    id: 'vp-1046',
    name: 'Giang Phung',
    researchOverview: {
      text: 'Associate Professor of Finance at ISC Paris Business School researching empirical corporate finance, digital finance, and ESG investment performance. Investigates bank regulatory capitalization, fintech diffusion, and carbon credit market dynamics across European markets.',
      sources: [
        'https://www.iscparis.com/en/faculty-research/phung-giang/',
        'https://sites.google.com/view/giangphung'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1053',
    name: 'Johnny Huynh',
    researchOverview: {
      text: 'Assistant Professor of Economics at Dartmouth College specializing in microeconomic theory, information design, and dynamic games. Researches strategic communication, disclosure incentives in financial markets, and dynamic mechanism design with asymmetric information.',
      sources: [
        'https://economics.dartmouth.edu/people/johnny-huynh',
        'https://sites.google.com/view/shjhuynh/home'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1059',
    name: 'Nhan Le',
    researchOverview: {
      text: 'Senior Lecturer in Finance at the Australian National University researching empirical asset pricing, institutional investors, and corporate governance. Investigates hedge fund activism, mutual fund flow performance relations, and corporate financial distress forecasting.',
      sources: [
        'https://researchportalplus.anu.edu.au/en/persons/nhan-le/',
        'https://sites.google.com/view/nhanle/home'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1067',
    name: 'Huy Chau',
    researchOverview: {
      text: 'Senior Lecturer in Financial Mathematics at the University of Manchester researching stochastic analysis, quantitative risk management, and machine learning in finance. Formulates non-linear optimal stopping problems and deep reinforcement learning algorithms for pricing path-dependent financial derivatives.',
      sources: [
        'https://research.manchester.ac.uk/en/persons/huy.chau',
        'https://sites.google.com/site/chaungochuyvn/home'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1072',
    name: 'Duong Anh Lam Tran',
    researchOverview: {
      text: 'Associate Professor of Economics at the University of Tsukuba researching international trade, global value chain participation, and wage inequality. Models endogenous technology adoption and the developmental impacts of trade integration on skill wage premiums in developing countries.',
      sources: [
        'https://trios.tsukuba.ac.jp/researcher/0000003869',
        'https://sites.google.com/site/anhduongtl/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1076',
    name: 'Canh Thien Dang',
    researchOverview: {
      text: 'Lecturer in Economics at King\'s College London specializing in development economics, public finance, and applied econometrics. Analyzes administrative tax datasets and philanthropic financial disclosures to evaluate non-profit efficiency and public good provision.',
      sources: [
        'https://www.kcl.ac.uk/people/canh-thien-dang',
        'https://sites.google.com/site/canhthiendang/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },

  // --- BATCH 26 ---
  {
    id: 'vp-1087',
    name: 'Anh Thu Mai',
    researchOverview: {
      text: 'Assistant Professor of Finance at Purdue University Northwest researching empirical asset pricing, derivative markets, and financial intermediation. Investigates how supply-demand imbalances in equity options impact underlying asset volatility and the pricing of downside tail risk.',
      sources: [
        'https://www.pnw.edu/people/anh-thu-mai/',
        'https://sites.google.com/view/anhthumai'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1088',
    name: 'Hung Viet Chu',
    researchOverview: {
      text: 'Assistant Professor of Mathematics at Washington and Lee University researching approximation theory, Banach space geometry, additive number theory, and combinatorics. Resolves open problems concerning greedy approximation algorithms, greedy bases, and MSTD (more sums than differences) sets.',
      sources: [
        'https://www.wlu.edu/profile/chu-hung',
        'https://hungvietchu.wordpress.com/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1091',
    name: 'Liet Vo',
    researchOverview: {
      text: 'Assistant Professor of Mathematics at University of Texas Rio Grande Valley specializing in numerical analysis, stochastic partial differential equations, and computational electromagnetics. Designs fast iterative solvers, finite element discretizations, and domain decomposition methods for wave propagation.',
      sources: [
        'https://www.utrgv.edu/cos/schools-and-departments/mathematical-and-statistical-sciences/math-faculty/index.htm',
        'https://sites.google.com/view/liet-vo/home'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1103',
    name: 'Van Thanh Huynh',
    researchOverview: {
      text: 'Senior Lecturer in Mechatronics and Robotics at Deakin University researching robust control theory, positive systems, and time-delay dynamics. Develops adaptive motion control and state estimation algorithms for collaborative robotic manipulators and autonomous mobile platforms.',
      sources: [
        'https://experts.deakin.edu.au/37675-van-thanh-huynh/about',
        'https://sites.google.com/view/vthuynh'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },

  // --- BATCH 27 ---
  {
    id: 'vp-1164',
    name: 'Ha Bui',
    researchOverview: {
      text: 'Assistant Professor of Economics at Grinnell College researching macroeconomics, international trade, and household expectations. Investigates how information frictions and global value chain disruptions affect monetary policy transmission and income inequality across heterogeneous households.',
      sources: [
        'https://www.grinnell.edu/user/buithuha',
        'https://www.thuhabui.com/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1165',
    name: 'Joy Marie Doan',
    researchOverview: {
      text: 'Assistant Professor of Information Sciences at the University of Tennessee, Knoxville researching critical academic librarianship, archival access, and equitable information pedagogy. Investigates institutional belonging, collection accessibility, and inclusive instructional design in academic research libraries.',
      sources: [
        'https://cci.utk.edu/sis/about/directory/joy-marie-doan/',
        'https://utk.academia.edu/JoyDoan'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1178',
    name: 'Van Ly Nguyen',
    researchOverview: {
      text: 'Assistant Professor of Electrical Engineering and Computer Science at the University of Kansas researching wireless communications and physical-layer signal processing. Develops integrated sensing and communication (ISAC), massive MIMO, and deep learning algorithms for millimeter-wave and terahertz networks.',
      sources: [
        'https://eecs.ku.edu/people/van-ly-nguyen',
        'https://people.eecs.ku.edu/~v532n390/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1179',
    name: 'Long Bao Le',
    researchOverview: {
      text: 'Professor at INRS-EMT, Université du Québec and IEEE Fellow recognized for contributions to wireless resource allocation and edge computing. Directs research on 5G/6G communication systems, cloud-RAN optimization, blockchain-enabled networks, and decentralized AI for intelligent infrastructure.',
      sources: [
        'https://inrs.ca/la-recherche/professeurs/long-le/',
        'https://longbaole.github.io/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1181',
    name: 'Brian Kha Tran',
    researchOverview: {
      text: 'Assistant Professor of Mathematics at California State University, Long Beach researching geometric mechanics, optimal control, and PDE-constrained optimization. Formulates structure-preserving geometric integrators and variational principles for nonlinear physical systems and robotic locomotion.',
      sources: [
        'https://www.csulb.edu/mathematics-statistics/department-directory',
        'https://www.btran.science/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1185',
    name: 'Thang Xuan Vu',
    researchOverview: {
      text: 'Research Scientist and Assistant Professor at the SnT Interdisciplinary Centre, University of Luxembourg. Specializes in 6G wireless communications, satellite-terrestrial integrated networks, Open RAN architectures, and robust machine learning for wireless resource management.',
      sources: [
        'https://www.uni.lu/snt-en/people/thang-xuan-vu/',
        'https://thangxvu.wordpress.com/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },

  // --- BATCH 28 ---
  {
    id: 'vp-1240',
    name: 'Kim-Vy Tran',
    researchOverview: {
      text: 'Senior Astrophysicist and Lecturer in Astronomy at Harvard University and the Center for Astrophysics | Harvard & Smithsonian. Investigates galaxy formation and cluster evolution across cosmic time using the James Webb Space Telescope (JWST), Hubble, and gravitational lensing observations.',
      sources: [
        'https://astronomy.fas.harvard.edu/people/kim-vy-tran',
        'https://kimvytran.org/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1262',
    name: 'Nhu-Ngoc Dao',
    researchOverview: {
      text: 'Assistant Professor of Computer Science and Engineering at Sejong University researching mobile cloud computing, network virtualization, and intelligent IoT systems. Applies deep reinforcement learning to autonomous edge orchestration and zero-trust security frameworks in 6G wireless networks.',
      sources: [
        'https://sejong.elsevierpure.com/en/persons/nhu-ngoc-dao',
        'https://nndao.github.io/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1385',
    name: 'Tuyen Pham',
    researchOverview: {
      text: 'Assistant Professor at the Voinovich School of Leadership and Public Service, Ohio University. Evaluates health economics, regional labor markets, and Appalachian energy transition initiatives using quasi-experimental econometric methods and public policy assessments.',
      sources: [
        'https://www.ohio.edu/voinovich-school/people/tuyen-pham',
        'https://www.tuyenpham.org/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1386',
    name: 'Ngoc Dieu Linh Vi',
    researchOverview: {
      text: 'Lecturer in Economics at Aston University researching labor economics, philanthropic decision-making, and behavioral finance. Employs web scraping and big data analytics to study digital fundraising platforms, charitable giving behavior, and gender dynamics in online labor markets.',
      sources: [
        'https://research.aston.ac.uk/en/persons/ngoc-dieu-linh-vi/',
        'https://ngocdieulinhvi.wixsite.com/linhvi'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1418',
    name: 'Duc Huy Dang',
    researchOverview: {
      text: 'Associate Professor of Chemistry and Environmental & Resource Science at Trent University leading the ENIGMA Laboratory. Investigates isotope geochemistry, trace metal biogeochemical cycles, and paleoclimate proxies in aquatic and polar ecosystems using high-precision mass spectrometry.',
      sources: [
        'https://www.trentu.ca/chemistry/faculty-research',
        'https://www.enigmaattrent.com/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },

  // --- BATCH 29 ---
  {
    id: 'vp-1492',
    name: 'Nam V. Phan',
    researchOverview: {
      text: 'Lecturer in Economics at the University of Western Australia researching quantitative macroeconomic policy and computational economics. Builds heterogeneous-agent models to evaluate how fiscal stimulus policies and tax structure reforms distribute welfare across diverse household types.',
      sources: [
        'https://research-repository.uwa.edu.au/en/persons/nam-phan/',
        'https://namvphan.com/'
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

  existing.researchOverview = entry.researchOverview;
  existing.lastUpdatedAt = new Date().toISOString();
  count++;
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n');
console.log(`Successfully upgraded ${count}/${enrichments.length} profiles to deep, rich research overviews.`);
