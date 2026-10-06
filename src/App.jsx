import { useEffect, useId, useRef, useState } from 'react'
import './App.css'

import heroRender from './assets/optimized/hero-render.webp'
import heroGarden from './assets/optimized/hero-garden.webp'
import heroDusk from './assets/optimized/hero-dusk.webp'
import aboutRender from './assets/optimized/about-render.webp'
import aerialImage from './assets/optimized/aerial.webp'
import familyImage from './assets/optimized/family.webp'
import goldenHourImage from './assets/optimized/golden-hour.webp'
import towersImage from './assets/optimized/towers-actual.webp'
import poolImage from './assets/optimized/pool-actual.webp'
import gymImage from './assets/optimized/gym-actual.webp'
import gardenImage from './assets/optimized/garden-actual.webp'
import templeImage from './assets/optimized/temple.webp'
import playImage from './assets/optimized/play.webp'
import bedroomImage from './assets/optimized/bedroom.webp'
import livingImage from './assets/optimized/living.webp'
import sitePlanImage from './assets/optimized/plan-site.webp'
import threeBhkPlanImage from './assets/optimized/plan-3bhk.webp'
import fourBhkPlanImage from './assets/optimized/plan-4bhk.webp'

const headerImages = [heroRender, heroGarden, heroDusk]
const leadFormEndpoint = import.meta.env.VITE_LEAD_API_URL || '/api/leads'
const currentYear = new Date().getFullYear()

const highlights = [
  ['RERA Approved', 'P-OTH-23-3881'],
  ['13 Towers', 'Phase-2 of Vastu City'],
  ['Ready Amenities', 'Pool, gym, temple, gardens'],
  ['5 Entry Gates', 'Secure gated community'],
  ['12 m Approach Road', 'Plus 9 m internal roads'],
  ['1660 sq.ft. Carpet', 'Spacious typical plan'],
  ['Next to School', 'Behind Vidhya Sagar School'],
  ['Bank Approved', 'SBI · HDFC · LIC HFL'],
]

const highlightIcons = ['check', 'towers', 'amenities', 'neighbourhood', 'arrowUp', 'carpet', 'school', 'bank']

const locationDetails = {
  Schools: ['Vidhya Sagar School', 'Pragya School', 'Agrawal Public School'],
  Connectivity: ['Bicholi Mardana Road', 'Ring Road access', 'Indore city centre'],
  'Leisure & shopping': ['Treasure Fantasy Mall', 'Local shopping plaza', 'Neighbourhood cafes'],
  Neighbourhood: ['Bicholi Mardana', 'Peaceful residential setting', 'Five gated entries'],
}

const amenities = [
  { title: 'Swimming Pool', image: poolImage },
  { title: 'Gymnasium', image: gymImage },
  { title: 'Landscaped Gardens', image: gardenImage },
  { title: 'Temple', image: templeImage },
  { title: "Kids' Play Area", image: playImage, note: 'Project visual' },
  { title: 'Residential Towers', image: towersImage },
]

const gallery = {
  Exterior: [
    { title: 'Aerial view of the community', image: aerialImage },
    { title: 'Life at Vastu City', image: familyImage },
    { title: 'Golden hour', image: goldenHourImage },
    { title: 'Residential towers', image: towersImage },
    { title: 'Swimming pool', image: poolImage },
    { title: 'Landscaped gardens', image: gardenImage },
    { title: 'Official project render', image: heroRender },
  ],
  'Interior / amenities': [
    { title: 'Gymnasium', image: gymImage },
    { title: 'Swimming pool', image: poolImage },
    { title: 'Temple', image: templeImage },
    { title: 'Bedroom (illustrative)', image: bedroomImage },
    { title: 'Living area (illustrative)', image: livingImage },
    { title: "Kids' play area", image: playImage },
    { title: 'Landscaped gardens', image: gardenImage },
  ],
  'Floor plans': [
    { title: 'Master site plan', image: sitePlanImage, plan: true },
    { title: 'Typical 3 BHK · 2300 sq.ft.', image: threeBhkPlanImage, plan: true },
    { title: 'Typical 4 BHK · 3906 sq.ft.', image: fourBhkPlanImage, plan: true },
  ],
}

const walkthroughSlides = [
  { title: 'A grand arrival', image: heroRender, detail: 'Vastu City Rameshwaram' },
  { title: 'Room to breathe', image: gardenImage, detail: 'Landscaped spaces' },
  { title: 'Everyday leisure', image: poolImage, detail: 'Ready-to-use amenities' },
  { title: 'Wellness, close to home', image: gymImage, detail: 'Modern fitness centre' },
  { title: 'A peaceful retreat', image: templeImage, detail: 'Temple within the community' },
]

