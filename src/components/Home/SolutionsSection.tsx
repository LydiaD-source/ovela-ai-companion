import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Globe2, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { DIGITAL_CARD_PLANS } from '@/config/digitalCards';
import isabellaPortrait from '@/assets/isabella-hero-avatar-new.webp';
import cardOverview from '@/assets/digital-cards/card-thumbnail-close.png.asset.json';

export const IIPE_URL = 'https://iipeexchange.lovable.app/';

export const digitalSolutionsCopy = {
  en: ['Our solutions', 'Digital intelligence. Real connections.', 'Ovela Interactive is a digital AI solutions company connecting businesses with people — before, during and after the conversation.', 'Digital Employees', 'Your business. Communicating 24/7.', 'AI representatives that answer questions, present services and connect visitors with your business.', 'Meet the digital team', 'Your Business Card. Always Current.', 'Meet someone once. Stay connected.', 'Your details in one place. Update your card without printing another. With Pro, share news with people who have saved it.', 'Explore Ovela Digital Cards', 'International Intelligent Property Exchange', 'An independent property ecosystem connecting people, property and intelligent communication. Built by Ovela.', 'Explore IIPE', 'Choose your card', 'Your professional profile, saved directly to their phone.', 'Phone, WhatsApp, email and website', 'Company, job title and company information', 'profile update per month', 'Everything in Digital Card', 'Smart Updates per month', 'Events, products, services and company news', 'Links and calls to action', 'Get Your Digital Card', 'Make Your Card Work Harder', 'month', 'year', 'Smart Updates', 'Your card keeps working after the meeting.', 'View card plans'],
  es: ['Nuestras soluciones', 'Inteligencia digital. Conexiones reales.', 'Ovela Interactive es una empresa de soluciones digitales de IA que conecta empresas y personas — antes, durante y después de cada conversación.', 'Empleados digitales', 'Tu empresa. Comunicando las 24 horas.', 'Representantes de IA que responden preguntas, presentan servicios y conectan visitantes con tu empresa.', 'Conoce al equipo digital', 'Tu tarjeta. Siempre actualizada.', 'Conoce a alguien una vez. Sigue conectado.', 'Tus datos en un solo lugar. Actualiza tu tarjeta sin volver a imprimir. Con Pro, comparte novedades con quienes la han guardado.', 'Explora Ovela Digital Cards', 'International Intelligent Property Exchange', 'Un ecosistema inmobiliario independiente que conecta personas, propiedades y comunicación inteligente. Creado por Ovela.', 'Explora IIPE', 'Elige tu tarjeta', 'Tu perfil profesional, guardado directamente en su teléfono.', 'Teléfono, WhatsApp, email y web', 'Empresa, cargo e información de la empresa', 'actualización del perfil al mes', 'Todo lo incluido en Digital Card', 'Smart Updates al mes', 'Eventos, productos, servicios y noticias', 'Enlaces y llamadas a la acción', 'Consigue tu Digital Card', 'Haz que tu tarjeta trabaje más', 'mes', 'año', 'Smart Updates', 'Tu tarjeta sigue trabajando después de la reunión.', 'Ver planes'],
  fr: ['Nos solutions', 'Intelligence numérique. Connexions réelles.', 'Ovela Interactive est une entreprise de solutions numériques d’IA qui relie entreprises et personnes — avant, pendant et après chaque échange.', 'Employés numériques', 'Votre entreprise. Disponible 24h/24.', 'Des représentants IA qui répondent aux questions, présentent vos services et connectent les visiteurs à votre entreprise.', 'Découvrez l’équipe numérique', 'Votre carte. Toujours à jour.', 'Une rencontre. Un lien durable.', 'Vos coordonnées au même endroit. Actualisez votre carte sans réimprimer. Avec Pro, partagez vos nouvelles avec ceux qui l’ont enregistrée.', 'Découvrez Ovela Digital Cards', 'International Intelligent Property Exchange', 'Un écosystème immobilier indépendant reliant personnes, biens et communication intelligente. Créé par Ovela.', 'Découvrez IIPE', 'Choisissez votre carte', 'Votre profil professionnel, enregistré directement sur leur téléphone.', 'Téléphone, WhatsApp, email et site web', 'Entreprise, poste et informations professionnelles', 'mise à jour du profil par mois', 'Tout ce qui est inclus dans Digital Card', 'Smart Updates par mois', 'Événements, produits, services et actualités', 'Liens et appels à l’action', 'Obtenez votre Digital Card', 'Faites travailler votre carte davantage', 'mois', 'an', 'Smart Updates', 'Votre carte continue de travailler après la rencontre.', 'Voir les formules'],
  de: ['Unsere Lösungen', 'Digitale Intelligenz. Echte Verbindungen.', 'Ovela Interactive entwickelt digitale KI-Lösungen, die Unternehmen und Menschen verbinden — vor, während und nach dem Gespräch.', 'Digitale Mitarbeiter', 'Ihr Unternehmen. Rund um die Uhr erreichbar.', 'KI-Repräsentanten beantworten Fragen, präsentieren Leistungen und verbinden Besucher mit Ihrem Unternehmen.', 'Das digitale Team kennenlernen', 'Ihre Visitenkarte. Immer aktuell.', 'Einmal treffen. Verbunden bleiben.', 'Ihre Kontaktdaten an einem Ort. Aktualisieren statt neu drucken. Mit Pro teilen Sie Neuigkeiten mit Menschen, die Ihre Karte gespeichert haben.', 'Ovela Digital Cards entdecken', 'International Intelligent Property Exchange', 'Ein unabhängiges Immobilien-Ökosystem für Menschen, Immobilien und intelligente Kommunikation. Entwickelt von Ovela.', 'IIPE entdecken', 'Wählen Sie Ihre Karte', 'Ihr berufliches Profil, direkt auf dem Telefon gespeichert.', 'Telefon, WhatsApp, E-Mail und Website', 'Unternehmen, Position und Firmeninformationen', 'Profilaktualisierung pro Monat', 'Alles aus Digital Card', 'Smart Updates pro Monat', 'Events, Produkte, Dienstleistungen und Neuigkeiten', 'Links und Handlungsaufforderungen', 'Ihre Digital Card anfragen', 'Ihre Karte kann mehr', 'Monat', 'Jahr', 'Smart Updates', 'Ihre Karte arbeitet nach dem Treffen weiter.', 'Tarife ansehen'],
  pt: ['As nossas soluções', 'Inteligência digital. Ligações reais.', 'A Ovela Interactive é uma empresa de soluções digitais de IA que liga empresas e pessoas — antes, durante e depois da conversa.', 'Colaboradores digitais', 'A sua empresa. A comunicar 24/7.', 'Representantes de IA que respondem a perguntas, apresentam serviços e ligam visitantes à sua empresa.', 'Conheça a equipa digital', 'O seu cartão. Sempre atualizado.', 'Conheça alguém uma vez. Mantenha a ligação.', 'Os seus dados num só lugar. Atualize o cartão sem voltar a imprimir. Com Pro, partilhe novidades com quem o guardou.', 'Explore Ovela Digital Cards', 'International Intelligent Property Exchange', 'Um ecossistema imobiliário independente que liga pessoas, imóveis e comunicação inteligente. Criado pela Ovela.', 'Explore IIPE', 'Escolha o seu cartão', 'O seu perfil profissional, guardado diretamente no telefone.', 'Telefone, WhatsApp, email e website', 'Empresa, cargo e informações da empresa', 'atualização de perfil por mês', 'Tudo incluído no Digital Card', 'Smart Updates por mês', 'Eventos, produtos, serviços e notícias', 'Ligações e chamadas à ação', 'Obtenha o seu Digital Card', 'Faça o seu cartão trabalhar mais', 'mês', 'ano', 'Smart Updates', 'O seu cartão continua a trabalhar depois da reunião.', 'Ver planos'],
  ca: ['Les nostres solucions', 'Intel·ligència digital. Connexions reals.', 'Ovela Interactive és una empresa de solucions digitals d’IA que connecta empreses i persones — abans, durant i després de la conversa.', 'Empleats digitals', 'La teva empresa. Comunicant 24/7.', 'Representants d’IA que responen preguntes, presenten serveis i connecten visitants amb la teva empresa.', 'Coneix l’equip digital', 'La teva targeta. Sempre actualitzada.', 'Coneix algú una vegada. Mantén la connexió.', 'Les teves dades en un sol lloc. Actualitza la targeta sense tornar a imprimir. Amb Pro, comparteix novetats amb qui l’ha desada.', 'Explora Ovela Digital Cards', 'International Intelligent Property Exchange', 'Un ecosistema immobiliari independent que connecta persones, propietats i comunicació intel·ligent. Creat per Ovela.', 'Explora IIPE', 'Tria la teva targeta', 'El teu perfil professional, desat directament al telèfon.', 'Telèfon, WhatsApp, email i web', 'Empresa, càrrec i informació de l’empresa', 'actualització del perfil al mes', 'Tot el que inclou Digital Card', 'Smart Updates al mes', 'Esdeveniments, productes, serveis i notícies', 'Enllaços i crides a l’acció', 'Aconsegueix la teva Digital Card', 'Fes que la teva targeta treballi més', 'mes', 'any', 'Smart Updates', 'La teva targeta continua treballant després de la reunió.', 'Veure plans'],
};

