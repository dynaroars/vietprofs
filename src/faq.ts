import './style.css';

const app = document.getElementById('app')!;
const base = import.meta.env.BASE_URL;

function runningHead(): string {
  return `<p class="man-running-head">
    <span>FAQ(1)</span>
    <span class="man-running-title"><a class="man-running-brand" href="${base}index.html" aria-label="VietProfs directory"><img class="brand-logo" src="${base}vietprofs-bamboo-v.svg" alt="" width="20" height="20"><span class="man-running-label">VietProfs Frequently Asked Questions</span></a></span>
    <span>FAQ(1)</span>
  </p>`;
}

function footer(): string {
  return `<footer class="man-footer"><p>
    <a href="${base}index.html">← Back to Directory</a> ·
    <a href="${base}stats.html">Visitor Statistics</a> ·
    <a href="${base}index.html?view=health">Data Health &amp; Completeness</a> ·
    <a href="${base}index.html?view=insights">Diaspora Insights &amp; Pathways</a> ·
    <a href="${base}connections.html">Academic Connections</a> ·
    <a href="${base}submit.html">Submit / Update</a> ·
    <a href="https://github.com/dynaroars/vietprofs" target="_blank" rel="noopener noreferrer">GitHub</a>
  </p></footer>`;
}

function renderFaqPage(): string {
  return `<main><article class="man-page stats-man-page faq-man-page">
    ${runningHead()}

    <section class="man-section name-section">
      <div class="identity">
        <div class="identity-details">
          <div class="name-heading">
            <h1>VietProfs FAQ</h1>
          </div>
          <p class="synopsis">Frequently asked questions regarding eligibility, inclusion criteria, maintenance philosophy, multi-agent automation, and platform features.</p>
        </div>
      </div>
    </section>

    <section class="man-section">
      <h2>TABLE OF CONTENTS</h2>
      <div class="faq-toc">
        <ol>
          <li><a href="#general-purpose">General &amp; Purpose</a></li>
          <li><a href="#eligibility-criteria">Eligibility &amp; Inclusion Criteria</a></li>
          <li><a href="#maintenance-automation">How the Website is Maintained &amp; Kept Live</a></li>
          <li><a href="#features-capabilities">Features &amp; Capabilities</a></li>
          <li><a href="#dataset-access">Dataset &amp; Access</a></li>
        </ol>
      </div>
    </section>

    <section class="man-section" id="general-purpose">
      <h2>GENERAL &amp; PURPOSE</h2>

      <div class="faq-item">
        <h3 class="faq-question">What is VietProfs?</h3>
        <div class="faq-answer">
          <p><strong>VietProfs</strong> (<a href="https://vietprofs.roars.dev" target="_blank" rel="noopener noreferrer">vietprofs.roars.dev</a>) is an open-access, searchable directory documenting Vietnamese-heritage faculty and permanent research scientists worldwide. Each profile pairs an authentic Vietnamese-diacritic name and portrait with verified institutional affiliations, rank, department, appointment track, educational history, research keywords, curated major honors, and direct web links.</p>
        </div>
      </div>

      <div class="faq-item">
        <h3 class="faq-question">Why was VietProfs created?</h3>
        <div class="faq-answer">
          <p>Before VietProfs, Vietnamese-heritage scholars were scattered across thousands of departmental websites across dozens of countries with no centralized record. VietProfs serves several practical purposes:</p>
          <ul>
            <li><strong>Finding Mentors and Advisors:</strong> Prospective graduate and undergraduate students can quickly discover mentors who share their cultural background and research interests.</li>
            <li><strong>Cross-Institutional Collaboration:</strong> Researchers can find peers and collaborators in their geographic region or discipline.</li>
            <li><strong>Event Organization:</strong> Conference organizers, professional societies, and student associations can find keynote speakers, panelists, and committee chairs.</li>
            <li><strong>Documenting Multi-Generational Contributions:</strong> Preserving the long historical record of Vietnamese scholarly contributions abroad—from early pioneers like Bửu-Hội Nguyễn-Phúc (1939 Paris doctorate; CNRS Director of Research) and Xương Nguyễn-Hữu (1962 UC Berkeley PhD; UC San Diego) to newly minted assistant professors.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item">
        <h3 class="faq-question">Is VietProfs a ranking system?</h3>
        <div class="faq-answer">
          <p><strong>No.</strong> VietProfs is strictly a curated community directory and discovery tool. It does not rank scholars, institutions, or departments, nor does it evaluate individual research performance or prestige.</p>
        </div>
      </div>
    </section>

    <section class="man-section" id="eligibility-criteria">
      <h2>ELIGIBILITY &amp; INCLUSION CRITERIA</h2>

      <div class="faq-item">
        <h3 class="faq-question">Who is eligible to be listed?</h3>
        <div class="faq-answer">
          <p>To be included in VietProfs, a scholar must satisfy two concurrent requirements supported by verifiable public evidence (such as an official institutional webpage):</p>
          <ol>
            <li><strong>Academic Appointment Outside Vietnam:</strong> A verified appointment at a recognized university or eligible public/nonprofit research institute outside Vietnam (or formally conferred Emeritus status / authoritative historical record for deceased scholars).</li>
            <li><strong>Accepted Track:</strong> The appointment must fall into one of the recognized appointment tracks.</li>
          </ol>
        </div>
      </div>

      <div class="faq-item">
        <h3 class="faq-question">What appointment tracks are accepted?</h3>
        <div class="faq-answer">
          <p>VietProfs recognizes seven distinct appointment tracks:</p>
          <ul>
            <li><strong>Tenure-line:</strong> Tenure-track or tenured faculty (Assistant Professor, Associate Professor, Full Professor, Chaired/Distinguished Professor).</li>
            <li><strong>Teaching:</strong> Full-time, stable, continuing non-tenure-track teaching faculty (e.g., Professor of Instruction, Professor of the Practice, Senior Lecturer with permanent appointment).</li>
            <li><strong>Research:</strong> Permanent or stable faculty-equivalent research scientists at universities or eligible public/nonprofit research institutes (e.g., CNRS, Max Planck, INRIA, CSIRO, NIH, RIKEN) who lead research groups and mentor students.</li>
            <li><strong>Clinical:</strong> Stable clinical-faculty appointments (e.g., Clinical Professor, Clinical Associate Professor) on a documented institutional ladder.</li>
            <li><strong>Academic Staff:</strong> University librarians or archivists with documented faculty rank or permanent academic status.</li>
            <li><strong>Emeritus:</strong> Formally conferred emeritus or emerita faculty.</li>
            <li><strong>Deceased:</strong> Historical scholars who held an eligible faculty or permanent research appointment outside Vietnam during their active careers.</li>
          </ul>
          <p>For complete criteria and verification guidelines, see <a href="https://github.com/dynaroars/vietprofs/blob/main/ROSTER_MAINTENANCE.md" target="_blank" rel="noopener noreferrer"><code>ROSTER_MAINTENANCE.md</code></a>.</p>
        </div>
      </div>

      <div class="faq-item">
        <h3 class="faq-question">Why are positions in Vietnam not listed?</h3>
        <div class="faq-answer">
          <p>In Vietnam, virtually all faculty are Vietnamese, and domestic university directories already list them. The Vietnamese <em>diaspora</em>, however, is dispersed across hundreds of institutions in more than 30 countries without any central registry. Focusing outside Vietnam addresses this specific discoverability gap.</p>
        </div>
      </div>

      <div class="faq-item">
        <h3 class="faq-question">Why are postdocs, adjuncts, visiting scholars, and industry roles excluded?</h3>
        <div class="faq-answer">
          <ul>
            <li><strong>Stability:</strong> Postdoctoral, visiting, adjunct, and term-limited appointments typically last only 1–3 years. Including high-turnover temporary positions would quickly degrade directory accuracy and fill the database with stale records.</li>
            <li><strong>Scope:</strong> Commercial research labs (e.g., corporate AI or industrial R&amp;D labs) are outside the scope of VietProfs, which focuses on academic institutions and public/nonprofit research institutes.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item">
        <h3 class="faq-question">Are non-university research institutes included?</h3>
        <div class="faq-answer">
          <p><strong>Yes</strong>, provided they are public, national, or independent nonprofit scholarly research bodies (e.g., CNRS/INSERM/INRIA in France, Max Planck/Helmholtz in Germany, CSIRO in Australia, RIKEN in Japan, or NIH intramural research). These entries are explicitly labeled with their institution type.</p>
        </div>
      </div>

      <div class="faq-item">
        <h3 class="faq-question">How is Vietnamese heritage determined?</h3>
        <div class="faq-answer">
          <ul>
            <li><strong>Search leads, not identity tests:</strong> Common Vietnamese surnames and given-name tokens are used purely as initial discovery leads to locate departmental pages on the open web.</li>
            <li><strong>No intrusive heritage tests:</strong> Once an individual holds an eligible academic appointment, VietProfs does not require or demand documentary proof of ethnicity or heritage.</li>
            <li><strong>Inclusive and respectful:</strong> VietProfs recognizes that surnames are neither necessary nor sufficient (e.g., scholars who changed surnames through marriage or adoption, or non-Vietnamese individuals sharing common romanized surnames). Anyone misidentified or wishing to opt out is promptly removed upon request.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item">
        <h3 class="faq-question">How can I request an addition, correction, or profile removal?</h3>
        <div class="faq-answer">
          <ul>
            <li><strong>Public Submission Form:</strong> Anyone can suggest a new candidate or propose updates via the <a href="${base}submit.html">Public Submission Form</a>.</li>
            <li><strong>GitHub Issues:</strong> Submissions and feedback can also be filed directly on the <a href="https://github.com/dynaroars/vietprofs/issues" target="_blank" rel="noopener noreferrer">VietProfs GitHub Repository</a>.</li>
            <li><strong>Opt-Out / Removal:</strong> If you are listed and wish to update your information or be removed, submit a request through the form or file an issue; requests are processed promptly.</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="man-section" id="maintenance-automation">
      <h2>HOW THE WEBSITE IS MAINTAINED &amp; KEPT LIVE</h2>

      <div class="faq-item">
        <h3 class="faq-question">How does VietProfs stay up-to-date?</h3>
        <div class="faq-answer">
          <p>Public directories often succumb to "link rot" and data staleness as faculty change universities, get promoted, retire, or update their websites. VietProfs solves this through a continuous <strong>hybrid human-in-the-loop and autonomous AI maintenance system</strong> documented in <a href="https://github.com/dynaroars/vietprofs/blob/main/docs/AUTOMATION.md" target="_blank" rel="noopener noreferrer"><code>docs/AUTOMATION.md</code></a>.</p>
        </div>
      </div>

      <div class="faq-item">
        <h3 class="faq-question">What is the core maintenance philosophy?</h3>
        <div class="faq-answer">
          <blockquote>"AI proposes, evidence decides."</blockquote>
          <p>Automated LLM agents are restricted to information retrieval, webpage parsing, and structured patch proposals. No AI model can directly mutate the canonical roster. All proposals must pass deterministic schema, track, URL, provenance, and target-scope validation gates before being merged.</p>
        </div>
      </div>

      <div class="faq-item">
        <h3 class="faq-question">How does the scheduled multi-agent automation work?</h3>
        <div class="faq-answer">
          <p>VietProfs operates two continuous loops:</p>
          <ol>
            <li><strong>Candidate Expansion Loop:</strong> Identifying new eligible faculty leads through crowdsourced submissions, community networks (e.g., LinkedIn academic clusters), and targeted web searches.</li>
            <li><strong>Periodic Revalidation Loop:</strong> Regularly auditing existing records against live university pages to refresh ranks, detect relocations, backfill degrees and Google Scholar profiles, and update honors.</li>
          </ol>
          <p>A fleet of scheduled cloud routines runs on a predictable cadence:</p>
          <ul>
            <li><strong>Daily Auditor:</strong> Runs daily to independently re-verify open PRs and candidate issues.</li>
            <li><strong>LinkedIn Backfill:</strong> Sweeps entries to verify and link authentic professional profiles.</li>
            <li><strong>Google Scholar Backfill:</strong> Discovers and validates publication profiles.</li>
            <li><strong>Websites &amp; Lab URLs:</strong> Verifies official directory links and personal lab homepages.</li>
            <li><strong>Portraits Sweep:</strong> Ingests and optimizes high-resolution, verified portrait photos with provenance.</li>
            <li><strong>Education Chronology:</strong> Audits undergraduate, master's, and PhD degrees for chronological integrity.</li>
            <li><strong>Honors &amp; Awards Triage:</strong> Audits major disciplinary awards against official awarding bodies.</li>
            <li><strong>Academic Relationships:</strong> Discovers and validates advisor-advisee and co-affiliation connections.</li>
            <li><strong>Faculty Discovery:</strong> Bounded searches across under-represented institutions and fields.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item">
        <h3 class="faq-question">What is the Producer-Auditor architecture?</h3>
        <div class="faq-answer">
          <p>To guarantee data integrity, VietProfs uses an independent two-tier agent model:</p>
          <ul>
            <li><strong>Producers (Worker Agents):</strong> Perform focused research playbooks in capped batches (e.g., backfilling missing links or education). Producers <em>never</em> merge pull requests or push directly to <code>main</code> (with narrow exceptions for relationship data).</li>
            <li><strong>The Auditor Agent:</strong> A separate, higher-capacity model runs daily on a minimum 12-hour delay. It checks out a clean clone of <code>main</code>, re-verifies every changed record against the live web, tests the build and test suite (<code>npm test</code>, <code>npm run build</code>), and only then squash-merges valid PRs or closes verified Issues.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item">
        <h3 class="faq-question">What are "Side Findings"?</h3>
        <div class="faq-answer">
          <p>When a producer agent is auditing an entry for one task (e.g., checking a Google Scholar URL), it often notices unrelated changes (e.g., a promotion to Full Professor, a relocation to a new university, a missing prestigious award, or a duplicate record).</p>
          <p>Instead of making unauthorized out-of-scope edits, the agent files a structured <strong>Side Finding Issue</strong>. The daily auditor then independently verifies the finding and updates the database.</p>
        </div>
      </div>

      <div class="faq-item">
        <h3 class="faq-question">How is human ground-truth protected from bot overwrites?</h3>
        <div class="faq-answer">
          <p>When a scholar or contributor directly submits verified facts (such as correct Vietnamese diacritics, joint appointments, or mid-career degrees), those attributes are registered in an immutable <code>directFields</code> list on the entry.</p>
          <p>Automated maintenance bots are strictly forbidden from modifying or deleting protected <code>directFields</code>, preventing scrapers from overwriting human ground truth with stripped or outdated web data.</p>
        </div>
      </div>

      <div class="faq-item">
        <h3 class="faq-question">How does VietProfs prevent "soft-404" errors and broken links?</h3>
        <div class="faq-answer">
          <p>Modern university websites often catch deleted faculty pages and silently redirect them (HTTP 301/302) to generic department landing pages or admissions portals with a <code>200 OK</code> status code.</p>
          <p>VietProfs avoids this "soft-404 fallacy" by requiring <strong>semantic liveness verification</strong>: the system confirms that the scholar's actual name and department appear on the destination page before accepting the link as valid.</p>
        </div>
      </div>

      <div class="faq-item">
        <h3 class="faq-question">How are honors and awards curated without CV inflation?</h3>
        <div class="faq-answer">
          <p>To prevent CV padding (such as departmental travel grants, routine paper acceptances, or student prizes), VietProfs restricts the <code>honors</code> field to five strict, schema-enforced categories backed by HTTPS provenance URLs:</p>
          <ol>
            <li><code>academy</code>: Election to national/international learned academies (e.g., National Academy of Engineering, National Academy of Sciences).</li>
            <li><code>fellow</code>: Fellow status in major disciplinary societies (e.g., IEEE Fellow, ACM Fellow, AAAS Fellow).</li>
            <li><code>career_award</code>: Highly competitive national early-career awards (e.g., NSF CAREER, Sloan Research Fellowship).</li>
            <li><code>major_award</code>: Major international or field-wide medals, lifetime achievement prizes, and test-of-time awards.</li>
            <li><code>distinguished_professorship</code>: Named endowed chairs and university-wide distinguished professorships.</li>
          </ol>
        </div>
      </div>
    </section>

    <section class="man-section" id="features-capabilities">
      <h2>FEATURES &amp; CAPABILITIES</h2>

      <div class="faq-item">
        <h3 class="faq-question">What search and filtering capabilities does the site offer?</h3>
        <div class="faq-answer">
          <ul>
            <li><strong>Zero-Latency In-Browser Search:</strong> The full dataset and search index load client-side for instant, responsive searching without server-side lag.</li>
            <li><strong>Faceted Combinable Filters:</strong> Filter simultaneously by Geographic Region (US, Continents, or specific Countries), Broad Field of Study, and Appointment Track.</li>
            <li><strong>Scoped Search:</strong> Users can target queries to specific fields using the search scope selector:
              <ul>
                <li><code>All Fields</code></li>
                <li><code>Name</code> (English or Vietnamese diacritic)</li>
                <li><code>University</code></li>
                <li><code>Department</code></li>
                <li><code>Rank / Title</code></li>
                <li><code>Research Area</code></li>
                <li><code>Honors &amp; Awards</code></li>
                <li><code>PhD Institution</code></li>
              </ul>
            </li>
            <li><strong>Shareable &amp; Bookmarkable URLs:</strong> Every search query and filter combination automatically synchronizes with URL parameters (e.g., <code>?q=robotics&amp;track=tenure-line&amp;country=Australia</code>).</li>
            <li><strong>Keyboard Shortcuts:</strong> Press <code>?</code> anywhere on the site to view quick keyboard shortcuts (<code>/</code> to focus search, <code>Esc</code> to clear, <code>j</code>/<code>k</code> navigation).</li>
          </ul>
        </div>
      </div>

      <div class="faq-item">
        <h3 class="faq-question">How does diacritic-insensitive search work?</h3>
        <div class="faq-answer">
          <p>Vietnamese names often lose their diacritics on Western university websites. VietProfs builds a normalized, accent-folded search index: searching for <code>Nguyen</code>, <code>Nguyễn</code>, or <code>nguyen</code> matches seamlessly across both standard English forms and authentic Vietnamese diacritics.</p>
        </div>
      </div>

      <div class="faq-item">
        <h3 class="faq-question">What interactive data visualizations and leaderboards are available?</h3>
        <div class="faq-answer">
          <ul>
            <li><strong>Interactive U.S. Choropleth Map:</strong> Selecting the U.S. view renders an interactive state grid map shaded by faculty concentration. Clicking any state immediately filters the directory.</li>
            <li><strong>Dynamic Leaderboards:</strong> Real-time leaderboards compute the <strong>Top Faculty Hubs</strong> (institutions employing the most diaspora faculty) and <strong>Top PhD Alma Maters</strong> for whichever subset is currently filtered. Clicking any institution instantly scopes the roster to that school.</li>
            <li><strong>"Show me something interesting":</strong> Clicking the dynamic insight button reveals real-time aggregate statistics, top feeder schools, generational cohorts, and geographic distribution.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item">
        <h3 class="faq-question">What is the Academic Connections / Genealogy network?</h3>
        <div class="faq-answer">
          <p>VietProfs includes a verified academic relationship graph mapping connections between scholars, such as:</p>
          <ul>
            <li>Doctoral advisor ↔ PhD student relationships.</li>
            <li>Postdoctoral mentor ↔ mentee connections.</li>
            <li>Co-affiliation and lab lineages.</li>
          </ul>
          <p>These relationships are displayed directly on individual profile pages and in the interactive <a href="${base}connections.html">Academic Connections Explorer</a>.</p>
        </div>
      </div>

      <div class="faq-item">
        <h3 class="faq-question">What information is shown on each profile card?</h3>
        <div class="faq-answer">
          <p>Each profile card displays:</p>
          <ul>
            <li><strong>Portrait &amp; Provenance:</strong> High-resolution local WebP headshot with attribution link.</li>
            <li><strong>Bilingual Name:</strong> English published name alongside authentic Vietnamese diacritics (<code>vietnameseName</code>).</li>
            <li><strong>Affiliation:</strong> Current rank, department, university/institute, city, state/province, and country flag.</li>
            <li><strong>Appointment Track &amp; Institution Type:</strong> Clearly distinguishing tenure-line, teaching, research, clinical, staff, or emeritus roles.</li>
            <li><strong>Education History:</strong> Chronological records of undergraduate, master's, PhD, and postdoctoral training.</li>
            <li><strong>Curated Honors:</strong> Badges for academy memberships, society fellowships, career awards, and endowed chairs.</li>
            <li><strong>Research Areas:</strong> Clickable keyword tags.</li>
            <li><strong>Direct Links:</strong> One-click links to official university profile pages, personal/lab websites, and Google Scholar.</li>
            <li><strong>Freshness Timestamp:</strong> <code>lastUpdatedAt</code> showing exactly when the profile was last revalidated against the live web.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item">
        <h3 class="faq-question">Are dynamic statistics stored statically or computed live?</h3>
        <div class="faq-answer">
          <p>All summary statistics, leaderboards, and aggregate metrics are <strong>computed dynamically at runtime</strong> from the underlying data. This prevents stale statistical claims from lingering when scholars relocate, get promoted, or join the roster.</p>
        </div>
      </div>
    </section>

    <section class="man-section" id="dataset-access">
      <h2>DATASET &amp; ACCESS</h2>

      <div class="faq-item">
        <h3 class="faq-question">Where can I access the open dataset and academic paper?</h3>
        <div class="faq-answer">
          <ul>
            <li><strong>Live Directory:</strong> <a href="https://vietprofs.roars.dev" target="_blank" rel="noopener noreferrer">https://vietprofs.roars.dev</a></li>
            <li><strong>Academic Paper:</strong> <a href="${base}vietprofs.pdf" target="_blank" rel="noopener noreferrer">Read the full paper (PDF)</a> or on <a href="https://arxiv.org/abs/2609.06091" target="_blank" rel="noopener noreferrer">arXiv (2609.06091)</a></li>
            <li><strong>GitHub Repository:</strong> <a href="https://github.com/dynaroars/vietprofs" target="_blank" rel="noopener noreferrer">github.com/dynaroars/vietprofs</a></li>
            <li><strong>Hugging Face Dataset:</strong> <a href="https://huggingface.co/datasets/nguyenthanhvuh/vietprofs" target="_blank" rel="noopener noreferrer">huggingface.co/datasets/nguyenthanhvuh/vietprofs</a></li>
            <li><strong>Visitor Statistics:</strong> <a href="${base}stats.html">vietprofs.roars.dev/stats.html</a></li>
            <li><strong>Academic Connections:</strong> <a href="${base}connections.html">vietprofs.roars.dev/connections.html</a></li>
            <li><strong>Public Submission Form:</strong> <a href="${base}submit.html">https://vietprofs.roars.dev/submit.html</a></li>
          </ul>
        </div>
      </div>
    </section>

    ${footer()}
  </article></main>`;
}

app.innerHTML = renderFaqPage();
