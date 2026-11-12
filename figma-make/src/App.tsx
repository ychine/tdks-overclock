import { useEffect, useRef, useState, type ReactNode } from "react";

type Screen =
  | "home"
  | "upload"
  | "reading"
  | "review"
  | "summary"
  | "salary"
  | "chat"
  | "compare"
  | "questions"
  | "help";

type IconName =
  | "home"
  | "upload"
  | "file"
  | "spark"
  | "wallet"
  | "chat"
  | "compare"
  | "help"
  | "sun"
  | "moon"
  | "arrow"
  | "camera"
  | "image"
  | "lock"
  | "check"
  | "alert"
  | "sound"
  | "send"
  | "phone"
  | "map"
  | "chevron"
  | "plus"
  | "close"
  | "wifi"
  | "refresh";

const paths: Record<IconName, ReactNode> = {
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10M9 20v-6h6v6" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V3m0 0L7 8m5-5 5 5" />
      <path d="M5 14v6h14v-6" />
    </>
  ),
  file: (
    <>
      <path d="M6 2h8l4 4v16H6z" />
      <path d="M14 2v5h5M9 12h6M9 16h6" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4z" />
      <path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z" />
    </>
  ),
  wallet: (
    <>
      <path d="M3 6h15a2 2 0 0 1 2 2v11H3z" />
      <path d="M3 7V4h14v3M15 12h7v4h-7z" />
    </>
  ),
  chat: (
    <>
      <path d="M4 4h16v13H9l-5 4z" />
      <path d="M8 9h8M8 13h5" />
    </>
  ),
  compare: (
    <>
      <path d="M8 3 4 7l4 4M4 7h13M16 21l4-4-4-4m4 4H7" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.8 9a2.4 2.4 0 1 1 3.4 2.2c-.8.4-1.2.9-1.2 1.8M12 17h.01" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9 7 7m10 10 2.1 2.1m0-14.2L17 7M7 17l-2.1 2.1" />
    </>
  ),
  moon: <path d="M20 15.5A8 8 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />,
  arrow: (
    <>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </>
  ),
  camera: (
    <>
      <path d="M3 7h4l2-3h6l2 3h4v13H3z" />
      <circle cx="12" cy="13" r="4" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m3 18 5-5 4 4 3-3 6 6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  alert: (
    <>
      <path d="M12 3 2 21h20z" />
      <path d="M12 9v5m0 3h.01" />
    </>
  ),
  sound: (
    <>
      <path d="M5 9H2v6h3l5 4V5zM14 9a4 4 0 0 1 0 6M17 6a8 8 0 0 1 0 12" />
    </>
  ),
  send: (
    <>
      <path d="m3 3 19 9-19 9 4-9z" />
      <path d="M7 12h15" />
    </>
  ),
  phone: (
    <path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-1.5 2.2a14 14 0 0 1-7.7-7.7L9 8z" />
  ),
  map: (
    <>
      <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15m6-12v15" />
    </>
  ),
  chevron: <path d="m9 18 6-6-6-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  wifi: (
    <>
      <path d="M3 9a14 14 0 0 1 18 0M6 13a9 9 0 0 1 12 0M9.5 17a4 4 0 0 1 5 0" />
      <circle cx="12" cy="20" r=".5" fill="currentColor" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 7v5h-5M4 17v-5h5" />
      <path d="M18.5 9A7 7 0 0 0 6 6M5.5 15A7 7 0 0 0 18 18" />
    </>
  ),
};

function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

const labels: Record<Screen, string> = {
  home: "Home",
  upload: "Upload",
  reading: "Binabasa",
  review: "Check & Correct",
  summary: "30-Second Summary",
  salary: "Salary Breakdown",
  chat: "Magtanong",
  compare: "Compare",
  questions: "Walang kontrata",
  help: "Get Help",
};

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand" aria-label="Linaw home">
      <span className="brand-sun">
        <Icon name="sun" size={compact ? 17 : 20} />
      </span>
      <span className={compact ? "brand-word compact" : "brand-word"}>Linaw</span>
    </div>
  );
}

