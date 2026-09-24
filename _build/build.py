import html,os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
UZ_TP="https://www.teepublic.com/user/unclezeke"
MD_TP="https://www.teepublic.com/user/minddump"
ETSY="https://www.etsy.com/shop/UncleZekesPlace"
AMZ_UZ="https://www.amazon.com/stores/Uncle-Zeke/author/B0GSNHSGZC"
AMZ_OVC="https://www.amazon.com/s?k=Owasco+Valley+Classics"
AMZ_HF="https://www.amazon.com/s?k=Hazel+Fireside"
AMZ_MH="https://www.amazon.com/s?k=Light+Across+the+Water+Mae+Hollis"
FB="https://www.facebook.com/unclezekesplace"
PIN="https://www.pinterest.com/UncleZekesPlace"
FONTS='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Crimson+Pro:wght@300;400&family=Oswald:wght@600;700&display=swap" rel="stylesheet">'
NAV=[("shirts.html","Red Shirts","red"),("minddump.html","MindDump",""),("prints.html","Prints",""),("books.html","Books","")]

def page(fn,title,desc,body):
    AC=' aria-current="page"'
    nav="".join(f'<a href="{h}" class="{c}"{AC if h==fn else ""}>{t}</a>' for h,t,c in NAV)
    out=f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:image" content="https://unclezeke.com/img/web/og.jpg">
<meta property="og:url" content="https://unclezeke.com/{'' if fn=='index.html' else fn}">
<meta property="og:type" content="website">
<link rel="icon" type="image/png" href="img/web/favicon.png">
<link rel="apple-touch-icon" href="img/web/favicon.png">
{FONTS}
<link rel="stylesheet" href="style.css">
</head>
<body>
<nav class="nav"><div class="nav-in">
  <a class="nav-brand" href="index.html"><img src="img/web/logo.jpg" alt="" width="36" height="36">Uncle Zeke's Place</a>
  <div class="nav-links">{nav}</div>
</div></nav>
{body}
<section class="contact">
  <p class="contact-note">Questions, bulk orders for your local, or just to say hey.</p>
  <a href="mailto:shopfloor@unclezeke.com">shopfloor@unclezeke.com</a>
  <div class="social"><a href="{FB}" target="_blank" rel="noopener">Facebook</a><a href="{PIN}" target="_blank" rel="noopener">Pinterest</a></div>
</section>
<footer>&copy; 2025-2026 Phoenix Industries Media &amp; Publishing LLC &nbsp;&middot;&nbsp; Moravia, New York</footer>
</body>
</html>
'''
    open(fn,'w').write(out)

def item(img,title,meta,href,alt=None,w=500,h=None,todo=True):
    t=' data-link="store"' if todo else ''
    hh=f' height="{h}"' if h else ''
    return f'''<a class="item" href="{href}" target="_blank" rel="noopener"{t}><img src="img/web/{img}.jpg" alt="{html.escape(alt or title)}" loading="lazy" width="{w}"{hh}><div class="item-body"><div class="item-title">{html.escape(title)}</div><div class="item-meta">{html.escape(meta)}</div></div></a>'''

RED=[("red_red_until_signed","Red Until It's Signed","Back print"),
     ("red_no_contract_no_peace","No Contract, No Peace","Front and back print"),
     ("red_record_profits","Record Profits. Empty Promises.","Back print"),
     ("red_union_steward","Union Steward, Ask Me Anything","Back print"),
     ("red_union_kid","Union Kid","Front and back, youth sizes too")]
def red_items(): return "".join(item(i,t,m,UZ_TP,alt=f"{t} shirt design",w=700,h=700) for i,t,m in RED)

# INDEX
page("index.html","Uncle Zeke's Place | A Voice for the Working Class",
 "Uncle Zeke's Place. Union shirts, patent prints, and books with a working-class voice, out of Moravia, New York.",f'''
<header class="hero">
  <img class="hero-logo" src="img/web/logo.jpg" alt="Uncle Zeke badge" width="150" height="150">
  <div class="eyebrow">Moravia, New York</div>
  <h1 class="hero-title">Uncle Zeke's Place</h1>
  <div class="rule"></div>
  <p class="hero-sub">A Voice for the Working Class</p>
</header>

<section class="rsw" id="red-shirt-wednesday">
  <div class="wrap">
    <div class="rsw-head">
      <div class="eyebrow">Contract Year</div>
      <h2>Red Shirt Wednesday</h2>
      <p>Every Wednesday is red until there's a fair contract with a signature on it. Shirts made by a steward, for the folks on the floor and the families backing them.</p>
    </div>
    <div class="grid">{red_items()}</div>
    <div class="cta"><a class="btn white" href="shirts.html">See All Red Shirts</a></div>
  </div>
</section>

