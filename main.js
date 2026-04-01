/**
 * Ephseed Web Components & Logic
 */

// --- Firebase Configuration (Placeholder) ---
// 실제 Firebase 설정값으로 교체해야 합니다.
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// --- Telegram Configuration ---
const TELEGRAM_BOT_TOKEN = '8729037979:AAFxfxv_k3ZuehM0mLlJjHYn5ASRlW4NFHQ'; // @BotFather를 통해 받은 토큰
const TELEGRAM_CHAT_ID = '8478291658';     // @userinfobot 등을 통해 받은 본인의 ID

// Header Component
class EphseedHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        window.addEventListener('scroll', () => this.handleScroll());
    }

    handleScroll() {
        const header = this.shadowRoot.querySelector('header');
        if (!header) return;
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
        <style>
            header {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                padding: 1.5rem 0;
                z-index: 1000;
                transition: all 0.3s ease;
                font-family: 'Inter', sans-serif;
            }
            header.scrolled {
                background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(10px);
                padding: 1rem 0;
                box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 1.5rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .logo {
                font-size: 1.5rem;
                font-weight: 800;
                color: oklch(45% 0.2 250);
                text-decoration: none;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .logo span { color: oklch(60% 0.2 250); }
            nav {
                display: flex;
                gap: 2rem;
                align-items: center;
            }
            nav a {
                text-decoration: none;
                color: oklch(20% 0.02 250);
                font-weight: 600;
                font-size: 0.95rem;
                transition: color 0.2s ease;
            }
            nav a:hover {
                color: oklch(60% 0.2 250);
            }
            .btn-contact {
                background: oklch(60% 0.2 250);
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 50px;
                font-weight: 700;
                transition: all 0.3s ease;
            }
            .btn-contact:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px oklch(60% 0.2 250 / 0.4);
            }
            @media (max-width: 768px) {
                nav { display: none; }
            }
        </style>
        <header>
            <div class="container">
                <a href="index.html" class="logo">EPH<span>SEED</span></a>
                <nav>
                    <a href="index.html#hero">홈</a>
                    <a href="about.html">서비스 배경</a>
                    <a href="features.html">기능 소개</a>
                    <a href="blog.html">운영 가이드</a>
                    <a href="index.html#pricing">요금제</a>
                    <a href="contact.html" class="btn-contact">상담 신청</a>
                </nav>
            </div>
        </header>
        `;
    }
}
customElements.define('e-header', EphseedHeader);

// Card Component
class EphseedCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const icon = this.getAttribute('icon') || '✨';
        const title = this.getAttribute('title') || 'Title';
        const description = this.getAttribute('description') || 'Description goes here.';
        
        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: block;
                height: 100%;
            }
            .card {
                background: white;
                padding: 2.5rem;
                border-radius: 24px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                height: 100%;
                display: flex;
                flex-direction: column;
                border: 1px solid rgba(0,0,0,0.03);
            }
            .card:hover {
                transform: translateY(-10px);
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                border-color: oklch(60% 0.2 250 / 0.1);
            }
            .icon {
                font-size: 3rem;
                margin-bottom: 1.5rem;
            }
            h3 {
                font-size: 1.5rem;
                margin: 0 0 1rem 0;
                color: oklch(15% 0.05 250);
                font-family: 'Inter', 'Noto Sans KR', sans-serif;
            }
            p {
                color: oklch(45% 0.02 250);
                line-height: 1.6;
                margin: 0;
            }
        </style>
        <div class="card">
            <div class="icon">${icon}</div>
            <h3>${title}</h3>
            <p>${description}</p>
        </div>
        `;
    }
}
customElements.define('e-card', EphseedCard);

