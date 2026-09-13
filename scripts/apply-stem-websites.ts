import * as fs from 'node:fs';
import * as path from 'node:path';

interface UrlUpdate {
  id: string;
  name: string;
  websiteUrl?: string;
  labUrl?: string;
  profileUrl?: string;
}

const updates: UrlUpdate[] = [
  {
    id: 'vp-0005',
    name: 'Minh N. Do',
    websiteUrl: 'https://minhdo.ece.illinois.edu/',
    labUrl: 'https://imaging.csl.illinois.edu/',
    profileUrl: 'https://ece.illinois.edu/about/directory/faculty/minhdo'
  },
  {
    id: 'vp-0010',
    name: 'Viet Tung Hoang',
    websiteUrl: 'https://www.cs.fsu.edu/~tvhoang/',
    profileUrl: 'https://www.cs.fsu.edu/department/faculty/hoang/'
  },
  {
    id: 'vp-0013',
    name: 'Hung Manh La',
    labUrl: 'https://ara.cse.unr.edu/',
    profileUrl: 'https://www.unr.edu/cse/people/hung-la'
  },
  {
    id: 'vp-0038',
    name: 'Tu Nguyen - Kennesaw State University',
    websiteUrl: 'https://ksuweb.kennesaw.edu/~tnguy360/',
    profileUrl: 'https://ccse.kennesaw.edu/cs/about/faculty-staff.php'
  },
  {
    id: 'vp-0040',
    name: 'XuanLong Nguyen',
    websiteUrl: 'https://dept.stat.lsa.umich.edu/~xuanlong/',
    profileUrl: 'https://lsa.umich.edu/stat/people/faculty/xuanlong.html'
  },
  {
    id: 'vp-0041',
    name: 'Linh Thi Xuan Phan',
    websiteUrl: 'https://www.cis.upenn.edu/~linhphan/',
    labUrl: 'https://dsl.cis.upenn.edu/',
    profileUrl: 'https://directory.seas.upenn.edu/linh-thi-xuan-phan/'
  },
  {
    id: 'vp-0043',
    name: 'Phu Phung',
    websiteUrl: 'https://academic.udayton.edu/PhuPhung/',
    labUrl: 'https://udayton.edu/artssciences/academics/computerscience/research/insclab.php',
    profileUrl: 'https://udayton.edu/directory/artssciences/computerscience/phung-phu.php'
  },
  {
    id: 'vp-0044',
    name: 'My Thai',
    websiteUrl: 'https://www.cise.ufl.edu/~mythai/',
    labUrl: 'https://nelms.ece.ufl.edu/',
    profileUrl: 'https://cise.ufl.edu/people/faculty/name/my-thai/'
  },
  {
    id: 'vp-0045',
    name: 'Duc (David) Tran',
    websiteUrl: 'https://www.cs.umb.edu/~duc/www/',
    labUrl: 'https://www.cs.umb.edu/~duc/netlab/',
    profileUrl: 'https://www.umb.edu/directory/ductran/'
  },
  {
    id: 'vp-0047',
    name: 'Son Tran',
    websiteUrl: 'https://www.cs.nmsu.edu/~tson/',
    profileUrl: 'https://cs.nmsu.edu/people/faculty/son-tran.html'
  },
  {
    id: 'vp-0050',
    name: 'Huy T. Vo',
    websiteUrl: 'https://huytvo.github.io/',
    labUrl: 'https://vis.ccny.cuny.edu/',
    profileUrl: 'https://www.ccny.cuny.edu/profiles/huy-vo'
  },
  {
    id: 'vp-0051',
    name: 'Mai Vu',
    websiteUrl: 'https://sites.tufts.edu/mvu/',
    labUrl: 'https://sites.tufts.edu/wireless/',
    profileUrl: 'https://engineering.tufts.edu/ece/people/faculty/mai-vu'
  },
  {
    id: 'vp-0068',
    name: 'Huy Quang Nguyen',
    websiteUrl: 'https://www.math.umd.edu/~hnguye90/',
    profileUrl: 'https://www-math.umd.edu/people/faculty/item/1460-hnguye90.html'
  },
  {
    id: 'vp-0070',
    name: 'Xuan Hien Nguyen',
    websiteUrl: 'https://faculty.sites.iastate.edu/xhnguyen/',
    profileUrl: 'https://math.iastate.edu/directory/xuan-hien-nguyen/'
  },
  {
    id: 'vp-0071',
    name: 'Nghiem V. Nguyen',
    websiteUrl: 'https://sites.google.com/view/nghiemvnguyen/home',
    profileUrl: 'https://artsci.usu.edu/math-stats/directory/faculty/nguyen-nghiem'
  },
  {
    id: 'vp-0075',
    name: 'Duy Le',
    websiteUrl: 'https://sciences.ucf.edu/physics/duyle/',
    profileUrl: 'https://sciences.ucf.edu/physics/person/duy-le/'
  },
  {
    id: 'vp-0077',
    name: 'Tho Nguyen',
    labUrl: 'https://www.spintronics.uga.edu/',
    profileUrl: 'https://www.physast.uga.edu/directory/people/tho-nguyen'
  },
  {
    id: 'vp-0082',
    name: 'Trac D. Tran',
    labUrl: 'https://dsp.ece.jhu.edu/',
    profileUrl: 'https://engineering.jhu.edu/faculty/trac-tran/'
  },
  {
    id: 'vp-0084',
    name: 'Thuc-Quyen Nguyen',
    labUrl: 'https://nguyen.chem.ucsb.edu/',
    profileUrl: 'https://www.chem.ucsb.edu/people/thuc-quyen-nguyen'
  },
  {
    id: 'vp-0087',
    name: 'Tuan Vo-Dinh',
    labUrl: 'https://vodinh.pratt.duke.edu/',
    profileUrl: 'https://bme.duke.edu/faculty/tuan-vo-dinh'
  },
  {
    id: 'vp-0096',
    name: 'Trung Van Nguyen',
    labUrl: 'https://cpe.ku.edu/research/electrochemical-engineering',
    profileUrl: 'https://cpe.ku.edu/people/trung-van-nguyen'
  },
  {
    id: 'vp-0101',
    name: 'Kayla Nguyen',
    labUrl: 'https://www.thekaylanguyenlab.com/',
    profileUrl: 'https://physics.uoregon.edu/profile/kaylan/'
  },
  {
    id: 'vp-0105',
    name: 'Tran B. Nguyen',
    labUrl: 'https://air.ucdavis.edu/',
    profileUrl: 'https://etox.ucdavis.edu/people/tran-nguyen'
  },
  {
    id: 'vp-0115',
    name: 'Hoang Pham - Rutgers University',
    labUrl: 'https://ise.rutgers.edu/research/reliability-engineering',
    profileUrl: 'https://ise.rutgers.edu/faculty/hoang-pham'
  },
  {
    id: 'vp-0117',
    name: 'Helen Nguyen',
    labUrl: 'https://nguyen.cee.illinois.edu/',
    profileUrl: 'https://cee.illinois.edu/directory/profile/thn'
  },
  {
    id: 'vp-0123',
    name: 'Kytai Truong Nguyen',
    labUrl: 'https://websites.uta.edu/knguyen',
    profileUrl: 'https://www.uta.edu/academics/faculty/profile?user=knguyen'
  },
  {
    id: 'vp-0124',
    name: 'Nam T. Dinh',
    labUrl: 'https://multiphysics.ne.ncsu.edu/',
    profileUrl: 'https://www.ne.ncsu.edu/people/nam-dinh/'
  },
  {
    id: 'vp-0125',
    name: 'Juliane Nguyen',
    labUrl: 'https://julianenguyenlab.com/',
    profileUrl: 'https://pharmacy.unc.edu/directory/jnguyen/'
  },
  {
    id: 'vp-0132',
    name: 'Thao D. (Vicky) Nguyen',
    labUrl: 'https://vickynguyenlab.org/',
    profileUrl: 'https://me.jhu.edu/faculty/thao-vicky-nguyen/'
  },
  {
    id: 'vp-0210',
    name: 'Minh T. Nguyen',
    labUrl: 'https://www.anl.gov/cnm',
    profileUrl: 'https://www.anl.gov/profile/minh-nguyen'
  },
  {
    id: 'vp-0216',
    name: 'Trang T.H. Nguyen',
    websiteUrl: 'https://sites.google.com/view/trang-t-h-nguyen/',
    profileUrl: 'https://www.astate.edu/college/sciences-and-mathematics/departments/biology/faculty-staff/index.dot'
  },
  {
    id: 'vp-0233',
    name: 'Triet M. Truong',
    labUrl: 'https://truonglab.weebly.com/',
    profileUrl: 'https://www.shu.edu/profiles/triet-truong.cfm'
  },
  {
    id: 'vp-0235',
    name: 'Hoa T. Tran',
    labUrl: 'https://crsc.ncsu.edu/',
    profileUrl: 'https://math.sciences.ncsu.edu/people/tran/'
  },
  {
    id: 'vp-0243',
    name: 'Tuan-Anh Le',
    websiteUrl: 'https://tuananhle.co.uk/',
    profileUrl: 'https://www.cs.utah.edu/people/tuan-anh-le/'
  },
  {
    id: 'vp-0272',
    name: 'Viet-Anh Nguyen',
    websiteUrl: 'https://viet-anh-nguyen.com/',
    profileUrl: 'https://www.cs.duke.edu/people/viet-anh-nguyen'
  },
  {
    id: 'vp-0287',
    name: 'Mai Ngo',
    labUrl: 'https://ngolab.che.wisc.edu/',
    profileUrl: 'https://directory.engr.wisc.edu/che/faculty/ngo_mai'
  },
  {
    id: 'vp-0294',
    name: 'Luan Hoang',
    websiteUrl: 'https://www.math.ttu.edu/~lhoang',
    profileUrl: 'https://www.depts.ttu.edu/math/about/directory/bio/index.php?id=38'
  },
  {
    id: 'vp-0302',
    name: 'Thanh Thai Nguyen',
    websiteUrl: 'https://sites.google.com/view/thainguyenmath/home',
    profileUrl: 'https://udayton.edu/directory/artssciences/mathematics/nguyen-thanh-thai.php'
  },
  {
    id: 'vp-0307',
    name: 'Hai Dang Nguyen - University of Minnesota',
    labUrl: 'https://sites.google.com/umn.edu/hdnguyenlab/',
    profileUrl: 'https://med.umn.edu/bio/pharmacology/hai-dang-nguyen'
  },
  {
    id: 'vp-0323',
    name: 'Hanh Lam',
    labUrl: 'https://www.hanhlamlab.com/',
    profileUrl: 'https://vetmed.vt.edu/people/faculty/lam-hanh.html'
  },
  {
    id: 'vp-0331',
    name: 'Trang Le',
    websiteUrl: 'https://trang-le.github.io/',
    profileUrl: 'https://engineering.vanderbilt.edu/bio/trang-le'
  },
  {
    id: 'vp-0337',
    name: 'Vu L. Ngo',
    labUrl: 'https://www.ngomicrobiologylab.com/',
    profileUrl: 'https://biologicalsciences.cas.lehigh.edu/content/vu-ngo'
  },
  {
    id: 'vp-0373',
    name: 'Thao T. Do',
    labUrl: 'https://www.doresearchgroup.org/',
    profileUrl: 'https://chem.uri.edu/people/thao-do/'
  },
  {
    id: 'vp-0428',
    name: 'Huy Tran',
    labUrl: 'https://tran.aerospace.illinois.edu/',
    profileUrl: 'https://aerospace.illinois.edu/directory/profile/huytran'
  },
  {
    id: 'vp-0482',
    name: 'Bao Chau Ngo',
    websiteUrl: 'https://www.math.uchicago.edu/~ngo/',
    profileUrl: 'https://www.math.hku.hk/people/academic-staff/ngo-bao-chau'
  },
  {
    id: 'vp-0497',
    name: 'Tien Mai',
    websiteUrl: 'https://sites.google.com/view/tien-mai/home',
    profileUrl: 'https://faculty.smu.edu.sg/profile/tien-mai-471'
  },
  {
    id: 'vp-0499',
    name: 'San H. Thang',
    labUrl: 'https://www.monash.edu/science/schools/chemistry/our-research/research-groups/thang-group',
    profileUrl: 'https://research.monash.edu/en/persons/san-hoa-thang'
  },
  {
    id: 'vp-0501',
    name: 'Nam-Trung Nguyen',
    labUrl: 'https://www.griffith.edu.au/queensland-micro-nanotechnology-centre',
    profileUrl: 'https://experts.griffith.edu.au/18898-namtrung-nguyen'
  },
  {
    id: 'vp-0504',
    name: 'Hoang-Phuong Phan',
    labUrl: 'https://www.unsw.edu.au/engineering/our-research/research-facilities/biomedical-microdevices-laboratory',
    profileUrl: 'https://www.unsw.edu.au/staff/hoang-phuong-phan'
  },
  {
    id: 'vp-0515',
    name: 'Thi Kim Thanh Nguyen',
    labUrl: 'https://www.ntk-thanh.co.uk/',
    profileUrl: 'https://iris.ucl.ac.uk/iris/browse/profile?upi=NTKTH28'
  },
  {
    id: 'vp-0516',
    name: 'Trung Q. Duong',
    labUrl: 'https://www.mun.ca/engineering/research/cerc-in-next-generation-communications-technologies/',
    profileUrl: 'https://www.mun.ca/engineering/about/people/trung-duong/'
  },
  {
    id: 'vp-0525',
    name: 'Kim Nguyen',
    websiteUrl: 'https://usr.lmf.cnrs.fr/~kn/',
    profileUrl: 'https://lmf.cnrs.fr/Members/KimNguyen/'
  },
  {
    id: 'vp-0526',
    name: 'Phong Nguyen - École Normale Supérieure PSL',
    websiteUrl: 'https://www.di.ens.fr/~pnguyen/',
    profileUrl: 'https://www.di.ens.fr/en'
  },
  {
    id: 'vp-0533',
    name: 'Tu Bao Ho',
    websiteUrl: 'https://www.jaist.ac.jp/~bao/',
    profileUrl: 'https://www.jaist.ac.jp/english/'
  },
  {
    id: 'vp-0537',
    name: 'Xuan-Bach Le',
    websiteUrl: 'https://xuanbachle.github.io/',
    profileUrl: 'https://findanexpert.unimelb.edu.au/profile/866579-bach-le'
  },
  {
    id: 'vp-0539',
    name: 'Tuan Ngo',
    labUrl: 'https://eng.unimelb.edu.au/arc-prefabs',
    profileUrl: 'https://findanexpert.unimelb.edu.au/profile/13824-tuan-ngo'
  },
  {
    id: 'vp-0544',
    name: 'Anh Khoa Doan',
    websiteUrl: 'https://sites.google.com/view/anh-khoa-doan/',
    profileUrl: 'https://www.tudelft.nl/staff/a.k.doan/'
  },
  {
    id: 'vp-0571',
    name: 'Van Bang Le',
    websiteUrl: 'https://users.informatik.uni-rostock.de/~le/',
    profileUrl: 'https://www.informatik.uni-rostock.de/'
  },
  {
    id: 'vp-0572',
    name: 'Hung Son Nguyen',
    websiteUrl: 'https://www.mimuw.edu.pl/~son/',
    profileUrl: 'https://www.mimuw.edu.pl/'
  },
  {
    id: 'vp-0573',
    name: 'Linh Anh Nguyen',
    websiteUrl: 'https://www.mimuw.edu.pl/~nguyen/',
    profileUrl: 'https://www.mimuw.edu.pl/'
  },
  {
    id: 'vp-0574',
    name: 'Hung Viet Pham',
    websiteUrl: 'https://hvpham.github.io/',
    profileUrl: 'https://lassonde.yorku.ca/users/hung-viet-pham'
  },
  {
    id: 'vp-0576',
    name: 'Tien Tuan Anh Dinh',
    websiteUrl: 'https://dinhtta.github.io/',
    labUrl: 'https://blockchain.sutd.edu.sg/',
    profileUrl: 'https://istd.sutd.edu.sg/people/faculty/dinh-tien-tuan-anh'
  },
  {
    id: 'vp-0616',
    name: 'Nguyen Bac Dang',
    websiteUrl: 'https://www.imo.universite-paris-saclay.fr/~nguyen-bac.dang/',
    profileUrl: 'https://www.imo.universite-paris-saclay.fr/'
  },
  {
    id: 'vp-0625',
    name: 'Hai Son Nguyen',
    websiteUrl: 'https://www.normalesup.org/~haison/',
    profileUrl: 'https://www.ec-lyon.fr/contacts/hai-son-nguyen'
  },
  {
    id: 'vp-0627',
    name: 'Thanh-Phuong Nguyen',
    websiteUrl: 'https://webusers.i3s.unice.fr/~tpnguyen/index.html',
    profileUrl: 'https://i3s.univ-cotedazur.fr/'
  },
  {
    id: 'vp-0628',
    name: 'Thach Ngoc Dinh',
    websiteUrl: 'https://sites.google.com/site/ngocthachdinh/home',
    profileUrl: 'https://cedric.cnam.fr/lab/'
  },
  {
    id: 'vp-0632',
    name: 'Thành Nam Phan',
    websiteUrl: 'https://www.mathematik.uni-muenchen.de/~phan/',
    profileUrl: 'https://www.mathematik.uni-muenchen.de/'
  },
  {
    id: 'vp-0645',
    name: 'Martino Tran',
    labUrl: 'https://urban-predict.scarp.ubc.ca/',
    profileUrl: 'https://scarp.ubc.ca/people/martino-tran'
  },
  {
    id: 'vp-0649',
    name: 'Dao Nguyen',
    labUrl: 'https://www.mcgill.ca/amr/',
    profileUrl: 'https://www.mcgill.ca/microimm/dao-nguyen'
  },
  {
    id: 'vp-0681',
    name: 'Nam Ho-Nguyen',
    websiteUrl: 'https://sites.google.com/site/namhonguyen89/home',
    profileUrl: 'https://www.sydney.edu.au/business/about/our-people/academic-staff/nam-ho-nguyen.html'
  },
  {
    id: 'vp-0706',
    name: 'Hieu Pham Trung Nguyen',
    labUrl: 'https://www.depts.ttu.edu/ece/faculty/Hieu_Nguyen/research.php',
    profileUrl: 'https://www.depts.ttu.edu/ece/faculty/Hieu_Nguyen/index.php'
  },
  {
    id: 'vp-0707',
    name: 'Duy H. N. Nguyen',
    websiteUrl: 'https://duynguyen.sdsu.edu/',
    profileUrl: 'https://electrical.sdsu.edu/people/duy-nguyen'
  },
  {
    id: 'vp-0714',
    name: 'Andy I. Nguyen',
    labUrl: 'https://nguyen.chem.uic.edu/',
    profileUrl: 'https://chem.uic.edu/profiles/nguyen-andy/'
  },
  {
    id: 'vp-0722',
    name: 'Duy Duong-Tran',
    websiteUrl: 'https://sites.google.com/view/dduongtr/home',
    labUrl: 'https://www.csea-lab.org/',
    profileUrl: 'https://www.usna.edu/MathDept/faculty/duong-tran.php'
  },
  {
    id: 'vp-0736',
    name: 'Thi-Mai-Trang Nguyen',
    websiteUrl: 'https://www-l2ti.univ-paris13.fr/~thimaitrang.nguyen/',
    profileUrl: 'https://l2ti.univ-paris13.fr/'
  },
  {
    id: 'vp-0737',
    name: 'Thao Nguyen - Haverford College',
    websiteUrl: 'https://thao-nguyen-ai.github.io/',
    profileUrl: 'https://www.haverford.edu/faculty/tnguyen4'
  },
  {
    id: 'vp-0740',
    name: 'Loan Bui',
    websiteUrl: 'https://sites.google.com/view/buiresearchgroup/home',
    profileUrl: 'https://udayton.edu/directory/artssciences/biology/bui-loan.php'
  },
  {
    id: 'vp-0744',
    name: 'Tri Lai',
    websiteUrl: 'https://sites.google.com/view/trilai',
    profileUrl: 'https://math.unl.edu/tri-lai'
  },
  {
    id: 'vp-0752',
    name: 'Tam Le',
    websiteUrl: 'https://tamle-ml.github.io/',
    profileUrl: 'https://www.ism.ac.jp/index_e.html'
  },
  {
    id: 'vp-0802',
    name: 'Tan Minh Nguyen',
    websiteUrl: 'https://tanmnguyen89.github.io/',
    profileUrl: 'https://www.math.nus.edu.sg/people/tan-minh-nguyen/'
  },
  {
    id: 'vp-0805',
    name: 'Tuan Anh Nguyen',
    labUrl: 'https://nguyen-lab.com/',
    profileUrl: 'https://facultyprofiles.hkust.edu.hk/profiles.php?profile=tuan-anh-nguyen-tuananh'
  },
  {
    id: 'vp-0808',
    name: 'Viet Quoc Pham',
    websiteUrl: 'https://quocvietpham.com/',
    profileUrl: 'https://www.scss.tcd.ie/personnel/phamqv'
  },
  {
    id: 'vp-0816',
    name: 'Liem Nguyen - Case Western Reserve University',
    labUrl: 'https://case.edu/medicine/pathology/research/laboratories/liem-nguyen-laboratory',
    profileUrl: 'https://case.edu/medicine/pathology/faculty/liem-nguyen'
  },
  {
    id: 'vp-0843',
    name: 'Van-Nam Huynh',
    websiteUrl: 'http://www.jaist.ac.jp/~huynh/dokuwiki/doku.php?id=user%3Anamhuynh%3Astart',
    profileUrl: 'https://www.jaist.ac.jp/english/'
  },
  {
    id: 'vp-1146',
    name: 'Dinh C. Nguyen',
    labUrl: 'https://lcls.slac.stanford.edu/',
    profileUrl: 'https://scholar.google.com/citations?user=E7_vH5sAAAAJ'
  },
  {
    id: 'vp-1183',
    name: 'Hong-Linh Truong',
    websiteUrl: 'https://users.aalto.fi/~truongh4/',
    labUrl: 'https://rdsea.github.io/',
    profileUrl: 'https://research.aalto.fi/en/persons/hong-linh-truong'
  },
  {
    id: 'vp-1234',
    name: 'Kim-Anh Lê Cao',
    labUrl: 'https://mixomics.org/',
    profileUrl: 'https://findanexpert.unimelb.edu.au/profile/735073-kim-anh-le-cao'
  },
  {
    id: 'vp-1236',
    name: 'Nhan Viet Tran',
    websiteUrl: 'https://fastmachinelearning.org/',
    labUrl: 'https://fastmachinelearning.org/',
    profileUrl: 'https://ccd.fnal.gov/'
  },
  {
    id: 'vp-1237',
    name: 'Vân Anh Huynh-Thu',
    websiteUrl: 'https://www.montefiore.uliege.be/~huynh-thu/',
    profileUrl: 'https://www.uliege.be/'
  },
  {
    id: 'vp-1248',
    name: 'Thi Hoang Duong Nguyen',
    labUrl: 'https://www2.mrc-lmb.cam.ac.uk/groups/tnguyen/',
    profileUrl: 'https://www2.mrc-lmb.cam.ac.uk/group-leaders/n-to-s/thi-hoang-duong-nguyen/'
  },
  {
    id: 'vp-1249',
    name: 'Nguyen Dinh Dang',
    websiteUrl: 'https://ribf.riken.jp/~dang/',
    profileUrl: 'https://www.riken.jp/en/'
  },
  {
    id: 'vp-1258',
    name: 'Anh-Tu Nguyen',
    websiteUrl: 'https://sites.google.com/view/anh-tu-nguyen',
    profileUrl: 'https://www.uphf.fr/lamih/membres/anh-tu-nguyen'
  },
  {
    id: 'vp-1322',
    name: 'Thinh T. Doan',
    websiteUrl: 'https://thinhdoan.github.io/',
    labUrl: 'https://sites.google.com/view/thinh-doan/home',
    profileUrl: 'https://www.ece.utexas.edu/people/faculty/thinh-doan'
  },
  {
    id: 'vp-1323',
    name: 'Cao-Thang Dinh',
    labUrl: 'https://dinhlab.ca/',
    profileUrl: 'https://chemeng.queensu.ca/people/faculty/cao-thang-dinh.html'
  },
  {
    id: 'vp-1444',
    name: 'Hoai An Le Thi',
    websiteUrl: 'https://lita.univ-lorraine.fr/~lethi/',
    profileUrl: 'https://lita.univ-lorraine.fr/'
  },
  {
    id: 'vp-1491',
    name: 'Ton An Bui',
    websiteUrl: 'https://www.math.ubc.ca/~bui/',
    profileUrl: 'https://www.math.ubc.ca/people/faculty'
  }
];

const dataPath = path.resolve('public/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const now = new Date().toISOString();
let applied = 0;

for (const upd of updates) {
  const p = data.find((x: any) => x.id === upd.id);
  if (!p) {
    console.error(`Not found: ${upd.id} (${upd.name})`);
    continue;
  }

  if (upd.websiteUrl) p.websiteUrl = upd.websiteUrl;
  if (upd.labUrl) p.labUrl = upd.labUrl;
  if (upd.profileUrl) p.profileUrl = upd.profileUrl;

  p.lastUpdatedAt = now;
  applied++;
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n');
console.log(`Successfully updated personal/lab websites for ${applied}/${updates.length} STEM and CS faculty.`);