<section class="about">
  <div class="eyebrow">Who We Are</div>
  <p style="margin-top:0.8rem">Hey, I'm Uncle Zeke. Just a guy out of Moravia, New York, trying to earn an honest living and spread a little of what I believe makes the world better while I do it. Most of what I make comes back to the same place, the working folks who actually built this country and the history that tends to get forgotten. If any of it lands with you, pull up a chair and look around.</p>
  <img class="sig" src="img/web/sig_white.png" alt="Uncle Zeke signature" width="500" height="122">
</section>

<main class="section"><div class="wrap">
  <div class="section-head"><div class="eyebrow">What We Make</div><h2>Pick a Door</h2></div>
  <div class="doors">
    <a class="door" href="shirts.html">
      <div class="door-img redbg"><img src="img/web/red_red_until_signed.jpg" alt="" loading="lazy"></div>
      <div class="door-body"><div class="eyebrow">TeePublic</div><div class="door-title">Uncle Zeke Shirts</div><div class="door-desc">Union, labor, and working-class pride. Red Shirt Wednesday lives here.</div><span class="door-go">Browse shirts &rsaquo;</span></div>
    </a>
    <a class="door" href="minddump.html">
      <div class="door-img wordmark"><span>MindDump</span></div>
      <div class="door-body"><div class="eyebrow">TeePublic</div><div class="door-title">MindDump</div><div class="door-desc">The second shirt shop. Hometown pride and whatever else falls out of my head.</div><span class="door-go">Browse MindDump &rsaquo;</span></div>
    </a>
    <a class="door" href="prints.html">
      <div class="door-img"><img src="img/web/mockup_drill.jpg" alt="" loading="lazy"></div>
      <div class="door-body"><div class="eyebrow">Etsy</div><div class="door-title">Patent Prints</div><div class="door-desc">Machine shop and fishing lure patents, printable wall art for the shop or the den.</div><span class="door-go">Browse prints &rsaquo;</span></div>
    </a>
    <a class="door" href="books.html">
      <div class="door-img covers"><img src="img/web/workers_unite.jpg" alt="" loading="lazy"><img src="img/web/ovc_debs.jpg" alt="" loading="lazy"><img src="img/web/ovc_tess.jpg" alt="" loading="lazy"></div>
      <div class="door-body"><div class="eyebrow">Amazon</div><div class="door-title">Books</div><div class="door-desc">Labor history puzzles, annotated classics, and a few surprises.</div><span class="door-go">Browse books &rsaquo;</span></div>
    </a>
  </div>
</div></main>
''')

# SHIRTS
page("shirts.html","Red Shirt Wednesday | Uncle Zeke Shirts",
 "Union shirts for Red Shirt Wednesday and every contract year. Designed by a steward in Moravia, New York.",f'''
<section class="rsw" style="margin-top:0">
  <div class="wrap">
    <div class="rsw-head">
      <div class="eyebrow">Uncle Zeke on TeePublic</div>
      <h2>Red Shirt Wednesday</h2>
      <p>Wear red every Wednesday until it's signed. Every design comes in red by default, plus black, navy, and heather.</p>
    </div>
    <div class="grid">{red_items()}</div>
    <div class="cta"><a class="btn white" href="{UZ_TP}" target="_blank" rel="noopener">Go to the Store</a></div>
  </div>
</section>
<main class="section"><div class="wrap">
  <div class="section-head"><div class="eyebrow">The Whole Shop</div><h2>More From Uncle Zeke</h2><p>Labor history, working-class pride, and a few that just make me laugh.</p></div>
  <a class="banner" href="{UZ_TP}" target="_blank" rel="noopener" style="display:block"><img src="img/web/tp_banner.jpg" alt="Uncle Zeke's Place, a voice for the working class" loading="lazy" width="1600" height="457"></a>
  <div class="cta"><a class="btn" href="{UZ_TP}" target="_blank" rel="noopener">Go to the Store</a><a class="btn ghost" href="index.html">Back Home</a></div>
</div></main>
''')

# MINDDUMP
page("minddump.html","MindDump | Uncle Zeke's Place",
 "MindDump, the second Uncle Zeke shirt shop on TeePublic.",f'''
<header class="page-head">
  <div class="eyebrow">TeePublic</div>
  <h1>MindDump</h1>
  <p>The second shirt shop, running its own lane. Hometown pride, odd ideas, and whatever else falls out of my head.</p>
</header>
<main class="section"><div class="wrap">
  <div class="grid wide" id="md-picks"><!-- MINDDUMP PICKS: Moravia shirt first, then 2 or 3 more. Needs images and links. --></div>
  <div class="cta"><a class="btn" href="{MD_TP}" target="_blank" rel="noopener">Go to the Store</a><a class="btn ghost" href="index.html">Back Home</a></div>