// Pricing Component
class EphseedPricing extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const plan = this.getAttribute('plan');
        const price = this.getAttribute('price');
        const description = this.getAttribute('description');
        const recommended = this.getAttribute('recommended') === 'true';
        const features = JSON.parse(this.getAttribute('features') || '[]');

        this.shadowRoot.innerHTML = `
        <style>
            .pricing-card {
                background: white;
                padding: 3rem 2rem;
                border-radius: 32px;
                text-align: center;
                position: relative;
                box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                transition: all 0.3s ease;
                display: flex;
                flex-direction: column;
                height: 100%;
                border: 2px solid transparent;
            }
            .pricing-card.recommended {
                border-color: oklch(60% 0.2 250);
                transform: scale(1.05);
                box-shadow: 0 20px 40px oklch(60% 0.2 250 / 0.15);
                z-index: 10;
            }
            .badge {
                position: absolute;
                top: -15px;
                left: 50%;
                transform: translateX(-50%);
                background: oklch(60% 0.2 250);
                color: white;
                padding: 0.5rem 1.5rem;
                border-radius: 20px;
                font-size: 0.875rem;
                font-weight: 800;
            }
            h3 {
                font-size: 1.5rem;
                margin-bottom: 0.5rem;
                color: oklch(15% 0.05 250);
            }
            .desc {
                color: oklch(45% 0.02 250);
                font-size: 0.9rem;
                margin-bottom: 2rem;
            }
            .price {
                font-size: 3rem;
                font-weight: 800;
                margin-bottom: 2rem;
                color: oklch(15% 0.05 250);
            }
            .price span {
                font-size: 1rem;
                font-weight: 500;
                color: oklch(45% 0.02 250);
            }
            ul {
                list-style: none;
                padding: 0;
                margin: 0 0 2.5rem 0;
                text-align: left;
                flex-grow: 1;
            }
            li {
                padding: 0.75rem 0;
                border-bottom: 1px solid rgba(0,0,0,0.05);
                color: oklch(20% 0.02 250);
                font-size: 0.95rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            li::before {
                content: "✓";
                color: oklch(60% 0.2 250);
                font-weight: 900;
            }
            .btn {
                background: oklch(90% 0.02 250);
                color: oklch(15% 0.05 250);
                padding: 1rem;
                border-radius: 12px;
                text-decoration: none;
                font-weight: 700;
                transition: all 0.3s ease;
            }
            .pricing-card.recommended .btn {
                background: oklch(60% 0.2 250);
                color: white;
            }
            .btn:hover {
                background: oklch(20% 0.02 250);
                color: white;
            }
            @media (max-width: 992px) {
                .pricing-card.recommended {
                    transform: scale(1);
                }
            }
        </style>
        <div class="pricing-card ${recommended ? 'recommended' : ''}">
            ${recommended ? '<div class="badge">추천 플랜</div>' : ''}
            <h3>${plan}</h3>
            <p class="desc">${description}</p>
            <div class="price">월 ${price}<span>원</span></div>
            <ul>
                ${features.map(f => `<li>${f}</li>`).join('')}
            </ul>
            <a href="contact.html" class="btn">시작하기</a>
        </div>
        `;
    }
}
customElements.define('e-pricing', EphseedPricing);

