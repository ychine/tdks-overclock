import Brand from '../components/Brand'
import Icon from '../components/Icon'

export default function Landing({ enter, dark, setDark }) {
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
            aria-label={dark ? 'Use light mode' : 'Use dark mode'}
            onClick={() => setDark(!dark)}
          >
            <Icon name={dark ? 'sun' : 'moon'} size={20} />
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
            <span className="landing-sun" aria-hidden="true">
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
            <span className="float-note note-a" aria-hidden="true">
              <Icon name="sound" size={18} /> Basahin nang malakas
            </span>
            <span className="float-note note-b" aria-hidden="true">
              <Icon name="chat" size={18} /> Magtanong sa Taglish
            </span>
          </div>
        </section>

        <section className="landing-trust">
          {[
            ['lock', 'Private by default'],
            ['spark', 'Simple, hindi legalese'],
            ['help', 'May next step lagi'],
            ['sound', 'Madaling basahin'],
          ].map(([icon, text]) => (
            <span key={text}>
              <Icon name={icon} size={21} /> {text}
            </span>
          ))}
        </section>

        <section className="landing-section" id="paano">
          <div className="landing-heading">
            <h2>Hindi mo kailangang maging expert.</h2>
            <p>Ikaw ang may desisyon. Tutulungan ka lang naming makita ang mahalaga.</p>
          </div>
          <div className="how-grid">
            {[
              [
                'Kunan o i-upload',
                'Photo o PDF ng contract, quitclaim, o offer letter—kahit galing sa chat.',
              ],
              [
                'Basahin ang malinaw na buod',
                'Makikita agad ang sahod, bawas, oras, day off, at dapat bantayan.',
              ],
              [
                'Magtanong nang malaya',
                'Tanungin sa sariling salita. Sasagot kami gamit ang mismong kontrata mo.',
              ],
            ].map(([, title, text], index) => (
              <article key={title}>
                <b>0{index + 1}</b>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section people-section" id="para-kanino">
          <div>
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
  )
}
