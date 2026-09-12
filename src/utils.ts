const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value: unknown): string {
  if (value == null) return '';
  return String(value).replace(/[&<>"']/g, (character) => HTML_ENTITIES[character]);
}

const rosterDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

const rosterShortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'numeric',
  day: 'numeric',
  year: '2-digit',
  timeZone: 'UTC',
});

type DateInput = string | number | Date;

function toDate(value: DateInput): Date {
  return value instanceof Date ? value : new Date(value);
}

export function formatRosterDate(timestamp: DateInput): string {
  const date = toDate(timestamp);
  return Number.isNaN(date.valueOf()) ? '' : rosterDateFormatter.format(date);
}

export function formatRosterShortDate(timestamp: DateInput): string {
  const date = toDate(timestamp);
  return Number.isNaN(date.valueOf()) ? '' : rosterShortDateFormatter.format(date);
}

export function showToast(message: string, durationMs = 2500): void {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById('vietprofs-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'vietprofs-toast';
  toast.className = 'toast-notification';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('toast-visible');
  });

  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 300);
  }, durationMs);
}

const INSIGHT_ABBREVIATIONS: [RegExp, string][] = [
  [/\bJohns Hopkins University\b/g, 'JHU'],
  [/\bJohns Hopkins\b/g, 'JHU'],
  [/\bMassachusetts Institute of Technology\b/g, 'MIT'],
  [/\bNew York University\b/g, 'NYU'],
  [/\bUniversity of California, Berkeley\b/g, 'UC Berkeley'],
  [/\bUniversity of California, Los Angeles\b/g, 'UCLA'],
  [/\bUniversity of California, San Diego\b/g, 'UCSD'],
  [/\bUniversity of California, Davis\b/g, 'UC Davis'],
  [/\bUniversity of California, Irvine\b/g, 'UCI'],
  [/\bUniversity of California, San Francisco\b/g, 'UCSF'],
  [/\bUniversity of California, Santa Barbara\b/g, 'UCSB'],
  [/\bUniversity of California, Santa Cruz\b/g, 'UCSC'],
  [/\bUniversity of California, Riverside\b/g, 'UCR'],
  [/\bUniversity of California\b/g, 'UC'],
  [/\bCarnegie Mellon University\b/g, 'CMU'],
  [/\bPennsylvania State University\b/g, 'Penn State'],
  [/\bPenn State University\b/g, 'Penn State'],
  [/\bGeorgia Institute of Technology\b/g, 'Georgia Tech'],
  [/\bCalifornia Institute of Technology\b/g, 'Caltech'],
  [/\bUniversity of Illinois Urbana-Champaign\b/g, 'UIUC'],
  [/\bUniversity of Illinois at Urbana-Champaign\b/g, 'UIUC'],
  [/\bUniversity of Texas at Austin\b/g, 'UT Austin'],
  [/\bUniversity of Texas Southwestern Medical Center\b/g, 'UT Southwestern'],
  [/\bUniversity of Michigan\b/g, 'UMich'],
  [/\bUniversity of Washington\b/g, 'UW'],
  [/\bUniversity of Pennsylvania\b/g, 'Penn'],
  [/\bNanyang Technological University\b/g, 'NTU'],
  [/\bNational University of Singapore\b/g, 'NUS'],
  [/\bUniversity of Technology Sydney\b/g, 'UTS'],
  [/\bStanford University\b/g, 'Stanford'],
  [/\bHarvard University\b/g, 'Harvard'],
  [/\bColumbia University\b/g, 'Columbia'],
  [/\bCornell University\b/g, 'Cornell'],
  [/\bYale University\b/g, 'Yale'],
  [/\bPrinceton University\b/g, 'Princeton'],
  [/\bBrown University\b/g, 'Brown'],
  [/\bNorthwestern University\b/g, 'Northwestern'],
  [/\bComputer Science & Software Eng\.\b/g, 'CS & Software Eng.'],
  [/\bComputer Science\b/g, 'CS'],
  [/\bElectrical & Computer Eng\.\b/g, 'ECE'],
  [/\bElectrical Engineering\b/g, 'EE'],
  [/\bMechanical Engineering\b/g, 'MechE'],
  [/\bCivil & Environmental Eng\.\b/g, 'CEE'],
  [/\bBiomedical Engineering\b/g, 'BME'],
  [/\bChemical Engineering\b/g, 'ChemE'],
  [/\bAerospace Engineering\b/g, 'AeroE'],
  [/\bIndustrial & Systems Eng\.\b/g, 'ISE'],
  [/\bMaterials Science & Eng\.\b/g, 'MSE'],
  [/\bHealth Sciences & Clinical Medicine\b/g, 'Health Sci. & Med.'],
  [/\bBiological & Life Sciences\b/g, 'Bio & Life Sci.'],
  [/\bMathematics & Statistics\b/g, 'Math & Stats'],
  [/\bPhysics & Astronomy\b/g, 'Physics & Ast.'],
  [/\bChemistry & Materials\b/g, 'Chem & Mat.'],
  [/\bBusiness & Management\b/g, 'Biz & Mgmt.'],
  [/\bEconomics & Finance\b/g, 'Econ & Fin.'],
  [/\bSocial Sciences & Policy\b/g, 'Social Sci.'],
  [/\bHumanities & Arts\b/g, 'Humanities'],
  [/\bDepartment of\b/g, 'Dept. of'],
  [/\bDepartment\b/g, 'Dept.'],
  [/\bUnited States\b/g, 'U.S.'],
  [/\bUnited Kingdom\b/g, 'UK'],
  [/\bUniversity\b/g, 'Univ.'],
  [/\bInstitutions\b/g, 'Inst.'],
  [/\bInstitution\b/g, 'Inst.'],
];

export function abbreviateInsightText(text: string): string {
  if (!text) return '';
  let result = text;
  for (const [pattern, replacement] of INSIGHT_ABBREVIATIONS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}
