import { useEffect } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../../services/auth/use-auth'
import { FeedTemplate } from '../templates/FeedTemplate'

const features = [
  { title: 'Explorar', text: 'Encontre publicações no feed e use a pesquisa para chegar aos conteúdos que interessam.' },
  { title: 'Compartilhar', text: 'Publique seus projetos com título, descrição e uma imagem de capa opcional.' },
  { title: 'Interagir', text: 'Curta publicações e participe das conversas por meio dos comentários.' },
  { title: 'Acompanhar', text: 'Acesse seu perfil para visualizar as publicações que você já compartilhou.' },
] as const

const principles = [
  { title: 'Responsiva', text: 'A navegação se adapta a computadores, tablets e celulares.' },
  { title: 'Acessível', text: 'A interface utiliza estrutura semântica, foco visível e suporte à navegação por teclado.' },
  { title: 'Clara', text: 'O conteúdo apresenta funcionalidades reais, mensagens compreensíveis e ações objetivas.' },
] as const

const description = 'Conheça o CodeConnect, um espaço para descobrir, compartilhar e interagir com publicações sobre projetos.'

function useAboutMetadata() {
  useEffect(() => {
    const previousTitle = document.title
    const existingDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = existingDescription?.content
    const descriptionElement = existingDescription ?? document.createElement('meta')
    const createdDescription = !existingDescription

    if (createdDescription) {
      descriptionElement.name = 'description'
      document.head.append(descriptionElement)
    }

    document.title = 'Sobre nós | CodeConnect'
    descriptionElement.content = description

    return () => {
      document.title = previousTitle
      if (createdDescription) descriptionElement.remove()
      else if (previousDescription !== undefined) descriptionElement.content = previousDescription
    }
  }, [])
}

function AboutIllustration() {
  return <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-96 overflow-hidden rounded-3xl border border-accent/30 bg-surface p-6 shadow-[0_0_60px_rgba(129,254,136,.12)]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(129,254,136,.3),transparent_30%),linear-gradient(135deg,transparent_0%,rgba(11,27,33,.9)_100%)]" />
    <div className="relative grid h-full place-items-center rounded-2xl border border-accent/30 bg-page/70">
      <div className="grid size-24 place-items-center rounded-3xl border-2 border-accent bg-surface text-5xl font-bold text-accent shadow-[0_0_32px_rgba(129,254,136,.32)]">⌘</div>
      <span className="absolute left-[14%] top-[22%] size-3 rounded-full bg-accent shadow-[0_0_18px_rgba(129,254,136,.9)]" />
      <span className="absolute bottom-[23%] right-[16%] size-4 rounded-full border-2 border-accent" />
      <span className="absolute left-[22%] top-1/2 h-px w-[25%] bg-accent/70" />
      <span className="absolute right-[20%] top-1/2 h-px w-[18%] bg-accent/70" />
      <code className="absolute bottom-7 left-7 text-sm text-accent/80">{'{ conectar: ideias }'}</code>
    </div>
  </div>
}

export function AboutPage() {
  const { isAuthenticated, status } = useAuth()
  useAboutMetadata()

  const isSessionReady = status !== 'initializing'
  const primaryAction = isAuthenticated
    ? { label: 'Publicar projeto', to: '/publicar' }
    : { label: 'Criar conta', to: '/cadastro' }
  const ctaTitle = isAuthenticated ? 'Compartilhe o que você está construindo' : 'Pronto para compartilhar seu projeto?'
  const ctaText = isAuthenticated
    ? 'Publique um novo projeto ou explore o que outras pessoas estão criando.'
    : 'Crie sua conta e comece a publicar no CodeConnect.'

  return <FeedTemplate><div className="space-y-16 pb-4 sm:space-y-20">
    <section className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14" aria-labelledby="about-title">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[.18em] text-accent">Sobre o CodeConnect</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-copy sm:text-5xl" id="about-title">Projetos, pessoas e ideias em conexão.</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-muted">O CodeConnect é um espaço para descobrir publicações sobre projetos, compartilhar o que você está criando e interagir com outros conteúdos.</p>
      </div>
      <AboutIllustration />
    </section>

    <section className="max-w-3xl" aria-labelledby="about-purpose-title">
      <h2 className="text-2xl font-semibold text-accent" id="about-purpose-title">Um espaço para descobrir e compartilhar</h2>
      <p className="mt-5 text-lg leading-8 text-copy">No feed, você pode explorar e pesquisar publicações. Com uma conta, também pode publicar projetos, comentar, curtir e acompanhar suas próprias publicações pelo perfil.</p>
    </section>

    <section aria-labelledby="about-features-title">
      <h2 className="text-2xl font-semibold text-accent" id="about-features-title">O que você pode fazer</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">{features.map((feature) => <article className="rounded-xl border border-[#294047] bg-surface p-6" key={feature.title}>
        <h3 className="text-lg font-semibold text-copy">{feature.title}</h3>
        <p className="mt-3 leading-7 text-muted">{feature.text}</p>
      </article>)}</div>
    </section>

    <section aria-labelledby="about-principles-title">
      <h2 className="text-2xl font-semibold text-accent" id="about-principles-title">Uma experiência pensada para diferentes telas</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">{principles.map((principle) => <article className="rounded-xl bg-pattern p-6" key={principle.title}>
        <h3 className="text-lg font-semibold text-copy">{principle.title}</h3>
        <p className="mt-3 leading-7 text-muted">{principle.text}</p>
      </article>)}</div>
    </section>

    <section className="rounded-2xl border border-accent/40 bg-surface p-6 sm:p-8" aria-labelledby="about-cta-title">
      <h2 className="text-2xl font-semibold text-copy" id="about-cta-title">{ctaTitle}</h2>
      <p className="mt-3 max-w-2xl leading-7 text-muted">{ctaText}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {isSessionReady ? <Link className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 py-3 font-semibold text-accent-ink hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent" to={primaryAction.to}>{primaryAction.label}</Link> : null}
        <Link className="inline-flex min-h-11 items-center justify-center rounded-lg border border-accent px-5 py-3 font-semibold text-accent hover:bg-white/5 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent" to="/feed">Explorar publicações</Link>
      </div>
    </section>
  </div></FeedTemplate>
}
