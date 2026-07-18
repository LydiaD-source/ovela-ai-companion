/**
 * Shared per-language SEO strings for pages that are also emitted
 * as static prerendered HTML (see scripts/prerender-localized.ts).
 *
 * Both the build-time prerender AND the runtime React pages read from
 * this single source of truth, so the title/description that Google
 * sees in the static HTML matches what react-helmet / useSEO writes
 * after client hydration. Without this, English titles would clobber
 * the prerendered localized ones and GSC flagged the pages as
 * "Duplicate, Google chose different canonical than user."
 */

export type Lang = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ca';

export interface PageContent {
  title: string;
  description: string;
  h1: string;
  intro: string;
}

export interface PageDef {
  path: string;
  byLang: Record<Lang, PageContent>;
}

export const LOCALIZED_PAGES: PageDef[] = [
  {
    path: '/about',
    byLang: {
      en: { title: 'About Ovela Interactive | AI Digital Employees', description: 'Meet the team behind Isabella and Ovela Interactive — the studio building AI digital employees for clinics, real estate, wellness and hospitality.', h1: 'About Ovela Interactive', intro: 'Ovela Interactive builds AI digital employees that greet visitors, qualify leads and handle bookings around the clock — in any language, on every device.' },
      es: { title: 'Sobre Ovela Interactive | Empleados Digitales con IA', description: 'Conoce al equipo detrás de Isabella y Ovela Interactive — el estudio que crea empleados digitales con IA para clínicas, inmobiliarias, wellness y hostelería.', h1: 'Sobre Ovela Interactive', intro: 'Ovela Interactive crea empleados digitales con IA que atienden visitantes, califican leads y gestionan reservas las 24 horas — en cualquier idioma y en cualquier dispositivo.' },
      fr: { title: "À Propos d'Ovela Interactive | Employés Numériques IA", description: "Découvrez l'équipe derrière Isabella et Ovela Interactive — le studio qui crée des employés numériques IA pour cliniques, immobilier, bien-être et hôtellerie.", h1: "À Propos d'Ovela Interactive", intro: "Ovela Interactive conçoit des employés numériques IA qui accueillent les visiteurs, qualifient les leads et gèrent les réservations 24h/24 — dans toutes les langues, sur tous les appareils." },
      de: { title: 'Über Ovela Interactive | KI-Digitalangestellte', description: 'Lernen Sie das Team hinter Isabella und Ovela Interactive kennen — das Studio für KI-Digitalangestellte für Kliniken, Immobilien, Wellness und Hotellerie.', h1: 'Über Ovela Interactive', intro: 'Ovela Interactive entwickelt KI-Digitalangestellte, die Besucher empfangen, Leads qualifizieren und Buchungen rund um die Uhr abwickeln — in jeder Sprache, auf jedem Gerät.' },
      pt: { title: 'Sobre a Ovela Interactive | Funcionários Digitais com IA', description: 'Conheça a equipa por trás da Isabella e da Ovela Interactive — o estúdio que cria funcionários digitais com IA para clínicas, imobiliárias, bem-estar e hotelaria.', h1: 'Sobre a Ovela Interactive', intro: 'A Ovela Interactive cria funcionários digitais com IA que recebem visitantes, qualificam leads e tratam de reservas 24 horas por dia — em qualquer idioma, em qualquer dispositivo.' },
      ca: { title: 'Sobre Ovela Interactive | Empleats Digitals amb IA', description: "Coneix l'equip darrere d'Isabella i Ovela Interactive — l'estudi que crea empleats digitals amb IA per a clíniques, immobiliàries, wellness i hostaleria.", h1: 'Sobre Ovela Interactive', intro: 'Ovela Interactive crea empleats digitals amb IA que atenen visitants, qualifiquen leads i gestionen reserves les 24 hores — en qualsevol idioma i en qualsevol dispositiu.' },
    },
  },
  {
    path: '/partner',
    byLang: {
      en: { title: 'Partner With Ovela Interactive | Join The Network', description: 'Become an Ovela Interactive partner. Studios, agencies and brands collaborate with us to deploy multilingual AI digital employees.', h1: 'Partner With Ovela Interactive', intro: 'Join the Ovela Network. We collaborate with studios, agencies and selected brands to deploy multilingual AI digital employees and interactive experiences worldwide.' },
      es: { title: 'Colabora con Ovela Interactive | Únete a la Red', description: 'Conviértete en partner de Ovela Interactive. Estudios, agencias y marcas colaboran con nosotros para desplegar empleados digitales con IA multilingües.', h1: 'Colabora con Ovela Interactive', intro: 'Únete a la Red Ovela. Colaboramos con estudios, agencias y marcas seleccionadas para desplegar empleados digitales con IA multilingües y experiencias interactivas en todo el mundo.' },
      fr: { title: "Devenez Partenaire d'Ovela Interactive", description: "Devenez partenaire d'Ovela Interactive. Studios, agences et marques collaborent avec nous pour déployer des employés numériques IA multilingues.", h1: "Devenez Partenaire d'Ovela Interactive", intro: "Rejoignez le réseau Ovela. Nous collaborons avec studios, agences et marques sélectionnées pour déployer des employés numériques IA multilingues et des expériences interactives dans le monde entier." },
      de: { title: 'Partner von Ovela Interactive werden', description: 'Werden Sie Partner von Ovela Interactive. Studios, Agenturen und Marken setzen mit uns mehrsprachige KI-Digitalangestellte ein.', h1: 'Partner von Ovela Interactive werden', intro: 'Treten Sie dem Ovela-Netzwerk bei. Wir arbeiten mit Studios, Agenturen und ausgewählten Marken zusammen, um weltweit mehrsprachige KI-Digitalangestellte und interaktive Erlebnisse einzusetzen.' },
      pt: { title: 'Seja Parceiro da Ovela Interactive', description: 'Torne-se parceiro da Ovela Interactive. Estúdios, agências e marcas colaboram connosco para implementar funcionários digitais com IA multilíngues.', h1: 'Seja Parceiro da Ovela Interactive', intro: 'Junte-se à Rede Ovela. Colaboramos com estúdios, agências e marcas selecionadas para implementar funcionários digitais com IA multilíngues e experiências interativas em todo o mundo.' },
      ca: { title: 'Col·labora amb Ovela Interactive', description: "Converteix-te en partner d'Ovela Interactive. Estudis, agències i marques col·laboren amb nosaltres per desplegar empleats digitals amb IA multilingües.", h1: 'Col·labora amb Ovela Interactive', intro: "Uneix-te a la Xarxa Ovela. Col·laborem amb estudis, agències i marques seleccionades per desplegar empleats digitals amb IA multilingües i experiències interactives arreu del món." },
    },
  },
  {
    path: '/pricing',
    byLang: {
      en: { title: 'Pricing | Ovela Interactive AI Digital Employees', description: 'Transparent pricing for Ovela Interactive AI digital employees, interactive websites and multilingual concierge deployments.', h1: 'Ovela Interactive Pricing', intro: 'Clear pricing for AI digital employees, interactive websites and multilingual concierge deployments — built to scale with clinics, agencies, hotels and wellness brands.' },
      es: { title: 'Precios | Empleados Digitales con IA de Ovela', description: 'Precios transparentes para los empleados digitales con IA de Ovela Interactive, webs interactivas y despliegues multilingües.', h1: 'Precios de Ovela Interactive', intro: 'Precios claros para empleados digitales con IA, webs interactivas y despliegues multilingües — diseñados para escalar con clínicas, agencias, hoteles y marcas de wellness.' },
      fr: { title: "Tarifs | Employés Numériques IA d'Ovela", description: "Tarifs transparents pour les employés numériques IA d'Ovela Interactive, les sites interactifs et les déploiements multilingues.", h1: 'Tarifs Ovela Interactive', intro: 'Tarifs clairs pour les employés numériques IA, les sites interactifs et les déploiements multilingues — conçus pour les cliniques, agences, hôtels et marques de bien-être.' },
      de: { title: 'Preise | KI-Digitalangestellte von Ovela', description: 'Transparente Preise für KI-Digitalangestellte von Ovela Interactive, interaktive Websites und mehrsprachige Concierge-Lösungen.', h1: 'Ovela Interactive Preise', intro: 'Klare Preise für KI-Digitalangestellte, interaktive Websites und mehrsprachige Concierge-Lösungen — skalierbar für Kliniken, Agenturen, Hotels und Wellness-Marken.' },
      pt: { title: 'Preços | Funcionários Digitais com IA da Ovela', description: 'Preços transparentes para os funcionários digitais com IA da Ovela Interactive, sites interativos e implementações multilíngues.', h1: 'Preços da Ovela Interactive', intro: 'Preços claros para funcionários digitais com IA, sites interativos e implementações multilíngues — escaláveis para clínicas, agências, hotéis e marcas de bem-estar.' },
      ca: { title: "Preus | Empleats Digitals amb IA d'Ovela", description: "Preus transparents per als empleats digitals amb IA d'Ovela Interactive, webs interactives i desplegaments multilingües.", h1: "Preus d'Ovela Interactive", intro: 'Preus clars per a empleats digitals amb IA, webs interactives i desplegaments multilingües — dissenyats per escalar amb clíniques, agències, hotels i marques de wellness.' },
    },
  },
  {
    path: '/contact',
    byLang: {
      en: { title: 'Contact Ovela Interactive | Talk To Our Team', description: 'Contact Ovela Interactive to deploy an AI digital employee, book a demo or join the partner network.', h1: 'Contact Ovela Interactive', intro: 'Talk to our team about deploying an AI digital employee, booking a demo or joining the Ovela partner network. We respond in your language, every day of the week.' },
      es: { title: 'Contacta con Ovela Interactive | Habla con Nuestro Equipo', description: 'Contacta con Ovela Interactive para desplegar un empleado digital con IA, reservar una demo o unirte a la red de partners.', h1: 'Contacta con Ovela Interactive', intro: 'Habla con nuestro equipo para desplegar un empleado digital con IA, reservar una demo o unirte a la red de partners de Ovela. Respondemos en tu idioma, todos los días de la semana.' },
      fr: { title: 'Contactez Ovela Interactive | Parlez à notre Équipe', description: 'Contactez Ovela Interactive pour déployer un employé numérique IA, réserver une démo ou rejoindre le réseau de partenaires.', h1: 'Contactez Ovela Interactive', intro: 'Parlez à notre équipe pour déployer un employé numérique IA, réserver une démo ou rejoindre le réseau de partenaires Ovela. Nous répondons dans votre langue, tous les jours de la semaine.' },
      de: { title: 'Kontakt zu Ovela Interactive | Sprechen Sie mit unserem Team', description: 'Kontaktieren Sie Ovela Interactive, um einen KI-Digitalangestellten einzusetzen, eine Demo zu buchen oder unserem Partnernetzwerk beizutreten.', h1: 'Kontakt zu Ovela Interactive', intro: 'Sprechen Sie mit unserem Team über den Einsatz eines KI-Digitalangestellten, eine Demo-Buchung oder den Beitritt zum Ovela-Partnernetzwerk. Wir antworten in Ihrer Sprache, jeden Tag der Woche.' },
      pt: { title: 'Contacte a Ovela Interactive | Fale com a Nossa Equipa', description: 'Contacte a Ovela Interactive para implementar um funcionário digital com IA, marcar uma demo ou juntar-se à rede de parceiros.', h1: 'Contacte a Ovela Interactive', intro: 'Fale com a nossa equipa para implementar um funcionário digital com IA, marcar uma demonstração ou juntar-se à rede de parceiros da Ovela. Respondemos no seu idioma, todos os dias da semana.' },
      ca: { title: 'Contacta amb Ovela Interactive | Parla amb el Nostre Equip', description: 'Contacta amb Ovela Interactive per desplegar un empleat digital amb IA, reservar una demo o unir-te a la xarxa de partners.', h1: 'Contacta amb Ovela Interactive', intro: "Parla amb el nostre equip per desplegar un empleat digital amb IA, reservar una demo o unir-te a la xarxa de partners d'Ovela. Responem en el teu idioma, cada dia de la setmana." },
    },
  },
  {
    path: '/industries/clinics',
    byLang: {
      en: { title: 'AI Receptionist For Clinics | Ovela Interactive', description: 'Deploy a multilingual AI receptionist for your clinic. Handle bookings, FAQs and patient communication 24/7.', h1: 'AI Receptionists For Modern Clinics', intro: 'An always-on AI digital employee that greets patients, answers common questions and captures bookings — in any language, on every device.' },
      es: { title: 'Recepcionista con IA para Clínicas | Ovela Interactive', description: 'Despliega un recepcionista con IA multilingüe para tu clínica. Reservas, preguntas frecuentes y comunicación con pacientes 24/7.', h1: 'Recepcionistas con IA para Clínicas Modernas', intro: 'Un empleado digital con IA siempre activo que recibe pacientes, responde preguntas habituales y capta reservas — en cualquier idioma y en cualquier dispositivo.' },
      fr: { title: 'Réceptionniste IA pour Cliniques | Ovela Interactive', description: 'Déployez un réceptionniste IA multilingue pour votre clinique. Rendez-vous, FAQ et communication patient 24h/24.', h1: 'Réceptionnistes IA pour Cliniques Modernes', intro: 'Un employé numérique IA toujours actif qui accueille les patients, répond aux questions courantes et capte les rendez-vous — dans toutes les langues, sur tous les appareils.' },
      de: { title: 'KI-Rezeptionist für Kliniken | Ovela Interactive', description: 'Setzen Sie einen mehrsprachigen KI-Rezeptionisten für Ihre Klinik ein. Termine, FAQs und Patientenkommunikation rund um die Uhr.', h1: 'KI-Rezeptionisten für moderne Kliniken', intro: 'Ein stets verfügbarer KI-Digitalangestellter, der Patienten begrüßt, häufige Fragen beantwortet und Termine erfasst — in jeder Sprache, auf jedem Gerät.' },
      pt: { title: 'Rececionista com IA para Clínicas | Ovela Interactive', description: 'Implemente um rececionista com IA multilíngue para a sua clínica. Marcações, FAQs e comunicação com pacientes 24/7.', h1: 'Rececionistas com IA para Clínicas Modernas', intro: 'Um funcionário digital com IA sempre ativo que recebe pacientes, responde a perguntas comuns e regista marcações — em qualquer idioma, em qualquer dispositivo.' },
      ca: { title: 'Recepcionista amb IA per a Clíniques | Ovela Interactive', description: 'Desplega un recepcionista amb IA multilingüe per a la teva clínica. Reserves, preguntes freqüents i comunicació amb pacients 24/7.', h1: 'Recepcionistes amb IA per a Clíniques Modernes', intro: 'Un empleat digital amb IA sempre actiu que rep pacients, respon preguntes habituals i capta reserves — en qualsevol idioma i en qualsevol dispositiu.' },
    },
  },
  {
    path: '/industries/real-estate',
    byLang: {
      en: { title: 'AI Property Presenter For Real Estate | Ovela Interactive', description: "A 24/7 AI digital employee that presents listings, qualifies leads and speaks every buyer's language.", h1: 'AI Representatives For Real Estate Agencies', intro: "Stop losing after-hours buyers. Your AI digital employee presents every property, qualifies every lead and follows up in the buyer's own language — instantly." },
      es: { title: 'Presentador de Propiedades con IA | Ovela Interactive', description: 'Un empleado digital con IA 24/7 que presenta propiedades, califica leads y habla el idioma de cada comprador.', h1: 'Representantes con IA para Agencias Inmobiliarias', intro: 'Deja de perder compradores fuera de horario. Tu empleado digital con IA presenta cada propiedad, califica cada lead y hace seguimiento en el idioma del comprador — al instante.' },
      fr: { title: 'Présentateur Immobilier IA | Ovela Interactive', description: 'Un employé numérique IA 24h/24 qui présente les biens, qualifie les leads et parle la langue de chaque acheteur.', h1: 'Représentants IA pour Agences Immobilières', intro: "Ne perdez plus les acheteurs hors horaires. Votre employé numérique IA présente chaque bien, qualifie chaque lead et relance dans la langue de l'acheteur — instantanément." },
      de: { title: 'KI-Immobilienpräsentator | Ovela Interactive', description: 'Ein KI-Digitalangestellter, der rund um die Uhr Immobilien präsentiert, Leads qualifiziert und die Sprache jedes Käufers spricht.', h1: 'KI-Vertreter für Immobilienagenturen', intro: 'Verlieren Sie keine Käufer mehr nach Feierabend. Ihr KI-Digitalangestellter präsentiert jede Immobilie, qualifiziert jeden Lead und folgt in der Sprache des Käufers nach — sofort.' },
      pt: { title: 'Apresentador Imobiliário com IA | Ovela Interactive', description: 'Um funcionário digital com IA 24/7 que apresenta imóveis, qualifica leads e fala o idioma de cada comprador.', h1: 'Representantes com IA para Agências Imobiliárias', intro: 'Deixe de perder compradores fora de horas. O seu funcionário digital com IA apresenta cada imóvel, qualifica cada lead e faz seguimento no idioma do comprador — instantaneamente.' },
      ca: { title: 'Presentador Immobiliari amb IA | Ovela Interactive', description: "Un empleat digital amb IA 24/7 que presenta propietats, qualifica leads i parla l'idioma de cada comprador.", h1: 'Representants amb IA per a Agències Immobiliàries', intro: "Deixa de perdre compradors fora d'horari. El teu empleat digital amb IA presenta cada propietat, qualifica cada lead i fa seguiment en l'idioma del comprador — a l'instant." },
    },
  },
  {
    path: '/industries/wellness',
    byLang: {
      en: { title: 'AI Concierge For Wellness & Hospitality | Ovela Interactive', description: 'An AI digital employee for spas, wellness retreats and hotels. Multilingual concierge, booking handler and brand voice.', h1: 'AI Concierges For Wellness & Hospitality', intro: "Set the experience before guests arrive. Your AI representative presents treatments, answers questions and books appointments in the guest's own language — 24 hours a day." },
      es: { title: 'Conserje con IA para Wellness y Hostelería | Ovela', description: 'Un empleado digital con IA para spas, retiros de bienestar y hoteles. Conserjería multilingüe, reservas y voz de marca.', h1: 'Conserjes con IA para Wellness y Hostelería', intro: 'Define la experiencia antes de que el huésped llegue. Tu representante con IA presenta tratamientos, responde preguntas y reserva citas en el idioma del huésped — 24 horas al día.' },
      fr: { title: 'Conciergerie IA pour Bien-être & Hôtellerie | Ovela', description: 'Un employé numérique IA pour spas, retraites de bien-être et hôtels. Conciergerie multilingue, réservations et voix de marque.', h1: 'Conciergeries IA pour Bien-être & Hôtellerie', intro: 'Posez l\u2019expérience avant l\u2019arrivée des clients. Votre représentant IA présente les soins, répond aux questions et réserve les rendez-vous dans la langue du client — 24h/24.' },
      de: { title: 'KI-Concierge für Wellness & Hotellerie | Ovela', description: 'Ein KI-Digitalangestellter für Spas, Wellness-Retreats und Hotels. Mehrsprachiger Concierge, Buchungsmanagement und Markenstimme.', h1: 'KI-Concierges für Wellness & Hotellerie', intro: 'Gestalten Sie das Erlebnis, bevor die Gäste eintreffen. Ihr KI-Vertreter präsentiert Behandlungen, beantwortet Fragen und bucht Termine in der Sprache des Gastes — rund um die Uhr.' },
      pt: { title: 'Concierge com IA para Bem-estar e Hotelaria | Ovela', description: 'Um funcionário digital com IA para spas, retiros de bem-estar e hotéis. Concierge multilíngue, gestão de reservas e voz de marca.', h1: 'Concierges com IA para Bem-estar e Hotelaria', intro: 'Defina a experiência antes da chegada dos hóspedes. O seu representante com IA apresenta tratamentos, responde a perguntas e marca consultas no idioma do hóspede — 24 horas por dia.' },
      ca: { title: 'Conserge amb IA per a Wellness i Hostaleria | Ovela', description: 'Un empleat digital amb IA per a spas, retirs de benestar i hotels. Conserge multilingüe, gestió de reserves i veu de marca.', h1: 'Conserges amb IA per a Wellness i Hostaleria', intro: "Defineix l'experiència abans que arribi l'hoste. El teu representant amb IA presenta tractaments, respon preguntes i reserva cites en l'idioma de l'hoste — 24 hores al dia." },
    },
  },
];

/**
 * Return the localized {title, description, h1, intro} for a given
 * (path, lang). Falls back to English content if the language variant
 * is missing; returns undefined if the path is not managed here.
 */
export function getLocalizedPageSEO(path: string, lang: string): PageContent | undefined {
  const page = LOCALIZED_PAGES.find((p) => p.path === path);
  if (!page) return undefined;
  const l = (lang?.split('-')[0] || 'en') as Lang;
  return page.byLang[l] || page.byLang.en;
}