</div></main>
''')

# PRINTS
MACH=[("mockup_drill","Drill Press"),("mockup_hammer","Power Hammer"),("mockup_milling","Milling Machine"),("mockup_planer","Metal Planer")]
FISH=[("fish_heddon","Heddon Lure"),("fish_pflueger","Pflueger Lure"),("fish_plug","Fishing Plug"),("fish_artificial","Artificial Bait")]
page("prints.html","Patent Prints | Uncle Zeke's Place",
 "Vintage machine shop and fishing lure patent prints. Printable digital downloads on Etsy.",f'''
<header class="page-head">
  <div class="eyebrow">Etsy</div>
  <h1>Patent Prints</h1>
  <p>Old patent drawings, cleaned up and ready to print. Instant digital downloads for the shop wall, the den, or the camp.</p>
</header>
<main><div class="wrap">
  <section class="section"><div class="section-head"><div class="eyebrow">Collection</div><h2>The Machine Shop</h2></div>
    <div class="grid wide">{"".join(item(i,t+" Patent Print","Printable download",ETSY,w=900,h=660) for i,t in MACH)}</div></section>
  <section class="section"><div class="section-head"><div class="eyebrow">Collection</div><h2>Tackle Box</h2></div>
    <div class="grid">{"".join(item(i,t+" Patent Print","Printable download",ETSY,w=500,h=637) for i,t in FISH)}</div></section>
  <div class="cta"><a class="btn" href="{ETSY}" target="_blank" rel="noopener">Go to the Store</a><a class="btn ghost" href="index.html">Back Home</a></div>
</div></main>
''')

# BOOKS
def books(lst,href): return "".join(item(i,t,a,href,alt=f"{t} cover",w=500) for i,t,a in lst)
UZB=[("workers_unite","Workers Unite! Word Search","Uncle Zeke"),("trailblazers","Trailblazers! Word Search","Uncle Zeke")]
OVC=[("ovc_debs","Debs: His Life, Writings and Speeches","Eugene V. Debs"),("ovc_sabotage","Simple Sabotage Field Manual","Office of Strategic Services"),
     ("ovc_tess","Tess of the Storm Country","Grace Miller White"),("ovc_valley","From the Valley of the Missing","Grace Miller White"),
     ("ovc_secret","The Secret of the Storm Country","Grace Miller White"),("ovc_rose","Rose O' Paradise","Grace Miller White"),
     ("ovc_yellow","The Yellow Wallpaper","Charlotte Perkins Gilman"),("ovc_dorian","The Picture of Dorian Gray","Oscar Wilde"),
     ("ovc_enchiridion","The Enchiridion","Epictetus"),("ovc_shortness","On the Shortness of Life","Seneca")]
HF=[("cozy_seasons","Cozy Seasons Large Print Word Search","Hazel Fireside"),("paddy","St. Patrick's Day Word Search","Hazel Fireside")]
MH=[("mh_light","Light Across the Water","Mae Hollis")]
page("books.html","Books | Uncle Zeke's Place",
 "Labor history puzzle books, annotated public domain classics from Owasco Valley Classics, and more. Published in Moravia, New York.",f'''
<header class="page-head">
  <div class="eyebrow">Amazon</div>
  <h1>Books</h1>
  <p>Everything here is published out of Moravia, New York by Phoenix Industries Media &amp; Publishing.</p>
</header>
<main><div class="wrap">
  <section class="section"><div class="section-head"><div class="eyebrow">Puzzles and History</div><h2>Uncle Zeke</h2><p>Word search books built from real labor and local history, with the story behind every puzzle.</p></div>
    <div class="grid">{books(UZB,AMZ_UZ)}</div>
    <div class="cta"><a class="btn" href="{AMZ_UZ}" target="_blank" rel="noopener">Uncle Zeke on Amazon</a></div></section>
  <section class="section"><div class="section-head"><div class="eyebrow">Annotated Classics</div><h2>Owasco Valley Classics</h2><p>Public domain works worth keeping, newly typeset with an introduction and a note on the text. Labor history, Finger Lakes authors, and the classics.</p></div>
    <div class="grid">{books(OVC,AMZ_OVC)}</div>
    <div class="cta"><a class="btn" href="{AMZ_OVC}" target="_blank" rel="noopener">Owasco Valley Classics on Amazon</a></div></section>
  <section class="section"><div class="section-head"><div class="eyebrow">Large Print Puzzles</div><h2>Hazel Fireside</h2><p>Relaxing large print word searches for adults and seniors.</p></div>
    <div class="grid">{books(HF,AMZ_HF)}</div>
    <div class="cta"><a class="btn" href="{AMZ_HF}" target="_blank" rel="noopener">Hazel Fireside on Amazon</a></div></section>
  <section class="section"><div class="section-head"><div class="eyebrow">Fiction</div><h2>Mae Hollis</h2><p>A small town second chance romance.</p></div>
    <div class="grid">{books(MH,AMZ_MH)}</div></section>
  <div class="cta"><a class="btn ghost" href="index.html">Back Home</a></div>
</div></main>
''')
print("ok")