// Footer Component
class EphseedFooter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
        <style>
            footer {
                background: oklch(15% 0.05 250);
                color: white;
                padding: 5rem 0 2rem;
                font-family: 'Inter', sans-serif;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 1.5rem;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 4rem;
                margin-bottom: 4rem;
            }
            .brand h2 {
                font-size: 1.5rem;
                margin-bottom: 1.5rem;
                color: oklch(75% 0.15 250);
            }
            .brand p {
                opacity: 0.7;
                font-size: 0.9rem;
                line-height: 1.8;
            }
            h4 {
                font-size: 1.1rem;
                margin-bottom: 1.5rem;
                color: white;
            }
            ul {
                list-style: none;
                padding: 0;
            }
            li { margin-bottom: 0.75rem; }
            a {
                color: rgba(255,255,255,0.6);
                text-decoration: none;
                font-size: 0.9rem;
                transition: color 0.2s ease;
            }
            a:hover { color: white; }
            .bottom {
                border-top: 1px solid rgba(255,255,255,0.1);
                padding-top: 2rem;
                text-align: center;
                font-size: 0.85rem;
                color: rgba(255,255,255,0.4);
            }
            .legal-links {
                margin-top: 1rem;
                display: flex;
                justify-content: center;
                gap: 2rem;
            }
            .legal-links a {
                font-size: 0.8rem;
                text-decoration: underline;
            }
        </style>
        <footer>
            <div class="container">
                <div class="brand">
                    <h2>EPHSEED</h2>
                    <p>AI 기술로 사장님의 일상을 지켜드리는<br>지능형 매장 관제 전문 기업입니다.</p>
                </div>
                <div>
                    <h4>서비스</h4>
                    <ul>
                        <li><a href="index.html#solution">지능형 관제</a></li>
                        <li><a href="index.html#solution">원격 방송</a></li>
                        <li><a href="about.html">서비스 배경</a></li>
                        <li><a href="#">맞춤형 컨설팅</a></li>
                    </ul>
                </div>
                <div>
                    <h4>고객지원</h4>
                    <ul>
                        <li><a href="#">자주 묻는 질문</a></li>
                        <li><a href="privacy.html">개인정보처리방침</a></li>
                        <li><a href="terms.html">이용 약관</a></li>
                        <li><a href="contact.html">1:1 문의</a></li>
                    </ul>
                </div>
                <div>
                    <h4>연락처</h4>
                    <p style="color: rgba(255,255,255,0.6); font-size: 0.9rem;">
                        서울특별시 강남구 ...<br>
                        Tel: 02-123-4567<br>
                        Email: info@ephseed.ai
                    </p>
                </div>
            </div>
            <div class="bottom">
                <div>&copy; 2026 Ephseed AI. All rights reserved.</div>
                <div class="legal-links">
                    <a href="privacy.html">개인정보처리방침</a>
                    <a href="terms.html">이용약관</a>
                </div>
            </div>
        </footer>
        `;
    }
}
customElements.define('e-footer', EphseedFooter);

// --- Form Submission & Telegram Logic ---
async function sendTelegramNotification(data) {
    const planMap = {
        'basic': '실속형 (월 10만)',
        'standard': '표준형 (월 30만)',
        'premium': '프리미엄 (월 50만)',
        'consult': '상담 후 결정'
    };
    const message = `
🚀 [에브라임 시드] 새로운 상담 신청!
- 성함: ${data.name}
- 연락처: ${data.phone}
- 매장종류: ${data.storeType}
- 희망요금제: ${planMap[data.plan] || data.plan}
- 문의사항: ${data.message || '없음'}
    `;
    
    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message
            })
        });
    } catch (err) {
        console.error("Telegram error:", err);
    }
}

// Contact Form Handler
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());
        data.timestamp = new Date().toISOString();

        // 1. Save to LocalStorage (Simulation for admin.html)
        const inquiries = JSON.parse(localStorage.getItem('ephseed_inquiries') || '[]');
        inquiries.unshift(data);
        localStorage.setItem('ephseed_inquiries', JSON.stringify(inquiries));

        // 2. Send Telegram
        await sendTelegramNotification(data);

        alert('상담 신청이 완료되었습니다. 곧 연락드리겠습니다!');
        window.location.href = 'index.html';
    });
}

// Admin Dashboard Loader
const inquiryList = document.getElementById('inquiryList');
if (inquiryList) {
    const inquiries = JSON.parse(localStorage.getItem('ephseed_inquiries') || '[]');
    const planMap = {
        'basic': '실속형',
        'standard': '표준형',
        'premium': '프리미엄',
        'consult': '상담필요'
    };
    if (inquiries.length === 0) {
        inquiryList.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 3rem;">접수된 내역이 없습니다.</td></tr>';
    } else {
        inquiryList.innerHTML = inquiries.map(item => `
            <tr>
                <td>${new Date(item.timestamp).toLocaleString()}</td>
                <td>${item.name}</td>
                <td>${item.phone}</td>
                <td>${item.storeType}</td>
                <td><span class="status-badge" style="background: var(--primary-light); color: white;">${planMap[item.plan] || item.plan}</span></td>
                <td>${item.message}</td>
            </tr>
        `).join('');
    }
}

// Smooth Scrolling for anchor links
document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href*="#"]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    const [path, hash] = href.split('#');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    if (!path || path === currentPath || (path === 'index.html' && currentPath === '')) {
        const target = document.querySelector('#' + hash);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

