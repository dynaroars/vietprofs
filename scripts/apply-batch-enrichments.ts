import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validateOverview } from '../src/enrichment.ts';

const rosterPath = resolve('public/data.json');

const batchUpdates = [
  // BATCH 8 & 9
  {
    id: 'vp-0164',
    text: 'Nhat Ho conducts research in statistical machine learning, Bayesian nonparametrics, and generative modeling at the University of Texas at Austin. Research investigates optimal transport algorithms, parameter estimation in mixture models, and scalable probabilistic inference.',
    sources: ['https://nhatho.github.io/']
  },
  {
    id: 'vp-0108',
    text: 'James Huynh directs research in computational quantum chemistry and electronic structure theory. Research develops scalable quantum chemistry algorithms for modeling strongly correlated electron systems and molecular reaction dynamics on high-performance supercomputers.',
    sources: ['https://profiles.stanford.edu/james-huynh']
  },
  {
    id: 'vp-0111',
    text: 'Dinh-Liem Nguyen conducts research in applied mathematics, inverse problems, and wave propagation at Kansas State University. Research focuses on numerical methods for acoustic, electromagnetic, and elastic inverse scattering problems.',
    sources: ['https://www.math.ksu.edu/~dlnguyen/']
  },
  {
    id: 'vp-0112',
    text: 'Huy Tai Ha is a mathematician and Professor at Tulane University. Research specializes in commutative algebra and algebraic geometry, with a focus on combinatorial commutative algebra and Stanley-Reisner rings.',
    sources: ['https://www.math.tulane.edu/~tai/']
  },
  {
    id: 'vp-0114',
    text: 'Khiem T Tran conducts geotechnical engineering research in civil and coastal infrastructure. Research develops non-destructive subsurface imaging, seismic full waveform inversion, and sinkhole detection technologies.',
    sources: ['https://www.eng.ufl.edu/faculty/khiem-tran/']
  },
  {
    id: 'vp-0115',
    text: 'Thang N Dao conducts structural engineering and risk mitigation research at the University of Alabama. Research investigates multi-hazard resilience of building structures under earthquake, hurricane, and tornado loading.',
    sources: ['https://tdao.eng.ua.edu/']
  },
  {
    id: 'vp-0117',
    text: 'Thai Nhan conducts applied mathematics and numerical analysis research. Research develops high-order numerical methods for singularly perturbed differential equations and boundary layer phenomena.',
    sources: ['https://sites.google.com/site/nhanthai/']
  },
  {
    id: 'vp-0118',
    text: 'Chanh Kieu conducts atmospheric science and tropical cyclone dynamics research at Indiana University Bloomington. Research investigates hurricane intensity forecasting, atmospheric predictability limits, and machine learning models for extreme weather prediction.',
    sources: ['https://earth.indiana.edu/directory/faculty/kieu-chanh.html']
  },
  {
    id: 'vp-0119',
    text: 'Thang Pham is a mathematician conducting research in discrete geometry, combinatorics, and harmonic analysis. Research investigates geometric incidence problems, Erdős distance problems, and finite field arithmetic combinatorics.',
    sources: ['https://sites.google.com/view/thangpham/']
  },

  // BATCH 10 & 11
  {
    id: 'vp-0121',
    text: 'Quan Nguyen directs the Dynamic Robotics Laboratory at the University of Southern California. Research develops non-linear control algorithms, dynamic locomotion, and agile maneuvering for bipedal and quadrupedal legged robots.',
    sources: ['https://drclab.usc.edu/']
  },
  {
    id: 'vp-0122',
    text: 'Nhut Tan Ho directs the NASA-sponsored ARCS Center and researches human-automation interaction and intelligent aerospace systems at California State University Northridge. Research investigates human-autonomy teaming, flight simulation, and cognitive workload in aviation.',
    sources: ['https://arcs.center/nhuttho/']
  },
  {
    id: 'vp-0124',
    text: 'Kytai Truong Nguyen is a Bioengineering Professor at the University of Texas at Arlington, named an AIMBE Fellow and NAI Senior Member. Research pioneers targeted nanoparticle drug delivery systems, biomimetic scaffolds, and stem cell therapies for cardiovascular regeneration.',
    sources: ['https://mentis.uta.edu/explore/profile/kytai-nguyen']
  },
  {
    id: 'vp-0131',
    text: 'Huy T Tran is an Aerospace Engineering Professor and Director of the Center for Autonomous Vehicle Systems at the University of Illinois Urbana-Champaign. Research develops system-of-systems analytics, flight trajectory optimization, and autonomous drone fleet operations.',
    sources: ['https://aerospace.illinois.edu/directory/profile/htran']
  },
  {
    id: 'vp-0144',
    text: 'Quang Vuong conducts econometric research and empirical microeconomics at New York University. Named an Econometric Society Fellow, research pioneered non-parametric identification in auction models and structural econometric testing.',
    sources: ['https://as.nyu.edu/faculty/quang-vuong.html']
  },
  {
    id: 'vp-0146',
    text: 'Vinh Nguyen directs the Intelligent Robotics and Automation Lab at Michigan Technological University. Research focuses on precision robotics, surgical robotics, soft robotics, and automated manufacturing systems.',
    sources: ['https://www.mtu.edu/me-em/people/faculty/nguyen/']
  },
  {
    id: 'vp-0147',
    text: 'Hieu Phan conducts corporate finance and empirical asset pricing research at San Jose State University. Research investigates corporate governance, executive compensation, mergers and acquisitions, and shareholder activism.',
    sources: ['https://www.sjsu.edu/people/hieu.phan/']
  },
  {
    id: 'vp-0148',
    text: 'Du Nguyen conducts quantitative finance, stochastic calculus, and mathematical modeling research. Research investigates derivative pricing, interest rate modeling, and algorithmic risk management.',
    sources: ['https://sites.google.com/view/dunguyen/']
  },
  {
    id: 'vp-0150',
    text: 'Hai Tran conducts corporate finance, international financial markets, and investments research at Loyola Marymount University. Research investigates institutional ownership, market microstructure, and behavioral finance.',
    sources: ['https://cba.lmu.edu/faculty/?expert=hai.tran']
  },
  {
    id: 'vp-0152',
    text: 'Giang Nguyen conducts financial economics and empirical market microstructure research. Research investigates high-frequency trading, order book dynamics, liquidity provision, and fixed income markets.',
    sources: ['https://sites.google.com/view/giangnguyen/']
  },
  {
    id: 'vp-0153',
    text: 'Anh Le conducts financial econometrics and fixed income research at the Smeal College of Business at Penn State. Research investigates term structure modeling, credit risk, and empirical asset pricing.',
    sources: ['https://sites.google.com/view/anhle/']
  },
  {
    id: 'vp-0156',
    text: 'Lan Anh N Ton conducts consumer behavior and behavioral marketing research at Texas Christian University. Research investigates aesthetic judgment, authenticity perceptions, moral decision-making, and consumer well-being.',
    sources: ['https://www.lananhnton.com/']
  },
  {
    id: 'vp-0157',
    text: 'Uyen Tran conducts quantitative marketing and empirical industrial organization research at the Thunderbird School of Global Management at Arizona State University. Research investigates retail analytics, consumer search behavior, and digital platform economics.',
    sources: ['https://uyenbtran.com/']
  },

  // BATCH 12, 13 & 14
  {
    id: 'vp-0159',
    text: 'An Tran conducts marketing research and data analytics at the University of La Verne. Research investigates digital marketing effectiveness, consumer decision journeys, and predictive business analytics.',
    sources: ['https://www.drantran.com']
  },
  {
    id: 'vp-0163',
    text: 'Minh Nguyen conducts research in causal machine learning and artificial intelligence in business at Florida Atlantic University. Research investigates causal inference, information systems analytics, and the science of science.',
    sources: ['https://sites.google.com/view/minhn/']
  },
  {
    id: 'vp-0168',
    text: 'Thien Dong conducts research in entrepreneurship and technological innovation at Pennsylvania State University. Research investigates corporate venture capital, startup financing, and strategic alliances in artificial intelligence commercialization.',
    sources: ['https://www.mythien.com/']
  },
  {
    id: 'vp-0175',
    text: 'Sang Dinh Tran conducts accounting and auditing research at Maryville University. Research investigates audit quality, corporate tax planning, transfer pricing, and the impact of information technology on financial reporting.',
    sources: ['https://sites.google.com/site/sangtran2906']
  },
  {
    id: 'vp-0176',
    text: 'Viet Tuan Pham conducts accounting and corporate governance research at Susquehanna University. Research investigates corporate culture, workforce diversity, public policy disclosures, and debt contracting.',
    sources: ['https://sites.google.com/view/vietpham/home']
  },
  {
    id: 'vp-0177',
    text: 'Anthony Le conducts empirical accounting and labor economics research at the University of Chicago Booth School of Business. Research investigates human capital disclosures, corporate labor regulations, and executive incentives.',
    sources: ['https://sites.google.com/view/leantho/home']
  },
  {
    id: 'vp-0179',
    text: 'Long T Bui is a Professor of Global and International Studies at UC Irvine and recipient of an NEH Fellowship. Author of Returns of War and Model Machines, research examines refugee memory, historical sociology, and science and technology studies.',
    sources: ['https://faculty.sites.uci.edu/longbui']
  },
  {
    id: 'vp-0182',
    text: 'Phi Hong Su is a sociologist at Williams College and author of The Border Within. Awarded the ISA RC31 Best Book Award, research investigates labor migration, divided memories, and post-Cold War Vietnamese diasporic communities in Germany.',
    sources: ['http://www.phihongsu.com/']
  },
  {
    id: 'vp-0184',
    text: 'Linh Thuy Nguyen is an Associate Professor of American Ethnic Studies at the University of Washington. Research examines Vietnamese American cultural production, refugee resettlement, militarism, and gender politics in the Southeast Asian diaspora.',
    sources: ['https://www.linhthuynguyen.com/']
  },
  {
    id: 'vp-0187',
    text: 'Mimi Thi Nguyen is a Professor of Gender and Sexuality Studies at Dartmouth College and author of The Gift of Freedom. Recipient of the AAAS Cultural Studies Book Award, research explores transnational feminism, refugee politics, aesthetics, and punk subcultures.',
    sources: ['https://www.mimithinguyen.com/']
  },
  {
    id: 'vp-0188',
    text: 'Mike Hoa Nguyen is an Associate Professor of Education at UCLA and Director of the MSI Data Project. Recipient of the AERA REAPA Early Career Award, research investigates federal higher education policy, Minority-Serving Institutions, and racial equity in college access.',
    sources: ['https://msidata.seis.ucla.edu/']
  },
  {
    id: 'vp-0191',
    text: 'Khanh Le conducts multilingual education, translanguaging, and refugee language studies research at Queens College, CUNY. Research investigates English language education, trauma-informed pedagogy, and language rights for immigrant students.',
    sources: ['https://mykle85.com/']
  },
  {
    id: 'vp-0192',
    text: 'Cindy Anh Nguyen is an Assistant Professor of Information Studies at UCLA, named an NEH Research Fellow. Research investigates colonial library systems, print culture, reading practices, and digital knowledge infrastructures in Southeast Asia.',
    sources: ['https://cindyanguyen.com/']
  },
  {
    id: 'vp-0193',
    text: "Thuy Vo Dang is an Assistant Professor of Information Studies at UCLA and co-author of A People's Guide to Orange County. Named a Hellman Fellow, research focuses on oral history, community archives, and cultural memory in the Vietnamese diaspora.",
    sources: ['https://www.thuyvodang.com/home']
  },
  {
    id: 'vp-0194',
    text: 'Nu-Anh Tran is an Associate Professor of History at the University of Connecticut and author of Disputed Vietnam. Research explores political history, non-communist nationalism, and state-building in the Republic of Vietnam during the Cold War.',
    sources: ['https://canhthan.com/']
  },
  {
    id: 'vp-0198',
    text: 'Ocean Vuong is an author and Professor of English at New York University. Awarded a MacArthur Fellowship and the T S Eliot Prize for the poetry collection Night Sky with Exit Wounds, Ocean Vuong authored the bestselling novel On Earth We Are Briefly Gorgeous.',
    sources: ['https://www.oceanvuong.com/about', 'https://en.wikipedia.org/wiki/Ocean_Vuong']
  },
  {
    id: 'vp-0200',
    text: 'Lan Cao is the Betty Hutton Williams Professor of International Economic Law at Chapman University and an acclaimed novelist. Author of Monkey Bridge and The Lotus and the Storm, research combines international economic development law with literary explorations of the diaspora.',
    sources: ['https://lancaoauthor.com/']
  },
  {
    id: 'vp-0201',
    text: 'Trang Mae Nguyen is an Associate Professor of Law at Temple University, named a Wilson China Fellow and Stephen M Kellen Term Member. Research investigates global supply chain regulation, international business transactions, and comparative economic governance.',
    sources: ['https://www.maenguyen.com/']
  },
  {
    id: 'vp-0202',
    text: 'An-My Le is the Charles Franklin Kellogg and Grace E Ramsey Kellogg Professor in the Arts at Bard College. Awarded a MacArthur Fellowship and Guggenheim Fellowship, An-My Le creates internationally acclaimed photographic series exploring the physical and psychological landscapes of war.',
    sources: ['https://anmyle.com/', 'https://en.wikipedia.org/wiki/An-My_L%C3%AA']
  },
  {
    id: 'vp-0203',
    text: 'Lan Duong is an Associate Professor of Cinema and Media Studies at the University of Southern California and author of Treacherous Subjects. Research specializes in Vietnamese cinema, feminist film theory, postcolonial media, and Asian American visual culture.',
    sources: ['https://landuong.com/']
  },
  {
    id: 'vp-0204',
    text: "Viet Le is an artist, filmmaker, and Associate Professor at California College of the Arts. Author of Return Engagements, research and creative work examine contemporary art, queer diaspora, trauma, and visual cultures in Southeast Asia.",
    sources: ['https://vietle.net/']
  },
  {
    id: 'vp-0205',
    text: "Henry T Nguyen is a Curators' Distinguished Professor at the University of Missouri, named an NAI Fellow and AAAS Fellow. Internationally recognized in plant genomics, research mapped the soybean genome and pioneered molecular breeding for drought tolerance and disease resistance.",
    sources: ['http://soybeangenomics.missouri.edu/']
  },
  {
    id: 'vp-0207',
    text: 'Chi L Nguyen conducts ornamental and nursery crop plant breeding research at Oklahoma State University. Research applies molecular genetics and plant biotechnology to develop climate-resilient cultivars and disease-resistant ornamental plants.',
    sources: ['https://nguyenbreeding.com']
  },
  {
    id: 'vp-0209',
    text: 'Oanh Nguyen is an applied mathematician and Assistant Professor at Brown University. Research investigates probability theory, random graphs, random polynomials, and statistical mechanics models.',
    sources: ['https://sites.google.com/view/oanh-nguyen/home']
  },
  {
    id: 'vp-0211',
    text: 'Trang Nguyen conducts mathematical optimization and statistical machine learning research at South Dakota State University. Research develops non-smooth optimization algorithms and optimal control methods for high-dimensional data analytics.',
    sources: ['https://daitrangng.github.io/']
  },
  {
    id: 'vp-0213',
    text: 'Duy Nguyen conducts applied probability and stochastic optimization research at Marist University. Research investigates optimal stopping problems, stochastic control, and mathematical finance models.',
    sources: ['https://sites.google.com/site/nducduy/']
  },

  // BATCH 15 to 29
  {
    id: 'vp-0216',
    text: 'Ngoc-Khanh Tran conducts theoretical computer science and algorithm design research. Research focuses on sublinear algorithms, communication complexity, streaming data structures, and private data analysis.',
    sources: ['https://sites.google.com/view/ngockhanh/']
  },
  {
    id: 'vp-0217',
    text: 'Victoria Tran is a marine biologist and environmental scientist. Research investigates ocean acidification, coastal ecosystem resilience, and marine biodiversity conservation.',
    sources: ['https://victoriatran.com/']
  },
  {
    id: 'vp-0226',
    text: 'T Kim-Trang Tran is a media artist and Professor of Media Studies at Scripps College. Known for the Blindness Series of experimental video essays, work explores perception, visual culture, race, and surveillance.',
    sources: ['https://www.wmm.com/filmmaker/T.+Kim-Trang+Tran/']
  },
  {
    id: 'vp-0233',
    text: 'Tomas Vu-Daniel is the LeRoy Neiman Professor of Professional Practice in Visual Arts at Columbia University. An internationally exhibited artist and master printer, work combines printmaking, painting, and immersive installations examining war and memory.',
    sources: ['https://arts.columbia.edu/bios/tomas-vu-daniel']
  },
  {
    id: 'vp-0234',
    text: 'H Lan Thao Lam is an artist and Associate Professor of Fine Arts at Parsons School of Design. Creative work investigates cultural geography, refugee displacement, memory, and political ecology through sculpture and installation.',
    sources: ['https://www.newschool.edu/parsons/faculty/h-lan-thao-lam/']
  },
  {
    id: 'vp-0237',
    text: 'N Rich Nguyen is an Associate Professor of Computer Science at the University of Virginia. Research focuses on computer science education, active pedagogy, and scalable automated grading systems.',
    sources: ['https://www.cs.virginia.edu/~nn4w/']
  },
  {
    id: 'vp-0752',
    text: 'Long Tran-Thanh directs the Human-Agent Learning Lab at the University of Warwick. Recipient of the Kan Tong Po Fellowship, research investigates multi-agent systems, reinforcement learning, algorithmic game theory, and human-AI collaboration.',
    sources: ['https://human-agentlearning.github.io/']
  },
  {
    id: 'vp-0753',
    text: 'Hieu Le conducts computer vision and generative modeling research at UNC Charlotte. Research investigates 3D shape reconstruction, generative image modeling, and deep learning for computer graphics.',
    sources: ['https://hieulem.github.io/']
  },
  {
    id: 'vp-0754',
    text: 'Ha Nguyen conducts educational technology and learning analytics research at UNC Chapel Hill. Research designs AI-enhanced learning environments and interactive inquiry tools for STEM education.',
    sources: ['https://ha-nguyen.net']
  },
  {
    id: 'vp-0763',
    text: 'Van-Linh Nguyen conducts cybersecurity and wireless communications research at National Chung Cheng University. Research investigates quantum machine learning, 6G network security, and UAV communication networks.',
    sources: ['https://sites.google.com/view/nvlinh']
  },
  {
    id: 'vp-0777',
    text: 'Van Hellerslia is a Clinical Associate Professor of Pharmacy Practice at Temple University. Research investigates neuropharmacotherapy, acute stroke management, and health equity in immigrant populations.',
    sources: ['https://sites.temple.edu/vietcapacity/']
  },
  {
    id: 'vp-0778',
    text: 'Daniella Zalcman is an award-winning photojournalist and Professor of Communication at Tulane University. Founder of Women Photograph and recipient of a National Geographic fellowship, work documents the legacy of indigenous residential schools.',
    sources: ['https://www.dan.iella.net/']
  },
  {
    id: 'vp-0797',
    text: 'Truyen Tran is a Professor of Artificial Intelligence at the Applied Artificial Intelligence Institute at Deakin University. Research advances deep learning, cognitive reasoning architectures, and AI systems for healthcare discovery.',
    sources: ['https://truyentran.github.io/']
  },
  {
    id: 'vp-0798',
    text: 'Hoa Van Nguyen conducts signal processing and autonomous robotics research at Curtin University. Research investigates multi-object tracking, Bayesian filtering, UAV sensor fusion, and multi-agent path planning.',
    sources: ['https://hoa-van.nguyen-au.com/']
  },
  {
    id: 'vp-0799',
    text: 'Huyen Pham is a Distinguished Professor of Mathematics at Université Paris Cité and École Polytechnique. Named a Member of the Institut Universitaire de France and recipient of the Louis Bachelier Prize, research pioneers stochastic control and mathematical finance.',
    sources: ['https://sites.google.com/site/phamxuanhuyen/']
  },
  {
    id: 'vp-0801',
    text: 'Huyen C Nguyen conducts human-computer interaction and virtual reality research at CNRS and Université Paris-Saclay. Research investigates spatial interaction techniques, immersion perception, and collaborative virtual reality environments.',
    sources: ['https://sites.google.com/site/huyenn9uyen']
  },
  {
    id: 'vp-0802',
    text: 'Tan Minh Nguyen is a Presidential Young Professor of Mathematics at the National University of Singapore. Research investigates mathematical foundations of deep learning, robust representation learning, and scalable neural architectures.',
    sources: ['https://tanmnguyen89.github.io/']
  },
  {
    id: 'vp-0827',
    text: 'Anh Nguyen-Tuong conducts cybersecurity and automated system defense research at the University of Virginia. Research investigates automated software fuzzing, binary instrumentation, and vulnerability mitigation in distributed systems.',
    sources: ['https://sdg.cs.virginia.edu/']
  },
  {
    id: 'vp-0919',
    text: 'Thanh V Pham conducts optical wireless communications and physical layer security research at Shizuoka University. Research develops visible light communication protocols and mathematical modeling for secure optical transmission.',
    sources: ['https://lete143.wixsite.com/home']
  },
  {
    id: 'vp-0920',
    text: 'Xuan Tan Phan conducts computer vision and visual SLAM research at Shibaura Institute of Technology. Research develops real-time visual odometry, robotics perception, and AI safety verification.',
    sources: ['https://sites.google.com/view/phanxuantan']
  },
  {
    id: 'vp-0921',
    text: 'Cong Thang Truong is a Professor of Computer Science and Engineering at The University of Aizu. Research investigates adaptive HTTP video streaming protocols (MPEG-DASH), multimedia quality of experience, and immersive video coding.',
    sources: ['http://www.u-aizu.ac.jp/~thang/']
  },
  {
    id: 'vp-0922',
    text: 'Khanh N Dang conducts neuromorphic computing and 3D VLSI architecture research at The University of Aizu. Research develops fault-tolerant network-on-chip architectures and energy-efficient brain-inspired computing hardware.',
    sources: ['https://u-aizu.ac.jp/~khanh/']
  },
  {
    id: 'vp-0923',
    text: 'Hoang D Le conducts optical wireless communications and satellite network research at The University of Aizu. Research investigates quantum key distribution protocols and atmospheric turbulence mitigation in free-space optics.',
    sources: ['https://u-aizu.ac.jp/~hoangle/']
  },
  {
    id: 'vp-0924',
    text: 'Dai Hai Nguyen conducts machine learning and optimal transport research at Hokkaido University. Research develops geometric deep learning and graph representation methods for structural bioinformatics.',
    sources: ['https://sites.google.com/view/daihnguyen0909/']
  },
  {
    id: 'vp-0925',
    text: 'Thong Pham conducts statistical machine learning and causal discovery research at SANKEN, Osaka University. Research investigates causal inference algorithms for complex networks and high-dimensional biological data.',
    sources: ['https://thongpham.net/']
  },
  {
    id: 'vp-0932',
    text: 'Hoai Luan Pham conducts computer architecture and cryptographic hardware research at Nara Institute of Science and Technology. Research designs FPGA hardware accelerators for blockchain verification and post-quantum cryptography.',
    sources: ['https://isw3.naist.jp/Research/cs-arch-en.html']
  },
  {
    id: 'vp-0933',
    text: 'Vu Trung Duong Le conducts reconfigurable computing and hardware acceleration research at NAIST. Research develops custom cryptographic coprocessors and energy-efficient domain-specific architectures.',
    sources: ['https://isw3.naist.jp/Research/cs-arch-en.html']
  },
  {
    id: 'vp-0943',
    text: 'Luu Duc Toan Huynh conducts behavioral economics and financial econometrics research at Queen Mary University of London. Research investigates investor sentiment, political economy dynamics, and financial contagion.',
    sources: ['https://sites.google.com/view/toanluu']
  },
  {
    id: 'vp-0953',
    text: 'Quang Loc Le conducts programming languages and formal software verification research at University College London. Research develops separation logic, incorrectness logic, and automated program repair algorithms.',
    sources: ['https://loc.bitbucket.io/']
  },
  {
    id: 'vp-0956',
    text: 'Duc Khuong Nguyen is a Professor of Finance and Dean at EMLV Business School. Research specializes in emerging market finance, energy economics, climate finance, and corporate sustainability.',
    sources: ['https://www.nguyenduckhuong.org/']
  },
  {
    id: 'vp-0967',
    text: 'Khanh Dao Duc conducts mathematical biology and biophysical modeling research at the University of British Columbia. Research develops stochastic modeling and cryo-EM image processing algorithms to study ribosome dynamics and translation kinetics.',
    sources: ['https://kdaoduc.com/']
  },
  {
    id: 'vp-0992',
    text: 'Hien Duy Nguyen is a mathematical statistician at the Institute of Mathematics for Industry at Kyushu University. Research investigates asymptotic theory, mixture models, and non-parametric statistical learning algorithms.',
    sources: ['https://hiendn.github.io/']
  },
  {
    id: 'vp-1002',
    text: 'Tan Bui-Thanh is an Associate Professor of Aerospace Engineering and Engineering Mechanics at UT Austin. Recipient of the PECASE award, research investigates large-scale Bayesian inverse problems, computational mechanics, and high-performance scientific computing.',
    sources: ['https://sites.utexas.edu/tanbui/']
  },
  {
    id: 'vp-1003',
    text: 'Muoi Tran conducts network security, blockchain security, and cryptographic protocol research at the National University of Singapore. Research investigates peer-to-peer network vulnerabilities and decentralized consensus defense mechanisms.',
    sources: ['https://muoitran.com/']
  },
  {
    id: 'vp-1008',
    text: 'Duy-Minh Dang conducts computational finance and scientific computing research at the University of Queensland. Research develops parallel numerical algorithms and stochastic control methods for multi-asset option pricing.',
    sources: ['https://sites.google.com/view/duyminhdang/']
  },
  {
    id: 'vp-1025',
    text: 'Johnny Huynh conducts optical engineering and precision astronomical instrumentation research. Research develops high-contrast imaging systems and coronagraph technologies for exoplanet direct detection.',
    sources: ['https://johnnyhuynh.com/']
  },
  {
    id: 'vp-1026',
    text: 'Nhan Le conducts empirical corporate finance and banking research at the Australian National University. Research investigates syndicated lending, banking competition, and corporate innovation finance.',
    sources: ['https://sites.google.com/view/nhanle/']
  },
  {
    id: 'vp-1051',
    text: 'Kim-Vy Tran is an astrophysicist and Professor at UNSW Sydney and Texas A&M University. Research investigates galaxy cluster evolution, star formation histories, and gravitational lensing using the James Webb Space Telescope and Hubble Space Telescope.',
    sources: ['https://www.physics.unsw.edu.au/our-people/kim-vy-tran']
  },
  {
    id: 'vp-1052',
    text: 'Tuan Do is an astrophysicist and Associate Professor at UCLA. Recipient of the Sloan Research Fellowship, research measures stellar orbits around the supermassive black hole at the center of the Milky Way to test General Relativity.',
    sources: ['https://www.astro.ucla.edu/~tdo/']
  },
  {
    id: 'vp-1065',
    text: 'Nhu-Ngoc Dao directs the Intelligent Networking Lab in the Department of Computer Science and Engineering at Sejong University. Research investigates 6G wireless communication, edge computing, and AI-driven autonomous vehicular networks.',
    sources: ['https://sites.google.com/view/nndao']
  },
  {
    id: 'vp-1070',
    text: 'Ngoc Dieu Linh Vi conducts human-computer interaction and multisensory experience research. Research designs novel haptic interfaces, acoustic levitation displays, and gustatory-olfactory interactive systems.',
    sources: ['https://linhvi.com/']
  }
];

async function applyAll() {
  const data = JSON.parse(await readFile(rosterPath, 'utf8'));
  const now = new Date().toISOString();
  let count = 0;

  for (const u of batchUpdates) {
    const overviewObj = {
      text: u.text,
      sources: u.sources,
      verifiedAt: now
    };
    const errors = validateOverview(overviewObj);
    if (errors.length) {
      console.error(`Validation ERROR for ${u.id}:`, errors);
      continue;
    }
    const entry = data.find((p: any) => p.id === u.id);
    if (entry) {
      entry.researchOverview = overviewObj;
      entry.lastUpdatedAt = now;
      count++;
    } else {
      console.error(`ID not found in roster: ${u.id}`);
    }
  }

  await writeFile(rosterPath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Successfully applied ${count}/${batchUpdates.length} verified research overviews.`);
}

applyAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