function Icon({ name, size = 20 }) {
  const paths = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    close: <><path d="m6 6 12 12" /><path d="M18 6 6 18" /></>,
    menu: <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>,
    arrowUp: <><path d="M7 17 17 7" /><path d="M7 7h10v10" /></>,
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    school: <><path d="m3 9 9-5 9 5-9 5-9-5Z" /><path d="M7 11.2V16c2.8 2.2 7.2 2.2 10 0v-4.8" /><path d="M21 9v6" /></>,
    route: <><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="6" r="2.5" /><path d="M8.5 18H11a4 4 0 0 0 4-4v-4a4 4 0 0 1 4-4" /></>,
    shopping: <><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></>,
    neighbourhood: <><path d="m3 11 9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M9 20v-5h6v5" /></>,
    towers: <><path d="M5 20V7h5v13" /><path d="M14 20V3h5v17" /><path d="M3 20h18" /><path d="M7.5 10h.01M7.5 13h.01M7.5 16h.01M16.5 6h.01M16.5 9h.01M16.5 12h.01M16.5 15h.01" /></>,
    amenities: <><path d="M4 8c2.5-4 5.5 4 8 0s5.5 4 8 0" /><path d="M4 13c2.5-4 5.5 4 8 0s5.5 4 8 0" /><path d="M4 18c2.5-4 5.5 4 8 0s5.5 4 8 0" /></>,
    carpet: <><path d="m12 3 9 9-9 9-9-9 9-9Z" /><path d="m9 9 6 6M15 9l-6 6" /></>,
    bank: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><path d="M12 7v10M7 12h10" /></>,
    badge: <><path d="M12 3 14.5 5.5 18 5.2l.8 3.4 2.7 2.3-2.7 2.3-.8 3.4-3.5-.3L12 19l-2.5-2.7-3.5.3-.8-3.4-2.7-2.3 2.7-2.3.8-3.4 3.5.3L12 3Z" /><path d="m8.5 11.5 2.2 2.2 4.8-5" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m4 7 8 6 8-6" /></>,
    handshake: <><path d="m8 11 2.5 2.5a2 2 0 0 0 2.8 0L16 10.8" /><path d="m3 9 3-3 4 4-3 3L3 9Z" /><path d="m21 9-3-3-4 4 3 3 4-4Z" /><path d="m6 13 2.5 2.5M9 15l2 2M18 13l-2.5 2.5" /></>,
    advisor: <><circle cx="12" cy="8" r="3" /><path d="M5 20a7 7 0 0 1 14 0" /><path d="M18 5.5a3 3 0 0 1 0 5" /></>,
    support: <><path d="M7 3h10v4H7z" /><path d="M5 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1" /><path d="m8 14 2.5 2.5L16 11" /></>,
  }

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}

function startDownload(url) {
  const link = document.createElement('a')
  link.href = url
  link.download = 'vastu-city-rameshwaram-brochure.pdf'
  document.body.appendChild(link)
  link.click()
  link.remove()
}

