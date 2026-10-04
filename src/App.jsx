import { useEffect, useId, useState } from 'react'
import './App.css'

import heroImage from './assets/property/hero.jpg'
import gardenImage from './assets/property/garden.jpg'
import poolImage from './assets/property/pool.jpg'
import gymImage from './assets/property/gym.jpg'
import templeImage from './assets/property/temple.jpg'
import landscapeImage from './assets/property/landscape.jpg'
import playImage from './assets/property/play.jpg'
import clubImage from './assets/property/club.jpg'
import exteriorTwoImage from './assets/property/exterior-two.jpg'
import exteriorFourImage from './assets/property/exterior-four.jpg'
import exteriorFiveImage from './assets/property/exterior-five.jpg'
import exteriorSixImage from './assets/property/exterior-six.jpg'
import floorplanImage from './assets/property/floorplan.jpg'
import headerImageNine from './assets/property/vc-9.jpg'
import headerImageTen from './assets/property/vc-10.jpg'
import headerImageEleven from './assets/property/vc-11.jpg'

const headerImages = [headerImageNine, headerImageTen, headerImageEleven]
const leadFormEndpoint = 'https://formsubmit.co/ajax/reethappymove19@gmail.com'

const photos = {
  hero: heroImage,
  garden: gardenImage,
  pool: poolImage,
  gym: gymImage,
  temple: templeImage,
  landscape: landscapeImage,
  play: playImage,
  club: clubImage,
  exterior: heroImage,
  exteriorTwo: exteriorTwoImage,
  exteriorThree: gardenImage,
  exteriorFour: exteriorFourImage,
  exteriorFive: exteriorFiveImage,
  exteriorSix: exteriorSixImage,
  floorplan: floorplanImage,
}

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

const gallery = {
  Exterior: [
    { title: 'Exterior 1', image: photos.exterior },
    { title: 'Exterior 2', image: photos.exteriorTwo },
    { title: 'Exterior 3', image: photos.exteriorThree },
    { title: 'Exterior 4', image: photos.exteriorFour },
    { title: 'Exterior 5', image: photos.exteriorFive },
    { title: 'Exterior 6', image: photos.exteriorSix },
  ],
  'Interior / amenities': [
    { title: 'Swimming Pool', image: photos.pool },
    { title: 'Gymnasium', image: photos.gym },
    { title: 'Temple', image: photos.temple },
    { title: 'Landscaped Gardens', image: photos.landscape },
    { title: "Kids' Play Area", image: photos.play },
    { title: 'Club House', image: photos.club },
  ],
  'Floor plans': [
    { title: 'Floor plan preview', image: photos.floorplan },
  ],
}

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

