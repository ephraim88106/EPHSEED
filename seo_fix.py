#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
seo_fix.py — ephseed.com SEO 정비 (재실행 안전 · 멱등)

    python3 seo_fix.py

하는 일
------
1) canonical / og:* / twitter / robots 메타를 SEO:BEGIN~END 블록으로 주입
2) 애드센스 스크립트 + google-adsense-account 메타를 콘텐츠 페이지에 주입
3) 로그인·대시보드 페이지에는 noindex 를 넣고 광고를 넣지 않는다
4) sitemap.xml / robots.txt 재생성

왜 이 파일이 생겼나 (2026-08-03)
--------------------------------
- index.html 의 canonical 이 **존재하지 않는 도메인** `https://ephseed.ai/` 를
  가리키고 있었다. DNS 조회 결과 NXDOMAIN. 검색엔진 입장에서는
  "정본이 존재하지 않는 페이지"라 색인 대상에서 빠진다.
  실제로 `site:ephseed.com` 검색 결과가 0건이었다.
- 나머지 14개 페이지에는 canonical 자체가 없었다.
- sitemap.xml 과 robots.txt 도 없었다.

주의
----
- 로그인·대시보드 페이지(admin/login/member)에는 광고를 넣지 않는다.
  로그인 뒤에 있거나 게시자 콘텐츠가 없는 페이지에 광고를 붙이는 것은
  애드센스 정책상 문제가 될 수 있다. noindex 처리한다.
