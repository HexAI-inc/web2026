import html as htmllib, json, pathlib, re, sys

SRC = pathlib.Path(__file__).parent
OUT = pathlib.Path(sys.argv[1])

SITE = 'https://hexai.gm'

# slug: (title, meta description)
PAGES = {
    'index':    ('HexAI | AI & Software Development in The Gambia',
                 'HexAI builds AI systems, business automation, payment infrastructure and custom software in The Gambia. Explore our products and engineering services.'),
    'ai-development-gambia': ('AI Development in The Gambia | HexAI',
                 'HexAI builds AI for Gambian institutions and businesses: fine-tuned and on-device models, AI automation and custom machine learning. Built in Banjul.'),
    'software-development-gambia': ('Software Development in The Gambia | HexAI',
                 'Custom software development in The Gambia: web and mobile apps, payment integrations, business systems and government platforms, built and maintained by HexAI.'),
    'payment-gateway': ('HexAI Payment Gateway | Payment API in The Gambia',
                 'One payment API for The Gambia: collect and pay out over Wave, APS and cards, reconciled on a live ledger. Per-transaction pricing and full developer docs.'),
    'services': ('Services | AI & Software Development | HexAI',
                 'HexAI services: strategy, data infrastructure, AI engineering and software engineering for governments, enterprises and consumer products in The Gambia.'),
    'projects': ('Case Studies & Projects | HexAI, The Gambia',
                 'Live systems built by HexAI in The Gambia: HexAI Payment Gateway, Kernel, Karang, Bantaba AI, Base10, the DPWM biodiversity portal, SSM and more.'),
    'team':     ('Team | HexAI, Banjul',
                 'Meet the HexAI team in Banjul: the engineers and operators building AI and software for The Gambia.'),
    'contact':  ('Contact HexAI | AI & Software Company in Banjul, The Gambia',
                 'Talk to HexAI about an AI or software project. Free 30-minute strategy call. Based in Banjul, The Gambia: admin@hexai.gm, +220 87 783 4351.'),
}

ORG = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': SITE + '/#org',
    'name': 'HexAI',
    'url': SITE + '/',
    'logo': SITE + '/images/logo-hexai.png',
    'description': 'HexAI builds AI products and software infrastructure for African governments, enterprises and students, from payment rails to offline AI tutors.',
    'email': 'admin@hexai.gm',
    'telephone': '+220 87 783 4351',
    'sameAs': ['https://www.linkedin.com/company/hexai-gm'],
    'address': {'@type': 'PostalAddress', 'addressLocality': 'Banjul', 'addressCountry': 'GM'},
    'areaServed': {'@type': 'Country', 'name': 'The Gambia'},
    'knowsAbout': ['Artificial intelligence', 'Machine learning', 'Software development', 'Payment infrastructure', 'Business automation'],
}
WEBSITE = {'@context': 'https://schema.org', '@type': 'WebSite', '@id': SITE + '/#website', 'name': 'HexAI', 'url': SITE + '/', 'publisher': {'@id': SITE + '/#org'}}

def faq_schema(body):
    """Build FAQPage structured data from the page's own <details> FAQ, so the two never drift apart."""
    qa = re.findall(r'<details[^>]*>\s*<summary>(.*?)</summary>\s*<p>(.*?)</p>', body, re.S)
    if not qa:
        return None
    strip = lambda t: htmllib.unescape(re.sub(r'<[^>]+>', '', t)).strip()
    return {'@context': 'https://schema.org', '@type': 'FAQPage',
            'mainEntity': [{'@type': 'Question', 'name': strip(q), 'acceptedAnswer': {'@type': 'Answer', 'text': strip(a)}} for q, a in qa]}

def ld(obj):
    return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False) + '</script>'

NAV = [('services', 'Services'), ('projects', 'Projects'), ('team', 'Team'), ('contact', 'Contact')]

ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'

def href(slug):
    return '/' if slug == 'index' else f'/{slug}'

