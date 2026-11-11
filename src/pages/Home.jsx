import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScanLine, ArrowRight, Camera, Fingerprint, Wand2, BookOpen, Cpu, Layers, Pencil, Languages, WifiOff, Lock, EyeOff, Trash2, Download, ShieldCheck } from 'lucide-react';
import HeroPalm from '../components/HeroPalm.jsx';
import Disclaimer from '../components/Disclaimer.jsx';
import ReadingCard from '../components/ReadingCard.jsx';
import { useT } from '../i18n/index.js';
import { CATEGORIES, LINE_NAMES, LINE_DESCRIPTIONS } from '../data/readingData.js';
import { LINE_COLORS, LINE_IDS } from '../services/palmAnalysis.js';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: 'easeOut' },
};

function Section({ id, eyebrow, title, intro, children }) {
  return (
    <section id={id} className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6">
      <motion.div {...fadeUp} className="mx-auto mb-12 max-w-2xl text-center">
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h2 className="section-title">{title}</h2>
        {intro && <p className="mt-4 text-muted">{intro}</p>}
      </motion.div>
      {children}
    </section>
  );
}

export default function Home() {
  const { t, lang } = useT();

  const steps = [
    { icon: Camera, key: 'capture' },
    { icon: Fingerprint, key: 'detect' },
    { icon: Layers, key: 'enhance' },
    { icon: BookOpen, key: 'read' },
  ];
  const features = [
    { icon: Cpu, key: 'landmarks' },
    { icon: Wand2, key: 'opencv' },
    { icon: Pencil, key: 'correction' },
    { icon: BookOpen, key: 'engine' },
    { icon: Languages, key: 'bilingual' },
    { icon: WifiOff, key: 'offline' },
  ];
  const privacy = [
    { icon: Lock, key: 'local' },
    { icon: EyeOff, key: 'noImages' },
    { icon: Trash2, key: 'delete' },
    { icon: Download, key: 'export' },
  ];

  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="chip mb-6 border-gold/30 bg-gold/5 text-gold">
            <ScanLine className="h-3.5 w-3.5" /> {t('home.badge')}
          </span>
          <h1 className="font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl xl:text-7xl">
            {t('home.titleA')} <span className="text-gradient">{t('home.titleB')}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{t('home.subtitle')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/scan" className="btn-gold px-6 py-3 text-base">
              <ScanLine className="h-5 w-5" /> {t('home.ctaStart')}
            </Link>
            <a href="#how-it-works" className="btn-ghost px-6 py-3 text-base">
              {t('home.ctaExplore')} <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
            {[
              ['21', t('home.stat.landmarks')],
              ['4', t('home.stat.lines')],
              ['0', t('home.stat.uploads')],
            ].map(([n, label]) => (
              <div key={label} className="rounded-2xl border border-line bg-white/[0.02] p-4">
                <dt className="sr-only">{label}</dt>
                <dd className="font-serif text-3xl font-semibold text-gold">{n}</dd>
                <dd className="mt-1 text-xs leading-snug text-muted">{label}</dd>
              </div>
            ))}
          </dl>
          <Disclaimer variant="inline" className="mt-8 max-w-xl" />
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.1 }}>
          <HeroPalm />
          <div className="mx-auto mt-6 flex max-w-sm flex-wrap justify-center gap-2">
            {LINE_IDS.map((id) => (
              <span key={id} className="chip text-muted">
                <span className="h-2 w-2 rounded-full" style={{ background: LINE_COLORS[id] }} /> {LINE_NAMES[id][lang]}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* -------------------------------------------------- how it works */}
      <Section id="how-it-works" eyebrow={t('home.how.eyebrow')} title={t('home.how.title')} intro={t('home.how.intro')}>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, key }, i) => (
            <motion.article key={key} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }} className="card relative overflow-hidden">
              <span className="absolute right-4 top-3 font-serif text-5xl font-semibold text-primary/15">0{i + 1}</span>
              <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary/12 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold">{t(`home.how.${key}.title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(`home.how.${key}.body`)}</p>
            </motion.article>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-muted">
          <ShieldCheck className="mr-1.5 inline h-4 w-4 text-gold" />
          {t('home.how.honesty')}
        </p>
      </Section>

      {/* ------------------------------------------------------ features */}
      <Section id="features" eyebrow={t('home.features.eyebrow')} title={t('home.features.title')} intro={t('home.features.intro')}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, key }, i) => (
            <motion.article key={key} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.05 }} className="card group transition hover:border-primary/40">
              <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-gold/15 text-gold transition group-hover:scale-105">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-semibold">{t(`home.features.${key}.title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(`home.features.${key}.body`)}</p>
            </motion.article>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------- categories */}
      <Section id="categories" eyebrow={t('home.categories.eyebrow')} title={t('home.categories.title')} intro={t('home.categories.intro')}>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="grid gap-3">
            {CATEGORIES.map((c) => (
              <ReadingCard key={c} category={c} to="/scan" />
            ))}
          </div>
          <div className="card">
            <h3 className="mb-4 font-serif text-2xl font-semibold">{t('home.categories.linesTitle')}</h3>
            <ul className="space-y-4">
              {LINE_IDS.map((id) => (
                <li key={id} className="flex gap-3">
                  <span className="mt-1.5 h-2.5 w-8 shrink-0 rounded-full" style={{ background: LINE_COLORS[id], boxShadow: `0 0 12px ${LINE_COLORS[id]}` }} />
                  <div>
                    <p className="font-semibold">{LINE_NAMES[id][lang]}</p>
                    <p className="text-sm leading-relaxed text-muted">{LINE_DESCRIPTIONS[id][lang]}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* -------------------------------------------------------- privacy */}
      <Section id="privacy" eyebrow={t('home.privacy.eyebrow')} title={t('home.privacy.title')} intro={t('home.privacy.intro')}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {privacy.map(({ icon: Icon, key }) => (
            <motion.article key={key} {...fadeUp} className="card text-center">
              <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-emerald-400/10 text-emerald-400">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-semibold">{t(`home.privacy.${key}.title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(`home.privacy.${key}.body`)}</p>
            </motion.article>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------ CTA */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div {...fadeUp} className="card relative overflow-hidden px-6 py-12 text-center sm:px-12">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/25 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-gold/15 blur-3xl" aria-hidden="true" />
          <h2 className="section-title relative">{t('home.cta.title')}</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-muted">{t('home.cta.body')}</p>
          <Link to="/scan" className="btn-gold relative mt-8 px-7 py-3 text-base">
            <ScanLine className="h-5 w-5" /> {t('home.ctaStart')}
          </Link>
        </motion.div>
        <Disclaimer className="mt-8" />
      </section>
    </>
  );
}
