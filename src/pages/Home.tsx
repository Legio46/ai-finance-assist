import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import SkyScene from "@/components/SkyScene";
import StockTicker from "@/components/StockTicker";
import { ChevronRight } from "lucide-react";

const Home = () => {
  const { t } = useLanguage();

  const features = [
    { icon: "📊", title: t('expenseTracking'), desc: t('expenseTrackingDesc') },
    { icon: "📈", title: "Smart Budgeting", desc: "Set budgets, track progress, and get AI-powered recommendations to optimize your spending." },
    { icon: "💰", title: t('financialAdvisor'), desc: t('financialAdvisorDesc') },
    { icon: "💳", title: "Credit Card Manager", desc: "Track all your credit cards, monitor balances, APRs, and due dates in one unified dashboard." },
    { icon: "🔒", title: "Bank-Level Security", desc: "Your data is protected with AES-256 encryption, 2FA authentication, and zero-knowledge architecture." },
    { icon: "✦", title: "AI-Powered Insights", desc: "Get personalized financial advice and predictions powered by advanced artificial intelligence." },
  ];

  const testimonials = [
    { name: "Sarah M.", role: "Small Business Owner", text: "Legio transformed how I manage my business finances. The AI advisor alone saved me thousands.", rating: 5 },
    { name: "James K.", role: "Freelancer", text: "Finally a finance app that handles both personal and business accounts. The charts are so easy to understand!", rating: 5 },
    { name: "Maria L.", role: "Student", text: "The budget tracking helped me save 30% more each month. Love the clean interface and smart insights.", rating: 5 },
  ];

  return (
    <div className="min-h-screen">
      {/* Ticker */}
      <StockTicker />

      {/* Hero Scene */}
      <section className="relative min-h-screen overflow-hidden flex flex-col">
        <SkyScene />

        <div className="relative z-10 flex-1 flex flex-col items-center text-center px-6 pt-14 lg:pt-20">
          {/* Eyebrow */}
          <div className="animate-fade-down inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium mb-7"
            style={{
              background: 'rgba(255,255,255,0.14)',
              border: '1px solid rgba(255,255,255,0.24)',
              backdropFilter: 'blur(12px)',
              color: 'rgba(255,255,255,0.9)',
            }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#4ade80]" 
              style={{ animation: 'sun-pulse 2s ease-in-out infinite' }} />
            AI-powered financial intelligence
          </div>

          {/* Main heading */}
          <h1 className="animate-fade-down font-serif font-black text-foreground leading-none max-w-[820px]"
            style={{ 
              fontSize: 'clamp(54px, 8vw, 94px)',
              letterSpacing: '-2px',
              textShadow: '0 2px 30px rgba(0,0,0,0.14), 0 0 80px rgba(255,255,255,0.08)',
              animationDelay: '0.1s',
            }}>
            #1 <em className="italic text-gold-glow">Intelligent</em><br />Finance Manager
          </h1>

          <p className="animate-fade-down mt-5 text-base font-light max-w-[490px] leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.76)', animationDelay: '0.2s' }}>
            Legio watches your money in real-time, gives instant AI-driven insights, and helps you grow wealth — completely effortlessly.
          </p>

          {/* CTA buttons */}
          <div className="animate-fade-down flex gap-3.5 items-center mt-8" style={{ animationDelay: '0.3s' }}>
            <Link to="/auth"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5"
              style={{
                background: '#2563eb',
                boxShadow: '0 4px 24px rgba(37,99,235,0.5), 0 1px 0 rgba(255,255,255,0.15) inset',
              }}>
              Get Started Free
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link to="/pricing"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm transition-all"
              style={{
                color: 'rgba(255,255,255,0.85)',
                border: '1px solid rgba(255,255,255,0.25)',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
              }}>
              View Pricing
            </Link>
          </div>

          {/* App Window Mockup */}
          <div className="animate-fade-up w-full flex justify-center mt-10 px-4 lg:px-10" style={{ animationDelay: '0.5s' }}>
            <div className="w-full max-w-[960px] rounded-t-2xl overflow-hidden"
              style={{
                background: 'rgba(16, 20, 36, 0.62)',
                border: '1px solid rgba(255,255,255,0.16)',
                borderBottom: 'none',
                backdropFilter: 'blur(28px)',
                boxShadow: '0 -8px 60px rgba(0,0,0,0.28)',
              }}>
              {/* Window bar */}
              <div className="flex items-center justify-between px-4 py-3" style={{
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(255,255,255,0.03)',
              }}>
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Legio — Portfolio Overview</span>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#4ade80]" />
                  Live
                </div>
              </div>

              {/* Dashboard preview */}
              <div className="grid grid-cols-[200px_1fr_280px] min-h-[380px] max-lg:grid-cols-1">
                {/* Sidebar */}
                <div className="hidden lg:flex flex-col p-5" style={{
                  borderRight: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(0,0,0,0.18)',
                }}>
                  <div className="text-[9px] uppercase tracking-[2px] mb-2 pl-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Overview</div>
                  {[
                    { name: "Dashboard", active: true },
                    { name: "Portfolio" },
                    { name: "Markets" },
                  ].map(item => (
                    <div key={item.name} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs mb-0.5 ${item.active ? '' : ''}`}
                      style={item.active ? {
                        background: 'rgba(245,201,106,0.12)',
                        color: '#fde68a',
                        border: '1px solid rgba(245,201,106,0.18)',
                      } : { color: 'rgba(255,255,255,0.45)' }}>
                      <span className="text-sm">{item.active ? '◈' : '◎'}</span>
                      {item.name}
                    </div>
                  ))}
                  <div className="text-[9px] uppercase tracking-[2px] mt-5 mb-2 pl-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Finance</div>
                  {["Transactions", "Analytics", "AI Advisor"].map(name => (
                    <div key={name} className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      <span className="text-sm">◷</span>
                      {name}
                    </div>
                  ))}
                </div>

                {/* Main */}
                <div className="p-5 overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-lg font-medium text-foreground">Good morning, User ☀️</div>
                      <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Your portfolio is up +4.2% this month</div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                      style={{ background: 'rgba(245,201,106,0.1)', border: '1px solid rgba(245,201,106,0.2)', color: '#f5c96a' }}>
                      <span className="text-xs" style={{ animation: 'sun-pulse 3s linear infinite' }}>✦</span>
                      Legio AI Active
                    </div>
                  </div>
                  
                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2.5 mb-4">
                    {[
                      { label: "Net Worth", value: "$842,140", delta: "▲ 4.2% this month", up: true },
                      { label: "Investments", value: "$634,850", delta: "▲ 12.8% YTD", up: true },
                      { label: "Cash Flow", value: "+$4,230", delta: "▼ $180 vs last mo.", up: false },
                    ].map(m => (
                      <div key={m.label} className="rounded-lg p-3.5 transition-all" style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.09)',
                      }}>
                        <div className="text-[10px] uppercase tracking-[1px] mb-1.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{m.label}</div>
                        <div className="font-serif text-xl font-bold text-foreground tracking-tight leading-none">{m.value}</div>
                        <div className={`text-[11px] mt-1.5 font-medium ${m.up ? 'text-emerald-400' : 'text-red-400'}`}>{m.delta}</div>
                      </div>
                    ))}
                  </div>

                  {/* Chart placeholder */}
                  <div className="rounded-lg p-3.5" style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Portfolio Performance</span>
                      <div className="flex gap-1">
                        {["1W", "1M", "6M", "1Y"].map((t, i) => (
                          <span key={t} className="text-[10.5px] px-2 py-0.5 rounded" style={i === 1 ? {
                            background: 'rgba(245,201,106,0.12)', color: '#fde68a', border: '1px solid rgba(245,201,106,0.18)'
                          } : { color: 'rgba(255,255,255,0.35)' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <svg className="w-full" viewBox="0 0 560 100" preserveAspectRatio="none" style={{ height: 100 }}>
                      <defs>
                        <linearGradient id="gGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(245,201,106,0.28)" />
                          <stop offset="100%" stopColor="rgba(245,201,106,0)" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="25" x2="560" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <line x1="0" y1="50" x2="560" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <line x1="0" y1="75" x2="560" y2="75" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <path d="M0,90 C40,82 70,74 100,66 C130,58 155,63 185,55 C215,47 240,43 268,36 C296,29 318,33 348,24 C378,16 405,20 432,14 C460,8 488,12 516,7 C532,4 548,6 560,5 L560,100 L0,100 Z" fill="url(#gGrad)" />
                      <path d="M0,90 C40,82 70,74 100,66 C130,58 155,63 185,55 C215,47 240,43 268,36 C296,29 318,33 348,24 C378,16 405,20 432,14 C460,8 488,12 516,7 C532,4 548,6 560,5" fill="none" stroke="#f5c96a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Right panel */}
                <div className="hidden lg:flex flex-col gap-5 p-5" style={{
                  borderLeft: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(0,0,0,0.12)',
                }}>
                  <div>
                    <div className="text-[9.5px] uppercase tracking-[2px] mb-3" style={{ color: 'rgba(255,255,255,0.22)' }}>AI Insight</div>
                    <div className="rounded-lg p-3" style={{
                      background: 'rgba(245,201,106,0.07)',
                      border: '1px solid rgba(245,201,106,0.18)',
                    }}>
                      <div className="flex items-center gap-1.5 text-xs font-medium mb-2" style={{ color: '#fde68a' }}>✦ Legio recommends</div>
                      <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>
                        "Your NVDA position is up 38% — consider trimming 15% to lock gains and rebalance tech exposure."
                      </p>
                      <div className="flex gap-2 mt-2.5">
                        <div className="flex-1 text-center py-1.5 rounded text-[11px] font-medium cursor-pointer"
                          style={{ background: 'rgba(245,201,106,0.15)', color: '#fde68a', border: '1px solid rgba(245,201,106,0.25)' }}>
                          Apply →
                        </div>
                        <div className="flex-1 text-center py-1.5 rounded text-[11px] cursor-pointer"
                          style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          Dismiss
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[9.5px] uppercase tracking-[2px] mb-3" style={{ color: 'rgba(255,255,255,0.22)' }}>Recent</div>
                    <div className="space-y-2">
                      {[
                        { icon: "📈", name: "AAPL bought", date: "Today, 09:14", amount: "+$1,840", up: true, bg: "rgba(52,211,153,0.12)" },
                        { icon: "🏠", name: "Mortgage", date: "Mar 22", amount: "−$2,100", up: false, bg: "rgba(248,113,113,0.12)" },
                        { icon: "💰", name: "Dividend", date: "Mar 21", amount: "+$340", up: true, bg: "rgba(245,201,106,0.12)" },
                      ].map(tx => (
                        <div key={tx.name} className="flex items-center gap-2 rounded-lg p-2" style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }}>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: tx.bg }}>{tx.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11.5px]" style={{ color: 'rgba(255,255,255,0.8)' }}>{tx.name}</div>
                            <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{tx.date}</div>
                          </div>
                          <span className={`text-xs font-medium ${tx.up ? 'text-emerald-400' : 'text-red-400'}`}>{tx.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="relative z-20" style={{
        background: 'rgba(8,16,40,0.94)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="container mx-auto px-4 py-14">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t('powerfulFeatures')}</h2>
            <p className="text-sm max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Everything you need to take control of your money, all in one beautiful platform.
            </p>
          </div>
          <div className="flex justify-center gap-4 flex-wrap">
            {features.map((feat, idx) => (
              <div key={idx} className="relative overflow-hidden rounded-2xl p-7 transition-all duration-300 cursor-default hover:-translate-y-1 group"
                style={{
                  flex: '1 1 200px',
                  maxWidth: 230,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                {/* top glow line on hover */}
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(245,201,106,0.35), transparent)' }} />
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4"
                  style={{ background: 'rgba(245,201,106,0.1)', border: '1px solid rgba(245,201,106,0.2)' }}>
                  {feat.icon}
                </div>
                <div className="text-sm font-medium text-foreground mb-1.5">{feat.title}</div>
                <div className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.42)' }}>{feat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative z-20" style={{
        background: 'rgba(8,16,40,0.94)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div className="flex items-center justify-center gap-4 flex-wrap py-5 px-8">
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Trusted by 50,000+ users</span>
          <div className="flex -space-x-2">
            {['🧑‍💼', '👩‍💻', '👨‍🎓', '👩‍🔬'].map((e, i) => (
              <span key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-sm" 
                style={{ border: '2px solid rgba(8,16,40,0.9)', background: 'rgba(245,201,106,0.2)' }}>{e}</span>
            ))}
          </div>
          <div className="flex gap-0.5 text-primary text-sm">★★★★★</div>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>4.9/5 from 3,200+ reviews</span>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-20 py-20" style={{ background: 'rgba(8,16,40,0.94)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Loved by Thousands</h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>See what our users have to say about Legio Finance</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {testimonials.map((t, idx) => (
              <div key={idx} className="rounded-2xl p-6 transition-all hover:-translate-y-1" style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
              }}>
                <div className="flex gap-1 mb-3 text-primary text-sm">★★★★★</div>
                <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>"{t.text}"</p>
                <div>
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-20 py-20" style={{ background: 'rgba(8,16,40,0.94)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">{t('readyToTakeControl')}</h2>
            <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {t('joinThousands')}
            </p>
            <Link to="/auth"
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-medium transition-all hover:-translate-y-0.5"
              style={{
                background: '#2563eb',
                color: '#fff',
                boxShadow: '0 4px 24px rgba(37,99,235,0.5)',
              }}>
              {t('startFreeTrialToday')}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
