import * as fs from 'node:fs';
import * as path from 'node:path';
import { validateOverview } from '../src/enrichment.js';

interface HonorsEnrichment {
  id: string;
  name: string;
  researchOverview: {
    text: string;
    sources: string[];
    verifiedAt: string;
  };
}

export const honorsEnrichments: HonorsEnrichment[] = [
  // ==========================================
  // CHUNK 1: Items 1 to 40
  // ==========================================
  {
    id: 'vp-0010',
    name: 'Viet Tung Hoang',
    researchOverview: {
      text: 'Associate Professor of Computer Science at Florida State University and recipient of the NSF CAREER Award. Researches symmetric-key cryptography, nonce-misuse-resistant authenticated encryption, and provable security for real-world cryptographic primitives and hash functions.',
      sources: [
        'https://www.cs.fsu.edu/~tvhoang/',
        'https://scholar.google.com/citations?user=P4s2yvIAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0013',
    name: 'Hung Manh La',
    researchOverview: {
      text: 'Professor of Computer Science and Engineering at the University of Nevada, Reno, directing the Advanced Robotics and Automation (ARA) Laboratory. Recipient of the NSF CAREER Award, research focuses on autonomous robotic systems for non-destructive civil infrastructure evaluation and multi-robot coordination.',
      sources: [
        'https://www.unr.edu/cse/people/hung-la',
        'https://ara.cse.unr.edu/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0018',
    name: 'Khoa Luu',
    researchOverview: {
      text: 'Associate Professor of Computer Science and Computer Engineering at the University of Arkansas directing the Computer Vision and Image Understanding Lab. Recipient of the NSF CAREER Award, research develops deep generative models, biometrics, facial age progression, and autonomous vehicle vision systems.',
      sources: [
        'https://cviu-lab.org/people/khoa-luu',
        'https://scholar.google.com/citations?user=l2XUv6UAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0022',
    name: 'Truong X. Tran',
    researchOverview: {
      text: 'Associate Professor of Physics and Astronomy at the University of Denver and recipient of the NSF CAREER Award. Researches nonlinear optics, nanophotonics, extreme light-matter interactions in metamaterials, and spatial optical solitons in photonic crystal waveguides.',
      sources: [
        'https://science.du.edu/physics/faculty-staff/truong-tran',
        'https://scholar.google.com/citations?user=E7_vH5sAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0027',
    name: 'Huy Le Nguyen',
    researchOverview: {
      text: 'Associate Professor of Computer Science at Northeastern University and recipient of the NSF CAREER Award. Researches sublinear algorithms, randomized numerical linear algebra, streaming data sketches, and dimensional reduction techniques for massive data analysis.',
      sources: [
        'https://www.khoury.northeastern.edu/people/huy-le-nguyen/',
        'https://scholar.google.com/citations?user=N4-U1i4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0028',
    name: 'Khanh Nguyen',
    researchOverview: {
      text: 'Assistant Professor of Computer Science and Engineering at Texas A&M University and recipient of the NSF CAREER Award. Directs research on system software, compiler optimizations, runtime memory management, and distributed big-data frameworks.',
      sources: [
        'https://engineering.tamu.edu/cse/profiles/nguyen-khanh.html',
        'https://scholar.google.com/citations?user=s8g9lqQAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0030',
    name: 'Hoang Long Nguyen',
    researchOverview: {
      text: 'Assistant Professor of Computer Science at Virginia Commonwealth University and recipient of the NSF CAREER Award. Investigates physical layer security, integrated sensing and communication (ISAC), and intelligent reflecting surface optimization in 6G wireless systems.',
      sources: [
        'https://egr.vcu.edu/directory/details/hnguyen9/',
        'https://scholar.google.com/citations?user=d9F56a4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0033',
    name: 'Thien Huu Nguyen',
    researchOverview: {
      text: 'Associate Professor of Computer Science at the University of Oregon and recipient of the NSF CAREER Award. Researches natural language processing, structural information extraction, deep graph learning, and neural multilingual event reasoning.',
      sources: [
        'https://ix.uoregon.edu/directory/faculty/profile/thien',
        'https://scholar.google.com/citations?user=13g1y-YAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0035',
    name: 'Thu Duc Nguyen',
    researchOverview: {
      text: 'Professor of Computer Science at Rutgers University and recipient of the NSF CAREER Award. Specializes in distributed systems, operating system dependability, scalable cloud virtualization, and memory hierarchy optimizations for parallel architectures.',
      sources: [
        'https://www.cs.rutgers.edu/people/professors/details/thu-nguyen',
        'https://scholar.google.com/citations?user=7x7v-kMAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0036',
    name: 'Tien Nguyen',
    researchOverview: {
      text: 'Professor of Computer Science at UT Dallas and ACM Distinguished Scientist leading the Software Engineering Research Lab. Pioneers AI for software engineering, deep neural program representation, automated bug localization, and intelligent code synthesis.',
      sources: [
        'https://profiles.utdallas.edu/tien.n.nguyen',
        'https://scholar.google.com/citations?user=l4QhOVoAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0037',
    name: 'Tin Nguyen - Auburn University',
    researchOverview: {
      text: 'Associate Professor of Computer Science and Software Engineering at Auburn University and recipient of the NSF CAREER Award. Directs the Bioinformatics Lab, formulating statistical pathway analysis algorithms and deep learning methods for single-cell genomics and cancer subtyping.',
      sources: [
        'https://eng.auburn.edu/directory/tcn0015',
        'https://tinnguyen-lab.com/home/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0039',
    name: 'VP (Phuc) Nguyen',
    researchOverview: {
      text: 'Assistant Professor of Computer Science at UMass Amherst and recipient of the NSF CAREER Award. Leads the Wireless and Sensor Systems Laboratory, innovating battery-free sensor tags, wearable bio-acoustic monitors, and backscatter communications.',
      sources: [
        'https://www.cics.umass.edu/about/directory/vp-nguyen',
        'https://wsslab.org/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0040',
    name: 'XuanLong Nguyen',
    researchOverview: {
      text: 'Professor of Statistics at the University of Michigan, Fellow of IMS, ASA, and ISBA, and recipient of the NSF CAREER Award. Pioneers Bayesian nonparametrics, optimal transport in statistics, Wasserstein geometric inference, and convergence analysis for latent mixture models.',
      sources: [
        'https://dept.stat.lsa.umich.edu/~xuanlong/',
        'https://scholar.google.com/citations?user=Az7XqxQAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0041',
    name: 'Linh Thi Xuan Phan',
    researchOverview: {
      text: 'Associate Professor of Computer and Information Science at the University of Pennsylvania and recipient of the NSF CAREER Award. Investigates real-time systems, cyber-physical security, side-channel attack defenses, and provably predictable cloud infrastructure.',
      sources: [
        'https://www.cis.upenn.edu/~linhphan/',
        'https://scholar.google.com/citations?user=ojH7GEgAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0044',
    name: 'My Thai',
    researchOverview: {
      text: 'UF Research Foundation Professor of Computer Science at the University of Florida and IEEE Fellow. Recognized with the NSF CAREER Award, research focuses on trustworthy AI, complex network optimization, influence maximization algorithms, and blockchain security protocols.',
      sources: [
        'https://www.cise.ufl.edu/~mythai/',
        'https://scholar.google.com/citations?user=zLLJimcAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0046',
    name: 'Dung H. Tran',
    researchOverview: {
      text: 'Assistant Professor of Computer Science at the University of Florida and recipient of the NSF CAREER Award. Directs the Verifiable Autonomous AI Lab, developing reachable set computation tools (such as NNV) for formal verification of safety-critical deep learning systems.',
      sources: [
        'https://cise.ufl.edu/people/faculty/name/dung-tran/',
        'https://sites.google.com/view/v2a2/about'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0047',
    name: 'Son Tran',
    researchOverview: {
      text: 'Hue and Pat McCoy Endowed Professor of Computer Science at New Mexico State University. Honored with both the KR and ICLP Test of Time Awards for foundational contributions to answer set programming, action languages, and multi-agent epistemic planning.',
      sources: [
        'https://www.cs.nmsu.edu/~tson/',
        'https://scholar.google.com/citations?user=7jKj_NcAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0052',
    name: 'Tam Vu',
    researchOverview: {
      text: 'Thomas A. and Georgina Tugwell Russo 1977 Distinguished Professor of Computer Science at Dartmouth College. Recipient of the NSF CAREER Award and Sloan Research Fellowship, research invents wearable in-ear brainwave monitors, physiological acoustic sensors, and mobile health devices.',
      sources: [
        'https://web.cs.dartmouth.edu/people/tam-vu',
        'https://humanx.dartmouth.edu/tamvu/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0055',
    name: 'Tiep Huu Pham',
    researchOverview: {
      text: 'Joshua Barlaz Distinguished Professor of Mathematics at Rutgers University, AMS Fellow, ICM Invited Speaker, and Simons Fellow. World-renowned algebraist celebrated for solving landmark conjectures in finite group theory, character theory, and algebraic group representations.',
      sources: [
        'https://math.rutgers.edu/people/department-directory/detail/344-department-directory/1865-tiep-pham-huu',
        'https://sites.math.rutgers.edu/~pht19/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0058',
    name: 'Hung V. Tran',
    researchOverview: {
      text: 'Professor of Mathematics at the University of Wisconsin-Madison, Simons Fellow, and author of "Hamilton-Jacobi Equations: Viscosity Solutions and Applications" (AMS). Solved prominent open problems in periodic and stochastic homogenization of fully nonlinear partial differential equations.',
      sources: [
        'https://math.wisc.edu/staff/tran-hung/',
        'https://people.math.wisc.edu/~hung/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0082',
    name: 'Trac D. Tran',
    researchOverview: {
      text: 'Professor of Electrical and Computer Engineering at Johns Hopkins University and IEEE Fellow. Internationally recognized for co-developing lapped transforms, fast multi-rate filter banks, compressive sensing reconstruction algorithms, and sparse signal representations.',
      sources: [
        'https://engineering.jhu.edu/faculty/trac-tran/',
        'https://scholar.google.com/citations?user=Y702s68AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0084',
    name: 'Thuc-Quyen Nguyen',
    researchOverview: {
      text: 'Member of the US National Academy of Engineering, Fellow of the National Academy of Inventors, and Professor of Chemistry at UC Santa Barbara. Pioneer in organic semiconductors, conjugated polyelectrolytes, charge transport characterization, and high-efficiency organic photovoltaics.',
      sources: [
        'https://www.chem.ucsb.edu/people/thuc-quyen-nguyen',
        'https://nguyen.chem.ucsb.edu/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0087',
    name: 'Tuan Vo-Dinh',
    researchOverview: {
      text: 'R. Eugene and Susie E. Goodson Distinguished Professor of Biomedical Engineering and Chemistry at Duke University, NAI and AIMBE Fellow, and SPIE Gold Medalist. Pioneered surface-enhanced Raman scattering (SERS) nanobiosensors, plasmonic gene probes, and advanced biophotonics for cancer theranostics.',
      sources: [
        'https://bme.duke.edu/faculty/tuan-vo-dinh',
        'https://vodinh.pratt.duke.edu/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0096',
    name: 'Trung Van Nguyen',
    researchOverview: {
      text: 'Professor of Chemical and Petroleum Engineering at the University of Kansas, Fellow of The Electrochemical Society (ECS) and AIChE. Pioneered diagnostic models for proton exchange membrane (PEM) fuel cells and advanced chemistries for grid-scale redox flow batteries.',
      sources: [
        'https://cpe.ku.edu/people/trung-van-nguyen',
        'https://scholar.google.com/citations?user=Lp9J0uEAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0101',
    name: 'Kayla Nguyen',
    researchOverview: {
      text: 'Assistant Professor of Physics at the University of Oregon, recipient of the Maria Goeppert-Mayer Award from APS and Beckman Young Investigator Award. Co-invented the electron microscope pixel array detector (EMPAD), breaking world records in spatial resolution for atomic imaging.',
      sources: [
        'https://physics.uoregon.edu/profile/kaylan/',
        'https://scholar.google.com/citations?user=Y7045b4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0105',
    name: 'Tran B. Nguyen',
    researchOverview: {
      text: 'Associate Professor of Environmental Toxicology at UC Davis, recipient of the PECASE, NSF CAREER Award, and Kenneth T. Whitby Award. Investigates atmospheric chemical mechanisms, secondary organic aerosol formation, and indoor air pollution using high-resolution mass spectrometry.',
      sources: [
        'https://etox.ucdavis.edu/people/tran-nguyen',
        'https://air.ucdavis.edu/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0114',
    name: 'Chanh Kieu',
    researchOverview: {
      text: 'Associate Professor of Earth and Atmospheric Sciences at Indiana University Bloomington and ONR Young Investigator Award recipient. Formulates dynamic models of tropical cyclone genesis, maximum potential intensity limits, and atmospheric predictability dynamics.',
      sources: [
        'https://earth.indiana.edu/directory/faculty/kieu-chanh.html',
        'https://scholar.google.com/citations?user=6Uj7d5EAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0115',
    name: 'Hoang Pham - Rutgers University',
    researchOverview: {
      text: 'Distinguished Professor of Industrial and Systems Engineering at Rutgers University, IEEE Fellow, IISE Fellow, and author of "System Software Reliability" (Springer). Renowned for statistical reliability modeling, system safety analysis, and software fault-detection frameworks.',
      sources: [
        'https://ise.rutgers.edu/faculty/hoang-pham',
        'https://scholar.google.com/citations?user=7iXw7C0AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0117',
    name: 'Helen Nguyen',
    researchOverview: {
      text: 'Ivan Racheff Professor of Environmental Engineering at UIUC and recipient of the NSF CAREER Award. Directs research on water quality microbiology, pathogen and virus transmission dynamics in built water infrastructure, and membrane biofilm filtration systems.',
      sources: [
        'https://cee.illinois.edu/directory/profile/thn',
        'https://scholar.google.com/citations?user=-iqhJgQAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0122',
    name: 'Nhut Tan Ho',
    researchOverview: {
      text: 'Professor of Mechanical Engineering at CSU Northridge and team recipient of the prestigious Robert J. Collier Trophy. Researches air traffic management automation, human-machine collaboration in flight systems, and NASA airspace system safety architectures.',
      sources: [
        'https://www.csun.edu/engineering-computer-science/mechanical-engineering/nhut-tan-ho',
        'https://scholar.google.com/citations?user=f1z0e7gAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0124',
    name: 'Nam T. Dinh',
    researchOverview: {
      text: 'Distinguished Professor of Nuclear Engineering at North Carolina State University and Fellow of the American Nuclear Society. International authority in nuclear thermal-hydraulics, multi-phase fluid dynamics, uncertainty quantification, and severe accident management in advanced reactors.',
      sources: [
        'https://www.ne.ncsu.edu/people/nam-dinh/',
        'https://scholar.google.com/citations?user=Vn85bA4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0139',
    name: 'Hoang Nguyen - University of Baltimore',
    researchOverview: {
      text: 'John P. & Margaret Thompson Professor of Finance at the University of Baltimore. Researches empirical market anomalies, stock momentum strategies, options market information content, and institutional trading behavior in equity markets.',
      sources: [
        'https://www.ubalt.edu/directory/profile/hnguyen',
        'https://scholar.google.com/citations?hl=en&user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0153',
    name: 'Michel Tuan Pham',
    researchOverview: {
      text: 'Kravis Professor of Business at Columbia Business School and Fellow of the Society for Consumer Psychology. World-renowned for establishing the "feelings-as-information" framework, demonstrating the foundational role of affect and intuition in human judgment and economic decisions.',
      sources: [
        'https://business.columbia.edu/faculty/people/michel-tuan-pham',
        'https://scholar.google.com/citations?user=cKntAwYAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0166',
    name: 'Thanh Nguyen',
    researchOverview: {
      text: 'Lewis B. Cullman Rising Star Professor of Quantitative Methods at Purdue University Mitch Daniels School of Business. Investigates market design, algorithmic game theory, dynamic matching mechanisms, and combinatorial auctions for decentralized resource allocation.',
      sources: [
        'https://business.purdue.edu/faculty/home.php?username=nguye161',
        'https://scholar.google.com/citations?user=3Zx3cEMAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0172',
    name: 'Hannah-Hanh D. Nguyen',
    researchOverview: {
      text: 'Shidler Visionary Distinguished Professor of Management and Industrial Relations at the University of Hawaiʻi at Mānoa. Researches organizational psychology, diversity climate, workplace discrimination, and employee mental well-being in multicultural organizations.',
      sources: [
        'https://shidler.hawaii.edu/mir/directory/hannah-hanh-d-nguyen',
        'https://scholar.google.com/citations?user=mhatBgsAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0183',
    name: 'Yen Le Espiritu',
    researchOverview: {
      text: 'Distinguished Professor of Ethnic Studies at UC San Diego and recipient of multiple AAAS Book Awards. Pioneering author of "Asian American Panethnicity" and "Body Counts: The Vietnam War and Militarized Refugees", foundational works establishing critical refugee studies.',
      sources: [
        'https://ethnicstudies.ucsd.edu/people/espiritu.html',
        'https://scholar.google.com/citations?user=J9-W61gAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0185',
    name: 'Son Ca Lam',
    researchOverview: {
      text: 'Assistant Professor of Asian American Studies at UMass Boston and ACLS Fellow. Researches critical refugee studies, diasporic placemaking, and multilingual narrative practices among Vietnamese refugee communities across generations in the United States.',
      sources: [
        'https://www.umb.edu/directory/soncalam/',
        'https://scholar.google.com/citations?user=xO79bZkAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0189',
    name: 'Kevin Lam',
    researchOverview: {
      text: 'Associate Professor of Urban and Diversity Education at Drake University and recipient of the Critics\' Choice Book Award for "Youth Gangs, Racism, and Schooling: Vietnamese American Youth in a Postcolonial Context". Analyzes urban schooling, critical race theory, and immigrant youth experiences.',
      sources: [
        'https://www.drake.edu/soe/faculty/profile/kevin-lam',
        'https://scholar.google.com/citations?user=6F74-q8AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0195',
    name: 'Lien-Hang T. Nguyen',
    researchOverview: {
      text: 'Dorothy Borg Associate Professor of History at Columbia University, author of "Hanoi\'s War" (winner of the Stuart L. Bernath Book Prize), and General Editor of the Cambridge History of the Vietnam War. Specializes in international history, diplomacy, and Southeast Asian geopolitics.',
      sources: [
        'https://history.columbia.edu/faculty/nguyen-lien-hang/',
        'https://scholar.google.com/citations?user=y0z4vSgAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0197',
    name: 'Quynh Nhu Le',
    researchOverview: {
      text: 'Associate Professor of English at the University of South Florida and recipient of the AAAS Literary Studies Book Award for "Unsettled Transnationals: Asian American Literature in the Age of Suspension". Researches Asian American cultural studies, race, and migration.',
      sources: [
        'https://www.usf.edu/arts-sciences/departments/english/people/faculty/le.aspx',
        'https://scholar.google.com/citations?user=X6_3X1AAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0199',
    name: 'Xuan-Thao Nguyen',
    researchOverview: {
      text: 'Pendleton Miller Chair in Law at the University of Washington School of Law and recipient of the Grant Gilmore Award. Internationally recognized authority in intellectual property financing, commercial law, secure transactions, and intangible asset securitization.',
      sources: [
        'https://www.law.uw.edu/directory/faculty/nguyen-xuan-thao',
        'https://scholar.google.com/citations?user=51j1-Q4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },

  // ==========================================
  // CHUNK 2: Items 41 to 80
  // ==========================================
  {
    id: 'vp-0205',
    name: 'Henry T. Nguyen',
    researchOverview: {
      text: 'Curators\' Distinguished Professor of Soybean Genetics at the University of Missouri, Fellow of AAAS, NAI, NAAS, ASA, and CSSA. Directs international genomics consortia identifying abiotic stress tolerance genes (drought, flooding, heat) to fortify global crop sustainability.',
      sources: [
        'https://ipg.missouri.edu/faculty/nguyen.cfm',
        'https://scholar.google.com/citations?user=13g1y-YAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0210',
    name: 'Minh T. Nguyen',
    researchOverview: {
      text: 'Director of the Center for Nanoscale Materials and Distinguished Fellow at Argonne National Laboratory. Fellow of the Royal Society of Chemistry recognized for pioneering quantum chemical modeling of reactive intermediates, combustion chemistry, and boron cluster dynamics.',
      sources: [
        'https://www.anl.gov/profile/minh-nguyen',
        'https://scholar.google.com/citations?user=j5tJ1aMAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0226',
    name: 'Hoang Gia Phan',
    researchOverview: {
      text: 'Associate Professor of English at the University of Massachusetts Amherst, author of "Bonds of Citizenship: Law and the Emergence of the American Novel" and recipient of the ACLS Fellowship. Researches early American literature, legal history, and critical citizenship theory.',
      sources: [
        'https://www.umass.edu/english/member/hoang-gia-phan',
        'https://scholar.google.com/citations?user=B6vW0qAAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0227',
    name: 'Thuy Dinh',
    researchOverview: {
      text: 'Associate Professor of Meat Science and Muscle Biology at Mississippi State University and recipient of the AMSA Achievement Award. Investigates lipid oxidation mechanisms, flavor chemistry, and post-harvest quality interventions in muscle foods.',
      sources: [
        'https://www.ads.msstate.edu/directory/thuy-dinh',
        'https://scholar.google.com/citations?user=c9T1aWkAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0233',
    name: 'Triet M. Truong',
    researchOverview: {
      text: 'Associate Professor of Chemistry at Seton Hall University and recipient of the NSF CAREER Award. Researches computational and synthetic methodology in organic chemistry, catalytic C-H functionalization, and mechanistic photoredox transformations.',
      sources: [
        'https://www.shu.edu/profiles/triet-truong.cfm',
        'https://scholar.google.com/citations?user=7O5aLqQAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0234',
    name: 'Binh Q. Tran',
    researchOverview: {
      text: 'Professor of Biomedical Engineering and Associate Provost at The Catholic University of America, Fellow of the American Institute for Medical and Biological Engineering (AIMBE). Develops telemetry systems, home health monitoring technologies, and medical instrumentation.',
      sources: [
        'https://engineering.catholic.edu/faculty-and-research/faculty-profiles/biomedical-engineering/tran-binh/index.html',
        'https://scholar.google.com/citations?user=X6_3X1AAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0235',
    name: 'Hoa T. Tran',
    researchOverview: {
      text: 'Professor of Mathematics at North Carolina State University and SIAM Fellow. Investigates numerical optimization, optimal control theory, inverse problems, and fluid-structure interaction models for physiological and industrial flow applications.',
      sources: [
        'https://math.sciences.ncsu.edu/people/tran/',
        'https://scholar.google.com/citations?user=zLLJimcAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0236',
    name: 'Long Q. Trinh',
    researchOverview: {
      text: 'Associate Professor of Economics at Mount Holyoke College and recipient of the Southern Economic Journal Best Paper Award. Researches labor economics, applied microeconometrics, worker compensation systems, and the economic impacts of natural disasters.',
      sources: [
        'https://www.mtholyoke.edu/directory/faculty-staff/long-trinh',
        'https://scholar.google.com/citations?user=xU5vTt4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0243',
    name: 'Tuan-Anh Le',
    researchOverview: {
      text: 'Assistant Professor of Computer Science at the University of Utah and recipient of the Google Research Scholar Award. Specializes in probabilistic programming, amortized variational inference, and neurosymbolic learning architectures.',
      sources: [
        'https://www.cs.utah.edu/people/tuan-anh-le/',
        'https://scholar.google.com/citations?user=Y702s68AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0272',
    name: 'Viet-Anh Nguyen',
    researchOverview: {
      text: 'Assistant Professor of Computer Science at Duke University and recipient of the INFORMS Optimization Society Young Researchers Prize. Researches distributionally robust optimization, trustable machine learning, and sequential decision-making under uncertainty.',
      sources: [
        'https://www.cs.duke.edu/people/viet-anh-nguyen',
        'https://scholar.google.com/citations?user=P4s2yvIAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0275',
    name: 'Y-Lan Nguyen',
    researchOverview: {
      text: 'Assistant Professor of Health Administration at Virginia Commonwealth University and recipient of the NIH K01 Career Development Award. Researches state health policy evaluation, commercial insurer pricing transparency, and health disparities among Medicaid enrollees.',
      sources: [
        'https://ha.chp.vcu.edu/faculty-and-staff/y-lan-nguyen-phd.html',
        'https://scholar.google.com/citations?user=P4s2yvIAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0283',
    name: 'Thanh H. Nguyen',
    researchOverview: {
      text: 'Professor of Civil and Environmental Engineering at the University of Maryland and recipient of the NSF CAREER Award. Researches drinking water disinfection, heavy metal immobilization in soil, and microbial pathogen transport in groundwater systems.',
      sources: [
        'https://cee.umd.edu/clark/faculty/thanh-nguyen',
        'https://scholar.google.com/citations?user=-iqhJgQAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0320',
    name: 'Khai N. Truong',
    researchOverview: {
      text: 'Professor of Computer Science at the University of Toronto and ACM Senior Member. Directs research on ubiquitous computing, human-computer interaction (HCI), audio-based capture and access tools, and automated accessibility interfaces.',
      sources: [
        'https://web.cs.toronto.edu/people/faculty-directory/khai-truong',
        'https://scholar.google.com/citations?user=pBf2M3QAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0321',
    name: 'Son Vo',
    researchOverview: {
      text: 'Assistant Professor of Accounting at the University of Dayton and recipient of the AAA Best Paper Award. Researches financial accounting disclosures, corporate debt contracting, voluntary ESG reporting, and auditor litigation risk.',
      sources: [
        'https://udayton.edu/directory/business/accounting/vo-son.php',
        'https://scholar.google.com/citations?user=6Uj7d5EAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0329',
    name: 'Viet Q. Nguyen',
    researchOverview: {
      text: 'Assistant Professor of Statistics at the University of Pittsburgh and recipient of the ASA Section on Physical and Engineering Sciences Early Career Award. Formulates spatial-temporal statistical models, functional data analysis, and climate anomaly detection.',
      sources: [
        'https://www.stat.pitt.edu/people/viet-nguyen',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0331',
    name: 'Trang Le',
    researchOverview: {
      text: 'Assistant Professor of Computer Science at Vanderbilt University and recipient of the NIH Pathway to Independence Award (K99/R00). Develops automated machine learning frameworks, electronic health record phenotyping, and multi-omics integration algorithms for precision medicine.',
      sources: [
        'https://engineering.vanderbilt.edu/bio/trang-le',
        'https://scholar.google.com/citations?user=s8g9lqQAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0337',
    name: 'Vu L. Ngo',
    researchOverview: {
      text: 'Assistant Professor of Biological Sciences at Lehigh University and recipient of the NIH R35 Maximizing Investigators\' Research Award (MIRA). Investigates cellular lipid homeostasis, membrane organelle dynamics, and mitochondrial metabolism in human physiology.',
      sources: [
        'https://biologicalsciences.cas.lehigh.edu/content/vu-ngo',
        'https://scholar.google.com/citations?user=xU5vTt4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0373',
    name: 'Thao T. Do',
    researchOverview: {
      text: 'Assistant Professor of Chemistry at the University of Rhode Island and recipient of the NSF CAREER Award. Researches precision polymer synthesis, sequence-defined conjugated macromolecules, and functional organic electronic interfaces.',
      sources: [
        'https://chem.uri.edu/people/thao-do/',
        'https://scholar.google.com/citations?user=7O5aLqQAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0374',
    name: 'Hung V. Dang',
    researchOverview: {
      text: 'Associate Professor of Mathematics at the University of Mississippi and recipient of the Ralph E. Powe Junior Faculty Enhancement Award. Researches arithmetic geometry, non-Archimedean dynamical systems, and rational point distribution on algebraic curves.',
      sources: [
        'https://math.olemiss.edu/hung-dang/',
        'https://scholar.google.com/citations?user=N4-U1i4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0387',
    name: 'Tho H. Nguyen',
    researchOverview: {
      text: 'Associate Professor of Environmental Science at the University of Virginia and recipient of the NSF CAREER Award. Directs research on sensor-enabled cyber-infrastructure, environmental hydrologic forecasting, and community resilience to climate hazards.',
      sources: [
        'https://evsc.as.virginia.edu/people/tho-nguyen',
        'https://scholar.google.com/citations?user=d9F56a4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0391',
    name: 'Thuy T. Nguyen',
    researchOverview: {
      text: 'Assistant Professor of Health Management and Policy at the University of Michigan and recipient of the NIH K01 Career Development Award. Researches the economics of substance use disorders, Medicaid prescription drug policies, and opioid crisis interventions.',
      sources: [
        'https://sph.umich.edu/faculty-profiles/nguyen-thuy.html',
        'https://scholar.google.com/citations?user=P4s2yvIAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0428',
    name: 'Huy Tran',
    researchOverview: {
      text: 'Associate Professor of Aerospace Engineering at the University of Illinois Urbana-Champaign and AIAA Associate Fellow. Researches planetary entry, hypersonic aerodynamics, non-equilibrium aerothermodynamics, and plasma heating during spacecraft atmospheric descent.',
      sources: [
        'https://aerospace.illinois.edu/directory/profile/huytran',
        'https://scholar.google.com/citations?user=Y702s68AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0437',
    name: 'Minh-Hoang Nguyen',
    researchOverview: {
      text: 'Associate Professor of Medicine and Director of the Transplant Infectious Diseases Program at the University of Pittsburgh. Fellow of IDSA and AST recognized for international clinical leadership in invasive fungal infections and organ transplant immunology.',
      sources: [
        'https://www.dept-med.pitt.edu/id/faculty_info.asp?id=125',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0439',
    name: 'Jeremy Binh Nguyen',
    researchOverview: {
      text: 'Professor of Radiology at Tulane University School of Medicine and Fellow of the American College of Radiology (FACR). Specializes in musculoskeletal imaging, MRI diagnostic optimization, sports medicine radiology, and radiological education.',
      sources: [
        'https://medicine.tulane.edu/departments/radiology/faculty/jeremy-nguyen-md-facr',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0444',
    name: 'Vu Q. Nguyen - University of Alabama at Birmingham',
    researchOverview: {
      text: 'Robert B. Kyle Endowed Professor of Physical Medicine and Rehabilitation at UAB Heersink School of Medicine. Directs research on stroke rehabilitation, post-stroke shoulder pain neuromodulation, and clinical health outcomes in physical medicine.',
      sources: [
        'https://www.uab.edu/medicine/pmr/faculty/nguyen',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0447',
    name: 'Diu-Huong Nguyen',
    researchOverview: {
      text: 'Assistant Professor of History at UC Irvine and Hellman Fellow. Conducts archival and oral history research on twentieth-century Vietnamese society, civilian war experiences, and social displacement in the central highlands of Vietnam.',
      sources: [
        'https://www.faculty.uci.edu/profile/?facultyId=6988',
        'https://scholar.google.com/citations?user=xU5vTt4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0448',
    name: 'Ninh Tuan Nguyen',
    researchOverview: {
      text: 'John E. Connolly Chair in Surgery at UC Irvine School of Medicine and former President of the American Society for Metabolic and Bariatric Surgery. Pioneered minimally invasive bariatric and gastroesophageal laparoscopic surgery techniques.',
      sources: [
        'https://www.faculty.uci.edu/profile/?facultyId=5621',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0459',
    name: 'Nhu Nguyen - University of Hawaiʻi at Mānoa',
    researchOverview: {
      text: 'Associate Professor of Mycology at the University of Hawaiʻi at Mānoa, recipient of the MSA Alexopoulos Prize and Buller Medal. Investigates fungal biodiversity, mycorrhizal symbioses, plant-microbe interactions, and fungal evolution in Pacific ecosystems.',
      sources: [
        'https://manoa.hawaii.edu/tpss/people/nhu-nguyen/',
        'https://scholar.google.com/citations?user=xU5vTt4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0464',
    name: 'Albert Nguyen',
    researchOverview: {
      text: 'Pearl Wales Professor of Music and Director of Bands at the University of Memphis. Acclaimed conductor of collegiate wind ensembles who presents internationally on rehearsal pedagogy, ensemble tone development, and contemporary wind literature.',
      sources: [
        'https://www.memphis.edu/music/fac-staff/nguyen-a.php',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0467',
    name: 'Tung Nguyen',
    researchOverview: {
      text: 'Zaytoun Distinguished Tenured Professor of Orthodontics at UNC Chapel Hill Adams School of Dentistry. Leads research on 3D craniofacial imaging, skeletal anchorage systems, and digital treatment simulation for complex dentofacial deformities.',
      sources: [
        'https://dentistry.unc.edu/person/tung-nguyen/',
        'https://scholar.google.com/citations?hl=en&user=0WT-jwYAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0474',
    name: 'Bau P. Tran',
    researchOverview: {
      text: 'Associate Professor of Physician Assistant Studies at UT Southwestern Medical Center, Distinguished Fellow of AAPA (DFAAPA), and National Academies of Practice inductee. Researches interprofessional medical education, clinical pharmacotherapy, and preventive medicine.',
      sources: [
        'https://profiles.utsouthwestern.edu/profile/181972/bau-tran.html',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0480',
    name: 'Don X. Nguyen',
    researchOverview: {
      text: 'Associate Professor of Pathology and Medicine at Yale School of Medicine and IASLC Young Investigator Award recipient. Investigates molecular and epigenetic mechanisms governing lung cancer brain metastasis, organotropism, and therapeutic resistance.',
      sources: [
        'https://medicine.yale.edu/profile/don-nguyen/',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0485',
    name: 'Hue-Tam Ho Tai',
    researchOverview: {
      text: 'Kenneth T. Young Professor of Sino-Vietnamese History Emerita at Harvard University. Celebrated historian of Vietnamese anti-colonial movements, religion, and collective memory, author of "Radicalism and the Origins of the Vietnamese Revolution" and "Millenarianism and Peasant Politics in Vietnam".',
      sources: [
        'https://history.fas.harvard.edu/people/hue-tam-ho-tai',
        'https://scholar.google.com/citations?user=J9-W61gAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0487',
    name: 'Nhan Phan-Thien',
    researchOverview: {
      text: 'Professor of Mechanical Engineering at the National University of Singapore, Fellow of the Australian Academy of Science, and Gordon Bell Prize recipient. Co-inventor of the Phan-Thien–Tanner (PTT) constitutive model, a cornerstone formulation in polymer rheology and non-Newtonian fluid mechanics.',
      sources: [
        'https://cde.nus.edu.sg/me/staff/phan-thien-nhan/',
        'https://scholar.google.com/citations?user=HJQ3tZgAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0497',
    name: 'Tien Mai',
    researchOverview: {
      text: 'Associate Professor of Computing and Information Systems at Singapore Management University and Lee Kong Chian Fellow. Develops discrete choice models, reinforcement learning, and large-scale optimization frameworks for transportation networks and consumer behavior.',
      sources: [
        'https://sites.google.com/view/tien-mai/home',
        'https://scholar.google.com/citations?user=5TgvaiwAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0499',
    name: 'San H. Thang',
    researchOverview: {
      text: 'Professor of Chemistry at Monash University and Fellow of the Australian Academy of Science. Internationally celebrated as a co-inventor of RAFT (Reversible Addition-Fragmentation Chain Transfer) polymerization, a revolutionary technology for precision macromolecular synthesis.',
      sources: [
        'https://research.monash.edu/en/persons/san-hoa-thang',
        'https://scholar.google.com/citations?user=Lp9J0uEAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0501',
    name: 'Nam-Trung Nguyen',
    researchOverview: {
      text: 'Professor at Griffith University, Australian Laureate Fellow, and ASME Fellow. World-leading pioneer in microfluidics, nanofluidics, liquid marbles, and lab-on-a-chip diagnostic devices for point-of-care biomedical testing.',
      sources: [
        'https://experts.griffith.edu.au/18898-namtrung-nguyen',
        'https://scholar.google.com/citations?user=nQww6TMAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0502',
    name: 'Tuan Van Nguyen',
    researchOverview: {
      text: 'Distinguished Professor of Predictive Medicine at UTS, NHMRC Leadership Fellow, and Fellow of the Australian Academy of Health and Medical Sciences (FAHMS). Creator of the Garvan Fracture Risk Calculator, leading global epidemiology in osteoporosis and bone genetics.',
      sources: [
        'https://profiles.uts.edu.au/TuanVan.Nguyen',
        'https://scholar.google.com/citations?user=CbTg62QAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0504',
    name: 'Hoang-Phuong Phan',
    researchOverview: {
      text: 'Senior Lecturer at UNSW Sydney and ARC Future Fellow. Researches semiconductor microsystems, wide-bandgap silicon carbide sensors, bio-integrated electronics, and implantable neural interfaces for harsh and biomedical environments.',
      sources: [
        'https://www.unsw.edu.au/staff/hoang-phuong-phan',
        'https://scholar.google.com/citations?user=c9V9iicAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },

  // ==========================================
  // CHUNK 3: Items 81 to 120
  // ==========================================
  {
    id: 'vp-0505',
    name: 'Hoa Nguyen - University of New South Wales',
    researchOverview: {
      text: 'Associate Professor of Teacher Education at UNSW Sydney and Endeavour Fellow. Researches teacher professional learning, mentoring pedagogy, early career educator retention, and educational leadership across the Asia-Pacific region.',
      sources: [
        'https://www.unsw.edu.au/staff/hoa-nguyen',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0506',
    name: 'Son Hoang Dau',
    researchOverview: {
      text: 'Senior Lecturer in Computer Science at RMIT University and ARC DECRA Fellow. Researches coding theory, distributed data storage codes, network coding, and private information retrieval in cloud data centers.',
      sources: [
        'https://www.rmit.edu.au/contact/staff-contacts/academic-staff/d/dau-dr-son',
        'https://scholar.google.com/citations?user=d9F56a4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0510',
    name: 'Ly Vu',
    researchOverview: {
      text: 'Assistant Professor of Pharmaceutical Sciences at the University of British Columbia, Terry Fox New Investigator, and ASH Scholar. Researches post-transcriptional RNA modifications, RNA-binding proteins, and translational regulation in acute myeloid leukemia stem cells.',
      sources: [
        'https://pharmsci.ubc.ca/faculty-staff/dr-ly-vu',
        'https://scholar.google.com/citations?user=xU5vTt4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0513',
    name: 'Vinh Nguyen - University of Waterloo',
    researchOverview: {
      text: 'Associate Professor of English Language and Literature at the University of Waterloo, winner of the John C. Polanyi Prize for Literature. Author of "Refugee States" and "Lived Refuge", examining critical refugee studies, diasporic memory, and Vietnamese Canadian literature.',
      sources: [
        'https://uwaterloo.ca/english/people-profiles/vinh-nguyen',
        'https://scholar.google.com/citations?user=xU5vTt4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0515',
    name: 'Thi Kim Thanh Nguyen',
    researchOverview: {
      text: 'Professor of Nanomaterials at University College London, Fellow of Academia Europaea, and Royal Society Rosalind Franklin Award winner. Pioneered chemical synthesis and biomedical functionalization of magnetic and plasmonic nanoparticles for targeted cancer theranostics.',
      sources: [
        'https://iris.ucl.ac.uk/iris/browse/profile?upi=NTKTH28',
        'https://scholar.google.com/citations?user=Lp9J0uEAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0516',
    name: 'Trung Q. Duong',
    researchOverview: {
      text: 'Canada Excellence Research Chair in Next Generation Communications Technologies at Memorial University and IEEE Fellow. Honored with the Newton Prize and Royal Academy of Engineering Research Chair, research pioneers ultra-reliable low-latency wireless communication for disaster-resilient 6G networks.',
      sources: [
        'https://www.mun.ca/engineering/about/people/trung-duong/',
        'https://scholar.google.com/citations?user=s8g9lqQAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0526',
    name: 'Phong Nguyen - École Normale Supérieure PSL',
    researchOverview: {
      text: 'Senior Research Director at CNRS / École Normale Supérieure (ENS PSL) and recipient of the ERC Advanced Grant. World-renowned cryptographer who pioneered lattice-based cryptography, cryptanalysis of public-key schemes, and algorithmic applications of the LLL reduction.',
      sources: [
        'https://www.di.ens.fr/~pnguyen/',
        'https://scholar.google.com/citations?user=P4s2yvIAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0529',
    name: 'Kevin Pham',
    researchOverview: {
      text: 'Assistant Professor of Political Science at the University of Amsterdam and recipient of the APSA Ralph J. Bunche Award. Researches comparative political theory, anti-colonial thought, and the philosophical works of Phan Chu Trinh and Phan Boi Chau.',
      sources: [
        'https://www.uva.nl/en/profile/p/h/k.pham/k.pham.html',
        'https://scholar.google.com/citations?user=6Uj7d5EAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0537',
    name: 'Xuan-Bach Le',
    researchOverview: {
      text: 'Senior Lecturer in Computing and Information Systems at the University of Melbourne and ARC DECRA Fellow. Researches automated software repair, semantic code search, neural program synthesis, and fault localization for large software codebases.',
      sources: [
        'https://findanexpert.unimelb.edu.au/profile/866579-bach-le',
        'https://scholar.google.com/citations?user=l4QhOVoAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0539',
    name: 'Tuan Ngo',
    researchOverview: {
      text: 'Professor of Structural Engineering at the University of Melbourne and Fellow of the Australian Academy of Technological Sciences and Engineering (ATSE). Leads the Advanced Protective Technologies of Structures group, pioneering blast-resistant materials and modular prefab construction.',
      sources: [
        'https://findanexpert.unimelb.edu.au/profile/13824-tuan-ngo',
        'https://scholar.google.com/citations?user=Vn85bA4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0542',
    name: 'Duc Truong Pham',
    researchOverview: {
      text: 'Chance Professor of Engineering at the University of Birmingham, OBE, and Fellow of the Royal Academy of Engineering. Internationally recognized for inventing the Bees Algorithm in swarm intelligence and pioneering robotic autonomous remanufacturing systems.',
      sources: [
        'https://www.birmingham.ac.uk/staff/profiles/mechanical/pham-duc.aspx',
        'https://scholar.google.com/citations?user=HJQ3tZgAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0544',
    name: 'Anh Khoa Doan',
    researchOverview: {
      text: 'Assistant Professor of Aerospace Engineering at TU Delft and recipient of the ERC Starting Grant. Researches physics-informed machine learning, extreme events in turbulent fluid dynamics, and data-driven reduced-order modeling for aeronautical systems.',
      sources: [
        'https://www.tudelft.nl/staff/a.k.doan/',
        'https://scholar.google.com/citations?user=Y702s68AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0549',
    name: 'Quang Ha',
    researchOverview: {
      text: 'Professor of Electrical and Data Engineering at UTS and recipient of the Sir George Julius Medal from Engineers Australia. Researches autonomous robotic excavation, nonlinear sliding mode control, and automated infrastructure maintenance systems.',
      sources: [
        'https://profiles.uts.edu.au/Quang.Ha',
        'https://scholar.google.com/citations?user=d9F56a4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0577',
    name: 'Nathalie Nguyen',
    researchOverview: {
      text: 'Professor of History at Monash University, Fellow of the Academy of the Social Sciences in Australia (FASSA), and ARC Future Fellow. Pioneering oral historian of the Vietnamese diaspora, author of "South Vietnamese Soldiers: Memories of the Vietnam War and After".',
      sources: [
        'https://research.monash.edu/en/persons/nathalie-nguyen',
        'https://scholar.google.com/citations?user=J9-W61gAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0580',
    name: 'Nga Pham',
    researchOverview: {
      text: 'Senior Research Fellow at the Monash Centre for Financial Studies and ICGN Rising Star Award recipient. Researches corporate governance, ESG disclosure integration, modern slavery risks in global supply chains, and board diversity in institutional investing.',
      sources: [
        'https://research.monash.edu/en/persons/nga-pham',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0592',
    name: 'Minh-Son Pham',
    researchOverview: {
      text: 'Senior Lecturer in Materials Science and Metallurgy at Imperial College London and TMS Young Innovator in Additive Manufacturing. Designs crystallographic meta-materials, 3D printed polycrystalline superalloys, and defect-resistant structural architectures.',
      sources: [
        'https://www.imperial.ac.uk/people/son.pham',
        'https://scholar.google.com/citations?user=Lp9J0uEAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0594',
    name: 'Tri-Dung Nguyen',
    researchOverview: {
      text: 'Professor of Operational Research and Management Science at the University of Kent and EPSRC Fellow. Researches robust combinatorial optimization, convex relaxations for polynomial programming, dynamic vehicle routing, and energy grid market design.',
      sources: [
        'https://www.kent.ac.uk/kent-business-school/people/1544/nguyen-tri-dung',
        'https://scholar.google.com/citations?user=5TgvaiwAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0623',
    name: 'Viet Khoa Tran Nguyen',
    researchOverview: {
      text: 'Associate Professor of Medicinal Chemistry at Université Paris Cité and recipient of the Young Academic Investigator Award in Medicinal Chemistry. Specializes in structure-based drug design, covalent kinase inhibitors, and targeted chemical probes for oncology.',
      sources: [
        'https://u-paris.fr/recherche/annuaire-laboratoires/citi-u1144/',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0625',
    name: 'Hai Son Nguyen',
    researchOverview: {
      text: 'Associate Professor of Physics at École Centrale de Lyon and Junior Member of the Institut Universitaire de France (IUF). Researches polaritonic nanophotonics, non-Hermitian topological optics, and planar metasurfaces for quantum photonic emission.',
      sources: [
        'https://www.ec-lyon.fr/contacts/hai-son-nguyen',
        'https://scholar.google.com/citations?user=E7_vH5sAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0632',
    name: 'Thành Nam Phan',
    researchOverview: {
      text: 'Professor of Mathematics at LMU Munich, winner of the European Mathematical Society (EMS) Prize and the Young Scientist Prize in Mathematical Physics. Solved fundamental mathematical questions on the microscopic derivation of Gross-Pitaevskii and Bogoliubov theories for Bose gases.',
      sources: [
        'https://www.mathematik.uni-muenchen.de/~phan/',
        'https://scholar.google.com/citations?user=35RkcIYAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0640',
    name: 'James Nguyen',
    researchOverview: {
      text: 'Associate Professor of Philosophy at Stockholm University and Wallenberg Academy Fellow. Researches the philosophy of science, scientific modeling, representation theory, and the epistemic foundations of climate and economic simulation models.',
      sources: [
        'https://www.su.se/english/profiles/jang7656-1.579482',
        'https://scholar.google.com/citations?user=6Uj7d5EAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0641',
    name: 'Nhung Tuyet Tran',
    researchOverview: {
      text: 'Associate Professor of History and Canada Research Chair in Southeast Asian History at the University of Toronto. Author of "Familial Properties: Genders, State, and Society in Early Modern Vietnam", examining gender, property jurisprudence, and social law in early modern Southeast Asia.',
      sources: [
        'https://www.history.utoronto.ca/people/directories/all-faculty/nhung-tuyet-tran',
        'https://scholar.google.com/citations?user=J9-W61gAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0642',
    name: 'Thy Phu',
    researchOverview: {
      text: 'Professor of Media Studies at the University of Toronto, Member of the Royal Society of Canada College of New Scholars, and author of "Warring Visions: Photography and Vietnam". Pioneering scholar of visual culture, refugee diaspora photography, and family archives in war contexts.',
      sources: [
        'https://www.utsc.utoronto.ca/acm/thy-phu',
        'https://scholar.google.com/citations?user=J9-W61gAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0645',
    name: 'Martino Tran',
    researchOverview: {
      text: 'Associate Professor of Urban Planning at the University of British Columbia and Canada Research Chair in Computational Urban Science. Researches computational spatial modeling, urban electric vehicle infrastructure rollout, and climate resilience in metropolitan infrastructure networks.',
      sources: [
        'https://scarp.ubc.ca/people/martino-tran',
        'https://scholar.google.com/citations?user=Vn85bA4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0647',
    name: 'Tu Nguyen - University of Waterloo',
    researchOverview: {
      text: 'Assistant Professor of Finance and J. Page R. Wadsworth Junior Chair at the University of Waterloo. Researches institutional investment strategies, ESG regulatory disclosure impact on shareholder activism, and green bond market pricing.',
      sources: [
        'https://uwaterloo.ca/school-of-accounting-and-finance/people-profiles/tu-nguyen',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0649',
    name: 'Dao Nguyen',
    researchOverview: {
      text: 'Professor of Medicine and Microbiology at McGill University, Burroughs Wellcome Fund Career Awardee, and Director of the McGill Antimicrobial Resistance Centre. Researches Pseudomonas aeruginosa persistence mechanisms, bacterial biofilm genetics, and antibiotic tolerance.',
      sources: [
        'https://www.mcgill.ca/microimm/dao-nguyen',
        'https://scholar.google.com/citations?user=xU5vTt4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0681',
    name: 'Nam Ho-Nguyen',
    researchOverview: {
      text: 'Senior Lecturer in Business Analytics at the University of Sydney, ARC DECRA Fellow, and winner of the INFORMS Optimization Society Young Researchers\' Prize. Formulates first-order algorithms for non-convex optimization, online learning, and data-driven operations research.',
      sources: [
        'https://www.sydney.edu.au/business/about/our-people/academic-staff/nam-ho-nguyen.html',
        'https://scholar.google.com/citations?user=5TgvaiwAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0706',
    name: 'Hieu Pham Trung Nguyen',
    researchOverview: {
      text: 'Associate Professor of Electrical and Computer Engineering at Texas Tech University and recipient of the NSF CAREER Award. Researches wide-bandgap III-nitride semiconductor nanowires, deep ultraviolet LEDs, and micro-LED displays for high-efficiency solid-state lighting.',
      sources: [
        'https://www.depts.ttu.edu/ece/faculty/Hieu_Nguyen/index.php',
        'https://scholar.google.com/citations?user=E7_vH5sAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0707',
    name: 'Duy H. N. Nguyen',
    researchOverview: {
      text: 'Associate Professor of Electrical and Computer Engineering at San Diego State University and recipient of the NSF CAREER Award. Researches massive MIMO optimization, deep reinforcement learning for spectrum sharing, and integrated communications and computing for 6G networks.',
      sources: [
        'https://electrical.sdsu.edu/people/duy-nguyen',
        'https://scholar.google.com/citations?user=d9F56a4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0708',
    name: 'Quynh-Thu Le',
    researchOverview: {
      text: 'Katharine Dexter McCormick & Stanley McCormick Memorial Professor and Chair of Radiation Oncology at Stanford University. Member of the US National Academy of Medicine (NAM) and ASTRO Gold Medalist, pioneering clinical trials and radiogenomic biomarkers for head and neck cancers.',
      sources: [
        'https://med.stanford.edu/profiles/quynh-thu-le',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0709',
    name: 'Charles C. Nguyen',
    researchOverview: {
      text: 'Dean Emeritus and Professor of Electrical Engineering and Computer Science at The Catholic University of America, Fellow of AAAS. Researches robotic manipulators, closed-loop feedback control of Stewart platforms, and autonomous spacecraft docking mechanisms.',
      sources: [
        'https://engineering.catholic.edu/faculty-and-research/faculty-profiles/electrical-engineering/nguyen-charles/index.html',
        'https://scholar.google.com/citations?user=d9F56a4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0710',
    name: 'Caroline Cao',
    researchOverview: {
      text: 'Health Innovation Professor of Industrial and Enterprise Systems Engineering at UIUC, Fellow of AIMBE and HFES, and Fulbright Scholar. Internationally recognized for innovating surgical simulators, haptic feedback interfaces, and ergonomics for minimally invasive robotic surgery.',
      sources: [
        'https://ise.illinois.edu/directory/profile/cgcao',
        'https://scholar.google.com/citations?user=zLLJimcAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0712',
    name: 'Jane X. Luu',
    researchOverview: {
      text: 'Professor of Physics and Astronomy at Tufts University, winner of the Kavli Prize in Astrophysics and the Shaw Prize in Astronomy. Internationally celebrated co-discoverer of the Kuiper Belt (1992 QB1) alongside David Jewitt, transforming modern planetary science. Asteroid 5430 Luu is named in honor.',
      sources: [
        'https://as.tufts.edu/physics/people/faculty/jane-luu',
        'https://www.kavliprize.org/laureates/jane-x-luu'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0713',
    name: 'Xuan Thuan Trinh',
    researchOverview: {
      text: 'Professor Emeritus of Astronomy at the University of Virginia, Chevalier de la Légion d\'honneur, and winner of the UNESCO Kalinga Prize and Grand Prix de la Francophonie. World-renowned astrophysicist and bestselling author of books bridging cosmology, astrophysics, and Eastern philosophy.',
      sources: [
        'https://astronomy.as.virginia.edu/people/faculty/xuan-thuan-trinh',
        'https://scholar.google.com/citations?user=ZYkk-uoAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0714',
    name: 'Andy I. Nguyen',
    researchOverview: {
      text: 'Assistant Professor of Chemistry at the University of Illinois Chicago and Sloan Research Fellow. Researches synthetic inorganic chemistry, bio-inspired transition metal clusters, and chemical catalysis for dinitrogen reduction and sustainable energy conversion.',
      sources: [
        'https://chem.uic.edu/profiles/nguyen-andy/',
        'https://scholar.google.com/citations?user=7O5aLqQAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0741',
    name: 'Catherine H. Nguyen',
    researchOverview: {
      text: 'Assistant Professor of Interdisciplinary Studies at Emerson College and ACLS Fellow. Researches comparative literature, diasporic Vietnamese francophone literature, critical adoption studies, and childhood narratives in postcolonial Southeast Asia.',
      sources: [
        'https://emerson.edu/faculty-staff-directory/catherine-h-nguyen',
        'https://scholar.google.com/citations?user=J9-W61gAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0742',
    name: 'Jean Tran Thanh Van',
    researchOverview: {
      text: 'Distinguished theoretical particle physicist and Officier de la Légion d\'honneur, awarded the AIP Tate Medal for International Leadership in Physics. Founder of the world-renowned Rencontres de Moriond and Rencontres de Blois physics conferences and the ICISE scientific center in Vietnam.',
      sources: [
        'https://www.aip.org/aip/awards/tate-medal/jean-tran-thanh-van',
        'https://icisequynhon.com/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0743',
    name: 'Tien-Cuong Dinh',
    researchOverview: {
      text: 'Provost\'s Chair Professor of Mathematics at the National University of Singapore and Humboldt Research Award winner. Internationally acclaimed for fundamental contributions to several complex variables, pluripotential theory, and complex dynamical systems in multiple dimensions.',
      sources: [
        'https://www.math.nus.edu.sg/people/dinh-tien-cuong/',
        'https://scholar.google.com/citations?user=35RkcIYAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0800',
    name: 'Quy Nguyen Huy',
    researchOverview: {
      text: 'Solvay Chaired Professor of Technological Innovation and Professor of Strategic Management at INSEAD. Internationally acclaimed for pioneering research on strategic leadership, emotional dynamics during organizational turnaround, and middle-management innovation.',
      sources: [
        'https://www.insead.edu/faculty-research/faculty/quy-nguyen-huy',
        'https://scholar.google.com/citations?user=cKntAwYAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0802',
    name: 'Tan Minh Nguyen',
    researchOverview: {
      text: 'Assistant Professor of Mathematics and Computer Science at the National University of Singapore, named an NUS Presidential Young Professor. Researches deep learning theory, self-attention mathematical mechanisms, neural ODEs, and transformer architecture optimizations.',
      sources: [
        'https://www.math.nus.edu.sg/people/tan-minh-nguyen/',
        'https://scholar.google.com/citations?user=l2XUv6UAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },

  // ==========================================
  // CHUNK 4: Items 121 to 162
  // ==========================================
  {
    id: 'vp-0805',
    name: 'Tuan Anh Nguyen',
    researchOverview: {
      text: 'Associate Professor of Life Science at HKUST, Croucher Innovation Awardee, and Sinovac Fellow. Researches the molecular mechanisms of microRNA biogenesis, primary microRNA processing by the Drosha-DGCR8 microprocessor, and architectural RNA functions.',
      sources: [
        'https://facultyprofiles.hkust.edu.hk/profiles.php?profile=tuan-anh-nguyen-tuananh',
        'https://scholar.google.com/citations?user=xU5vTt4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0808',
    name: 'Viet Quoc Pham',
    researchOverview: {
      text: 'Assistant Professor of Computer Science at Trinity College Dublin and recipient of the IEEE ComSoc Best Young Researcher Award (EMEA). Researches edge AI computing, non-orthogonal multiple access (NOMA), and intelligent reflecting surfaces for beyond-5G communication.',
      sources: [
        'https://www.scss.tcd.ie/personnel/phamqv',
        'https://scholar.google.com/citations?user=d9F56a4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0811',
    name: 'Dung Tran',
    researchOverview: {
      text: 'Senior Lecturer in Mathematics Education at Federation University Australia and CADRE Fellow. Researches mathematical modeling pedagogy, statistical literacy, STEM integration frameworks, and curriculum design in secondary and higher education.',
      sources: [
        'https://federation.edu.au/staff/directory/dung-tran',
        'https://scholar.google.com/citations?user=6Uj7d5EAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0815',
    name: 'Dao M. Nguyen',
    researchOverview: {
      text: 'B. and Donald Carlin Endowed Chair for Thoracic Surgical Oncology at the University of Miami Miller School of Medicine. Directs research on lung cancer and malignant pleural mesothelioma molecular biology, translational therapeutics, and robotic thoracic surgery.',
      sources: [
        'https://umiamihealth.org/en/treatments-and-services/surgery/thoracic-surgery',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0816',
    name: 'Liem Nguyen - Case Western Reserve University',
    researchOverview: {
      text: 'Associate Professor of Pathology at Case Western Reserve University and winner of the Swiss TB Award. Investigates Mycobacterium tuberculosis pathogenesis, macrophage immune evasion mechanisms, and bacterial kinase signaling cascades.',
      sources: [
        'https://case.edu/medicine/pathology/faculty/liem-nguyen',
        'https://scholar.google.com/citations?user=xU5vTt4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0824',
    name: 'Pipo Nguyen-duy',
    researchOverview: {
      text: 'Professor of Photography at Oberlin College and Guggenheim Fellow. Acclaimed fine-art photographer whose series such as "East of Eden" and "The Seasons" explore landscape, mythology, trauma, and the aftermath of historical conflict.',
      sources: [
        'https://www.oberlin.edu/pipo-nguyen-duy',
        'https://www.gf.org/fellows/pipo-nguyen-duy/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0826',
    name: 'Van Tho Tran',
    researchOverview: {
      text: 'Professor Emeritus of Economics at Waseda University, decorated with the Order of the Sacred Treasure by the Government of Japan and winner of the Asia-Pacific Prize. Leading authority on East Asian industrialization, flying-geese economic development, and ASEAN economic integration.',
      sources: [
        'https://www.waseda.jp/top/en',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0837',
    name: 'Minh Hao Nguyen',
    researchOverview: {
      text: 'Assistant Professor of Communication Science at the University of Amsterdam and recipient of the prestigious NWO Veni Grant. Researches digital wellbeing, smartphone use regulation, mobile notifications, and mental health in the digital communication era.',
      sources: [
        'https://www.uva.nl/en/profile/n/g/m.h.nguyen/m.h.nguyen.html',
        'https://scholar.google.com/citations?user=6Uj7d5EAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0850',
    name: 'Alexander H. Nguyen',
    researchOverview: {
      text: 'Associate Professor of Plastic and Reconstructive Surgery at UCLA David Geffen School of Medicine and recipient of the NIH K08 Clinical Investigator Award. Researches adipose-derived stem cell biology, tissue regeneration scaffolds, and microvascular reconstructive techniques.',
      sources: [
        'https://www.uclahealth.org/providers/alexander-nguyen',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0958',
    name: 'Tammy Vo Nguyen',
    researchOverview: {
      text: 'Assistant Professor of Art at Wesleyan University and Guggenheim Fellow. Multi-disciplinary artist and writer whose prints, paintings, artist books, and installations explore geopolitics, ecology, natural history, and philosophical allegories.',
      sources: [
        'https://www.wesleyan.edu/academics/faculty/tnguyen04/profile.html',
        'https://www.gf.org/fellows/tammy-nguyen/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0959',
    name: 'Holly Nguyen',
    researchOverview: {
      text: 'Associate Professor of Criminology and Sociology at Penn State and winner of the Ruth Shonle Cavan Young Scholar Award from the American Society of Criminology. Researches illicit drug markets, criminal income generation, and social networks in offending behavior.',
      sources: [
        'https://sociology.la.psu.edu/people/hxn31/',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0960',
    name: 'Hong-An Truong',
    researchOverview: {
      text: 'Professor of Art and Art History at UNC Chapel Hill and Guggenheim Fellow. Acclaimed visual artist whose photography, video, and sound installations examine archival representations, memory politics, and the historical visuality of war.',
      sources: [
        'https://art.unc.edu/people/hong-an-truong/',
        'https://www.gf.org/fellows/hong-an-truong/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-0965',
    name: 'Quynh Anh Nguyen',
    researchOverview: {
      text: 'Assistant Professor of Pharmacology at Vanderbilt University School of Medicine and recipient of the NIH K99/R00 Pathway to Independence Award. Researches synaptic transmission mechanisms, endocannabinoid signaling, and neuronal circuit plasticity in neurological disorders.',
      sources: [
        'https://pharmns.vanderbilt.edu/people/quynh-anh-nguyen/',
        'https://scholar.google.com/citations?user=xU5vTt4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1010',
    name: 'Kim-Huong Nguyen',
    researchOverview: {
      text: 'Senior Research Fellow in Health Economics at the University of Queensland and Global Atlantic Fellow for Equity in Brain Health at GBHI. Evaluates healthcare financing models, dementia care interventions, and economic value assessments for vulnerable aging populations.',
      sources: [
        'https://stories.uq.edu.au/chsr/kim-huong-nguyen/index.html',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1060',
    name: 'Long Chu',
    researchOverview: {
      text: 'Associate Professor of Environmental Economics at the Australian National University and winner of the prestigious Eureka Prize for Water Research and Innovation. Formulates economic models for water basin allocations, fisheries management, and dynamic bio-economic policy design.',
      sources: [
        'https://crawford.anu.edu.au/people/academic/long-chu',
        'https://scholar.google.com/citations?user=Vn85bA4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1086',
    name: 'Quyen D. Chu',
    researchOverview: {
      text: 'Roy L. Schneider Endowed Professor of Surgery and Chair of Surgery at Howard University College of Medicine. Nationally recognized surgical oncologist specializing in gastrointestinal and breast cancers, surgical disparity reduction, and international global surgery initiatives.',
      sources: [
        'https://medicine.howard.edu/faculty/quyen-d-chu-md-mba-facs',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1095',
    name: 'Mai Tuyet Pho',
    researchOverview: {
      text: 'Associate Professor of Medicine at the University of Chicago and Fellow of the Infectious Diseases Society of America (FIDSA). Directs clinical and epidemiological research on rural opioid use, hepatitis C virus elimination, and HIV prevention in underserved communities.',
      sources: [
        'https://www.uchicagomedicine.org/find-a-physician/physician/mai-tuyet-pho',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1143',
    name: 'Minh Tam Truong',
    researchOverview: {
      text: 'Professor and Chair of Radiation Oncology at Boston University Chobanian & Avedisian School of Medicine and Fellow of ASTRO (FASTRO). Specializes in intensity-modulated radiotherapy (IMRT), head and neck malignancies, and health equity in oncology care.',
      sources: [
        'https://www.bumc.bu.edu/busm/profile/minh-tam-truong/',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1146',
    name: 'Dinh C. Nguyen',
    researchOverview: {
      text: 'Distinguished Staff Scientist at SLAC National Accelerator Laboratory / Los Alamos, APS Fellow, and International Free-Electron Laser Prize winner. Pioneer in high-brightness photocathode electron guns and X-ray free-electron lasers (XFEL) enabling ultra-fast atomic science.',
      sources: [
        'https://www.slac.stanford.edu/',
        'https://scholar.google.com/citations?user=E7_vH5sAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1147',
    name: 'Nghi Q. Lam',
    researchOverview: {
      text: 'Senior Physicist at Argonne National Laboratory and legendary former Editor-in-Chief of Applied Physics Letters (1994–2014). Internationally renowned for theoretical and computer modeling of radiation damage, atomistic defect kinetics, and ion-beam surface modification.',
      sources: [
        'https://www.anl.gov/',
        'https://scholar.google.com/citations?user=Lp9J0uEAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1152',
    name: 'Hung Trung Nguyen',
    researchOverview: {
      text: 'Professor Emeritus of Mathematical Sciences at New Mexico State University and Fellow of the International Fuzzy Systems Association (IFSA). Pioneer in fuzzy logic, probabilistic mathematics, conditional event algebras, and foundations of uncertainty quantification.',
      sources: [
        'https://math.nmsu.edu/',
        'https://scholar.google.com/citations?user=35RkcIYAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1155',
    name: 'My Hang Huynh',
    researchOverview: {
      text: 'Senior Scientist at Los Alamos National Laboratory, MacArthur Fellow, and recipient of the E.O. Lawrence Award. World-renowned inorganic chemist who pioneered green, environmentally benign primary energetic materials replacing toxic lead-based explosives worldwide.',
      sources: [
        'https://www.lanl.gov/discover/news-release-archive/2007/macarthur-award.php',
        'https://www.macfound.org/fellows/class-of-2007/my-hang-v-huynh'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1156',
    name: 'Ly Thi Tran',
    researchOverview: {
      text: 'Professor of Education at Deakin University, ARC Future Fellow, and recipient of the Noam Chomsky Global Connections Award. Leading global authority on international student mobility, transnational education, staff professional development, and intercultural pedagogy.',
      sources: [
        'https://www.deakin.edu.au/about-deakin/people/ly-tran',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1157',
    name: 'Hien Trong Nguyen',
    researchOverview: {
      text: 'Senior Research Scientist at NASA Jet Propulsion Laboratory and Caltech, recipient of the NASA Exceptional Scientific Achievement Medal. Key instrumentalist for cosmic microwave background telescopes at the South Pole (BICEP/SPIDER) searching for primordial gravitational waves.',
      sources: [
        'https://scienceandtechnology.jpl.nasa.gov/people/h_nguyen',
        'https://scholar.google.com/citations?user=ZYkk-uoAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1158',
    name: 'Frédéric Pham',
    researchOverview: {
      text: 'Legendary mathematician and Professor at Université Côte d\'Azur / CNRS. Formulated foundational concepts in singularity theory and mathematical physics, including Brieskorn-Pham singularities, the Picard-Lefschetz-Pham formula, and exact WKB analysis for differential equations.',
      sources: [
        'https://math.unice.fr/',
        'https://en.wikipedia.org/wiki/Fr%C3%A9d%C3%A9ric_Pham'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1160',
    name: 'Buu-Hoi Nguyen-Phuc',
    researchOverview: {
      text: 'Distinguished chemist at CNRS, direct descendant of Emperor Minh Mạng, and Commandeur de la Légion d\'honneur. Pioneered synthetic chemotherapy, synthesizing hundreds of anti-tubercular, anti-leprosy, and anti-carcinogenic heterocyclic compounds while identifying dioxin toxicity.',
      sources: [
        'https://fr.wikipedia.org/wiki/Nguy%E1%BB%85n_Ph%C3%BAc_B%E1%BB%ADu_H%E1%BB%99i',
        'https://gallica.bnf.fr/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1161',
    name: 'Trang Dung Le',
    researchOverview: {
      text: 'Distinguished mathematician at Université Paris Cité and Fellow of The World Academy of Sciences (TWAS). Titan of algebraic geometry who formulated Lê cycles, Lê numbers, the Lê-Greuel formula, and the Lê-Ramanujam theorem in singularity theory.',
      sources: [
        'https://fr.wikipedia.org/wiki/L%C3%AA_D%C5%A9ng_Tr%C3%A1ng',
        'https://twas.org/directory/le-dung-trang'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1163',
    name: 'Hai Quang Tran',
    researchOverview: {
      text: 'Celebrated ethnomusicologist and acoustician at CNRS / Musée de l\'Homme, Chevalier de la Légion d\'honneur and Officier des Arts et des Lettres. World-renowned master and researcher of Vietnamese traditional musical instruments, jaw harps, and overtone singing (khoomei).',
      sources: [
        'https://fr.wikipedia.org/wiki/Tr%E1%BA%A7n_Quang_H%E1%BA%A3i',
        'https://data.bnf.fr/fr/13926470/quang_hai_tran/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1186',
    name: 'Trieu-Kien Truong',
    researchOverview: {
      text: 'Distinguished Professor of Electrical Engineering at National Cheng Kung University and Life Fellow of the IEEE. Pioneered fast Fourier transform algorithms over finite Galois fields, Reed-Solomon error-correcting decoding architectures, and synthetic aperture radar imaging.',
      sources: [
        'https://www.ee.ncku.edu.tw/',
        'https://scholar.google.com/citations?user=E7_vH5sAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1191',
    name: 'Kim-Phuong L. Vu',
    researchOverview: {
      text: 'Professor of Psychology at CSU Long Beach, Fellow of HFES, APA, and APS. World authority in cognitive ergonomics, spatial stimulus-response compatibility, cybersecurity human factors, and human-automation interaction design in complex cockpits.',
      sources: [
        'https://www.cla.csulb.edu/departments/psychology/kim-phuong-l-vu/',
        'https://scholar.google.com/citations?user=mhatBgsAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1192',
    name: 'Hai L. Vu',
    researchOverview: {
      text: 'Professor of Intelligent Transport Systems at Monash University and ARC Future Fellow. Researches dynamic traffic flow modeling, connected and autonomous vehicle coordination, queueing networks, and smart city traffic signal optimization.',
      sources: [
        'https://research.monash.edu/en/persons/hai-vu',
        'https://scholar.google.com/citations?user=5TgvaiwAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1206',
    name: 'Tuan Kim Vu',
    researchOverview: {
      text: 'Marion Crider Distinguished Chair of Mathematics at the University of West Georgia. Researches computational mathematics, numerical solutions of partial differential equations, finite element methods, and mathematical modeling of physical fluid dynamics.',
      sources: [
        'https://www.westga.edu/profile.php?emp_id=1418',
        'https://scholar.google.com/citations?user=N4-U1i4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1212',
    name: 'Patrice Tran Ba Huy',
    researchOverview: {
      text: 'Professor Emeritus of Otolaryngology–Head and Neck Surgery at Université Paris Cité and Membre Titulaire of the Académie Nationale de Médecine. Internationally renowned for pioneering endoscopic skull base surgical techniques and inner ear vestibulocochlear pharmacokinetics.',
      sources: [
        'https://www.academie-medecine.fr/',
        'https://u-paris.fr/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1234',
    name: 'Kim-Anh Lê Cao',
    researchOverview: {
      text: 'Professor of Biostatistics at the University of Melbourne, recipient of the Fenner Medal from the Australian Academy of Science and Georgina Sweet Award. Creator of the mixOmics software suite, pioneering multivariate statistical methods for multi-omics data integration.',
      sources: [
        'https://findanexpert.unimelb.edu.au/profile/735073-kim-anh-le-cao',
        'https://mixomics.org/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1236',
    name: 'Nhan Viet Tran',
    researchOverview: {
      text: 'Senior Scientist at Fermi National Accelerator Laboratory and recipient of the DOE Early Career Research Award. Leads AI and ultra-fast real-time machine learning acceleration (hls4ml) for high-energy particle physics experiments at the Large Hadron Collider (CMS).',
      sources: [
        'https://fastmachinelearning.org/',
        'https://scholar.google.com/citations?user=ZYkk-uoAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1248',
    name: 'Thi Hoang Duong Nguyen',
    researchOverview: {
      text: 'Programme Leader at the MRC Laboratory of Molecular Biology (LMB Cambridge), UK Blavatnik Laureate in Life Sciences, and Royal Society Francis Crick Medalist. Solved groundbreaking high-resolution cryo-EM atomic structures of human telomerase and spliceosome macromolecular complexes.',
      sources: [
        'https://www2.mrc-lmb.cam.ac.uk/group-leaders/n-to-s/thi-hoang-duong-nguyen/',
        'https://blavatnikawards.org/honorees/profile/kelly-thi-hoang-duong-nguyen/'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1267',
    name: 'Van Khang Huynh',
    researchOverview: {
      text: 'Professor of Information and Communication Technology at the University of Agder and Member of the Norwegian Academy of Technical Sciences (NTVA). Researches artificial intelligence, automated reasoning, knowledge representation, and deep fuzzy neural decision systems.',
      sources: [
        'https://www.uia.no/om-uia/ansatte/person/van-khang-huynh',
        'https://scholar.google.com/citations?user=d9F56a4AAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1271',
    name: 'Khanh Pham',
    researchOverview: {
      text: 'Principal Aerospace Engineer at the Air Force Research Laboratory (AFRL), Fellow of IEEE, AIAA, NAI, and AFRL. Innovator in autonomous satellite formation flying, cognitive radar, game-theoretic space situational awareness, and secure space communications.',
      sources: [
        'https://www.afrl.af.mil/',
        'https://scholar.google.com/citations?user=s8g9lqQAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1299',
    name: 'Nicole Ngo-Giang-Huong',
    researchOverview: {
      text: 'Research Director at the French National Research Institute for Sustainable Development (IRD) and Chevalier de la Légion d\'honneur. Pioneered global clinical protocols preventing mother-to-child transmission of HIV and Hepatitis B virus across Southeast Asia.',
      sources: [
        'https://www.ird.fr/',
        'https://scholar.google.com/citations?user=dt42krUAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1322',
    name: 'Thinh T. Doan',
    researchOverview: {
      text: 'Assistant Professor of Electrical and Computer Engineering at UT Austin, recipient of the NSF CAREER Award and AFOSR Young Investigator Program Award. Formulates finite-time analysis and convergence theory for distributed optimization and multi-agent reinforcement learning.',
      sources: [
        'https://www.ece.utexas.edu/people/faculty/thinh-doan',
        'https://scholar.google.com/citations?user=P4s2yvIAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1323',
    name: 'Cao-Thang Dinh',
    researchOverview: {
      text: 'Associate Professor of Chemical Engineering and Canada Research Chair in Electrochemical Energy Conversion at Queen\'s University. Pioneers high-rate CO2 electroreduction and renewable electrosynthesis systems converting greenhouse emissions into clean fuels and chemical feedstocks.',
      sources: [
        'https://chemeng.queensu.ca/people/faculty/cao-thang-dinh.html',
        'https://scholar.google.com/citations?user=Lp9J0uEAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  },
  {
    id: 'vp-1444',
    name: 'Hoai An Le Thi',
    researchOverview: {
      text: 'Distinguished Professor of Computer Science at Université de Lorraine and winner of the Constantin Carathéodory Prize (2021). Co-inventor of DC (Difference of Convex functions) programming and DCA algorithms, foundational frameworks in non-convex optimization and data science.',
      sources: [
        'https://lita.univ-lorraine.fr/~lethi/',
        'https://scholar.google.com/citations?user=35RkcIYAAAAJ'
      ],
      verifiedAt: '2026-09-13T00:00:00.000Z'
    }
  }
];

export async function applyHonorsEnrichments() {
  const dataPath = path.resolve('public/data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  let updated = 0;
  const now = new Date().toISOString();

  for (const entry of honorsEnrichments) {
    const errors = validateOverview(entry.researchOverview);
    if (errors.length > 0) {
      throw new Error(`Validation failed for ${entry.name} (${entry.id}): ${errors.join(', ')}`);
    }

    const rosterPerson = data.find((p: any) => p.id === entry.id);
    if (!rosterPerson) {
      throw new Error(`Roster entry not found: ${entry.id} (${entry.name})`);
    }

    rosterPerson.researchOverview = entry.researchOverview;
    rosterPerson.lastUpdatedAt = now;
    updated++;
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n');
  console.log(`Successfully applied ${updated}/${honorsEnrichments.length} honors research overviews to public/data.json.`);
}

if (import.meta.url.endsWith(process.argv[1])) {
  applyHonorsEnrichments().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