def nav(cur):
    cur_attr = lambda s: ' aria-current="page"' if s == cur else ''
    links = '\n'.join(f'      <li><a href="{href(s)}"{cur_attr(s)}>{t}</a></li>' for s, t in NAV)
    mob = '\n'.join(f'    <a href="{href(s)}"{cur_attr(s)}>{t}</a>' for s, t in [('index', 'Home')] + NAV)
    return f'''<div class="nav-shell">
  <nav class="nav" aria-label="Main navigation">
    <a class="nav-logo" href="/" aria-label="HexAI home">
      <img src="/images/logo-hexai.png" alt="HexAI" width="34" height="34">
      <span class="status" role="status" aria-label="All systems operational"></span>
    </a>
    <ul class="nav-links">
{links}
    </ul>
    <div class="nav-actions">
      <a class="chip hide-sm" href="https://app.hx-ai.org" target="_blank" rel="noopener">Console</a>
      <a class="chip" href="/contact.html"><span class="dot"></span>Partner<span class="dot"></span></a>
      <button class="chip icon" id="themeBtn" aria-label="Toggle colour theme">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
      </button>
      <button class="chip icon menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="mobilePanel">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
  </nav>
  <div class="mobile-panel" id="mobilePanel">
{mob}
  </div>
</div>'''

FOOTER = '''<footer>
  <div class="wrap">
    <div class="foot">
      <div>
        <img src="/images/logo-hexai.png" alt="HexAI" width="40" height="40">
        <p class="lead" style="margin-top:1.25rem;font-size:1rem">We build quality AI and software.</p>
        <p class="loc">· Banjul · The Gambia</p>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/team.html">Team</a></li>
          <li><a href="/projects.html">Case studies</a></li>
          <li><a href="/contact.html">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4 class="hl">Products</h4>
        <ul>
          <li><a href="https://karang.hx-ai.org" target="_blank" rel="noopener">Karang ↗</a></li>
          <li><a href="/payment-gateway">HPG</a></li>
          <li><a href="https://kernel.hexai.gm" target="_blank" rel="noopener">Kernel ↗</a></li>
          <li><a href="https://socratic.hx-ai.org" target="_blank" rel="noopener">Bantaba AI ↗</a></li>
        </ul>
      </div>
      <div>
        <h4>Services</h4>
        <ul>
          <li><a href="/ai-development-gambia">AI Products</a></li>
          <li><a href="/software-development-gambia">Software Infrastructure</a></li>
          <li><a href="/services.html#advisory">Strategy &amp; Requirements</a></li>
          <li><a href="/services.html#engineering">Engineering</a></li>
        </ul>
      </div>
      <div>
        <h4>Connect</h4>
        <ul>
          <li><a href="mailto:admin@hexai.gm">admin@hexai.gm</a></li>
          <li><a href="tel:+220877834351">+220 87 783 4351</a></li>
          <li><a href="tel:+220833020789">+220 83 302 0789</a></li>
          <li><a href="https://www.linkedin.com/company/hexai-gm" target="_blank" rel="noopener">LinkedIn ↗</a></li>
        </ul>
      </div>
    </div>
    <div class="copy" style="justify-content:space-between;flex-wrap:wrap;gap:.75rem"><span>AI &amp; Software · Built in Banjul</span><span>© 2026 HexAI · All rights reserved.</span></div>
  </div>
</footer>'''

for slug, (title, desc) in PAGES.items():
    body = (SRC / f'{slug}.body.html').read_text().replace('{{ARROW}}', ARROW)
    url = SITE + href(slug)
    schema = [ORG, WEBSITE] if slug == 'index' else [ORG]
    faq = faq_schema(body)
    if faq:
        schema.append(faq)
    t, d = htmllib.escape(title), htmllib.escape(desc)
    html = f'''<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{t}</title>
<meta name="description" content="{d}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="HexAI">
<meta property="og:locale" content="en_GB">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{t}">
<meta property="og:description" content="{d}">
<meta property="og:image" content="{SITE}/images/og-hexai.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{t}">
<meta name="twitter:description" content="{d}">
<meta name="twitter:image" content="{SITE}/images/og-hexai.png">
{chr(10).join(ld(o) for o in schema)}
<link rel="icon" href="/favicon.ico">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<script>(function(){{var t=null;try{{t=localStorage.getItem('hexai-theme')}}catch(e){{}}document.documentElement.dataset.theme=t||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark')}})()</script>
<link rel="stylesheet" href="/assets/site.css">
</head>
<body>

<canvas id="mesh" aria-hidden="true"></canvas>
<div class="glow" aria-hidden="true"></div>

{nav(slug)}

<main>
{body.strip()}
</main>

{FOOTER}

<script src="/assets/site.js"></script>
</body>
</html>
'''
    # internal links use clean URLs (Vercel cleanUrls), so crawlers never hit a .html redirect
    html = re.sub(r'href="/([a-z0-9-]+)\.html', r'href="/\1', html)
    (OUT / f'{slug}.html').write_text(html)
    print('wrote', slug)