function LeadForm({ compact = false, buttonLabel = 'SEND REQUEST', source = 'Hero enquiry form', onFocusChange }) {
  const formId = useId().replaceAll(':', '')
  const [status, setStatus] = useState('idle')

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('sending')

    const formData = new FormData(event.currentTarget)
    const submission = Object.fromEntries(formData.entries())
    submission._subject = `Vastu City enquiry: ${submission.name}`
    submission._template = 'table'

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
      setStatus('sent')
      onFocusChange?.(false)
    } catch {
      setStatus('error')
    }
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
      <label className="sr-only" htmlFor={`${formId}-name`}>Full name</label>
      <input id={`${formId}-name`} name="name" autoComplete="name" placeholder="Full Name" required />
      <label className="sr-only" htmlFor={`${formId}-phone`}>Phone number</label>
      <input id={`${formId}-phone`} name="phone" type="tel" autoComplete="tel" placeholder="Phone Number" pattern="[0-9+() -]{10,}" title="Enter a valid phone number" required />
      <label className="sr-only" htmlFor={`${formId}-email`}>Email address</label>
      <input id={`${formId}-email`} name="email" type="email" autoComplete="email" placeholder="Email Address" required />
      {compact && <>
        <label className="sr-only" htmlFor={`${formId}-interest`}>What can we help you with?</label>
        <select id={`${formId}-interest`} name="enquiry_type" defaultValue="Pricing and availability">
          <option>Pricing and availability</option>
          <option>Book a site visit</option>
          <option>Request a brochure</option>
          <option>Other enquiry</option>
        </select>
        <label className="sr-only" htmlFor={`${formId}-message`}>Message (optional)</label>
        <textarea id={`${formId}-message`} name="message" placeholder="Message (optional)" rows="3" />
      </>}
      <div className="consent-row">
        <input id={`${formId}-consent`} name="consent" type="checkbox" value="Agreed to be contacted" required />
        <label htmlFor={`${formId}-consent`}>I agree to be contacted by Happy Move about this enquiry.</label>
      </div>
      {status === 'error' && <p className="form-error" role="alert">We couldn’t send this just now. Please try again or <a href="mailto:reethappymove19@gmail.com">email our team</a>.</p>}
      <button className="button button-gold form-submit" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'SENDING...' : buttonLabel}<Icon name="arrow" size={17} />
      </button>
      <p className="form-note">Your details are shared only with our project advisor for this enquiry.</p>
    </form>
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
  const [modal, setModal] = useState(null)
  const [activeHeaderImage, setActiveHeaderImage] = useState(0)
  const [headerScrolled, setHeaderScrolled] = useState(false)
  const [leadFormFocused, setLeadFormFocused] = useState(false)

  useEffect(() => {
    const rotation = window.setInterval(() => {
      setActiveHeaderImage((current) => (current + 1) % headerImages.length)
    }, 2000)

    return () => window.clearInterval(rotation)
  }, [])

  useEffect(() => {
    const updateHeaderState = () => setHeaderScrolled(window.scrollY > 20)
    updateHeaderState()
    window.addEventListener('scroll', updateHeaderState, { passive: true })
    return () => window.removeEventListener('scroll', updateHeaderState)
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

  function openRequest(title) {
    setModal({ kind: 'form', title })
  }

  const navItems = [
    ['Overview', '#about'],
    ['Configuration', '#configuration'],
    ['Amenities', '#amenities'],
    ['Gallery', '#gallery'],
  ]

  return (
    <>
      <header className={`site-header${headerScrolled ? ' is-scrolled' : ''}`} id="top">
        <a className="brand" href="#top" aria-label="Vastu City Rameshwaram home">
          <span className="brand-name">VASTU CITY</span>
          <span className="brand-sub">Rameshwaram</span>
        </a>
        <span className="header-partner">Marketed by <span className="happy-move">Happy Move</span><br />Authorized Channel Partner</span>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
        </nav>
        <button className="header-callback" type="button" onClick={() => openRequest('Express Your Interest')}>☎ CALL BACK</button>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          <Icon name={menuOpen ? 'close' : 'menu'} size={25} />
        </button>
        {menuOpen && (
          <nav className="menu-panel" aria-label="Main navigation">
            {navItems.map(([label, href], index) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}><span>0{index + 1}</span>{label}<Icon name="arrowUp" size={15} /></a>
            ))}
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
          <div className="hero-content page-wrap">
            <div className="hero-copy">
              <p className="approval"><span className="approval-dot" /> RERA APPROVED <span className="approval-separator">/</span> P-OTH-23-3881</p>
              <p className="eyebrow hero-eyebrow">AN EPIC LIFESTYLE · PHASE-2</p>
              <h1 id="hero-title">Vastu City<br /><em>Rameshwaram</em></h1>
              <p className="hero-description">A kingdom for the most influential — where your address speaks about your status. 13 towers in Bicholi Mardana, Indore, with amenities that are ready to use today.</p>
              <div className="hero-actions">
                <a className="button button-gold" href="/vastu-city-rameshwaram-brochure.pdf" download="vastu-city-rameshwaram-brochure.pdf">DOWNLOAD BROCHURE <Icon name="download" size={17} /></a>
                <a className="text-button" href="#configuration">VIEW PRICE</a>
              </div>
            </div>
            <aside className="interest-panel">
              <p className="eyebrow">LIMITED INVENTORY</p>
              <h2>Express Your Interest</h2>
              <p className="interest-copy">Get pricing, offers &amp; site visit slots.</p>
              <LeadForm buttonLabel="SUBMIT" onFocusChange={setLeadFormFocused} />
            </aside>
          </div>
        </section>

        <section className="about-section section-pad" id="about">
          <div className="about-grid page-wrap">
            <div className="about-copy">
              <SectionHeading eyebrow="ABOUT THE PROJECT" title={<>Here your address <em>speaks</em> about your status</>} />
              <p>Vastu City Rameshwaram (Phase-2) is a gated residential community behind Vidhya Sagar School in Bicholi Mardana. Spread across 13 towers with five entry gates and wide 9 m–12 m approach roads, it is designed as a true kingdom — vastu-led planning, landscaped gardens and a lifestyle defined by space.</p>
              <p>Unlike promises on paper, the swimming pool, gymnasium, temple and gardens here are already built and ready to use — every photograph you see is an actual photograph. Approved by SBI, HDFC Home Loans, LIC HFL and all major banks.</p>
              <a className="link-button button button-gold" href="/vastu-city-rameshwaram-brochure.pdf" download="vastu-city-rameshwaram-brochure.pdf">DOWNLOAD BROCHURE <Icon name="download" size={16} /></a>
            </div>
            <figure className="about-image-wrap">
              <img src={photos.garden} alt="Vastu City towers and garden" loading="lazy" />
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
                    <div className="price-action" role="cell"><button className="button button-gold" type="button" onClick={() => openRequest('Ask about the premium residence')}>PRICE ON REQUEST</button></div>
                  </div>
                  <div className="pricing-row" role="row">
                    <div className="residence-name" role="cell"><strong>Other Configurations</strong></div>
                    <span className="area-value" role="cell">On Request</span>
                    <div className="price-action" role="cell"><button className="button button-gold" type="button" onClick={() => openRequest('Explore other configurations')}>PRICE ON REQUEST</button></div>
                  </div>
                  <div className="pricing-footnote"><p>Typical plan includes lobby, living room, kitchen with store, bedrooms with dressing &amp; toilets, wash area and a 12'10" × 6'5" balcony.</p></div>
                </div>
              </div>
              <button className="floorplan-card" type="button" onClick={() => setModal({ kind: 'floorplan', title: 'Typical residence floor plan' })} aria-label="View floor plan">
                <img src={photos.floorplan} alt="Floor plan preview" loading="lazy" />
                <span className="floorplan-label"><span className="floorplan-lock">⌑</span><strong>VIEW FLOOR PLAN</strong></span>
              </button>
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
            <div className="amenity-grid">
              {[
                ['Swimming Pool', photos.pool, '01'], ['Gymnasium', photos.gym, '02'], ['Temple', photos.temple, '03'],
                ['Landscaped Gardens', photos.landscape, '04'], ["Kids' Play Area", photos.play, '05'], ['Club House', photos.club, '06'],
              ].map(([label, image, index]) => (
                <article className="amenity-card" key={label}>
                  <img src={image} alt={label} loading="lazy" />
                  <div className="amenity-overlay"><span>{index}</span><h3>{label}</h3><span className="amenity-plus"><Icon name="arrowUp" size={15} /></span></div>
                </article>
              ))}
            </div>
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
            <div className="gallery-grid">
              {gallery[galleryTab].map((item, index) => (
                <button className={`gallery-item gallery-item-${index + 1}${index > 2 ? ' gallery-locked' : ''}`} key={item.title} type="button" onClick={() => index > 2 ? openRequest('Request the full gallery') : setModal({ kind: 'image', title: item.title, image: item.image })} aria-label={index > 2 ? `${item.title} click to view` : `View ${item.title}`}>
                  <img src={item.image} alt={item.title} loading="lazy" />
                  <span className="gallery-item-caption"><span>0{index + 1} / 0{gallery[galleryTab].length}</span><strong>{item.title}</strong><Icon name="arrowUp" size={17} /></span>
                  {index > 2 && <span className="gallery-lock">⌑<small>CLICK TO VIEW</small></span>}
                </button>
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
        <div className="footer-main page-wrap">
          <a className="brand footer-brand" href="#top"><span className="brand-name">Vastu City</span><span className="brand-sub">Rameshwaram</span></a>
          <p className="footer-marketer">Marketed by <span className="happy-move">Happy Move</span><br />Authorized Channel Partner</p>
          <div className="footer-contact">
            <span><Icon name="badge" size={15} /> MP RERA NO: P-OTH-23-3881</span>
            <a href="https://maps.google.com/?q=Vidyasagar+School+Indore%2C+Pragati+Vihar%2C+Indore%2C+Madhya+Pradesh+452016%2C+India"><Icon name="pin" size={15} /> Vidyasagar School Indore, Pragati Vihar, Indore, Madhya Pradesh 452016, India</a>
            <a href="mailto:reethappymove19@gmail.com"><Icon name="mail" size={15} /> reethappymove19@gmail.com</a>
          </div>
          <div className="footer-rera"><span>MP RERA NO.</span><strong>P-OTH-23-3881</strong><span>APPROVED PROJECT</span></div>
        </div>
        <div className="footer-legal page-wrap"><p><strong>Disclaimer:</strong> This is the official landing page of Happy Move, an authorized channel partner for Vastu City Rameshwaram. This is not the developer's official website.<br />The contents are purely conceptual and have no legal binding. The builder reserves the right to amend layouts, plans, dimensions, elevations, colour schemes, specifications and amenities without notice. Subject to Indore jurisdiction. Images are for representation; some are artistic renders.<br />© 2026 Happy Move. All rights reserved.</p><div><a href="#top">Privacy Policy</a><a href="#top">Disclaimer</a></div></div>
      </footer>

      <div className="sticky-actions" aria-label="Quick actions" style={leadFormFocused ? { transform: 'translateY(100%)', opacity: 0, visibility: 'hidden', pointerEvents: 'none' } : undefined}>
        <button type="button" className="sticky-primary" onClick={() => openRequest('Plan your visit to Vastu City')}>REQUEST SITE VISIT</button>
        <a className="sticky-secondary" href="/vastu-city-rameshwaram-brochure.pdf" download="vastu-city-rameshwaram-brochure.pdf">DOWNLOAD BROCHURE <Icon name="download" size={16} /></a>
      </div>

      {modal && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setModal(null)}>
          <section className={`modal-dialog${modal.kind === 'image' ? ' modal-image' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <button className="modal-close" type="button" aria-label="Close dialog" onClick={() => setModal(null)}><Icon name="close" size={21} /></button>
            {modal.kind === 'image' ? <img src={modal.image} alt={modal.title} /> : modal.kind === 'floorplan' ? (
              <>
                <p className="eyebrow">1660 SQ. FT. · TYPICAL PLAN</p><h2 id="modal-title">{modal.title}</h2>
                <p className="modal-description">Typical plan includes lobby, living room, kitchen with store, bedrooms with dressing and toilets, wash area and balcony.</p>
                <img className="modal-floorplan-image" src={photos.floorplan} alt="Typical 1660 square foot residence floor plan" />
                <button className="button button-gold modal-cta" type="button" onClick={() => openRequest('Ask about the typical residence')}>ASK ABOUT THIS PLAN <Icon name="arrow" size={16} /></button>
              </>
            ) : (
              <>
                <p className="eyebrow">VASTU CITY RAMESHWARAM · INDORE</p><h2 id="modal-title">{modal.title}</h2>
                <p className="modal-description">Leave your details and a Happy Move advisor will get back to you with the information you need.</p>
                <LeadForm compact buttonLabel="SEND MY REQUEST" source={modal.title} onFocusChange={setLeadFormFocused} />
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