export const SolutionsSection = () => {
  const { i18n } = useTranslation();
  const language = i18n.language.split('-')[0];
  const c = digitalSolutionsCopy[language as keyof typeof digitalSolutionsCopy] ?? digitalSolutionsCopy.en;
  const prefix = ['es', 'fr', 'de', 'pt', 'ca'].includes(language) ? `/${language}` : '';
  const actionClass = 'h-auto justify-start whitespace-normal px-0 text-solution-gold hover:text-solution-foreground';

  return (
    <section id="solutions" className="scroll-mt-20 border-y border-solution-border bg-solution px-6 py-14 text-solution-foreground md:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 max-w-3xl">
          <p className="mb-3 text-xs uppercase text-solution-gold">{c[0]} / Ovela Interactive</p>
          <h2 className="font-playfair text-3xl leading-tight md:text-4xl">{c[1]}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-solution-muted">{c[2]}</p>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          <article className="flex min-w-0 flex-col rounded-lg border border-solution-border bg-solution-surface p-6">
            <div className="mb-6 flex h-16 items-center gap-4">
              <img src={isabellaPortrait} alt="Isabella — Ovela AI Ambassador" className="h-16 w-16 rounded-full object-cover object-top" loading="lazy" />
              <MessageCircle className="h-6 w-6 text-solution-gold" aria-hidden="true" />
            </div>
            <p className="mb-2 text-xs text-solution-gold">01 / {c[3]}</p>
            <h3 className="font-playfair text-2xl leading-tight">{c[4]}</h3>
            <p className="mb-6 mt-4 text-sm leading-relaxed text-solution-muted">{c[5]}</p>
            <Button asChild variant="link" className={`${actionClass} mt-auto`}><a href="#meet-team">{c[6]} <ArrowRight /></a></Button>
          </article>
          <article id="digital-cards" className="flex min-w-0 scroll-mt-20 flex-col rounded-lg border border-solution-gold/50 bg-solution-surface p-6">
            <Link to={`${prefix}/digital-cards`} className="mb-5 block overflow-hidden rounded-md border border-solution-border" aria-label={c[10]}>
              <img src={cardOverview.url} alt="Ovela Digital Card — fictional Dario Engler profile" className="aspect-[16/9] w-full object-contain" loading="lazy" />
            </Link>
            <p className="mb-2 text-xs text-solution-gold">02 / Ovela Digital Card</p>
            <h3 className="font-playfair text-2xl leading-tight">{c[7]}</h3>
            <p className="mt-3 text-sm text-solution-gold">{c[8]}</p>
            <p className="mb-5 mt-3 text-sm leading-relaxed text-solution-muted">{c[9]}</p>
            <div className="mb-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-solution-border pt-4 text-sm"><span>Basic <strong className="text-solution-gold">€{DIGITAL_CARD_PLANS[0].monthlyPrice}</strong>/{c[25]}</span><span>Pro <strong className="text-solution-gold">€{DIGITAL_CARD_PLANS[1].monthlyPrice}</strong>/{c[25]}</span></div>
            <Button asChild variant="link" className={`${actionClass} mt-auto`}><Link to={`${prefix}/digital-cards`}>{c[10]} <ArrowRight /></Link></Button>
          </article>
          <article id="iipe" className="flex min-w-0 scroll-mt-20 flex-col rounded-lg border border-solution-border bg-solution-surface p-6">
            <div className="mb-6 flex h-16 items-center gap-4 text-solution-cyan"><Globe2 className="h-12 w-12" strokeWidth={1} aria-hidden="true" /><span className="font-playfair text-3xl">IIPE</span></div>
            <p className="mb-2 text-xs text-solution-cyan">03 / IIPE</p>
            <h3 className="font-playfair text-2xl leading-tight">{c[11]}</h3>
            <p className="mb-6 mt-4 text-sm leading-relaxed text-solution-muted">{c[12]}</p>
            <Button asChild variant="link" className={`${actionClass} mt-auto text-solution-cyan`}><a href={IIPE_URL} target="_blank" rel="noopener noreferrer">{c[13]} <ArrowUpRight /></a></Button>
          </article>
        </div>
      </div>
    </section>
  );
};