function LeadForm({ compact = false, brochure = false, buttonLabel = 'SEND REQUEST', source = 'Hero enquiry form', onFocusChange }) {
  const formId = useId().replaceAll(':', '')
  const [status, setStatus] = useState('idle')
  const [downloadUrl, setDownloadUrl] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('sending')

    const formData = new FormData(event.currentTarget)
    const submission = Object.fromEntries(formData.entries())

    try {
      const response = await fetch(leadFormEndpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error('Lead delivery failed')
      if (brochure) {
        if (!result.downloadUrl) throw new Error('Brochure link missing')
        const url = new URL(result.downloadUrl, new URL(leadFormEndpoint, window.location.href)).href
        setDownloadUrl(url)
        startDownload(url)
      }
      setStatus('sent')
      onFocusChange?.(false)
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent' && brochure) {
    return (
      <div className="form-success form-success-compact" role="status" aria-live="polite">
        <span className="success-mark"><Icon name="check" size={18} /></span>
        <div>
          <strong>Thank you! Your brochure is downloading.</strong>
          <p>If nothing happens, use the button below.</p>
          <a className="button button-gold form-download" href={downloadUrl} download="vastu-city-rameshwaram-brochure.pdf">DOWNLOAD AGAIN <Icon name="download" size={16} /></a>
        </div>
      </div>
    )
  }

  if (status === 'sent') {
    return (
      <div className={`form-success${compact ? ' form-success-compact' : ''}`} role="status" aria-live="polite">
        <span className="success-mark"><Icon name="check" size={18} /></span>
        <div><strong>Thank you for reaching out.</strong><p>Your enquiry has been sent to our project team.</p></div>
      </div>
    )
  }

  return (
    <form
      className={`lead-form${compact ? ' lead-form-compact' : ''}`}
      onSubmit={handleSubmit}
      onFocus={() => onFocusChange?.(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onFocusChange?.(false)
      }}
    >
      <input type="hidden" name="project" value="Vastu City Rameshwaram, Indore" />
      <input type="hidden" name="lead_source" value={source} />
      {brochure && <>
        <input type="hidden" name="want_brochure" value="yes" />
        <input type="hidden" name="enquiry_type" value="Request a brochure" />
      </>}
      <label className="sr-only" htmlFor={`${formId}-name`}>Full name</label>
      <input id={`${formId}-name`} name="name" autoComplete="name" placeholder="Full Name" required />
      <label className="sr-only" htmlFor={`${formId}-phone`}>Phone number</label>
      <input id={`${formId}-phone`} name="phone" type="tel" autoComplete="tel" placeholder="Phone Number" pattern="(?=(?:\D*\d){10})\+?[0-9\(\) \-]{10,20}" title="Enter a valid phone number (at least 10 digits)" required />
      <label className="sr-only" htmlFor={`${formId}-email`}>Email address</label>
      <input id={`${formId}-email`} name="email" type="email" autoComplete="email" placeholder="Email Address" required />
      <div className="consent-row">
        <input id={`${formId}-consent`} name="consent" type="checkbox" value="Agreed to be contacted" required />
        <label htmlFor={`${formId}-consent`}>I agree to be contacted by Happy Move about this enquiry.</label>
      </div>
      {status === 'error' && <p className="form-error" role="alert">We couldn’t send this just now. Please try again or call us on <a href="tel:+919403892218">+91 94038 92218</a>.</p>}
      <button className="button button-gold form-submit" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'SENDING...' : buttonLabel}<Icon name="arrow" size={17} />
      </button>
      <p className="form-note">Your details are shared only with our project advisor for this enquiry.</p>
    </form>
  )
}

function AmenityCarousel({ onOpen }) {
  const trackRef = useRef(null)
  const [state, setState] = useState({ page: 0, pages: 1 })

  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined
    const update = () => {
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0
      const max = track.scrollWidth - track.clientWidth
      const pages = Math.max(1, Math.round((track.scrollWidth + gap) / (track.clientWidth + gap)))
      const page = max > 0 ? Math.round((track.scrollLeft / max) * (pages - 1)) : 0
      setState((current) => (current.page === page && current.pages === pages ? current : { page, pages }))
    }
    update()
    track.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(track)
    return () => {
      track.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [])

  function scrollToPage(page) {
    const track = trackRef.current
    const max = track.scrollWidth - track.clientWidth
    track.scrollTo({ left: state.pages > 1 ? (max * page) / (state.pages - 1) : 0, behavior: 'smooth' })
  }

  return (
    <div className="amenity-carousel">
      <div className="amenity-track" ref={trackRef} tabIndex={0} aria-label="Amenity photographs">
        {amenities.map((item) => (
          <button className="amenity-card" key={item.title} type="button" onClick={() => onOpen(item)} aria-label={`View ${item.title}`}>
            <img src={item.image} alt={item.title} loading="lazy" />
            <span className="amenity-pill">{item.title}{item.note && <small>{item.note}</small>}</span>
          </button>
        ))}
      </div>
      <div className="carousel-controls">
        <button type="button" aria-label="Previous amenities" disabled={state.page === 0} onClick={() => scrollToPage(state.page - 1)}><Icon name="arrow" size={17} /></button>
        <div className="carousel-dots">
          {Array.from({ length: state.pages }, (_, index) => (
            <button key={index} type="button" aria-label={`Amenities page ${index + 1}`} aria-current={state.page === index ? 'true' : undefined} className={state.page === index ? 'active' : ''} onClick={() => scrollToPage(index)} />
          ))}
        </div>
        <button type="button" aria-label="Next amenities" disabled={state.page === state.pages - 1} onClick={() => scrollToPage(state.page + 1)}><Icon name="arrow" size={17} /></button>
      </div>
    </div>
  )
}