function Landing({
  enter,
  dark,
  setDark,
}: {
  enter: () => void;
  dark: boolean;
  setDark: (value: boolean) => void;
}) {
  return (
    <div className="landing">
      <header className="landing-nav">
        <Brand />
        <nav>
          <a href="#paano">Paano gumagana</a>
          <a href="#para-kanino">Para kanino</a>
          <a href="#privacy">Privacy</a>
        </nav>
        <div className="landing-actions">
          <button
            className="icon-button"
            aria-label={dark ? "Use light mode" : "Use dark mode"}
            onClick={() => setDark(!dark)}
          >
            <Icon name={dark ? "sun" : "moon"} size={20} />
          </button>
          <button className="landing-start" onClick={enter}>
            Simulan
          </button>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <span className="landing-pill">
              <i /> Libre, pribado, at madaling maintindihan
            </span>
            <h1>
              Linaw sa kontrata.
              <br />
              <em>Kampante sa pirma.</em>
            </h1>
            <p>
              Ipaunawa ang employment contract o quitclaim mo sa simpleng Taglish—para alam mo ang
              sahod, oras, bawas, at mga dapat itanong.
            </p>
            <div className="landing-hero-actions">
              <button className="landing-cta" onClick={enter}>
                <Icon name="upload" /> Suriin ang kontrata ko
              </button>
              <a href="#paano">
                Tingnan kung paano <Icon name="arrow" size={18} />
              </a>
            </div>
            <div className="landing-reassurance">
              <span>
                <Icon name="lock" size={18} /> Auto-delete after 24 hours
              </span>
              <span>
                <Icon name="check" size={18} /> Walang signup
              </span>
            </div>
          </div>

          <div className="landing-visual">
            <span className="landing-sun">
              <Icon name="sun" size={28} />
            </span>
            <div className="contract-preview">
              <div className="preview-top">
                <span className="preview-file">
                  <Icon name="file" size={22} />
                </span>
                <div>
                  <strong>Employment Contract</strong>
                  <small>4 pages · Nasuri na</small>
                </div>
                <span className="preview-check">
                  <Icon name="check" size={15} />
                </span>
              </div>
              <b className="preview-label">30-second summary</b>
              <div className="preview-row">
                <span className="blue">
                  <Icon name="wallet" size={19} />
                </span>
                <div>
                  <small>Sahod</small>
                  <strong>₱18,000 / buwan</strong>
                </div>
              </div>
              <div className="preview-row">
                <span className="yellow">
                  <Icon name="sun" size={19} />
                </span>
                <div>
                  <small>Oras ng trabaho</small>
                  <strong>8 oras / araw</strong>
                </div>
              </div>
              <div className="preview-row warning">
                <span className="red">
                  <Icon name="alert" size={19} />
                </span>
                <div>
                  <small>Dapat mong itanong</small>
                  <strong>May ₱5,000 early-exit penalty</strong>
                </div>
              </div>
              <div className="preview-chat">
                <Icon name="spark" size={18} />
                <p>“May 2 bagay na dapat linawin bago ka pumirma.”</p>
              </div>
            </div>
            <span className="float-note note-a">
              <Icon name="sound" size={18} /> Basahin nang malakas
            </span>
            <span className="float-note note-b">
              <Icon name="chat" size={18} /> Magtanong sa Taglish
            </span>
          </div>
        </section>

        <section className="landing-trust">
          {[
            ["lock", "Private by default"],
            ["spark", "Simple, hindi legalese"],
            ["help", "May next step lagi"],
            ["sound", "Madaling basahin"],
          ].map(([icon, text]) => (
            <span key={text}>
              <Icon name={icon as IconName} size={21} /> {text}
            </span>
          ))}
        </section>

        <section className="landing-section" id="paano">
          <div className="landing-heading">
            <span className="eyebrow">Tatlong simpleng hakbang</span>
            <h2>Hindi mo kailangang maging expert.</h2>
            <p>Ikaw ang may desisyon. Tutulungan ka lang naming makita ang mahalaga.</p>
          </div>
          <div className="how-grid">
            {[
              [
                "camera",
                "Kunan o i-upload",
                "Photo o PDF ng contract, quitclaim, o offer letter—kahit galing sa chat.",
              ],
              [
                "spark",
                "Basahin ang malinaw na buod",
                "Makikita agad ang sahod, bawas, oras, day off, at dapat bantayan.",
              ],
              [
                "chat",
                "Magtanong nang malaya",
                "Tanungin sa sariling salita. Sasagot kami gamit ang mismong kontrata mo.",
              ],
            ].map(([icon, title, text], index) => (
              <article key={title}>
                <b>0{index + 1}</b>
                <span>
                  <Icon name={icon as IconName} size={27} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section people-section" id="para-kanino">
          <div>
            <span className="eyebrow">Para sa iyo ito</span>
            <h2>Trabaho mo. Karapatan mo. Dapat malinaw.</h2>
            <p>
              Kasambahay ka man, local employee, o OFW, dapat naiintindihan mo ang pinipirmahan
              mo—nang walang judgment.
            </p>
            <ul>
              <li>
                <Icon name="check" size={17} /> Natural na Taglish, Filipino, o English
              </li>
              <li>
                <Icon name="check" size={17} /> Malinaw kahit sa maliit at murang phone
              </li>
              <li>
                <Icon name="check" size={17} /> Official hotline kapag kailangan ng tulong
              </li>
            </ul>
          </div>
          <div className="people-quotes">
            <article>
              <span>L</span>
              <div>
                <b>Para kay Ate Liza</b>
                <p>“Malinaw na kung magkano ang take-home pay ko.”</p>
              </div>
            </article>
            <article>
              <span>J</span>
              <div>
                <b>Para kay Kuya Jun</b>
                <p>“Nakita ko agad ang nagbago sa bagong OFW contract.”</p>
              </div>
            </article>
            <article>
              <span>M</span>
              <div>
                <b>Para kay Mica</b>
                <p>“Gets ko na ang probationary at quitclaim.”</p>
              </div>
            </article>
          </div>
        </section>

        <section className="landing-privacy" id="privacy">
          <span className="privacy-icon">
            <Icon name="lock" size={31} />
          </span>
          <div>
            <span className="eyebrow">Privacy, hindi fine print</span>
            <h2>Ang dokumento mo ay sa iyo.</h2>
            <p>
              Encrypted habang sinusuri at awtomatikong binubura matapos ang 24 oras. Hindi ibebenta
              o gagamitin para mag-train ng AI ang personal mong dokumento.
            </p>
          </div>
          <div className="privacy-stats">
            <span>
              <b>24h</b> auto-delete
            </span>
            <span>
              <b>0</b> ads or spam
            </span>
          </div>
        </section>

        <section className="landing-final">
          <span className="final-sun">
            <Icon name="sun" size={36} />
          </span>
          <span className="eyebrow">Bago ka pumirma</span>
          <h2>Bigyan ang sarili mo ng ilang minutong linaw.</h2>
          <p>Libre. Walang signup. Walang judgment.</p>
          <button className="landing-cta" onClick={enter}>
            Simulan ngayon <Icon name="arrow" />
          </button>
          <small>Nagpapaliwanag lang ang Linaw, hindi legal advice.</small>
        </section>
      </main>
      <div className="landing-footer">
        <Brand compact />
        <p>Ginawa para sa manggagawang Pilipino.</p>
        <button onClick={enter}>Buksan ang app</button>
      </div>
    </div>
  );
}

function Button({
  children,
  onClick,
  variant = "primary",
  icon,
  disabled = false,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: IconName;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button className={`button ${variant} ${className}`} onClick={onClick} disabled={disabled}>
      {icon && <Icon name={icon} />}
      <span>{children}</span>
    </button>
  );
}

function Topbar({
  title,
  onHome,
  dark,
  setDark,
  language,
  setLanguage,
}: {
  title: string;
  onHome: () => void;
  dark: boolean;
  setDark: (v: boolean) => void;
  language: string;
  setLanguage: (v: string) => void;
}) {
  return (
    <header className="topbar">
      <button className="brand-button" onClick={onHome}>
        <Brand compact />
      </button>
      <span className="top-title">{title}</span>
      <div className="top-actions">
        <select
          aria-label="Language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option>Taglish</option>
          <option>Filipino</option>
          <option>English</option>
        </select>
        <button
          className="icon-button"
          aria-label={dark ? "Use light mode" : "Use dark mode"}
          onClick={() => setDark(!dark)}
        >
          <Icon name={dark ? "sun" : "moon"} size={20} />
        </button>
      </div>
    </header>
  );
}

const primaryNav: { id: Screen; icon: IconName; short: string }[] = [
  { id: "home", icon: "home", short: "Home" },
  { id: "summary", icon: "spark", short: "Buod" },
  { id: "chat", icon: "chat", short: "Tanong" },
  { id: "compare", icon: "compare", short: "Compare" },
  { id: "help", icon: "help", short: "Tulong" },
];

function Nav({ screen, go }: { screen: Screen; go: (s: Screen) => void }) {
  return (
    <>
      <aside className="side-nav">
        <Brand />
        <p className="nav-kicker">Ang kontrata mo, malinaw.</p>
        <nav>
          {primaryNav.map((item) => (
            <button
              key={item.id}
              className={screen === item.id ? "active" : ""}
              onClick={() => go(item.id)}
            >
              <Icon name={item.icon} />
              <span>{item.short}</span>
            </button>
          ))}
        </nav>
        <div className="side-note">
          <Icon name="lock" size={18} />
          <span>Private at ligtas ang dokumento mo.</span>
        </div>
      </aside>
      <nav className="bottom-nav">
        {primaryNav.map((item) => (
          <button
            key={item.id}
            className={screen === item.id ? "active" : ""}
            onClick={() => go(item.id)}
          >
            <Icon name={item.icon} size={21} />
            <span>{item.short}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

function Home({
  go,
  language,
  setLanguage,
}: {
  go: (s: Screen) => void;
  language: string;
  setLanguage: (s: string) => void;
}) {
  return (
    <div className="home-page page">
      <div className="hero-copy">
        <span className="eyebrow">Para sa bawat manggagawang Pilipino</span>
        <h1>
          Intindihin ang kontrata mo <span>bago ka pumirma.</span>
        </h1>
        <p className="lead">
          I-upload ang kontrata o quitclaim mo. Ipapaliwanag namin ang mahalaga—sa salitang madaling
          maintindihan.
        </p>
      </div>
      <div className="home-card card">
        <div className="language-pills" aria-label="Choose language">
          {["English", "Filipino", "Taglish"].map((l) => (
            <button
              key={l}
              className={language === l ? "active" : ""}
              onClick={() => setLanguage(l)}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="home-actions">
          <Button icon="upload" onClick={() => go("upload")}>
            Mag-upload ng kontrata
          </Button>
          <Button variant="secondary" icon="file" onClick={() => go("questions")}>
            Wala akong kontrata
          </Button>
        </div>
        <button className="text-link" onClick={() => go("compare")}>
          <Icon name="compare" size={18} /> Ikumpara ang dalawang kontrata
        </button>
      </div>
      <div className="trust-row">
        <span>
          <Icon name="lock" size={18} /> Auto-delete after 24 hours
        </span>
        <span>
          <Icon name="spark" size={18} /> Simple at walang judgment
        </span>
        <span>
          <Icon name="help" size={18} /> May totoong ahensyang matatakbuhan
        </span>
      </div>
      <div className="disclaimer">
        <Icon name="alert" size={17} />
        <span>Nagpapaliwanag lang kami, hindi legal advice.</span>
      </div>
    </div>
  );
}

function Upload({ go }: { go: (s: Screen) => void }) {
  const [error, setError] = useState(false);
  return (
    <div className="page narrow-page">
      <div className="page-heading">
        <span className="step-label">Step 1 of 3</span>
        <h1>I-upload ang dokumento</h1>
        <p>Contract, quitclaim, offer letter—kahit photo lang, puwede.</p>
      </div>
      {error && (
        <div className="error-banner">
          <Icon name="alert" />
          <div>
            <strong>Medyo malabo ang photo.</strong>
            <p>Subukang kunan ulit sa maliwanag at patag na lugar.</p>
          </div>
          <button aria-label="Close error" onClick={() => setError(false)}>
            <Icon name="close" size={18} />
          </button>
        </div>
      )}
      <div className="upload-zone card">
        <div className="upload-illustration">
          <Icon name="file" size={40} />
          <span>
            <Icon name="spark" size={18} />
          </span>
        </div>
        <h2>Ilagay dito ang kontrata</h2>
        <p>PDF, JPG, o PNG · hanggang 20 MB</p>
        <div className="upload-buttons">
          <Button icon="camera" onClick={() => go("reading")}>
            Kunan ng photo
          </Button>
          <Button variant="secondary" icon="image" onClick={() => go("reading")}>
            Pumili sa phone
          </Button>
        </div>
        <button className="demo-error" onClick={() => setError(true)}>
          I-preview ang blurry photo error
        </button>
      </div>
      <div className="tip-card">
        <div className="tip-icon">
          <Icon name="sun" />
        </div>
        <div>
          <h3>Para malinaw ang basa</h3>
          <ul>
            <li>Ipatag ang papel</li>
            <li>Iwasan ang anino at glare</li>
            <li>Isama ang buong page sa photo</li>
          </ul>
        </div>
      </div>
      <div className="privacy-note">
        <Icon name="lock" />
        <div>
          <strong>Sa iyo ang dokumento mo.</strong>
          <p>
            Encrypted habang binabasa. Awtomatikong buburahin ang file at analysis matapos ang 24
            oras.
          </p>
        </div>
      </div>
    </div>
  );
}

function Reading({ go }: { go: (s: Screen) => void }) {
  const [step, setStep] = useState(0);
  const statuses = [
    "Binabasa ang pahina 1...",
    "Hinahanap ang sahod...",
    "Tinitingnan ang mga bawas...",
    "Halos tapos na...",
  ];
  useEffect(() => {
    const id = window.setInterval(() => setStep((s) => Math.min(s + 1, 3)), 1100);
    const done = window.setTimeout(() => go("review"), 5200);
    return () => {
      clearInterval(id);
      clearTimeout(done);
    };
  }, [go]);
  return (
    <div className="page reading-page">
      <div className="reading-visual">
        <div className="scan-doc">
          <div />
          <div />
          <div />
          <div />
          <span className="scan-line" />
        </div>
        <div className="orbit">
          <Icon name="spark" size={22} />
        </div>
      </div>
      <div className="reading-copy">
        <span className="step-label">Sandali lang</span>
        <h1>Inaalam namin ang mahalaga.</h1>
        <p className="shimmer-text">{statuses[step]}</p>
        <div className="activity card">
          {statuses.slice(0, 3).map((s, i) => (
            <div key={s} className={i < step ? "done" : i === step ? "current" : ""}>
              <span className="status-dot">
                {i < step ? <Icon name="check" size={15} /> : i + 1}
              </span>
              <span>{s.replace("...", "")}</span>
            </div>
          ))}
        </div>
        <p className="gentle-note">Okay lang lumipat ng app. Hindi mawawala ang progress mo.</p>
      </div>
    </div>
  );
}

const fields = [
  { label: "Sahod", value: "₱18,000 / buwan", confidence: true },
  { label: "Start date", value: "15 June 2025", confidence: true },
  { label: "Haba", value: "2 taon", confidence: true },
  { label: "Oras", value: "8 oras / araw", confidence: false },
  { label: "Day off", value: "Linggo", confidence: true },
];

function DocumentMock({ active }: { active: number }) {
  return (
    <div className="document-mock">
      <div className="doc-paper">
        <div className="doc-logo">EMPLOYMENT AGREEMENT</div>
        <p>
          This Agreement is entered into between Maria D. Santos (“Employee”) and ABC Household.
        </p>
        <p className={active === 0 ? "located" : ""}>
          <b>1. COMPENSATION.</b> The Employee shall receive <mark>PHP 18,000 per month</mark>,
          payable every 15th and 30th.
        </p>
        <p className={active === 1 ? "located" : ""}>
          <b>2. TERM.</b> Employment starts on <mark>15 June 2025</mark> and will continue for two
          (2) years.
        </p>
        <p className={active === 3 ? "located uncertain" : ""}>
          <b>3. HOURS.</b> The Employee shall work <mark>8 hours per day</mark>, six days each week.
        </p>
        <p>
          <b>4. REST DAY.</b> The weekly rest day shall be Sunday.
        </p>
        <p className="tiny-lines">Signed by the parties on the date stated above.</p>
        <div className="signatures">
          <span>Employer</span>
          <span>Employee</span>
        </div>
      </div>
      <span className="page-count">Page 1 of 4</span>
    </div>
  );
}

function Review({ go }: { go: (s: Screen) => void }) {
  const [tab, setTab] = useState<"doc" | "fields">("fields");
  const [active, setActive] = useState(3);
  return (
    <div className="page review-page">
      <div className="page-heading row-heading">
        <div>
          <span className="step-label">Step 2 of 3</span>
          <h1>Check natin kung tama</h1>
          <p>I-tap ang detalye para makita kung saan ito galing.</p>
        </div>
        <span className="confidence">
          <Icon name="alert" size={17} /> 1 kailangang suriin
        </span>
      </div>
      <div className="mobile-tabs">
        <button className={tab === "doc" ? "active" : ""} onClick={() => setTab("doc")}>
          Original
        </button>
        <button className={tab === "fields" ? "active" : ""} onClick={() => setTab("fields")}>
          Mga detalye
        </button>
      </div>
      <div className="review-grid">
        <section className={`review-document ${tab !== "doc" ? "mobile-hidden" : ""}`}>
          <DocumentMock active={active} />
        </section>
        <section className={`fields-panel card ${tab !== "fields" ? "mobile-hidden" : ""}`}>
          <div className="panel-title">
            <h2>Nakuha naming detalye</h2>
            <span>Tap para i-edit</span>
          </div>
          <div className="field-list">
            {fields.map((field, i) => (
              <button
                key={field.label}
                className={`field-chip ${!field.confidence ? "low" : ""} ${active === i ? "active" : ""}`}
                onClick={() => {
                  setActive(i);
                  setTab("doc");
                }}
              >
                <span className="field-meta">
                  {field.label}
                  {!field.confidence && <em>Pakisuri</em>}
                </span>
                <strong>{field.value}</strong>
                <Icon name="chevron" size={19} />
              </button>
            ))}
          </div>
          <div className="low-note">
            <span className="yellow-dot" />
            <p>Hindi kami 100% sure sa naka-yellow. Tingnan kung tugma sa original.</p>
          </div>
          <Button icon="check" onClick={() => go("summary")}>
            Tama na ito, ipaliwanag
          </Button>
        </section>
      </div>
    </div>
  );
}

const summaryItems = [
  {
    icon: "wallet" as IconName,
    title: "Sahod",
    value: "₱18,000 / buwan",
    detail: "Bayad tuwing ika-15 at ika-30",
  },
  {
    icon: "alert" as IconName,
    title: "Bawas",
    value: "₱1,260 estimate",
    detail: "SSS, PhilHealth, at Pag-IBIG",
    worry: true,
  },
  {
    icon: "sun" as IconName,
    title: "Oras ng trabaho",
    value: "8 oras / araw",
    detail: "Lunes–Sabado, may 1 oras na break",
  },
  {
    icon: "home" as IconName,
    title: "Day off",
    value: "Tuwing Linggo",
    detail: "24 oras na tuloy-tuloy na pahinga",
  },
  {
    icon: "file" as IconName,
    title: "Haba ng kontrata",
    value: "2 taon",
    detail: "Mula June 15, 2025",
  },
  {
    icon: "alert" as IconName,
    title: "Parusa / penalties",
    value: "May ₱5,000 penalty",
    detail: "Kapag umalis bago matapos ang kontrata",
    worry: true,
  },
];

function Summary({ go }: { go: (s: Screen) => void }) {
  const [term, setTerm] = useState<string | null>(null);
  return (
    <div className="page">
      <div className="page-heading summary-heading">
        <div>
          <span className="step-label">Step 3 of 3 · Tapos na</span>
          <h1>Ang kontrata mo, in 30 seconds</h1>
          <p>Unahin natin ang mga bagay na may epekto sa pera at oras mo.</p>
        </div>
        <Button variant="secondary" icon="sound">
          Basahin nang malakas
        </Button>
      </div>
      <div className="notice">
        <Icon name="alert" />
        <div>
          <strong>May 2 bagay na dapat mong tanungin.</strong>
          <p>
            May penalty sa maagang pag-alis at hindi malinaw kung sagot ng employer ang medical.
          </p>
        </div>
      </div>
      <div className="summary-grid">
        {summaryItems.map((item) => (
          <article key={item.title} className={`summary-card card ${item.worry ? "worry" : ""}`}>
            <div className="summary-icon">
              <Icon name={item.icon} />
            </div>
            <div>
              <span>{item.title}</span>
              <h2>{item.value}</h2>
              <p>{item.detail}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="terms-card card">
        <div>
          <span className="eyebrow">Mga salitang legal</span>
          <h2>Hindi kailangang manghula.</h2>
        </div>
        <div className="term-list">
          {["Quitclaim", "Probationary", "Liquidated damages"].map((t) => (
            <button key={t} onClick={() => setTerm(t)}>
              {t}
              <Icon name="plus" size={18} />
            </button>
          ))}
        </div>
      </div>
      <div className="summary-actions">
        <Button icon="wallet" onClick={() => go("salary")}>
          Tingnan ang salary breakdown
        </Button>
        <Button variant="secondary" icon="chat" onClick={() => go("chat")}>
          May itatanong ako
        </Button>
      </div>
      {term && (
        <div className="sheet-backdrop" onClick={() => setTerm(null)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <button className="sheet-close" onClick={() => setTerm(null)}>
              <Icon name="close" />
            </button>
            <span className="eyebrow">Simple meaning</span>
            <h2>{term}</h2>
            <p>
              {term === "Quitclaim"
                ? "Dokumentong nagsasabing natanggap mo na ang bayad at wala ka nang ibang hahabulin sa employer."
                : term === "Probationary"
                  ? "Trial period kung kailan tinitingnan kung pasado ka sa malinaw na standards ng trabaho."
                  : "Halagang napagkasunduang bayaran kapag may hindi nasunod sa kontrata."}
            </p>
            <Button onClick={() => setTerm(null)}>Gets ko na</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Salary({ go }: { go: (s: Screen) => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const rows = [
    ["Gross pay", "₱18,000"],
    ["SSS", "− ₱900"],
    ["PhilHealth", "− ₱270"],
    ["Pag-IBIG", "− ₱90"],
  ];
  return (
    <div className="page narrow-page salary-page">
      <div className="page-heading">
        <span className="eyebrow">Pera mo</span>
        <h1>Saan napupunta ang sahod?</h1>
        <p>Estimate ito base sa nakasulat sa kontrata.</p>
      </div>
      <div className="take-home card">
        <span>Estimated take-home pay</span>
        <strong className={visible ? "number show" : "number"}>₱16,740</strong>
        <p>kada buwan</p>
        <div className="pay-bar">
          <span style={{ width: "93%" }} />
        </div>
        <small>93% ng gross pay ang maiuuwi mo</small>
      </div>
      <div className="salary-table card">
        {rows.map((r, i) => (
          <div className={i > 0 ? "deduction" : ""} key={r[0]}>
            <span>
              {r[0]}
              {i > 0 && <small> mandatory</small>}
            </span>
            <strong>{r[1]}</strong>
          </div>
        ))}
        <div className="net">
          <span>Net pay</span>
          <strong>₱16,740</strong>
        </div>
      </div>
      <div className="thirteenth card">
        <div className="thirteen-icon">13</div>
        <div>
          <span>Estimated 13th month pay</span>
          <strong>₱18,000</strong>
          <p>Kung nakumpleto mo ang 12 buwan</p>
        </div>
      </div>
      <div className="formula-note">
        <Icon name="check" size={18} />
        <span>Kinuwenta ito gamit ang formula, hindi ng AI.</span>
      </div>
      <Button variant="secondary" icon="chat" onClick={() => go("chat")}>
        May tanong tungkol sa sahod
      </Button>
    </div>
  );
}

function Chat() {
  const [text, setText] = useState("");
  const [asked, setAsked] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const ask = (value?: string) => {
    const q = value || text;
    if (!q.trim()) return;
    setText(q);
    setAsked(true);
  };
  return (
    <div className="page chat-page">
      <div className="chat-header">
        <div>
          <span className="eyebrow">Ka-chat si Linaw</span>
          <h1>Ano ang gusto mong linawin?</h1>
        </div>
        <span className="online">
          <i /> Handa akong tumulong
        </span>
      </div>
      <div className="suggestions">
        {[
          "Pwede ba akong umalis nang maaga?",
          "Tama ba ang mga bawas?",
          "Ano ang dapat itanong bago pumirma?",
        ].map((q) => (
          <button key={q} onClick={() => ask(q)}>
            {q}
          </button>
        ))}
      </div>
      <div className="messages">
        <div className="message assistant">
          <div className="bot-mark">
            <Icon name="sun" size={18} />
          </div>
          <div className="bubble">
            <p>
              Kumusta! Nabasa ko na ang kontrata mo. Puwede kang magtanong sa Tagalog, English, o
              Taglish—kahit hindi kumpleto ang sentence.
            </p>
          </div>
        </div>
        {asked && (
          <>
            <div className="message user">
              <div className="bubble">
                <p>{text}</p>
              </div>
            </div>
            <div className="message assistant">
              <div className="bot-mark">
                <Icon name="sun" size={18} />
              </div>
              <div className="bubble answer">
                <p>
                  Oo, puwede kang umalis bago matapos ang kontrata—pero may nakasulat na{" "}
                  <strong>₱5,000 penalty</strong>. Bago pumirma, itanong kung kailan ito hindi
                  sisingilin, halimbawa kung may emergency o hindi ligtas ang trabaho. <sup>1</sup>
                </p>
                <details>
                  <summary>
                    <Icon name="file" size={17} /> Tingnan ang source
                  </summary>
                  <blockquote>
                    <b>Clause 8.2</b> — “In case of early termination by the Employee, a fixed sum
                    of PHP 5,000…”
                  </blockquote>
                </details>
              </div>
            </div>
          </>
        )}
        <div className="approval-card card">
          <div className="approval-top">
            <span className="check-box">
              <Icon name="check" size={17} />
            </span>
            <div>
              <span className="eyebrow">Bago pumirma</span>
              <h3>Gumawa ng checklist ng itatanong?</h3>
            </div>
          </div>
          <p>May nakita akong 3 bahagi na mas mabuting malinaw muna sa employer.</p>
          <div>
            <Button variant="primary">Oo, gawin natin</Button>
            <Button variant="ghost">Mamaya na</Button>
          </div>
        </div>
      </div>
      <div className="prompt-wrap">
        <textarea
          ref={textarea}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onInput={(e) => {
            e.currentTarget.style.height = "auto";
            e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 120)}px`;
          }}
          placeholder="I-type ang tanong mo…"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              ask();
            }
          }}
        />
        <button aria-label="Send message" onClick={() => ask()}>
          <Icon name="send" size={20} />
        </button>
        <span>Base sa iyong kontrata · Hindi legal advice</span>
      </div>
    </div>
  );
}

function Compare() {
  const [ready, setReady] = useState(false);
  return (
    <div className="page compare-page">
      <div className="page-heading">
        <span className="eyebrow">Compare contracts</span>
        <h1>Ano ang nagbago?</h1>
        <p>Ilagay ang luma at bagong kontrata. Ipapakita namin ang mas okay at dapat bantayan.</p>
      </div>
      {!ready ? (
        <div className="compare-upload-grid">
          <div className="mini-upload card">
            <span>1</span>
            <Icon name="file" size={34} />
            <h2>Lumang kontrata</h2>
            <p>Na-upload · Contract_2024.pdf</p>
            <button>
              <Icon name="check" size={18} /> Palitan
            </button>
          </div>
          <button className="mini-upload card empty" onClick={() => setReady(true)}>
            <span>2</span>
            <Icon name="plus" size={34} />
            <h2>Bagong kontrata</h2>
            <p>I-tap para mag-upload</p>
          </button>
        </div>
      ) : (
        <>
          <div className="compare-alert">
            <Icon name="alert" />
            <div>
              <span>Pinakamahalagang pagbabago</span>
              <h2>
                Mas mababa ang sahod sa bago: <s>₱18,000</s> → ₱16,500
              </h2>
              <p>₱1,500 less bawat buwan, o ₱18,000 less kada taon.</p>
            </div>
          </div>
          <div className="legend">
            <span>
              <i className="added" />
              Added / better
            </span>
            <span>
              <i className="changed" />
              Changed
            </span>
            <span>
              <i className="removed" />
              Removed / worse
            </span>
          </div>
          <div className="comparison-table card">
            <div className="compare-head">
              <span>Detalye</span>
              <strong>Luma</strong>
              <strong>Bago</strong>
            </div>
            <div>
              <span>Sahod</span>
              <strong>₱18,000</strong>
              <strong className="removed-cell">₱16,500</strong>
            </div>
            <div>
              <span>Day off</span>
              <strong>Sunday</strong>
              <strong className="changed-cell">Flexible day</strong>
            </div>
            <div>
              <span>Medical</span>
              <strong>Hindi nakalagay</strong>
              <strong className="added-cell">Covered</strong>
            </div>
            <div>
              <span>Penalty</span>
              <strong>₱5,000</strong>
              <strong className="removed-cell">₱8,000</strong>
            </div>
          </div>
          <div className="compare-summary card">
            <span className="eyebrow">Sa madaling salita</span>
            <h2>May isang improvement, pero mas mababa ang overall value.</h2>
            <p>
              Covered na ang medical, pero bababa ang sahod at mas mataas ang penalty. Linawin din
              kung kailan ang “flexible” day off.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

const questions = [
  {
    q: "Anong trabaho ang ginagawa mo?",
    options: ["Kasambahay", "Local employee", "OFW / abroad"],
  },
  {
    q: "May malinaw ba kayong usapan sa sahod?",
    options: ["Oo, nakasulat sa chat", "Verbal lang", "Hindi pa malinaw"],
  },
  { q: "May regular kang day off?", options: ["Oo, bawat linggo", "Minsan lang", "Wala"] },
];

function Questions() {
  const [step, setStep] = useState(0);
  const done = step >= questions.length;
  return (
    <div className="page question-page">
      {!done ? (
        <>
          <div className="question-progress">
            <span style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
            <p>
              Tanong {step + 1} of {questions.length}
            </p>
          </div>
          <button className="back-link" onClick={() => setStep(Math.max(0, step - 1))}>
            ← Bumalik
          </button>
          <div className="question-wrap">
            <span className="eyebrow">Walang kontrata? Okay lang.</span>
            <h1>{questions[step].q}</h1>
            <p>Piliin ang pinakamalapit sa sitwasyon mo.</p>
            <div className="choice-list">
              {questions[step].options.map((o, i) => (
                <button key={o} onClick={() => setStep(step + 1)}>
                  <span>{String.fromCharCode(65 + i)}</span>
                  {o}
                  <Icon name="arrow" />
                </button>
              ))}
            </div>
            <small>Walang maling sagot. Hindi namin ise-save ang sagot mo.</small>
          </div>
        </>
      ) : (
        <div className="result-wrap">
          <div className="result-sun">
            <Icon name="sun" size={40} />
          </div>
          <span className="eyebrow">Base sa sagot mo</span>
          <h1>Ano ang karaniwang hinihingi ng Batas Kasambahay</h1>
          <p className="lead">Kahit walang written contract, may mga karapatan ka pa rin.</p>
          <div className="rights-list card">
            {[
              "Nakasulat na employment contract",
              "Minimum wage sa inyong rehiyon",
              "Isang buong araw na pahinga bawat linggo",
              "SSS, PhilHealth, at Pag-IBIG",
              "Maayos at ligtas na tulugan at pagkain",
            ].map((t) => (
              <div key={t}>
                <span>
                  <Icon name="check" size={17} />
                </span>
                {t}
              </div>
            ))}
          </div>
          <div className="notice">
            <Icon name="help" />
            <div>
              <strong>Hindi tugma ang sitwasyon mo?</strong>
              <p>Maaaring tumawag sa DOLE Hotline 1349 para magtanong nang libre.</p>
            </div>
          </div>
          <Button icon="phone">Tumawag sa DOLE 1349</Button>
        </div>
      )}
    </div>
  );
}

const agencies = [
  {
    name: "DOLE",
    full: "Department of Labor and Employment",
    for: "Sahod, termination, benefits, at labor complaints",
    phone: "1349",
    color: "blue",
  },
  {
    name: "DMW",
    full: "Department of Migrant Workers",
    for: "Kontrata, recruiter, at problema ng OFW",
    phone: "8722-1144",
    color: "red",
  },
  {
    name: "OWWA",
    full: "Overseas Workers Welfare Administration",
    for: "Welfare support, repatriation, at pamilya ng OFW",
    phone: "1348",
    color: "yellow",
  },
  {
    name: "PAO",
    full: "Public Attorney’s Office",
    for: "Libreng legal assistance kung qualified",
    phone: "(02) 8929-9436",
    color: "ink",
  },
];

function Help() {
  const [offline, setOffline] = useState(false);
  return (
    <div className="page help-page">
      <div className="page-heading">
        <span className="eyebrow">May makakausap ka</span>
        <h1>Humingi ng tulong</h1>
        <p>Mga official na ahensya. Piliin kung alin ang pinakamalapit sa kailangan mo.</p>
      </div>
      {offline && (
        <div className="offline-banner">
          <Icon name="wifi" />
          <div>
            <strong>Offline ka ngayon.</strong>
            <p>Makikita mo pa rin ang saved hotline numbers.</p>
          </div>
          <button onClick={() => setOffline(false)}>
            <Icon name="refresh" size={19} /> Retry
          </button>
        </div>
      )}
      <button className="offline-demo" onClick={() => setOffline(true)}>
        I-preview ang offline state
      </button>
      <div className="agency-grid">
        {agencies.map((a) => (
          <article className="agency-card card" key={a.name}>
            <div className={`agency-mark ${a.color}`}>{a.name}</div>
            <div className="agency-copy">
              <h2>{a.full}</h2>
              <p>{a.for}</p>
            </div>
            <div className="agency-actions">
              <a href={`tel:${a.phone}`}>
                <Icon name="phone" size={19} /> {a.phone}
              </a>
              <button>
                <Icon name="map" size={19} /> Find office
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="urgent card">
        <Icon name="alert" />
        <div>
          <h2>Kung may agarang panganib</h2>
          <p>Tumawag sa 911 o lumapit sa pinakamalapit na barangay o police station.</p>
        </div>
        <a href="tel:911">Call 911</a>
      </div>
    </div>
  );
}

export default function App() {
  const [landed, setLanded] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [dark, setDark] = useState(false);
  const [language, setLanguage] = useState("Taglish");
  const go = (next: Screen) => {
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const content: Record<Screen, ReactNode> = {
    home: <Home go={go} language={language} setLanguage={setLanguage} />,
    upload: <Upload go={go} />,
    reading: <Reading go={go} />,
    review: <Review go={go} />,
    summary: <Summary go={go} />,
    salary: <Salary go={go} />,
    chat: <Chat />,
    compare: <Compare />,
    questions: <Questions />,
    help: <Help />,
  };
  if (!landed) {
    return (
      <div className={dark ? "app dark" : "app"}>
        <Landing
          dark={dark}
          setDark={setDark}
          enter={() => {
            setLanded(true);
            window.scrollTo(0, 0);
          }}
        />
      </div>
    );
  }
  return (
    <div className={dark ? "app dark" : "app"}>
      <Nav screen={screen} go={go} />
      <main className="main-shell">
        <Topbar
          title={labels[screen]}
          onHome={() => {
            setLanded(false);
            window.scrollTo(0, 0);
          }}
          dark={dark}
          setDark={setDark}
          language={language}
          setLanguage={setLanguage}
        />
        {content[screen]}
        <footer>
          <span>Linaw</span>
          <p>Nagpapaliwanag lang kami, hindi legal advice.</p>
        </footer>
      </main>
    </div>
  );
}