"""

import os, re, glob, html, hashlib, datetime

ROOT       = os.path.dirname(os.path.abspath(__file__))
SITE       = "https://ephseed.com"
SITE_NAME  = "에브라임 시드"
SITE_DESC  = "무인 매장 실시간 AI 관제 및 원격 방송 솔루션"
OG_IMAGE   = SITE + "/assets/og-default.png"
ADSENSE_ID = "ca-pub-9118774019383180"
TODAY      = datetime.date.today().isoformat()

# 네이버 서치어드바이저 소유확인 코드. 비워두면 태그를 넣지 않는다.
# ⚠️ 값이 있는데 지우면 소유확인이 풀린다.
NAVER_VERIFY = ""

# 색인 대상이 아닌 페이지 — sitemap 제외 + noindex + 광고 없음
NOINDEX = {"admin.html", "login.html", "member.html", "404.html"}

# 애드센스를 넣을 페이지 (2026-08-03 결정)
#
# 회사 홈페이지와 애드센스는 목적이 충돌한다.
#   · 회사 홈페이지: 방문자를 고객으로 전환시키는 게 목적
#   · 애드센스: 방문자를 광고로 내보내는 게 목적
# 무인매장 관제 계약 하나의 가치가 광고 클릭 몇백 원과 비교가 안 되고,
# B2B 사이트에 배너가 붙으면 신뢰도도 떨어진다.
#
# 그래서 정보를 찾으러 온 사람(블로그 글)에게만 광고를 보이고,
# 제품을 보러 온 사람(메인·제품·기능·문의)에게는 보이지 않게 한다.
ADS_PAGES_PREFIX = ("post-",)
ADS_PAGES = {"blog.html"}


def has_ads(fname):
    if fname in NOINDEX:
        return False
    return fname in ADS_PAGES or fname.startswith(ADS_PAGES_PREFIX)

def asset_version(fname):
    """파일 내용 해시 앞 8자리. CSS 를 고쳤는데 재방문자에게 옛 파일이 계속
    보이는 문제(브라우저 캐시)를 막는다. 내용이 바뀔 때만 값이 바뀌므로
    불필요한 재다운로드도 생기지 않는다."""
    path = os.path.join(ROOT, fname)
    if not os.path.exists(path):
        return ""
    with open(path, "rb") as f:
        return hashlib.sha1(f.read()).hexdigest()[:8]


CSS_VER = asset_version("style.css")

BEGIN = "<!-- SEO:BEGIN -->"
END   = "<!-- SEO:END -->"

ADSENSE_BLOCK = (
    '<meta name="google-adsense-account" content="%s">\n'
    '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=%s"\n'
    '     crossorigin="anonymous"></script>' % (ADSENSE_ID, ADSENSE_ID)
)


def esc(s):
    return html.escape(s or "", quote=True)


def clean_url(fname):
    if fname == "index.html":
        return SITE + "/"
    return SITE + "/" + fname[:-len(".html")]


def strip_tags(s):
    s = re.sub(r"<script.*?</script>", " ", s, flags=re.S | re.I)
    s = re.sub(r"<style.*?</style>", " ", s, flags=re.S | re.I)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()


def get_title(src):
    m = re.search(r"<title[^>]*>(.*?)</title>", src, flags=re.S | re.I)
    return html.unescape(m.group(1)).strip() if m else SITE_NAME


def get_description(src):
    m = re.search(r'<meta\s+name=["\']description["\'][^>]*content=["\']([^"\']+)["\']', src, flags=re.I)
    if m:
        return html.unescape(m.group(1)).strip()
    body = re.search(r"<body[^>]*>(.*?)</body>", src, flags=re.S | re.I)
    text = strip_tags(body.group(1) if body else src)
    return (text[:155] + "…") if len(text) > 155 else (text or SITE_DESC)


def build_block(fname, src):
    url = clean_url(fname)
    noindex = fname in NOINDEX
    parts = [BEGIN]

    if NAVER_VERIFY and fname == "index.html":
        parts.append('<meta name="naver-site-verification" content="%s">' % NAVER_VERIFY)

    parts.append('<link rel="canonical" href="%s">' % url)

    if noindex:
        # 로그인·대시보드·에러 페이지 — 색인하지 않는다
        parts.append('<meta name="robots" content="noindex, follow">')
    else:
        parts.append('<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">')

    if has_ads(fname):
        parts.append(ADSENSE_BLOCK)

    title = get_title(src)
    desc  = get_description(src)
    parts += [
        '<meta property="og:type" content="%s">' % ("website" if fname == "index.html" else "article"),
        '<meta property="og:site_name" content="%s">' % esc(SITE_NAME),
        '<meta property="og:title" content="%s">' % esc(title),
        '<meta property="og:description" content="%s">' % esc(desc),
        '<meta property="og:url" content="%s">' % url,
        '<meta property="og:locale" content="ko_KR">',
        '<meta property="og:image" content="%s">' % OG_IMAGE,
        '<meta name="twitter:card" content="summary_large_image">',
        '<meta name="twitter:title" content="%s">' % esc(title),
        '<meta name="twitter:description" content="%s">' % esc(desc),
        END,
    ]
    return "\n".join(parts)


def fix_file(path):
    fname = os.path.basename(path)
    src = open(path, encoding="utf-8").read()
    if "</head>" not in src.lower():
        return "head없음"

    # 죽은 도메인 교정 — ephseed.ai 는 DNS 에 존재하지 않는다 (NXDOMAIN)
    src = src.replace("https://ephseed.ai", SITE).replace("http://ephseed.ai", SITE)

    # style.css 캐시 무효화 — 버전 쿼리를 현재 파일 해시로 맞춘다
    if CSS_VER:
        src = re.sub(r'(href=["\'])style\.css(\?v=[0-9a-f]+)?(["\'])',
                     r'\g<1>style.css?v=%s\g<3>' % CSS_VER, src)

    # 이전 실행 블록 제거
    src = re.sub(r"[ \t]*\n?" + re.escape(BEGIN) + r".*?" + re.escape(END) + r"[ \t]*\n?",
                 "", src, flags=re.S)

    # 우리가 관리하는 태그가 head 안에 중복으로 남아 있으면 제거
    def clean_head(m):
        h = m.group(0)
        h = re.sub(r'[ \t]*<link[^>]+rel=["\']canonical["\'][^>]*>[ \t]*\n?', "", h, flags=re.I)
        h = re.sub(r'[ \t]*<meta[^>]+property=["\']og:[^"\']*["\'][^>]*>[ \t]*\n?', "", h, flags=re.I)
        h = re.sub(r'[ \t]*<meta[^>]+name=["\']twitter:[^"\']*["\'][^>]*>[ \t]*\n?', "", h, flags=re.I)
        h = re.sub(r'[ \t]*<meta[^>]+name=["\']robots["\'][^>]*>[ \t]*\n?', "", h, flags=re.I)
        h = re.sub(r'[ \t]*<meta[^>]+name=["\']google-adsense-account["\'][^>]*>[ \t]*\n?', "", h, flags=re.I)
        h = re.sub(r'[ \t]*<script[^>]+adsbygoogle\.js[^>]*>\s*</script>[ \t]*\n?', "", h, flags=re.I | re.S)
        h = re.sub(r"\n{3,}", "\n\n", h)
        return re.sub(r"[ \t\n]*</head>", "\n</head>", h, flags=re.I)

    src = re.sub(r"<head[^>]*>.*?</head>", clean_head, src, flags=re.S | re.I)
    block = build_block(fname, src)
    src = re.sub(r"[ \t\n]*</head>", "\n" + block + "\n</head>", src, count=1, flags=re.I)

    open(path, "w", encoding="utf-8").write(src)
    return "ok"


def write_sitemap(files):
    urls = []
    for f in files:
        pr = "1.0" if f == "index.html" else "0.7"
        urls.append("  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n"
                    "    <changefreq>weekly</changefreq>\n    <priority>%s</priority>\n  </url>"
                    % (clean_url(f), TODAY, pr))
    open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls) + "\n</urlset>\n")
    return len(urls)


def write_robots():
    open(os.path.join(ROOT, "robots.txt"), "w", encoding="utf-8").write(
"""User-agent: *
Allow: /
Disallow: /admin.html
Disallow: /login.html
Disallow: /member.html
Disallow: /subscribers.json

# 네이버
User-agent: Yeti
Allow: /

# 다음(카카오)
User-agent: Daum
Allow: /

# 구글
User-agent: Googlebot
Allow: /

Sitemap: %s/sitemap.xml
""" % SITE)


if __name__ == "__main__":
    files = sorted(os.path.basename(p) for p in glob.glob(os.path.join(ROOT, "*.html")))
    stats = {}
    for f in files:
        r = fix_file(os.path.join(ROOT, f))
        stats[r] = stats.get(r, 0) + 1

    indexable = [f for f in files if f not in NOINDEX]
    n = write_sitemap(indexable)
    write_robots()

    print("메타 주입: %s" % ", ".join("%s %d개" % (k, v) for k, v in stats.items()))
    ads = [f for f in files if has_ads(f)]
    print("애드센스 적용: %d개 (%s)" % (len(ads), ", ".join(ads) if ads else "없음"))
    print("  → 회사 소개·제품 페이지에는 광고를 넣지 않는다 (고객 전환 우선)")
    print("sitemap.xml: %d개 URL (%s)" % (n, SITE))
    print("robots.txt: 갱신 완료")
    print("style.css 버전: ?v=%s" % (CSS_VER or "(파일 없음)"))