function ThemeToggle({ theme, onToggle, className }) {
  const next = theme === 'light' ? 'dark' : 'light'
  return (
    <button className={className} type="button" onClick={onToggle} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`}>
      {theme === 'light' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </svg>
      )}
    </button>
  )
}

function SectionHeading({ eyebrow, title, light = false, intro }) {
  return (
    <div className={`section-heading${light ? ' section-heading-light' : ''}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {intro && <p className="section-intro">{intro}</p>}
      <span className="heading-rule" />
    </div>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [locationTab, setLocationTab] = useState('Schools')
  const [galleryTab, setGalleryTab] = useState('Exterior')
  const [activeWalkthroughSlide, setActiveWalkthroughSlide] = useState(0)
  const [modal, setModal] = useState(null)
  const [activeHeaderImage, setActiveHeaderImage] = useState(0)
  const [headerScrolled, setHeaderScrolled] = useState(false)
  const [leadFormFocused, setLeadFormFocused] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const [theme, setTheme] = useState(() => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'))
  const walkthroughTouchX = useRef(null)
  const progressRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const rotation = window.setTimeout(() => {
      setActiveHeaderImage((current) => (current + 1) % headerImages.length)
    }, 5000)

    return () => window.clearTimeout(rotation)
  }, [activeHeaderImage])

  useEffect(() => {
    const sectionIds = ['about', 'highlights', 'configuration', 'location', 'gallery']
    let frame = 0
    const updateHeaderState = () => {
      frame = 0
      setHeaderScrolled(window.scrollY > 20)
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0})`
      let current = ''
      for (const id of sectionIds) {
        const element = document.getElementById(id)
        if (element && element.getBoundingClientRect().top <= 140) current = `#${id}`
      }
      setActiveSection(current)
    }
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(updateHeaderState) }
    updateHeaderState()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => {
    if (!modal) return undefined
    const closeOnEscape = (event) => event.key === 'Escape' && setModal(null)
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [modal])

  useEffect(() => {
    if (!menuOpen) return undefined
    const closeMenu = (event) => {
      if (event.type === 'keydown' ? event.key === 'Escape' : !event.target.closest('.site-header')) setMenuOpen(false)
    }
    document.addEventListener('keydown', closeMenu)
    document.addEventListener('pointerdown', closeMenu)
    return () => {
      document.removeEventListener('keydown', closeMenu)
      document.removeEventListener('pointerdown', closeMenu)
    }
  }, [menuOpen])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#fbf8f2' : '#11110e')
  }, [theme])

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    try {
      localStorage.setItem('vc-theme', next)
    } catch {
      // Private browsing: the choice just won't be remembered.
    }
  }

  function openRequest(title, options = {}) {
    setModal({ kind: 'form', title, ...options })
  }

  function openBrochure() {
    openRequest('Download the brochure', { brochure: true })
  }

  function moveWalkthroughSlide(direction) {
    setActiveWalkthroughSlide((current) => (
      (current + direction + walkthroughSlides.length) % walkthroughSlides.length
    ))
  }

  function handleWalkthroughSwipe(event) {
    const startX = walkthroughTouchX.current
    walkthroughTouchX.current = null
    if (startX === null) return
    const distance = event.changedTouches[0].clientX - startX
    if (Math.abs(distance) > 40) moveWalkthroughSlide(distance < 0 ? 1 : -1)
  }

  const navItems = [
    ['About', '#about'],
    ['Highlights', '#highlights'],
    ['Pricing', '#configuration'],
    ['Location', '#location'],
    ['Gallery', '#gallery'],
  ]

  return (
    <>
      <header className={`site-header${headerScrolled ? ' is-scrolled' : ''}`} id="top">
        <span className="scroll-progress" ref={progressRef} aria-hidden="true" />
        <a className="brand" href="#top" aria-label="Vastu City Rameshwaram home">
          <span className="brand-name">VASTU CITY</span>
          <span className="brand-sub">RAMESHWARAM</span>
          <span className="brand-tagline">MARKETED BY HAPPY MOVE</span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map(([label, href]) => <a key={href} href={href} aria-current={activeSection === href ? 'location' : undefined}>{label}</a>)}
        </nav>
        <div className="header-actions">
          <a className="header-contact-link" href="tel:+919403892218">Call</a>
          <a className="header-contact-link" href="https://wa.me/919403892218" target="_blank" rel="noreferrer">WhatsApp</a>
          <button className="header-callback" type="button" onClick={() => openRequest('Book a site visit')}>SITE VISIT</button>
          <ThemeToggle className="header-theme" theme={theme} onToggle={toggleTheme} />
        </div>
        <ThemeToggle className="header-theme header-theme-mobile" theme={theme} onToggle={toggleTheme} />
        <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          <Icon name={menuOpen ? 'close' : 'menu'} size={25} />
        </button>
        {menuOpen && (
          <nav className="menu-panel" aria-label="Main navigation">
            {navItems.map(([label, href], index) => (
              <a key={href} href={href} aria-current={activeSection === href ? 'location' : undefined} onClick={() => setMenuOpen(false)}><span>0{index + 1}</span>{label}<Icon name="arrowUp" size={15} /></a>
            ))}
            <div className="menu-panel-actions">
              <a href="tel:+919403892218">Call</a>
              <a href="https://wa.me/919403892218" target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
          </nav>
        )}
      </header>
      <button className="vertical-enquiry" type="button" onClick={() => openRequest('Express Your Interest')}>ENQUIRE NOW</button>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          {headerImages.map((image, index) => (
            <img
              className={`hero-image hero-image-slide${index === activeHeaderImage ? ' is-active' : ''}`}
              src={image}
              alt={index === activeHeaderImage ? 'Vastu City Rameshwaram towers' : ''}
              aria-hidden={index !== activeHeaderImage}
              fetchPriority={index === 0 ? 'high' : undefined}
              key={image}
            />
          ))}
          <div className="hero-shade" />
          <div className="hero-slider-controls">
            <button type="button" aria-label="Previous image" onClick={() => setActiveHeaderImage((current) => (current - 1 + headerImages.length) % headerImages.length)}><Icon name="arrow" size={17} /></button>
            <div className="carousel-dots">
              {headerImages.map((image, index) => (
                <button key={image} type="button" aria-label={`Show hero image ${index + 1}`} aria-current={index === activeHeaderImage ? 'true' : undefined} className={index === activeHeaderImage ? 'active' : ''} onClick={() => setActiveHeaderImage(index)} />
              ))}
            </div>
            <button type="button" aria-label="Next image" onClick={() => setActiveHeaderImage((current) => (current + 1) % headerImages.length)}><Icon name="arrow" size={17} /></button>
          </div>
          <div className="hero-content page-wrap">
            <div className="hero-copy">
              <p className="approval"><span className="approval-dot" /> RERA APPROVED <span className="approval-separator">/</span> P-OTH-23-3881</p>
              <p className="eyebrow hero-eyebrow">AN EPIC LIFESTYLE · PHASE-2</p>
              <h1 id="hero-title">Vastu City<br /><em>Rameshwaram</em></h1>
              <p className="hero-description">A kingdom for the most influential — where your address speaks about your status. 13 towers in Bicholi Mardana, Indore, with amenities that are ready to use today.</p>
              <div className="hero-actions">
                <button className="button button-gold" type="button" onClick={openBrochure}>DOWNLOAD BROCHURE <Icon name="download" size={17} /></button>
                <a className="text-button" href="#configuration">VIEW PRICE</a>
              </div>
            </div>
            <aside className="interest-panel">
              <p className="eyebrow">LIMITED INVENTORY</p>
              <h2>Express Your Interest</h2>
              <p className="interest-copy">Get pricing, offers &amp; site visit slots.</p>
              <button className="interest-cta" type="button" onClick={() => openRequest('Request a callback')}>
                REQUEST A CALLBACK <Icon name="arrow" size={17} />
              </button>
              <p className="interest-consent">By submitting, you agree to be contacted by Happy Move about Vastu City Rameshwaram.</p>
            </aside>
          </div>
        </section>

        <section className="about-section section-pad" id="about">
          <div className="about-grid page-wrap">
            <div className="about-copy">
              <SectionHeading eyebrow="ABOUT THE PROJECT" title={<>Here your address <em>speaks</em> about your status</>} />
              <p>Vastu City Rameshwaram (Phase-2) is a gated residential community behind Vidhya Sagar School in Bicholi Mardana, Indore. Spread across 13 towers with five entry gates and wide 9 m–12 m approach roads, it is designed as a true kingdom — vastu-led planning, landscaped gardens and a lifestyle defined by space.</p>
              <p>Unlike promises on paper, the swimming pool, gymnasium, temple and gardens here are already built and ready to use. Images on this page include actual site photographs and project visuals. Approved by SBI, HDFC Home Loans, LIC HFL and all major banks.</p>
              <button className="link-button button button-gold" type="button" onClick={openBrochure}>DOWNLOAD BROCHURE <Icon name="download" size={16} /></button>
            </div>
            <figure className="about-image-wrap">
              <img src={aboutRender} alt="Vastu City towers and landscaped courtyard" loading="lazy" />
              <figcaption><span>13</span><span>RESIDENTIAL TOWERS</span></figcaption>
            </figure>
          </div>
        </section>

        <section className="highlights-section section-pad" id="highlights">
          <div className="page-wrap">
            <div className="highlights-header">
              <SectionHeading eyebrow="PROJECT HIGHLIGHTS" title="Crafted for the influential" light />
            </div>
            <div className="highlight-grid">
              {highlights.map(([title, detail], index) => (
                <article className="highlight-item" key={title}>
                  <span className="highlight-number"><Icon name={highlightIcons[index]} size={24} /></span>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="configuration-section section-pad" id="configuration">
          <div className="page-wrap">
            <div className="configuration-heading">
              <SectionHeading eyebrow="CONFIGURATION & PRICING" title="Choose your residence" />
            </div>
            <div className="configuration-grid">
              <div className="configuration-table-wrap">
                <div className="pricing-table" role="table" aria-label="Residence configurations and pricing">
                  <div className="pricing-row pricing-head" role="row"><span role="columnheader">TYPE</span><span role="columnheader">AREA (SQ.FT.)</span><span role="columnheader">PRICE</span></div>
                  <div className="pricing-row" role="row">
                    <div className="residence-name" role="cell"><strong>Premium Residence (Typical Plan)</strong></div>
                    <span className="area-value" role="cell">1660 Carpet</span>
                    <div className="price-action" role="cell"><button className="button button-gold" type="button" onClick={() => openRequest('Ask about the premium residence')}><span>PRICE ON<br />REQUEST</span></button></div>
                  </div>
                  <div className="pricing-row" role="row">
                    <div className="residence-name" role="cell"><strong>Other Configurations</strong></div>
                    <span className="area-value" role="cell">On Request</span>
                    <div className="price-action" role="cell"><button className="button button-gold" type="button" onClick={() => openRequest('Explore other configurations')}><span>PRICE ON<br />REQUEST</span></button></div>
                  </div>
                  <div className="pricing-footnote"><p>Typical plan includes lobby, living room, kitchen with store, bedrooms with dressing &amp; toilets, wash area and a 12'10" × 6'5" balcony.</p></div>
                </div>
              </div>
              <div className="configuration-visual">
                <button className="configuration-plan" type="button" onClick={() => setModal({ kind: 'floorplan', title: 'Typical residence floor plan' })} aria-label="View the typical floor plan full size">
                  <img src={threeBhkPlanImage} alt="Typical 3 BHK residence floor plan" loading="lazy" />
                </button>
                <button className="floorplan-link" type="button" onClick={() => setModal({ kind: 'floorplan', title: 'Typical residence floor plan' })}>
                  VIEW FULL SIZE
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="location-section section-pad" id="location">
          <div className="location-grid page-wrap">
            <div className="location-copy">
              <SectionHeading eyebrow="LOCATION ADVANTAGES" title="Bicholi Mardana, Indore" />
              <p className="location-address"><Icon name="pin" size={18} /> Vidyasagar School Indore, Pragati Vihar, Indore, Madhya Pradesh 452016, India</p>
              <div className="location-tabs" role="tablist" aria-label="Nearby places">
                {Object.keys(locationDetails).map((tab) => <button key={tab} type="button" role="tab" aria-selected={locationTab === tab} className={locationTab === tab ? 'active' : ''} onClick={() => setLocationTab(tab)}><Icon name={tab === 'Schools' ? 'school' : tab === 'Connectivity' ? 'route' : tab === 'Leisure & shopping' ? 'shopping' : 'neighbourhood'} size={15} />{tab}</button>)}
              </div>
              <ul className="location-list" role="tabpanel">
                {locationDetails[locationTab].map((place, index) => <li key={place}><span>0{index + 1}</span>{place}<Icon name="arrowUp" size={15} /></li>)}
              </ul>
                <a className="link-button" href="https://maps.google.com/?q=Vidyasagar+School+Indore%2C+Pragati+Vihar%2C+Indore%2C+Madhya+Pradesh+452016%2C+India" target="_blank" rel="noreferrer">OPEN IN MAPS <Icon name="arrowUp" size={16} /></a>
            </div>
              <iframe className="map-panel" title="Map of Vidyasagar School Indore" src="https://maps.google.com/maps?q=Vidyasagar%20School%20Indore%2C%20Pragati%20Vihar%2C%20Indore%2C%20Madhya%20Pradesh%20452016%2C%20India&t=&z=15&ie=UTF8&iwloc=&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </section>

        <section className="amenities-section section-pad" id="amenities">
          <div className="page-wrap">
            <div className="amenities-heading"><SectionHeading eyebrow="READY-TO-USE AMENITIES" title="Actual photographs, not promises" light /></div>
            <AmenityCarousel onOpen={(item) => setModal({ kind: 'image', title: item.title, image: item.image })} />
            <p className="amenity-extras">Also: Shopping Plaza · Wide internal roads · 5 gated entries · Gym with treadmill, elliptical, cable machine &amp; exercise bike</p>
          </div>
        </section>

        <section className="gallery-section section-pad" id="gallery">
          <div className="page-wrap">
            <div className="gallery-heading-row">
              <SectionHeading eyebrow="GALLERY" title="A glimpse of the kingdom" />
              <div className="gallery-tabs" role="tablist" aria-label="Gallery category">
                {Object.keys(gallery).map((tab) => <button key={tab} type="button" role="tab" aria-selected={galleryTab === tab} className={galleryTab === tab ? 'active' : ''} onClick={() => setGalleryTab(tab)}>{tab === 'Interior / amenities' ? 'INTERIOR / AMENITIES' : tab.toUpperCase()}</button>)}
              </div>
            </div>
            <div className={`gallery-grid${galleryTab === 'Floor plans' ? ' gallery-grid-floorplan' : ''}`}>
              {gallery[galleryTab].map((item, index) => (
                <button className={`gallery-item gallery-item-${index + 1}`} key={item.title} type="button" onClick={() => setModal({ kind: 'image', title: item.title, image: item.image, plan: item.plan })} aria-label={`View ${item.title}`}>
                  <img src={item.image} alt={item.title} loading="lazy" />
                  <span className="gallery-item-caption"><span>0{index + 1} / 0{gallery[galleryTab].length}</span><strong>{item.title}</strong><Icon name="arrowUp" size={17} /></span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="walkthrough-section section-pad" aria-label="Vastu City image slider">
          <div className="walkthrough-wrap page-wrap">
            <div className="walkthrough-heading">
              <SectionHeading eyebrow="LIFE AT VASTU CITY" title="A closer look at your next home" light />
              <div className="walkthrough-controls">
                <button type="button" aria-label="Previous slide" onClick={() => moveWalkthroughSlide(-1)}><Icon name="arrow" size={19} /></button>
                <button type="button" aria-label="Next slide" onClick={() => moveWalkthroughSlide(1)}><Icon name="arrow" size={19} /></button>
              </div>
            </div>
            <div
              className="walkthrough-grid"
              aria-live="polite"
              onTouchStart={(event) => { walkthroughTouchX.current = event.touches[0].clientX }}
              onTouchEnd={handleWalkthroughSwipe}
            >
              {[0, 1, 2].map((offset) => {
                const slideIndex = (activeWalkthroughSlide + offset) % walkthroughSlides.length
                const slide = walkthroughSlides[slideIndex]
                return (
                  <button
                    className="walkthrough-card"
                    key={slide.title}
                    type="button"
                    onClick={() => setModal({ kind: 'image', title: slide.title, image: slide.image })}
                    aria-label={`View ${slide.title}`}
                  >
                    <img src={slide.image} alt="" loading="lazy" />
                    <span className="walkthrough-caption">
                      <span className="walkthrough-detail">{slide.detail}</span>
                      <strong>{slide.title}</strong>
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="walkthrough-pagination" aria-label="Choose a slide">
              {walkthroughSlides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  aria-label={`Show slide ${index + 1}: ${slide.title}`}
                  aria-current={activeWalkthroughSlide === index ? 'true' : undefined}
                  className={activeWalkthroughSlide === index ? 'active' : ''}
                  onClick={() => setActiveWalkthroughSlide(index)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="partner-section section-pad">
          <div className="partner-inner page-wrap">
            <div className="partner-copy">
              <SectionHeading eyebrow="ABOUT THE MARKETER" title={<>Happy Move — <em>Indore's trusted</em> channel partner</>} />
              <p>Happy Move is a premier real estate channel partner in Indore, authorized to facilitate bookings at Vastu City Rameshwaram. From the first site visit to home loan coordination and possession, our advisors make buying your home transparent, informed and effortless.</p>
              <button className="button button-dark" type="button" onClick={() => openRequest('Book a personal site visit')}>BOOK A SITE VISIT <Icon name="arrow" size={17} /></button>
            </div>
            <div className="partner-points">
              {[
                ['handshake', 'Authorized Partner', 'Officially facilitating this project'],
                ['advisor', 'Personal Advisors', 'Dedicated relationship manager'],
                ['support', 'End-to-End Support', 'Site visits, loans & paperwork'],
              ].map(([icon, title, detail]) => <div className="partner-point" key={title}><span className="partner-point-icon"><Icon name={icon} size={21} /></span><div><strong>{title}</strong><p>{detail}</p></div><Icon name="arrowUp" size={17} /></div>)}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <section className="footer-contact-strip" aria-label="Contact options">
          <div className="contact-strip-grid page-wrap">
            <a className="contact-card" href="tel:+919403892218">
              <span>CALL US</span>
              <strong>+91 94038 92218</strong>
            </a>
            <button className="contact-card" type="button" onClick={() => openRequest('Book a site visit')}>
              <span>SITE VISIT</span>
              <strong>Book a personalized walkthrough</strong>
            </button>
          </div>
        </section>
        <div className="footer-main page-wrap">
          <div className="footer-about">
            <a className="brand footer-brand" href="#top" aria-label="Vastu City Rameshwaram home"><span className="brand-name">VASTU CITY</span><span className="brand-sub">RAMESHWARAM</span></a>
            <p className="footer-marketer">Marketed by Happy Move – Authorized Channel Partner</p>
          </div>
          <nav className="footer-nav" aria-label="Footer navigation">
            {[
              ['About', '#about'],
              ['Highlights', '#highlights'],
              ['Pricing', '#configuration'],
              ['Location', '#location'],
            ].map(([label, href]) => <a key={href} href={href}>{label}</a>)}
          </nav>
          <ul className="footer-details">
            <li><Icon name="badge" size={20} /><span>MP RERA No: P-OTH-23-3881</span></li>
            <li><Icon name="pin" size={20} /><span>Behind Vidhya Sagar School, Bicholi Mardana, Indore</span></li>
          </ul>
        </div>
        <div className="footer-fineprint page-wrap" id="disclaimer">
          <p><strong>Disclaimer:</strong> This is the official landing page of Happy Move, an authorized channel partner for Vastu City Rameshwaram. This is not the developer’s official website.</p>
          <p>The contents are purely conceptual and have no legal binding. The builder reserves the right to amend layouts, plans, dimensions, elevations, colour schemes, specifications and amenities without notice. Subject to Indore jurisdiction. Images are for representation; some are artistic renders.</p>
          <p className="footer-copyright">© {currentYear} Happy Move. All rights reserved.</p>
        </div>
      </footer>

      <div className="sticky-actions" aria-label="Quick actions" style={leadFormFocused ? { transform: 'translateY(100%)', opacity: 0, visibility: 'hidden', pointerEvents: 'none' } : undefined}>
        <button type="button" className="sticky-primary" onClick={() => openRequest('Plan your visit to Vastu City')}>REQUEST SITE VISIT</button>
        <button type="button" className="sticky-secondary" onClick={openBrochure}>DOWNLOAD BROCHURE <Icon name="download" size={16} /></button>
      </div>

      {modal && (
        <div className={`modal-backdrop modal-backdrop-${modal.kind}`} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setModal(null)}>
          <section className={`modal-dialog${modal.kind === 'image' ? ' modal-image' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <button className="modal-close" type="button" aria-label="Close dialog" onClick={() => setModal(null)}><Icon name="close" size={21} /></button>
            {modal.kind === 'image' ? <div className={`modal-image-frame${modal.plan ? ' is-plan' : ''}`}><img src={modal.image} alt={modal.title} /></div> : modal.kind === 'floorplan' ? (
              <>
                <p className="eyebrow">TYPICAL 3 BHK FLOOR PLAN · 2300 SQ. FT.</p><h2 id="modal-title">{modal.title}</h2>
                <p className="modal-description">Typical plan includes lobby, living room, kitchen with store, bedrooms with dressing and toilets, wash area and balcony.</p>
                <div className="modal-floorplan-scroll"><img className="modal-floorplan-image" src={threeBhkPlanImage} alt="Typical 3 BHK residence floor plan" /></div>
                <button className="button button-gold modal-cta" type="button" onClick={() => openRequest('Ask about the typical residence')}>ASK ABOUT THIS PLAN <Icon name="arrow" size={16} /></button>
              </>
            ) : (
              <>
                <p className="eyebrow">VASTU CITY RAMESHWARAM · INDORE</p><h2 id="modal-title">{modal.title}</h2>
                <p className="modal-description">{modal.brochure ? 'Enter your details and the Vastu City Rameshwaram brochure will download straight away.' : 'Leave your details and a Happy Move advisor will get back to you with the information you need.'}</p>
                <LeadForm compact brochure={modal.brochure} buttonLabel={modal.brochure ? 'DOWNLOAD BROCHURE' : 'SEND MY REQUEST'} source={modal.title} onFocusChange={setLeadFormFocused} />
              </>
            )}
            {modal.kind === 'image' && <p className="image-modal-caption">{modal.title}<span>VASTU CITY RAMESHWARAM · INDORE</span></p>}
          </section>
        </div>
      )}
    </>
  )
}

export default App
