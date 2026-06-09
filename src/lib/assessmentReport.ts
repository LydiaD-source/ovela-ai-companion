/**
 * Client-side PDF generator for Isabella's wellness assessments.
 * Reports are generated in-session only — nothing is persisted.
 *
 * Two report types:
 *   - nutrition_assessment
 *   - recovery_resilience  (Recovery & Resilience Assessment)
 *
 * Legacy alias: 'biological_age' is still accepted on inbound payloads.
 *
 * Footer disclaimer is always included.
 */

import jsPDF from 'jspdf';

// ── i18n for PDF chrome (header / section titles / footer) ──────────────
// Body content (recommendations, scores narrative) still comes from the
// deterministic tool output in supabase/functions/ovela-chat/_tools.ts,
// which is currently English. Translating that is a separate pass.
export type AssessmentLang = 'en' | 'es' | 'fr' | 'de' | 'ca' | 'pt' | 'it';
const DEFAULT_LANG: AssessmentLang = 'en';
const SUPPORTED_LANGS: AssessmentLang[] = ['en', 'es', 'fr', 'de', 'ca', 'pt', 'it'];
function normLang(l?: string): AssessmentLang {
  if (!l) return DEFAULT_LANG;
  const x = l.toLowerCase().slice(0, 2) as AssessmentLang;
  return (SUPPORTED_LANGS.includes(x) ? x : DEFAULT_LANG);
}

// ── Label dictionary for section titles / table headers / inline labels ──
// English source string -> per-language translation. L(lang, en) returns the
// translation when present, otherwise the original English so nothing breaks.
const LABELS: Record<string, Partial<Record<AssessmentLang, string>>> = {
  '1 · Summary': { es: '1 · Resumen', fr: '1 · Résumé', de: '1 · Zusammenfassung', ca: '1 · Resum', pt: '1 · Resumo', it: '1 · Riepilogo' },
  'What Isabella noticed in your diary': { es: 'Lo que Isabella observó en tu diario', fr: 'Ce qu’Isabella a remarqué dans votre journal', de: 'Was Isabella in deinem Tagebuch bemerkt hat', ca: 'El que Isabella ha observat al teu diari', pt: 'O que Isabella notou no seu diário', it: 'Cosa Isabella ha notato nel tuo diario' },
  'Your biggest opportunities': { es: 'Tus mayores oportunidades', fr: 'Vos plus grandes opportunités', de: 'Deine größten Chancen', ca: 'Les teves majors oportunitats', pt: 'As suas maiores oportunidades', it: 'Le tue maggiori opportunità' },
  'Top changes': { es: 'Cambios principales', fr: 'Changements clés', de: 'Wichtigste Änderungen', ca: 'Canvis principals', pt: 'Principais alterações', it: 'Cambiamenti principali' },
  'Expected 14-day gains': { es: 'Mejoras esperadas en 14 días', fr: 'Gains attendus en 14 jours', de: 'Erwartete Fortschritte in 14 Tagen', ca: 'Millores esperades en 14 dies', pt: 'Ganhos esperados em 14 dias', it: 'Miglioramenti attesi in 14 giorni' },
  '2 · Nutrition Optimization Score': { es: '2 · Puntuación de Optimización Nutricional', fr: '2 · Score d’optimisation nutritionnelle', de: '2 · Ernährungs-Optimierungs-Score', ca: '2 · Puntuació d’Optimització Nutricional', pt: '2 · Pontuação de Otimização Nutricional', it: '2 · Punteggio di Ottimizzazione Nutrizionale' },
  'Scale:': { es: 'Escala:', fr: 'Échelle :', de: 'Skala:', ca: 'Escala:', pt: 'Escala:', it: 'Scala:' },
  '3 · Headline scores': { es: '3 · Puntuaciones principales', fr: '3 · Scores principaux', de: '3 · Hauptkennzahlen', ca: '3 · Puntuacions principals', pt: '3 · Pontuações principais', it: '3 · Punteggi principali' },
  '4 · Nutrition benchmark': { es: '4 · Referencia nutricional', fr: '4 · Référence nutritionnelle', de: '4 · Ernährungs-Benchmark', ca: '4 · Referència nutricional', pt: '4 · Referência nutricional', it: '4 · Benchmark nutrizionale' },
  'Metric': { es: 'Métrica', fr: 'Indicateur', de: 'Kennzahl', ca: 'Mètrica', pt: 'Métrica', it: 'Metrica' },
  'Current': { es: 'Actual', fr: 'Actuel', de: 'Aktuell', ca: 'Actual', pt: 'Atual', it: 'Attuale' },
  'Recommended': { es: 'Recomendado', fr: 'Recommandé', de: 'Empfohlen', ca: 'Recomanat', pt: 'Recomendado', it: 'Raccomandato' },
  'Position': { es: 'Posición', fr: 'Position', de: 'Position', ca: 'Posició', pt: 'Posição', it: 'Posizione' },
  'Nutrition snapshot': { es: 'Resumen nutricional', fr: 'Aperçu nutritionnel', de: 'Ernährungs-Überblick', ca: 'Resum nutricional', pt: 'Resumo nutricional', it: 'Panoramica nutrizionale' },
  'Why these scores': { es: 'Por qué estas puntuaciones', fr: 'Pourquoi ces scores', de: 'Warum diese Bewertungen', ca: 'Per què aquestes puntuacions', pt: 'Porquê estas pontuações', it: 'Perché questi punteggi' },
  'Your daily targets': { es: 'Tus objetivos diarios', fr: 'Vos objectifs quotidiens', de: 'Deine Tagesziele', ca: 'Els teus objectius diaris', pt: 'Os seus objetivos diários', it: 'I tuoi obiettivi giornalieri' },
  '⚡ Fastest win': { es: '⚡ Victoria más rápida', fr: '⚡ Gain le plus rapide', de: '⚡ Schnellster Erfolg', ca: '⚡ Victòria més ràpida', pt: '⚡ Vitória mais rápida', it: '⚡ Vittoria più rapida' },
  '5 · Muscle preservation & performance capacity': { es: '5 · Preservación muscular y capacidad de rendimiento', fr: '5 · Préservation musculaire et capacité de performance', de: '5 · Muskelerhalt & Leistungsfähigkeit', ca: '5 · Preservació muscular i capacitat de rendiment', pt: '5 · Preservação muscular e capacidade de desempenho', it: '5 · Preservazione muscolare e capacità di performance' },
  'Top meals from your week': { es: 'Mejores comidas de tu semana', fr: 'Meilleurs repas de votre semaine', de: 'Top-Mahlzeiten der Woche', ca: 'Millors àpats de la teva setmana', pt: 'Melhores refeições da sua semana', it: 'Migliori pasti della tua settimana' },
  'Protein opportunity — where your protein is missing': { es: 'Oportunidad de proteína — dónde te falta proteína', fr: 'Opportunité protéique — où votre protéine manque', de: 'Protein-Chance — wo dein Protein fehlt', ca: 'Oportunitat de proteïna — on et falta proteïna', pt: 'Oportunidade de proteína — onde falta proteína', it: 'Opportunità proteica — dove manca la tua proteina' },
  'Meal': { es: 'Comida', fr: 'Repas', de: 'Mahlzeit', ca: 'Àpat', pt: 'Refeição', it: 'Pasto' },
  'Actual': { es: 'Actual', fr: 'Réel', de: 'Aktuell', ca: 'Real', pt: 'Real', it: 'Reale' },
  'Target': { es: 'Objetivo', fr: 'Cible', de: 'Ziel', ca: 'Objectiu', pt: 'Meta', it: 'Obiettivo' },
  'Gap': { es: 'Diferencia', fr: 'Écart', de: 'Differenz', ca: 'Diferència', pt: 'Diferença', it: 'Divario' },
  'on target': { es: 'en objetivo', fr: 'sur la cible', de: 'im Ziel', ca: 'en objectiu', pt: 'no alvo', it: 'in obiettivo' },
  '7 · Personalised meal framework — based on your diary': { es: '7 · Marco de comidas personalizado — basado en tu diario', fr: '7 · Cadre de repas personnalisé — basé sur votre journal', de: '7 · Personalisierter Mahlzeitenrahmen — basierend auf deinem Tagebuch', ca: '7 · Marc d’àpats personalitzat — basat en el teu diari', pt: '7 · Estrutura de refeições personalizada — com base no seu diário', it: '7 · Struttura pasti personalizzata — basata sul tuo diario' },
  '8 · Recovery & metabolic efficiency': { es: '8 · Recuperación y eficiencia metabólica', fr: '8 · Récupération et efficacité métabolique', de: '8 · Erholung & Stoffwechseleffizienz', ca: '8 · Recuperació i eficiència metabòlica', pt: '8 · Recuperação e eficiência metabólica', it: '8 · Recupero ed efficienza metabolica' },
  '9 · Resistance training recommendation': { es: '9 · Recomendación de entrenamiento de fuerza', fr: '9 · Recommandation d’entraînement en résistance', de: '9 · Krafttraining-Empfehlung', ca: '9 · Recomanació d’entrenament de força', pt: '9 · Recomendação de treino de resistência', it: '9 · Raccomandazione allenamento di resistenza' },
  '10 · Recovery & lifestyle factors': { es: '10 · Factores de recuperación y estilo de vida', fr: '10 · Récupération et facteurs de mode de vie', de: '10 · Erholung & Lebensstilfaktoren', ca: '10 · Factors de recuperació i estil de vida', pt: '10 · Recuperação e fatores de estilo de vida', it: '10 · Recupero e fattori dello stile di vita' },
  'Strengths': { es: 'Fortalezas', fr: 'Points forts', de: 'Stärken', ca: 'Fortaleses', pt: 'Pontos fortes', it: 'Punti di forza' },
  'Needs improvement': { es: 'Necesita mejorar', fr: 'À améliorer', de: 'Verbesserungsbedarf', ca: 'Necessita millorar', pt: 'A melhorar', it: 'Da migliorare' },
  '11 · Expected progress': { es: '11 · Progreso esperado', fr: '11 · Progrès attendus', de: '11 · Erwarteter Fortschritt', ca: '11 · Progrés esperat', pt: '11 · Progresso esperado', it: '11 · Progresso atteso' },
  '12 · How your nutrition is affecting your results': { es: '12 · Cómo tu nutrición afecta tus resultados', fr: '12 · Comment votre nutrition affecte vos résultats', de: '12 · Wie deine Ernährung deine Ergebnisse beeinflusst', ca: '12 · Com la teva nutrició afecta els teus resultats', pt: '12 · Como a sua nutrição afeta os seus resultados', it: '12 · Come la tua nutrizione influisce sui risultati' },
  '13 · Long-term outlook': { es: '13 · Perspectiva a largo plazo', fr: '13 · Perspective à long terme', de: '13 · Langfristige Aussicht', ca: '13 · Perspectiva a llarg termini', pt: '13 · Perspetiva a longo prazo', it: '13 · Prospettiva a lungo termine' },
  'Most impactful improvement:': { es: 'Mejora más impactante:', fr: 'Amélioration la plus impactante :', de: 'Wirkungsvollste Verbesserung:', ca: 'Millora més impactant:', pt: 'Melhoria mais impactante:', it: 'Miglioramento più incisivo:' },
  '14 · Highest-priority improvements': { es: '14 · Mejoras de máxima prioridad', fr: '14 · Améliorations prioritaires', de: '14 · Wichtigste Verbesserungen', ca: '14 · Millores de màxima prioritat', pt: '14 · Melhorias de maior prioridade', it: '14 · Miglioramenti prioritari' },
  '7-day upgrade plan': { es: 'Plan de mejora de 7 días', fr: 'Plan d’amélioration sur 7 jours', de: '7-Tage-Upgrade-Plan', ca: 'Pla de millora de 7 dies', pt: 'Plano de melhoria de 7 dias', it: 'Piano di upgrade di 7 giorni' },
  '16 · Upgrade the meals you already eat': { es: '16 · Mejora las comidas que ya consumes', fr: '16 · Améliorez les repas que vous consommez déjà', de: '16 · Verbessere die Mahlzeiten, die du bereits isst', ca: '16 · Millora els àpats que ja menges', pt: '16 · Melhore as refeições que já consome', it: '16 · Migliora i pasti che già consumi' },
  '17 · Nutrition risk flags (observational)': { es: '17 · Señales de riesgo nutricional (observacional)', fr: '17 · Signaux de risque nutritionnel (observationnel)', de: '17 · Ernährungs-Risikohinweise (Beobachtung)', ca: '17 · Senyals de risc nutricional (observacional)', pt: '17 · Sinais de risco nutricional (observacional)', it: '17 · Segnali di rischio nutrizionale (osservazionali)' },
  'Dominant nutrition patterns': { es: 'Patrones nutricionales dominantes', fr: 'Schémas nutritionnels dominants', de: 'Dominante Ernährungsmuster', ca: 'Patrons nutricionals dominants', pt: 'Padrões nutricionais dominantes', it: 'Modelli nutrizionali dominanti' },
  'Impact:': { es: 'Impacto:', fr: 'Impact :', de: 'Auswirkung:', ca: 'Impacte:', pt: 'Impacto:', it: 'Impatto:' },
  'What success looks like in 14 days': { es: 'Cómo se ve el éxito en 14 días', fr: 'À quoi ressemble le succès en 14 jours', de: 'So sieht Erfolg in 14 Tagen aus', ca: 'Com es veu l’èxit en 14 dies', pt: 'Como é o sucesso em 14 dias', it: 'Come appare il successo in 14 giorni' },
  'Your baseline today — vs your tracked progress': { es: 'Tu punto de partida hoy — frente a tu progreso', fr: 'Votre point de départ aujourd’hui — vs votre progrès suivi', de: 'Deine Ausgangslage heute — vs. dein verfolgter Fortschritt', ca: 'El teu punt de partida avui — vs el teu progrés', pt: 'A sua base hoje — vs o seu progresso acompanhado', it: 'La tua base oggi — vs il tuo progresso monitorato' },
  '20 · Continue your progress with WellneSpirit': { es: '20 · Continúa tu progreso con WellneSpirit', fr: '20 · Poursuivez vos progrès avec WellneSpirit', de: '20 · Setze deinen Fortschritt mit WellneSpirit fort', ca: '20 · Continua el teu progrés amb WellneSpirit', pt: '20 · Continue o seu progresso com a WellneSpirit', it: '20 · Continua i tuoi progressi con WellneSpirit' },
  'Free baseline today · Tracked progress with Pro.': { es: 'Base gratuita hoy · Progreso seguido con Pro.', fr: 'Base gratuite aujourd’hui · Progrès suivi avec Pro.', de: 'Kostenlose Basis heute · Verfolgter Fortschritt mit Pro.', ca: 'Base gratuïta avui · Progrés seguit amb Pro.', pt: 'Base grátis hoje · Progresso acompanhado com Pro.', it: 'Base gratuita oggi · Progresso monitorato con Pro.' },
  '1 · Executive summary': { es: '1 · Resumen ejecutivo', fr: '1 · Résumé exécutif', de: '1 · Executive Summary', ca: '1 · Resum executiu', pt: '1 · Resumo executivo', it: '1 · Sintesi esecutiva' },
  '2 · Core scores': { es: '2 · Puntuaciones clave', fr: '2 · Scores clés', de: '2 · Kernkennzahlen', ca: '2 · Puntuacions clau', pt: '2 · Pontuações principais', it: '2 · Punteggi chiave' },
  'Burnout risk indicator:': { es: 'Indicador de riesgo de burnout:', fr: 'Indicateur de risque de burnout :', de: 'Burnout-Risikoindikator:', ca: 'Indicador de risc de burnout:', pt: 'Indicador de risco de burnout:', it: 'Indicatore di rischio burnout:' },
  '2b · Your recovery stage': { es: '2b · Tu etapa de recuperación', fr: '2b · Votre stade de récupération', de: '2b · Deine Erholungsphase', ca: '2b · La teva etapa de recuperació', pt: '2b · O seu estágio de recuperação', it: '2b · La tua fase di recupero' },
  '2c · Your Isabella recovery archetype': { es: '2c · Tu arquetipo de recuperación Isabella', fr: '2c · Votre archétype de récupération Isabella', de: '2c · Dein Isabella-Erholungs-Archetyp', ca: '2c · El teu arquetip de recuperació Isabella', pt: '2c · O seu arquétipo de recuperação Isabella', it: '2c · Il tuo archetipo di recupero Isabella' },
  'Characteristics:': { es: 'Características:', fr: 'Caractéristiques :', de: 'Merkmale:', ca: 'Característiques:', pt: 'Características:', it: 'Caratteristiche:' },
  'Typical risk:': { es: 'Riesgo típico:', fr: 'Risque typique :', de: 'Typisches Risiko:', ca: 'Risc típic:', pt: 'Risco típico:', it: 'Rischio tipico:' },
  'Primary focus:': { es: 'Enfoque principal:', fr: 'Objectif principal :', de: 'Hauptfokus:', ca: 'Enfocament principal:', pt: 'Foco principal:', it: 'Focus principale:' },
  '3 · Burnout risk indicators': { es: '3 · Indicadores de riesgo de burnout', fr: '3 · Indicateurs de risque de burnout', de: '3 · Burnout-Risikoindikatoren', ca: '3 · Indicadors de risc de burnout', pt: '3 · Indicadores de risco de burnout', it: '3 · Indicatori di rischio burnout' },
  '3c · Dominant recovery patterns': { es: '3c · Patrones dominantes de recuperación', fr: '3c · Schémas de récupération dominants', de: '3c · Dominante Erholungsmuster', ca: '3c · Patrons dominants de recuperació', pt: '3c · Padrões dominantes de recuperação', it: '3c · Modelli dominanti di recupero' },
  '3d · Executive dashboard — your 14-day leverage': { es: '3d · Panel ejecutivo — tu palanca de 14 días', fr: '3d · Tableau de bord exécutif — votre levier 14 jours', de: '3d · Executive Dashboard — dein 14-Tage-Hebel', ca: '3d · Tauler executiu — la teva palanca de 14 dies', pt: '3d · Painel executivo — a sua alavanca de 14 dias', it: '3d · Dashboard esecutiva — la tua leva di 14 giorni' },
  'Biggest opportunities (ranked by leverage):': { es: 'Mayores oportunidades (clasificadas por impacto):', fr: 'Plus grandes opportunités (classées par levier) :', de: 'Größte Chancen (nach Hebel sortiert):', ca: 'Majors oportunitats (per impacte):', pt: 'Maiores oportunidades (por alavanca):', it: 'Maggiori opportunità (per leva):' },
  'Expected 14-day gains:': { es: 'Mejoras esperadas en 14 días:', fr: 'Gains attendus en 14 jours :', de: 'Erwartete Fortschritte in 14 Tagen:', ca: 'Millores esperades en 14 dies:', pt: 'Ganhos esperados em 14 dias:', it: 'Miglioramenti attesi in 14 giorni:' },
  '3e · Your recovery drivers': { es: '3e · Tus impulsores de recuperación', fr: '3e · Vos moteurs de récupération', de: '3e · Deine Erholungs-Treiber', ca: '3e · Els teus motors de recuperació', pt: '3e · Os seus impulsionadores de recuperação', it: '3e · I tuoi driver di recupero' },
  'Biggest recovery drains:': { es: 'Mayores drenajes de recuperación:', fr: 'Principales pertes de récupération :', de: 'Größte Erholungs-Verluste:', ca: 'Majors drenatges de recuperació:', pt: 'Maiores perdas de recuperação:', it: 'Maggiori perdite di recupero:' },
  'Biggest recovery protectors:': { es: 'Mayores protectores de recuperación:', fr: 'Principaux protecteurs de récupération :', de: 'Größte Erholungs-Schützer:', ca: 'Majors protectors de recuperació:', pt: 'Maiores protetores de recuperação:', it: 'Maggiori protettori del recupero:' },
  '4 · Executive performance factors': { es: '4 · Factores de rendimiento ejecutivo', fr: '4 · Facteurs de performance exécutive', de: '4 · Executive Leistungsfaktoren', ca: '4 · Factors de rendiment executiu', pt: '4 · Fatores de desempenho executivo', it: '4 · Fattori di performance esecutiva' },
  '5 · Fastest wins': { es: '5 · Victorias más rápidas', fr: '5 · Gains les plus rapides', de: '5 · Schnellste Erfolge', ca: '5 · Victòries més ràpides', pt: '5 · Vitórias mais rápidas', it: '5 · Vittorie più rapide' },
  '5b · Nutrition × Recovery — combined view': { es: '5b · Nutrición × Recuperación — vista combinada', fr: '5b · Nutrition × Récupération — vue combinée', de: '5b · Ernährung × Erholung — kombinierte Ansicht', ca: '5b · Nutrició × Recuperació — vista combinada', pt: '5b · Nutrição × Recuperação — vista combinada', it: '5b · Nutrizione × Recupero — vista combinata' },
  '5c · Your two trajectories': { es: '5c · Tus dos trayectorias', fr: '5c · Vos deux trajectoires', de: '5c · Deine zwei Trajektorien', ca: '5c · Les teves dues trajectòries', pt: '5c · As suas duas trajetórias', it: '5c · Le tue due traiettorie' },
  '6 · 7-day recovery plan': { es: '6 · Plan de recuperación de 7 días', fr: '6 · Plan de récupération sur 7 jours', de: '6 · 7-Tage-Erholungsplan', ca: '6 · Pla de recuperació de 7 dies', pt: '6 · Plano de recuperação de 7 dias', it: '6 · Piano di recupero di 7 giorni' },
  '6b · 30 / 60 / 90-day outlook': { es: '6b · Perspectiva 30 / 60 / 90 días', fr: '6b · Perspective 30 / 60 / 90 jours', de: '6b · 30 / 60 / 90-Tage-Ausblick', ca: '6b · Perspectiva 30 / 60 / 90 dies', pt: '6b · Perspetiva 30 / 60 / 90 dias', it: '6b · Prospettiva 30 / 60 / 90 giorni' },
  '6c · Executive recovery-age estimate': { es: '6c · Estimación de edad de recuperación ejecutiva', fr: '6c · Estimation de l’âge de récupération exécutive', de: '6c · Schätzung des Executive-Erholungsalters', ca: '6c · Estimació d’edat de recuperació executiva', pt: '6c · Estimativa de idade de recuperação executiva', it: '6c · Stima dell’età di recupero esecutiva' },
  '7 · Next step': { es: '7 · Próximo paso', fr: '7 · Prochaine étape', de: '7 · Nächster Schritt', ca: '7 · Pròxim pas', pt: '7 · Próximo passo', it: '7 · Prossimo passo' },
  '1 - Executive snapshot': { es: '1 - Resumen ejecutivo', fr: '1 - Aperçu exécutif', de: '1 - Executive Snapshot', ca: '1 - Resum executiu', pt: '1 - Resumo executivo', it: '1 - Sintesi esecutiva' },
  'Estimated annual savings vs human (mid)': { es: 'Ahorro anual estimado vs humano (medio)', fr: 'Économies annuelles estimées vs humain (médian)', de: 'Geschätzte Jahresersparnis vs. Mensch (Mittelwert)', ca: 'Estalvi anual estimat vs humà (mitjà)', pt: 'Poupança anual estimada vs humano (médio)', it: 'Risparmio annuo stimato vs umano (medio)' },
  'Cost reduction vs full human TCO': { es: 'Reducción de costes vs TCO humano completo', fr: 'Réduction des coûts vs TCO humain complet', de: 'Kostensenkung vs. vollständige menschliche TCO', ca: 'Reducció de costos vs TCO humà complet', pt: 'Redução de custos vs TCO humano total', it: 'Riduzione costi vs TCO umano totale' },
  'Payback period': { es: 'Período de retorno', fr: 'Période de retour', de: 'Amortisationszeit', ca: 'Període de retorn', pt: 'Período de retorno', it: 'Periodo di payback' },
  '2 - Your archetype': { es: '2 - Tu arquetipo', fr: '2 - Votre archétype', de: '2 - Dein Archetyp', ca: '2 - El teu arquetip', pt: '2 - O seu arquétipo', it: '2 - Il tuo archetipo' },
  '3 - True annual cost of a human (mid estimate)': { es: '3 - Coste anual real de un humano (estimación media)', fr: '3 - Coût annuel réel d’un humain (estimation médiane)', de: '3 - Tatsächliche Jahreskosten eines Menschen (Mittelwert)', ca: '3 - Cost anual real d’un humà (estimació mitjana)', pt: '3 - Custo anual real de um humano (estimativa média)', it: '3 - Costo annuo reale di un umano (stima media)' },
  'Cost component': { es: 'Componente de coste', fr: 'Composante de coût', de: 'Kostenkomponente', ca: 'Component de cost', pt: 'Componente de custo', it: 'Componente di costo' },
  'Amount per year': { es: 'Importe anual', fr: 'Montant annuel', de: 'Betrag pro Jahr', ca: 'Import anual', pt: 'Valor anual', it: 'Importo annuo' },
  'True annual cost (mid)': { es: 'Coste anual real (medio)', fr: 'Coût annuel réel (médian)', de: 'Tatsächliche Jahreskosten (Mittelwert)', ca: 'Cost anual real (mitjà)', pt: 'Custo anual real (médio)', it: 'Costo annuo reale (medio)' },
  '4 - Coverage gap': { es: '4 - Brecha de cobertura', fr: '4 - Écart de couverture', de: '4 - Abdeckungslücke', ca: '4 - Bretxa de cobertura', pt: '4 - Lacuna de cobertura', it: '4 - Divario di copertura' },
  'Human (single FTE)': { es: 'Humano (un FTE)', fr: 'Humain (un ETP)', de: 'Mensch (eine VZÄ)', ca: 'Humà (un FTE)', pt: 'Humano (um FTE)', it: 'Umano (un FTE)' },
  '5 - Annual cost: human vs Isabella': { es: '5 - Coste anual: humano vs Isabella', fr: '5 - Coût annuel : humain vs Isabella', de: '5 - Jahreskosten: Mensch vs. Isabella', ca: '5 - Cost anual: humà vs Isabella', pt: '5 - Custo anual: humano vs Isabella', it: '5 - Costo annuo: umano vs Isabella' },
  '6 - Total cost of ownership (3 and 5 years)': { es: '6 - Coste total de propiedad (3 y 5 años)', fr: '6 - Coût total de possession (3 et 5 ans)', de: '6 - Gesamtbetriebskosten (3 und 5 Jahre)', ca: '6 - Cost total de propietat (3 i 5 anys)', pt: '6 - Custo total de propriedade (3 e 5 anos)', it: '6 - Costo totale di proprietà (3 e 5 anni)' },
  'Horizon': { es: 'Horizonte', fr: 'Horizon', de: 'Horizont', ca: 'Horitzó', pt: 'Horizonte', it: 'Orizzonte' },
  'Human (mid)': { es: 'Humano (medio)', fr: 'Humain (médian)', de: 'Mensch (Mittelwert)', ca: 'Humà (mitjà)', pt: 'Humano (médio)', it: 'Umano (medio)' },
  'Savings': { es: 'Ahorro', fr: 'Économies', de: 'Ersparnis', ca: 'Estalvi', pt: 'Poupança', it: 'Risparmio' },
  '3 years': { es: '3 años', fr: '3 ans', de: '3 Jahre', ca: '3 anys', pt: '3 anos', it: '3 anni' },
  '5 years': { es: '5 años', fr: '5 ans', de: '5 Jahre', ca: '5 anys', pt: '5 anos', it: '5 anni' },
  '7 - Front Office Efficiency Score': { es: '7 - Puntuación de eficiencia del front office', fr: '7 - Score d’efficacité du front office', de: '7 - Front-Office-Effizienz-Score', ca: '7 - Puntuació d’eficiència del front office', pt: '7 - Pontuação de eficiência do front office', it: '7 - Punteggio di efficienza del front office' },
  '8 - Revenue protected (estimated)': { es: '8 - Ingresos protegidos (estimado)', fr: '8 - Revenus protégés (estimé)', de: '8 - Geschützter Umsatz (geschätzt)', ca: '8 - Ingressos protegits (estimat)', pt: '8 - Receita protegida (estimada)', it: '8 - Ricavi protetti (stima)' },
  'Annual revenue exposed to missed inbound at current capture rate': { es: 'Ingresos anuales expuestos a llamadas perdidas con la tasa de captura actual', fr: 'Revenu annuel exposé aux appels manqués au taux de captation actuel', de: 'Jahresumsatz, der verpassten Anrufen bei der aktuellen Erfassungsrate ausgesetzt ist', ca: 'Ingressos anuals exposats a trucades perdudes amb la taxa de captura actual', pt: 'Receita anual exposta a chamadas perdidas à taxa de captura atual', it: 'Ricavi annuali esposti alle chiamate perse al tasso di cattura attuale' },
  '9 - Industry benchmark': { es: '9 - Referencia del sector', fr: '9 - Référence sectorielle', de: '9 - Branchen-Benchmark', ca: '9 - Referència del sector', pt: '9 - Referência do setor', it: '9 - Benchmark di settore' },
  '10 - Operational risk exposure': { es: '10 - Exposición a riesgo operativo', fr: '10 - Exposition au risque opérationnel', de: '10 - Operative Risikoexposition', ca: '10 - Exposició a risc operatiu', pt: '10 - Exposição ao risco operacional', it: '10 - Esposizione al rischio operativo' },
  '11 - If you do nothing — 12-month cost of inaction': { es: '11 - Si no haces nada — coste de inacción a 12 meses', fr: '11 - Si vous ne faites rien — coût d’inaction sur 12 mois', de: '11 - Wenn du nichts tust — 12-Monats-Kosten der Untätigkeit', ca: '11 - Si no fas res — cost d’inacció a 12 mesos', pt: '11 - Se não fizer nada — custo de inação a 12 meses', it: '11 - Se non fai nulla — costo dell’inazione a 12 mesi' },
  'Hidden staffing cost': { es: 'Coste de personal oculto', fr: 'Coût caché de personnel', de: 'Versteckte Personalkosten', ca: 'Cost de personal ocult', pt: 'Custo oculto de pessoal', it: 'Costo nascosto del personale' },
  'Missed revenue (annual)': { es: 'Ingresos perdidos (anual)', fr: 'Revenus manqués (annuel)', de: 'Verpasster Umsatz (jährlich)', ca: 'Ingressos perduts (anual)', pt: 'Receita perdida (anual)', it: 'Ricavi persi (annuali)' },
  'Turnover exposure': { es: 'Exposición a rotación', fr: 'Exposition au turnover', de: 'Fluktuationsrisiko', ca: 'Exposició a rotació', pt: 'Exposição a rotatividade', it: 'Esposizione al turnover' },
  'Total opportunity cost': { es: 'Coste de oportunidad total', fr: 'Coût d’opportunité total', de: 'Gesamtopportunitätskosten', ca: 'Cost d’oportunitat total', pt: 'Custo de oportunidade total', it: 'Costo opportunità totale' },
  '12 - Recommended staffing model (Human + Isabella)': { es: '12 - Modelo de personal recomendado (Humano + Isabella)', fr: '12 - Modèle de dotation recommandé (Humain + Isabella)', de: '12 - Empfohlenes Personalmodell (Mensch + Isabella)', ca: '12 - Model de personal recomanat (Humà + Isabella)', pt: '12 - Modelo de pessoal recomendado (Humano + Isabella)', it: '12 - Modello di staffing raccomandato (Umano + Isabella)' },
  'Today': { es: 'Hoy', fr: 'Aujourd’hui', de: 'Heute', ca: 'Avui', pt: 'Hoje', it: 'Oggi' },
};

function L(lang: AssessmentLang, en: string): string {
  if (lang === 'en') return en;
  return LABELS[en]?.[lang] ?? en;
}

const PDF_STRINGS: Record<AssessmentLang, Record<string, any>> = {
  en: {
    brand: 'OVELA INTERACTIVE  ·  ISABELLA',
    nutrition_title: 'Nutrition & Muscle Preservation Assessment',
    recovery_title: 'Recovery & Resilience Assessment',
    receptionist_title: 'Receptionist Cost & ROI Assessment',
    missed_title: 'Missed Calls & Revenue Leak Diagnostic',
    summary: 'Summary',
    footer_attrib: 'Generated by Isabella · ovelainteractive.com',
    page_x_of_y: (p: any, n: any) => `page ${p} of ${n}`,
    disclaimer: 'This assessment is educational and informational only. It is not a medical diagnosis and should not replace consultation with a qualified healthcare professional.',
  },
  es: {
    brand: 'OVELA INTERACTIVE  ·  ISABELLA',
    nutrition_title: 'Evaluacion de Nutricion y Preservacion Muscular',
    recovery_title: 'Evaluacion de Recuperacion y Resiliencia',
    receptionist_title: 'Coste de Recepcionista y Evaluacion de ROI',
    missed_title: 'Diagnostico de Llamadas Perdidas y Fuga de Ingresos',
    summary: 'Resumen',
    footer_attrib: 'Generado por Isabella · ovelainteractive.com',
    page_x_of_y: (p: any, n: any) => `pagina ${p} de ${n}`,
    disclaimer: 'Esta evaluacion es solo educativa e informativa. No es un diagnostico medico y no debe sustituir la consulta con un profesional sanitario cualificado.',
  },
  fr: {
    brand: 'OVELA INTERACTIVE  ·  ISABELLA',
    nutrition_title: 'Evaluation Nutrition et Preservation Musculaire',
    recovery_title: 'Evaluation de Recuperation et de Resilience',
    receptionist_title: 'Cout de Receptionniste et Evaluation du ROI',
    missed_title: 'Diagnostic des Appels Manques et Fuite de Revenus',
    summary: 'Resume',
    footer_attrib: 'Genere par Isabella · ovelainteractive.com',
    page_x_of_y: (p: any, n: any) => `page ${p} sur ${n}`,
    disclaimer: 'Cette evaluation est uniquement educative et informative. Elle ne constitue pas un diagnostic medical et ne doit pas remplacer la consultation d\'un professionnel de sante qualifie.',
  },
  de: {
    brand: 'OVELA INTERACTIVE  ·  ISABELLA',
    nutrition_title: 'Ernahrungs- und Muskelerhaltungs-Assessment',
    recovery_title: 'Recovery- und Resilienz-Assessment',
    receptionist_title: 'Empfangskosten- und ROI-Assessment',
    missed_title: 'Diagnose verpasster Anrufe und Umsatzverluste',
    summary: 'Zusammenfassung',
    footer_attrib: 'Erstellt von Isabella · ovelainteractive.com',
    page_x_of_y: (p: any, n: any) => `Seite ${p} von ${n}`,
    disclaimer: 'Dieses Assessment dient ausschliesslich Bildungs- und Informationszwecken. Es ist keine medizinische Diagnose und ersetzt nicht die Beratung durch qualifiziertes medizinisches Fachpersonal.',
  },
  ca: {
    brand: 'OVELA INTERACTIVE  ·  ISABELLA',
    nutrition_title: 'Avaluacio de Nutricio i Preservacio Muscular',
    recovery_title: 'Avaluacio de Recuperacio i Resiliencia',
    receptionist_title: 'Cost de Recepcionista i Avaluacio de ROI',
    missed_title: 'Diagnostic de Trucades Perdudes i Fuga d\'Ingressos',
    summary: 'Resum',
    footer_attrib: 'Generat per Isabella · ovelainteractive.com',
    page_x_of_y: (p: any, n: any) => `pagina ${p} de ${n}`,
    disclaimer: 'Aquesta avaluacio es nomes educativa i informativa. No es un diagnostic medic i no ha de substituir la consulta amb un professional sanitari qualificat.',
  },
  pt: {
    brand: 'OVELA INTERACTIVE  ·  ISABELLA',
    nutrition_title: 'Avaliacao de Nutricao e Preservacao Muscular',
    recovery_title: 'Avaliacao de Recuperacao e Resiliencia',
    receptionist_title: 'Custo de Rececionista e Avaliacao de ROI',
    missed_title: 'Diagnostico de Chamadas Perdidas e Fuga de Receita',
    summary: 'Resumo',
    footer_attrib: 'Gerado por Isabella · ovelainteractive.com',
    page_x_of_y: (p: any, n: any) => `pagina ${p} de ${n}`,
    disclaimer: 'Esta avaliacao e apenas educativa e informativa. Nao e um diagnostico medico e nao deve substituir a consulta com um profissional de saude qualificado.',
  },
  it: {
    brand: 'OVELA INTERACTIVE  ·  ISABELLA',
    nutrition_title: 'Valutazione Nutrizione e Preservazione Muscolare',
    recovery_title: 'Valutazione Esecutiva di Recupero e Resilienza',
    receptionist_title: 'Costo della Reception e Valutazione del ROI',
    missed_title: 'Diagnosi Chiamate Perse e Perdita di Ricavi',
    summary: 'Riepilogo',
    footer_attrib: 'Generato da Isabella · ovelainteractive.com',
    page_x_of_y: (p: any, n: any) => `pagina ${p} di ${n}`,
    disclaimer: 'Questa valutazione è solo a scopo educativo e informativo. Non è una diagnosi medica e non deve sostituire la consulenza di un professionista sanitario qualificato.',
  },
};
function tr(lang: AssessmentLang, key: string): string {
  const v = PDF_STRINGS[lang]?.[key] ?? PDF_STRINGS.en[key];
  return typeof v === 'string' ? v : '';
}
function tFn(lang: AssessmentLang, key: string, ...args: any[]): string {
  const v = PDF_STRINGS[lang]?.[key] ?? PDF_STRINGS.en[key];
  return typeof v === 'function' ? v(...args) : String(v ?? '');
}

const FOOTER_DISCLAIMER =
  'This assessment is educational and informational only. It is not a medical diagnosis and should not replace consultation with a qualified healthcare professional.';

export interface AssessmentReport {
  type: 'nutrition_assessment' | 'recovery_resilience' | 'business_calculator';
  subtype?: string;
  title?: string;
  language?: string;
  data: any;
}

export function isMeaningfulAssessmentReport(report: AssessmentReport | null | undefined): report is AssessmentReport {
  if (!report?.data || typeof report.data !== 'object') return false;
  const data = report.data;

  if (report.type === 'business_calculator') {
    if (report.subtype === 'missed_calls') {
      return Boolean(
        data?.inputs?.monthly_inbound > 0 &&
        typeof data?.annual_revenue_loss_eur === 'number' &&
        data?.leak_breakdown_eur
      );
    }
    return Boolean(
      data.country &&
      data.true_annual_cost_eur?.mid > 0 &&
      data.isabella_tiers_eur_per_year
    );
  }

  if (report.type === 'nutrition_assessment') {
    const targets = data.targets || {};
    return Boolean(
      (typeof targets.daily_calories === 'number' && targets.daily_calories > 500) ||
      (typeof targets.protein_g?.low_g === 'number' && targets.protein_g.low_g > 20) ||
      (typeof data.muscle_preservation?.recommended_protein_g === 'number' && data.muscle_preservation.recommended_protein_g > 20)
    );
  }

  const scores = data.scores || {};
  return Boolean(
    (typeof scores.executive_wellness === 'number' && scores.executive_wellness > 0) ||
    (typeof scores.recovery_capacity === 'number' && scores.recovery_capacity > 0) ||
    typeof scores.burnout_risk === 'string'
  );
}

function normalizeAssessmentReportPayload(parsed: any): AssessmentReport | null {
  if (!parsed || typeof parsed !== 'object') return null;

  const explicitType = parsed.type === 'biological_age' ? 'recovery_resilience' : parsed.type;
  if ((explicitType === 'nutrition_assessment' || explicitType === 'recovery_resilience' || explicitType === 'business_calculator') && parsed.data) {
    const report = { ...parsed, type: explicitType } as AssessmentReport;
    return isMeaningfulAssessmentReport(report) ? report : null;
  }

  if (parsed.nutrition_assessment_response) {
    const report: AssessmentReport = {
      type: 'nutrition_assessment',
      title: 'Nutrition & Muscle Preservation Assessment',
      data: parsed.nutrition_assessment_response,
    };
    return isMeaningfulAssessmentReport(report) ? report : null;
  }

  const recoveryPayload = parsed.recovery_resilience_response || parsed.recovery_resilience_assessment_response || parsed.biological_age_response;
  if (recoveryPayload) {
    const report: AssessmentReport = {
      type: 'recovery_resilience',
      title: 'Recovery & Resilience Assessment',
      data: recoveryPayload,
    };
    return isMeaningfulAssessmentReport(report) ? report : null;
  }

  if (parsed.muscle_preservation || parsed.protein_strategy || parsed.daily_meal_framework) {
    const report: AssessmentReport = {
      type: 'nutrition_assessment',
      title: 'Nutrition & Muscle Preservation Assessment',
      data: parsed,
    };
    return isMeaningfulAssessmentReport(report) ? report : null;
  }

  if (parsed.scores?.burnout_risk || parsed.recovery_capacity || parsed.executive_wellness || parsed.resilience) {
    const report: AssessmentReport = {
      type: 'recovery_resilience',
      title: 'Recovery & Resilience Assessment',
      data: parsed,
    };
    return isMeaningfulAssessmentReport(report) ? report : null;
  }

  return null;
}

// Try to parse a fenced ```assessment-report ... ``` block.
// Returns the report and the cleaned message (block removed) so chat UI stays clean.
export function extractAssessmentReport(text: string): {
  report: AssessmentReport | null;
  cleaned: string;
} {
  if (!text) return { report: null, cleaned: text };
  const re = /`{2,3}\s*assessment-report\s*([\s\S]*?)`{2,3}/i;
  const m = text.match(re);
  if (!m) return { report: null, cleaned: text };
  try {
    const parsed = JSON.parse(m[1].trim().replace(/^json\s*/i, ''));
    const report = normalizeAssessmentReportPayload(parsed);
    if (report) {
      return {
        report,
        cleaned: text.replace(re, '').trim(),
      };
    }
  } catch {
    // fall through
  }
  // If Isabella emitted a malformed assessment-report block, never show the
  // raw JSON/code payload in chat. The backend now also sends a structured
  // assessment_report field, which the UI can use as the download source.
  return { report: null, cleaned: text.replace(re, '').trim() };
}

// ── PDF builder ─────────────────────────────────────────────────────────
const GOLD = '#c9a84c';
const NAVY = '#0d1b2a';
const INK = '#1a1a1a';
const MUTED = '#666666';

// jsPDF's built-in Helvetica uses WinAnsi encoding and cannot render most
// Unicode glyphs (emoji, ≤ ≥ – — · ✓ ✗ ☐ ⚡ €, curly quotes, etc.).
// When it encounters one, the output is corrupted ("&¡ F a s t e s t w i n").
// We sanitize ALL text passed to the document before it reaches the encoder.
const UNICODE_MAP: Record<string, string> = {
  '⚡': '*', '★': '*', '✦': '*', '✱': '*',
  '✓': '+', '✔': '+',
  '✗': 'x', '✘': 'x', '×': 'x', '✕': 'x',
  '☐': '[ ]', '☑': '[x]', '☒': '[x]',
  '≤': '<=', '≥': '>=', '≠': '!=', '≈': '~',
  '–': '-', '—': '-', '−': '-',
  '·': '-', '•': '-', '●': '-', '◦': '-', '▪': '-', '■': '-',
  '€': 'EUR', '£': 'GBP', '¥': 'JPY',
  '°': ' deg',
  '“': '"', '”': '"', '„': '"', '«': '"', '»': '"',
  '‘': "'", '’': "'", '‚': "'",
  '…': '...',
  '\u00a0': ' ', '\u2009': ' ', '\u202f': ' ', '\u200b': '',
};
function sanitize(text: string): string {
  if (!text) return text;
  let out = '';
  for (const ch of text) {
    if (ch in UNICODE_MAP) out += UNICODE_MAP[ch];
    else if (ch.charCodeAt(0) < 256) out += ch;
    else out += '?'; // any other non-WinAnsi char → safe placeholder
  }
  return out;
}

function header(doc: jsPDF, title: string, lang: AssessmentLang = DEFAULT_LANG) {
  doc.setFillColor(NAVY);
  doc.rect(0, 0, 595, 70, 'F');
  doc.setTextColor(GOLD);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(tr(lang, 'brand'), 40, 28);
  doc.setTextColor('#ffffff');
  doc.setFontSize(18);
  doc.text(title, 40, 52);
}

function footer(doc: jsPDF, pageNo: number, pages: number, lang: AssessmentLang = DEFAULT_LANG) {
  const h = doc.internal.pageSize.getHeight();
  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.5);
  doc.line(40, h - 70, 555, h - 70);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  const wrapped = doc.splitTextToSize(tr(lang, 'disclaimer') || FOOTER_DISCLAIMER, 515);
  doc.text(wrapped, 40, h - 55);
  doc.setFont('helvetica', 'normal');
  doc.text(`${tr(lang, 'footer_attrib')}  ·  ${tFn(lang, 'page_x_of_y', pageNo, pages)}`, 40, h - 20);
}

function sectionTitle(doc: jsPDF, text: string, y: number) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(NAVY);
  doc.text(text, 40, y);
  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.8);
  doc.line(40, y + 4, 90, y + 4);
  return y + 22;
}

function paragraph(doc: jsPDF, text: string, y: number, opts: { size?: number; color?: string } = {}) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(opts.size ?? 10);
  doc.setTextColor(opts.color ?? INK);
  const lines = doc.splitTextToSize(text, 515);
  doc.text(lines, 40, y);
  return y + lines.length * (opts.size ?? 10) * 1.4;
}

function scoreRow(doc: jsPDF, label: string, score: number, y: number) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(INK);
  doc.text(label, 40, y);
  // bar
  const barX = 240, barW = 240, barH = 8;
  doc.setFillColor('#eeeeee');
  doc.rect(barX, y - 7, barW, barH, 'F');
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const fillColor = score >= 75 ? '#2d8a5e' : score >= 55 ? GOLD : '#c2553a';
  doc.setFillColor(fillColor);
  doc.rect(barX, y - 7, barW * pct, barH, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text(`${score}/100`, 500, y);
  return y + 18;
}

function ensureSpace(doc: jsPDF, y: number, needed: number) {
  const h = doc.internal.pageSize.getHeight();
  if (y + needed > h - 90) {
    doc.addPage();
    return 100;
  }
  return y;
}

// ── Nutrition report (clean sequential numbering) ───────────────────────
function buildNutrition(doc: jsPDF, data: any, lang: AssessmentLang = DEFAULT_LANG) {
  header(doc, tr(lang, 'nutrition_title'), lang);
  let y = 110;
  const s = data.scores || {};

  // 1. Summary
  if (data.executive_summary) {
    y = sectionTitle(doc, L(lang, '1 · Summary'), y);
    y = paragraph(doc, data.executive_summary, y);
    y += 8;
  }

  // 1b. Observations from your diary (meal-log references — personalization)
  if (Array.isArray(data.meal_observations) && data.meal_observations.length) {
    y = ensureSpace(doc, y, 30 + data.meal_observations.length * 16);
    y = sectionTitle(doc, L(lang, 'What Isabella noticed in your diary'), y);
    data.meal_observations.forEach((obs: string) => {
      y = ensureSpace(doc, y, 16);
      y = paragraph(doc, `- ${obs}`, y, { color: INK });
    });
    y += 6;
  }

  // 1c. Executive dashboard — biggest opportunities + expected 14-day gains
  const ed = data.executive_dashboard;
  if (ed && ((ed.biggest_opportunities || []).length || (ed.expected_14_day_gains || []).length)) {
    const opps = ed.biggest_opportunities || [];
    const gains = ed.expected_14_day_gains || [];
    const panelH = 40 + Math.max(opps.length, gains.length) * 16;
    y = ensureSpace(doc, y, panelH + 30);
    y = sectionTitle(doc, L(lang, 'Your biggest opportunities'), y);
    doc.setFillColor('#f7f3e6');
    doc.rect(40, y - 10, 515, panelH, 'F');
    // Left column header
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
    doc.text(L(lang, 'Top changes'), 56, y + 6);
    doc.text(L(lang, 'Expected 14-day gains'), 320, y + 6);
    let oy = y + 22;
    opps.forEach((o: any) => {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(NAVY);
      doc.text(`• ${o.label ?? ''}`, 56, oy);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(GOLD);
      doc.text(String(o.delta ?? ''), 200, oy);
      oy += 14;
    });
    let gy = y + 22;
    gains.forEach((g: any) => {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(INK);
      doc.text(String(g.metric ?? ''), 320, gy);
      doc.setFont('helvetica', 'bold'); doc.setTextColor('#2d8a5e');
      doc.text(String(g.gain ?? ''), 520, gy);
      gy += 14;
    });
    y += panelH;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(MUTED);
    y = paragraph(doc, ed.note, y + 4, { color: MUTED, size: 8 });
    y += 6;
  }

  // 2. Nutrition Optimization Score (headline)
  const er = data.executive_readiness;
  if (er) {
    y = ensureSpace(doc, y, 140);
    y = sectionTitle(doc, L(lang, '2 · Nutrition Optimization Score'), y);
    // Big number block
    doc.setFillColor('#f7f3e6');
    doc.rect(40, y - 12, 515, 70, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(36);
    doc.setTextColor(NAVY);
    doc.text(`${er.score} / 100`, 56, y + 28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(GOLD);
    doc.text(er.level, 260, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(MUTED);
    doc.text(`Measures: ${(er.measures || []).join(' · ')}`, 260, y + 30);
    doc.text(L(lang, 'Scale:'), 260, y + 44);
    (er.scale || []).slice(0, 4).forEach((line: string, i: number) => {
      doc.text(`• ${line}`, 300, y + 44 + (i + 1) * 10);
    });
    y += 90;
  }

  // 3. Headline scores (Nutrition / Recovery Support / Muscle)
  y = ensureSpace(doc, y, 130);
  y = sectionTitle(doc, L(lang, '3 · Headline scores'), y);
  y = paragraph(doc, 'These three scores feed into your Nutrition Optimization Score above. Lowest score = biggest leverage point.', y, { color: MUTED, size: 9 });
  y += 4;
  y = scoreRow(doc, 'Nutrition quality', s.overall_nutrition ?? 0, y);
  y = scoreRow(doc, 'Recovery Support Score', s.recovery_capacity ?? 0, y);
  y = scoreRow(doc, 'Muscle preservation', s.muscle_preservation ?? 0, y);
  y += 10;

  // 4. Nutrition Benchmark (peer comparison)
  const eb = data.executive_benchmark;
  if (eb) {
    y = ensureSpace(doc, y, 200);
    y = sectionTitle(doc, L(lang, '4 · Nutrition benchmark'), y);
    y = paragraph(doc, `Compared with ${eb.cohort}:`, y, { color: MUTED, size: 9 });
    y += 4;
    // Column headers
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(NAVY);
    doc.text(L(lang, 'Metric'), 40, y);
    doc.text(L(lang, 'Current'), 200, y);
    doc.text(L(lang, 'Recommended'), 330, y);
    doc.text(L(lang, 'Position'), 470, y);
    y += 6;
    doc.setDrawColor('#dddddd'); doc.line(40, y, 555, y); y += 8;
    (eb.items || []).forEach((it: any) => {
      y = ensureSpace(doc, y, 22);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(INK);
      doc.text(String(it.metric), 40, y);
      doc.text(String(it.current), 200, y);
      doc.text(String(it.recommended), 330, y);
      const top = String(it.position).startsWith('Top');
      const bot = String(it.position).startsWith('Bottom');
      doc.setTextColor(top ? '#2d8a5e' : bot ? '#c2553a' : MUTED);
      doc.setFont('helvetica', 'bold');
      doc.text(String(it.position), 470, y);
      y += 14;
    });
    y += 4;
    y = paragraph(doc, eb.note, y, { color: MUTED, size: 8 });
    y += 6;
  }


  // Nutrition snapshot (sub of executive view, no number)
  y = ensureSpace(doc, y, 180);
  y = sectionTitle(doc, L(lang, 'Nutrition snapshot'), y);
  y = scoreRow(doc, 'Protein', s.protein ?? 0, y);
  y = scoreRow(doc, 'Carbohydrate quality', s.carbs ?? 0, y);
  y = scoreRow(doc, 'Fat quality', s.fat ?? 0, y);
  y = scoreRow(doc, 'Hydration', s.hydration ?? 0, y);
  y = scoreRow(doc, 'Recovery inputs (nutrition contribution)', s.recovery_support ?? 0, y);
  y += 10;

  // Why these scores (transparency)
  const drivers = data.score_drivers;
  if (drivers && (drivers.hydration || drivers.carbs || drivers.recovery_support)) {
    y = ensureSpace(doc, y, 160);
    y = sectionTitle(doc, L(lang, 'Why these scores'), y);
    const blocks: Array<[string, any]> = [
      ['Hydration', drivers.hydration],
      ['Carbohydrate quality', drivers.carbs],
      ['Recovery support', drivers.recovery_support],
    ];
    for (const [label, blk] of blocks) {
      if (!blk) continue;
      y = ensureSpace(doc, y, 50);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(NAVY);
      doc.text(label, 40, y); y += 14;
      (blk.positives || []).forEach((p: string) => { y = ensureSpace(doc, y, 14); y = paragraph(doc, `+ ${p}`, y, { color: '#2d8a5e', size: 9 }); });
      (blk.limiting || []).forEach((p: string) => { y = ensureSpace(doc, y, 14); y = paragraph(doc, `- ${p}`, y, { color: '#c2553a', size: 9 }); });
      y += 4;
    }
  }

  // Targets + calculation basis (sub, no number)
  y = ensureSpace(doc, y, 160);
  y = sectionTitle(doc, L(lang, 'Your daily targets'), y);
  const t = data.targets || {};
  const cb = data.calculation_basis;
  if (cb?.note) {
    y = paragraph(doc, cb.note, y, { color: MUTED, size: 9 });
    y += 4;
  }
  y = paragraph(doc,
    `Calories: ~${t.daily_calories ?? '—'} kcal${t.maintenance_calories && t.maintenance_calories !== t.daily_calories ? `  (maintenance ~${t.maintenance_calories} kcal)` : ''}\n` +
    `Protein: ${t.protein_g?.low_g ?? '—'}–${t.protein_g?.high_g ?? '—'} g\n` +
    `Carbohydrates: ${t.carbs_g?.low_g ?? '—'}–${t.carbs_g?.high_g ?? '—'} g\n` +
    `Fat: ${t.fat_g?.low_g ?? '—'}–${t.fat_g?.high_g ?? '—'} g\n` +
    `Hydration: ~${t.hydration_l ?? '—'} L`, y);
  y += 6;

  // Weekly protein gap callout
  if (data.gaps?.weekly_protein_g > 0) {
    y = ensureSpace(doc, y, 50);
    doc.setFillColor('#fff8e1');
    doc.rect(40, y - 12, 515, 36, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(NAVY);
    doc.text(`Weekly protein gap: ${data.gaps.weekly_protein_g} g`, 50, y + 2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(MUTED);
    doc.text(`That is roughly ${data.gaps.protein_g} g/day × 7 — closing it is your fastest body-composition lever.`, 50, y + 16);
    y += 32;
  }

  // Fastest win (sub, no number)
  if (data.fastest_win) {
    y = ensureSpace(doc, y, 110);
    y = sectionTitle(doc, L(lang, '⚡ Fastest win'), y);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(NAVY);
    doc.text(data.fastest_win.title, 40, y); y += 16;
    y = paragraph(doc, data.fastest_win.action, y);
    if ((data.fastest_win.expected_benefits || []).length) {
      y = paragraph(doc, `Expected benefits: ${data.fastest_win.expected_benefits.join(', ')}.`, y, { color: MUTED, size: 9 });
    }
    if (data.fastest_win.closes_pct_of_weekly_gap > 0) {
      y = paragraph(doc, `This single change closes approximately ${data.fastest_win.closes_pct_of_weekly_gap}% of your weekly protein gap.`, y, { color: MUTED, size: 9 });
    }
    y += 8;
  }

  // 3. Muscle preservation & performance capacity
  const mp = data.muscle_preservation;
  if (mp) {
    y = ensureSpace(doc, y, 160);
    y = sectionTitle(doc, L(lang, '5 · Muscle preservation & performance capacity'), y);
    y = paragraph(doc,
      `Current protein: ${mp.current_protein_g ?? '—'} g/day\n` +
      `Recommended protein: ${mp.recommended_protein_g ?? '—'} g/day\n` +
      `Status: ${mp.status}`, y);
    y += 4;
    y = scoreRow(doc, 'Muscle preservation score', mp.score ?? 0, y);
    if ((mp.reasons || []).length) {
      y += 4;
      y = paragraph(doc, 'Why this score:', y);
      mp.reasons.forEach((r: string) => { y = ensureSpace(doc, y, 14); y = paragraph(doc, `• ${r}`, y, { color: MUTED, size: 9 }); });
    }
    if (mp.note) { y += 4; y = paragraph(doc, mp.note, y, { color: MUTED, size: 9 }); }
    y += 6;
  }

  // 5b. Top meals from your week (moved up — what helped / what hurt)
  const tmEarly = data.top_meals;
  if (tmEarly && (tmEarly.strongest || tmEarly.weakest)) {
    y = ensureSpace(doc, y, 180);
    y = sectionTitle(doc, L(lang, 'Top meals from your week'), y);
    const drawMeal = (label: string, color: string, m: any, reasonsKey: string) => {
      if (!m || !m.meal) return;
      y = ensureSpace(doc, y, 90);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(color);
      doc.text(label, 40, y);
      if (typeof m.score === 'number') {
        doc.setTextColor(NAVY);
        doc.text(`${m.score}/100`, 500, y);
      }
      y += 14;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(INK);
      y = paragraph(doc, m.meal, y, { color: INK });
      (m[reasonsKey] || []).forEach((r: string) => {
        y = ensureSpace(doc, y, 14);
        y = paragraph(doc, `• ${r}`, y, { color: MUTED, size: 9 });
      });
      y += 6;
    };
    drawMeal('Strongest meal', '#2d8a5e', tmEarly.strongest, 'why_it_works');
    drawMeal('Weakest meal', '#c2553a', tmEarly.weakest, 'why_it_hurts');
  }

  // 5c. Protein Opportunity Analysis (meal × actual / target / gap)
  const po = data.protein_opportunity;
  if (po && Array.isArray(po.meals)) {
    y = ensureSpace(doc, y, 180);
    y = sectionTitle(doc, L(lang, 'Protein opportunity — where your protein is missing'), y);
    y = paragraph(doc, 'Meal-by-meal view of how much protein you ate vs. a practical target.', y, { color: MUTED, size: 9 });
    y += 4;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(NAVY);
    doc.text(L(lang, 'Meal'), 40, y);
    doc.text(L(lang, 'Actual'), 240, y);
    doc.text(L(lang, 'Target'), 340, y);
    doc.text(L(lang, 'Gap'), 460, y);
    y += 6;
    doc.setDrawColor('#dddddd'); doc.line(40, y, 555, y); y += 10;
    po.meals.forEach((m: any) => {
      y = ensureSpace(doc, y, 18);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(INK);
      doc.text(String(m.meal), 40, y);
      doc.text(m.actual_g == null ? '—' : `${m.actual_g} g`, 240, y);
      doc.text(`${m.target_g} g`, 340, y);
      if (m.gap_g != null && m.gap_g > 0) {
        doc.setTextColor('#c2553a'); doc.setFont('helvetica', 'bold');
        doc.text(`-${m.gap_g} g`, 460, y);
      } else if (m.gap_g === 0) {
        doc.setTextColor('#2d8a5e'); doc.setFont('helvetica', 'bold');
        doc.text(L(lang, 'on target'), 460, y);
      } else {
        doc.setTextColor(MUTED);
        doc.text('—', 460, y);
      }
      y += 16;
    });
    y += 4;
    doc.setDrawColor('#dddddd'); doc.line(40, y, 555, y); y += 10;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
    doc.text(`Total daily gap: ${po.total_gap_g} g protein`, 40, y);
    y += 16;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(MUTED);
    y = paragraph(doc, 'Closing the largest single gap is your fastest body-composition lever.', y, { color: MUTED, size: 9 });
    y += 6;
  }

  // 4. Nutrition strategy
  const ps = data.protein_strategy;
  if (ps) {
    y = ensureSpace(doc, y, 180);
    y = sectionTitle(doc, `6 · High-performance nutrition strategy (${ps.diet_type})`, y);
    y = paragraph(doc, 'Best protein sources:', y);
    (ps.best_sources || []).forEach((src: string) => { y = ensureSpace(doc, y, 14); y = paragraph(doc, `• ${src}`, y); });
    y += 4;
    if (ps.distribution) {
      y = paragraph(doc, `Distribution status: ${ps.distribution.status}`, y, { color: MUTED, size: 9 });
      if (ps.distribution.score != null) {
        y += 2;
        y = scoreRow(doc, 'Protein distribution score', ps.distribution.score, y);
      }
      if (ps.distribution.meals) {
        ps.distribution.meals.forEach((m: any) => {
          y = ensureSpace(doc, y, 14);
          y = paragraph(doc, `   ${m.meal}: ${m.protein_g ?? '—'} g  (target 30–40 g per main meal)`, y, { color: MUTED, size: 9 });
        });
      }
      y += 4;
    }
    if ((ps.thirty_gram_options || []).length) {
      y = ensureSpace(doc, y, 80);
      y = paragraph(doc, 'To add 30 g of protein — choose ONE:', y);
      ps.thirty_gram_options.forEach((opt: string) => { y = ensureSpace(doc, y, 14); y = paragraph(doc, `✓ ${opt}`, y); });
      y += 4;
    }
    if (ps.vegetarian_alternatives) {
      y = ensureSpace(doc, y, 60);
      y = paragraph(doc, 'Vegetarian alternatives:', y, { color: MUTED, size: 9 });
      y = paragraph(doc, ps.vegetarian_alternatives.join(', '), y, { color: MUTED, size: 9 });
      y += 6;
    }
  }

  // 7. Daily meal framework — personalised when replacements are present
  const mf = data.daily_meal_framework;
  const mfr: Array<{ slot: string; current: string; upgrade: string }> = Array.isArray(data.meal_framework_replacements) ? data.meal_framework_replacements : [];
  if (mfr.length) {
    y = ensureSpace(doc, y, 60 + mfr.length * 48);
    y = sectionTitle(doc, L(lang, '7 · Personalised meal framework — based on your diary'), y);
    y = paragraph(doc, 'Replacements for the meals already in your week — not a generic plan.', y, { color: MUTED, size: 9 });
    y += 4;
    mfr.forEach((m) => {
      y = ensureSpace(doc, y, 48);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(NAVY);
      doc.text(m.slot, 40, y); y += 14;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(MUTED);
      y = paragraph(doc, `Current: ${m.current}`, y, { color: MUTED });
      y = paragraph(doc, `Upgrade: ${m.upgrade}`, y, { color: '#2d8a5e' });
      y += 4;
    });
  } else if (mf) {
    y = ensureSpace(doc, y, 160);
    y = sectionTitle(doc, `7 · Daily meal framework (~${mf.total_protein_g} g protein)`, y);
    (mf.meals || []).forEach((m: any) => {
      y = ensureSpace(doc, y, 36);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(NAVY);
      doc.text(`${m.meal} — ${m.protein_g} g protein`, 40, y);
      y += 14;
      y = paragraph(doc, m.example, y, { color: MUTED });
      y += 4;
    });
  }

  // 6. Recovery & metabolic efficiency
  const ms = data.metabolic_support;
  if (ms) {
    y = ensureSpace(doc, y, 100);
    y = sectionTitle(doc, L(lang, '8 · Recovery & metabolic efficiency'), y);
    y = scoreRow(doc, 'Metabolic support score', ms.score ?? 0, y);
    if ((ms.biggest_opportunities || []).length) {
      y += 4;
      y = paragraph(doc, 'Biggest opportunities:', y);
      ms.biggest_opportunities.forEach((o: string) => {
        y = ensureSpace(doc, y, 14);
        y = paragraph(doc, `• ${o}`, y);
      });
    }
    y += 6;
  }

  // 7. Resistance training
  const rt = data.resistance_training;
  if (rt) {
    y = ensureSpace(doc, y, 120);
    y = sectionTitle(doc, L(lang, '9 · Resistance training recommendation'), y);
    y = paragraph(doc,
      `Age: ${rt.age}    Goal: ${rt.goal}\n` +
      `• ${rt.strength_sessions_per_week} resistance sessions per week\n` +
      `• ${rt.cardio_sessions_per_week} cardio sessions per week\n` +
      `• ${rt.mobility_minutes_per_day} minutes of daily mobility work`, y);
    if (rt.reason) { y += 4; y = paragraph(doc, rt.reason, y, { color: MUTED, size: 9 }); }
    y += 6;
  }

  // 8. Recovery & lifestyle factors (alcohol, coffee, walking) + biological age impact
  const lf = data.lifestyle_factors;
  const bai = data.biological_age_impact;
  if ((lf && (lf.alcohol || lf.coffee || lf.walking)) || bai) {
    y = ensureSpace(doc, y, 160);
    y = sectionTitle(doc, L(lang, '10 · Recovery & lifestyle factors'), y);
    if (lf?.alcohol) {
      y = ensureSpace(doc, y, 36);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(NAVY);
      doc.text(`Alcohol — ${lf.alcohol.units_per_week} unit${lf.alcohol.units_per_week === 1 ? '' : 's'}/week`, 40, y);
      y += 14;
      y = paragraph(doc, lf.alcohol.status, y, { color: MUTED });
      y += 4;
    }
    if (lf?.coffee) {
      y = ensureSpace(doc, y, 36);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(NAVY);
      doc.text(`Coffee — ${lf.coffee.cups_per_day} cup${lf.coffee.cups_per_day === 1 ? '' : 's'}/day`, 40, y);
      y += 14;
      y = paragraph(doc, lf.coffee.status, y, { color: MUTED });
      y += 4;
    }
    if (lf?.walking) {
      y = ensureSpace(doc, y, 36);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(NAVY);
      doc.text(`Walking — ${lf.walking.minutes_per_day} min/day`, 40, y);
      y += 14;
      y = paragraph(doc, lf.walking.status, y, { color: MUTED });
      y += 6;
    }
    if (bai) {
      if ((bai.positive || []).length) {
        y = ensureSpace(doc, y, 40);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor('#2d8a5e');
        doc.text(L(lang, 'Strengths'), 40, y); y += 14;
        bai.positive.forEach((p: string) => { y = ensureSpace(doc, y, 14); y = paragraph(doc, `+ ${p}`, y, { color: '#2d8a5e' }); });
        y += 4;
      }
      if ((bai.needs_improvement || []).length) {
        y = ensureSpace(doc, y, 40);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(GOLD);
        doc.text(L(lang, 'Needs improvement'), 40, y); y += 14;
        bai.needs_improvement.forEach((p: string) => { y = ensureSpace(doc, y, 14); y = paragraph(doc, `! ${p}`, y, { color: '#a8801a' }); });
        y += 4;
      }
    }
  }

  // 9. Expected progress
  const proj = data.weight_loss_projection;
  if (proj) {
    y = ensureSpace(doc, y, 120);
    y = sectionTitle(doc, L(lang, '11 · Expected progress'), y);
    y = paragraph(doc, proj.assumes, y, { color: MUTED, size: 9 });
    y += 4;
    y = paragraph(doc,
      `• Improved satiety within ${proj.satiety_within_days} days\n` +
      `• Visible body composition changes within ${proj.visible_change_weeks} weeks\n` +
      `• Potential weight reduction of ${proj.weekly_kg_low}–${proj.weekly_kg_high} kg per week (≈ ${proj.monthly_kg_low}–${proj.monthly_kg_high} kg per month)`, y);
    y += 4;
    y = paragraph(doc, proj.note, y, { color: MUTED, size: 9 });
    y += 6;
  }

  // 10. How your nutrition is affecting your results (renamed; no Fastest-win restatement)
  const epi = data.executive_performance_impact;
  if (epi && (epi.current_likely_influences || []).length) {
    y = ensureSpace(doc, y, 120);
    y = sectionTitle(doc, L(lang, '12 · How your nutrition is affecting your results'), y);
    y = paragraph(doc, 'Right now, your nutrition pattern most likely shapes:', y);
    epi.current_likely_influences.forEach((p: string) => {
      y = ensureSpace(doc, y, 14);
      y = paragraph(doc, `- ${p}`, y);
    });
    y += 6;
  }

  // 11. Long-term outlook
  const lto = data.long_term_outlook;
  if (lto) {
    y = ensureSpace(doc, y, 130);
    y = sectionTitle(doc, L(lang, '13 · Long-term outlook'), y);
    y = paragraph(doc, 'Current trajectory:', y);
    y = paragraph(doc, `• Muscle preservation risk: ${lto.muscle_preservation_risk}`, y);
    y = paragraph(doc, `• Recovery Support Score: ${lto.recovery_capacity}`, y);
    y = paragraph(doc, `• Fat-loss potential: ${lto.fat_loss_potential}`, y);
    y = paragraph(doc, `• Longevity support: ${lto.longevity_support}`, y);
    y += 4;
    if (lto.most_impactful_improvement) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
      doc.text(L(lang, 'Most impactful improvement:'), 40, y); y += 14;
      y = paragraph(doc, lto.most_impactful_improvement, y, { color: MUTED });
    }
    y += 6;
  }

  // 12. Three highest-impact improvements (RED — highest priority)
  if ((data.improvement_priorities || []).length) {
    y = ensureSpace(doc, y, 130);
    y = sectionTitle(doc, L(lang, '14 · Highest-priority improvements'), y);
    data.improvement_priorities.forEach((p: any, i: number) => {
      y = ensureSpace(doc, y, 50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor('#c2553a');
      doc.text(`${i + 1}. ${p.title}`, 40, y);
      y += 14;
      y = paragraph(doc, p.detail, y, { color: MUTED });
      y += 4;
    });
  }

  // 13. Isabella's weekly action plan (+ 7-day plan)
  const wap = data.weekly_action_plan;
  if (wap) {
    y = ensureSpace(doc, y, 160);
    y = sectionTitle(doc, L(lang, "15 · Isabella's weekly action plan"), y);
    y = paragraph(doc, 'Your priority focus this week:', y);
    (wap.priorities || []).forEach((p: string) => {
      y = ensureSpace(doc, y, 16);
      y = paragraph(doc, `☐ ${p}`, y);
    });
    y += 6;
    y = paragraph(doc, 'Expected benefits:', y);
    (wap.expected_benefits || []).forEach((b: string) => {
      y = ensureSpace(doc, y, 14);
      y = paragraph(doc, `• ${b}`, y);
    });
    y += 4;
  }

  if ((data.seven_day_plan || []).length) {
    y = ensureSpace(doc, y, 180);
    y = sectionTitle(doc, L(lang, '7-day upgrade plan'), y);
    data.seven_day_plan.forEach((line: string) => {
      y = ensureSpace(doc, y, 18);
      y = paragraph(doc, `• ${line}`, y);
    });
  }

  // 16. Upgrade the meals you already eat (foods you currently consume)
  const upgrades = Array.isArray(data.habit_upgrades) ? data.habit_upgrades : [];
  if (upgrades.length) {
    y = ensureSpace(doc, y, 60 + upgrades.length * 50);
    y = sectionTitle(doc, L(lang, '16 · Upgrade the meals you already eat'), y);
    y = paragraph(doc, "Each upgrade is anchored to a meal already in your week — small changes, not new routines.", y, { color: MUTED, size: 9 });
    y += 4;
    upgrades.forEach((u: any, i: number) => {
      y = ensureSpace(doc, y, 50);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(NAVY);
      doc.text(`${i + 1}. ${u.existing_meal}`, 40, y); y += 14;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor('#2d8a5e');
      y = paragraph(doc, `+ ${u.upgrade}`, y, { color: '#2d8a5e' });
      if (u.why) y = paragraph(doc, u.why, y, { color: MUTED, size: 9 });
      y += 4;
    });
  }

  // 17. Nutrition risk flags (observational micronutrient flags)
  const flags = Array.isArray(data.nutrition_risk_flags) ? data.nutrition_risk_flags : [];
  if (flags.length) {
    y = ensureSpace(doc, y, 60 + flags.length * 28);
    y = sectionTitle(doc, L(lang, '17 · Nutrition risk flags (observational)'), y);
    y = paragraph(doc, "Observations from your diary — not a diagnosis. Confirm with a clinician if relevant.", y, { color: MUTED, size: 9 });
    y += 4;
    flags.forEach((f: any) => {
      y = ensureSpace(doc, y, 28);
      const conf = String(f.confidence || 'low').toLowerCase();
      const color = conf === 'high' ? '#c2553a' : conf === 'moderate' ? GOLD : MUTED;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(color);
      doc.text(`${f.nutrient}  [${conf}]`, 40, y); y += 12;
      if (f.reasoning) y = paragraph(doc, f.reasoning, y, { color: MUTED, size: 9 });
      y += 4;
    });
  }

  // (Top meals moved earlier — section 5b)

  // 17b. Dominant Nutrition Patterns (practitioner-style pattern read)
  const patterns = Array.isArray(data.dominant_nutrition_patterns) ? data.dominant_nutrition_patterns : [];
  if (patterns.length) {
    y = ensureSpace(doc, y, 50 + patterns.length * 40);
    y = sectionTitle(doc, L(lang, 'Dominant nutrition patterns'), y);
    y = paragraph(doc, "How a practitioner would read your week — not nutrients in isolation, but the patterns they form.", y, { color: MUTED, size: 9 });
    y += 4;
    patterns.forEach((p: any, i: number) => {
      y = ensureSpace(doc, y, 40);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(NAVY);
      doc.text(`Pattern ${i + 1}: ${p.pattern}`, 40, y); y += 14;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(GOLD);
      doc.text(L(lang, 'Impact:'), 40, y);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(INK);
      const impactLines = doc.splitTextToSize(p.impact, 480);
      doc.text(impactLines, 80, y); y += 14 + (impactLines.length - 1) * 11;
      y += 4;
    });
    y += 6;
  }

  // 18. Isabella's Clinical Observation
  if (data.clinical_perspective) {
    y = ensureSpace(doc, y, 110);
    y = sectionTitle(doc, L(lang, "18 · Isabella's Clinical Observation"), y);
    doc.setFillColor('#f4f1ea');
    doc.setDrawColor(GOLD);
    doc.setLineWidth(0.5);
    doc.rect(40, y - 12, 515, 64, 'FD');
    const lines = doc.splitTextToSize(data.clinical_perspective, 495);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(NAVY);
    doc.text(lines, 50, y + 2);
    y += 76;
  }

  // 20. Reassess in 14 days (retention hook) + success preview
  const rp = data.reassessment_projection;
  const sp = data.success_preview;
  if (rp || sp) {
    y = ensureSpace(doc, y, 220);
    y = sectionTitle(doc, `19 · Reassess in ${rp?.reassess_in_days ?? 14} days`, y);
    if (rp) {
      y = paragraph(doc, 'If you:', y);
      (rp.if_you || []).forEach((it: string) => {
        y = ensureSpace(doc, y, 14);
        y = paragraph(doc, `+ ${it}`, y, { color: '#2d8a5e' });
      });
      y += 4;
      y = paragraph(doc, 'You could expect:', y);
      (rp.expected_changes || []).forEach((c: any) => {
        y = ensureSpace(doc, y, 16);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
        doc.text(`${c.metric}`, 40, y);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(INK);
        doc.text(`${c.from}  ->  ${c.to}`, 300, y);
        y += 14;
      });
      y += 4;
      y = paragraph(doc, rp.note, y, { color: MUTED, size: 9 });
      y += 6;
    }
    if (sp) {
      y = ensureSpace(doc, y, 140);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(NAVY);
      doc.text(L(lang, 'What success looks like in 14 days'), 40, y); y += 16;
      y = paragraph(doc, 'If you complete:', y);
      (sp.if_completed || []).forEach((line: string) => {
        y = ensureSpace(doc, y, 14);
        y = paragraph(doc, `+ ${line}`, y, { color: '#2d8a5e' });
      });
      y += 4;
      y = paragraph(doc, 'You should notice:', y);
      (sp.you_should_notice || []).forEach((line: string) => {
        y = ensureSpace(doc, y, 14);
        y = paragraph(doc, `- ${line}`, y, { color: INK });
      });
    }
  }

  // 19b. Baseline vs Tracked Progress (free vs Pro framing)
  y = ensureSpace(doc, y, 150);
  y = sectionTitle(doc, L(lang, 'Your baseline today — vs your tracked progress'), y);
  doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.setTextColor(MUTED);
  y = paragraph(doc,
    'This report is a free one-time baseline snapshot. The numbers below are illustrative of what monthly tracking reveals — they are not your projected scores.',
    y, { color: MUTED, size: 9 }
  );
  y += 4;
  const overall = Number(data?.scores?.overall_nutrition ?? 0) || 67;
  const proteinNow = Number(data?.scores?.protein_adequacy ?? 0) || 54;
  const musclePres = Number(data?.scores?.muscle_preservation ?? 0) || 58;
  const rows = [
    ['Metric',                'Today (baseline)',  'Month 2 (tracked)',  'Month 6 (tracked)'],
    ['Overall Nutrition',     `${overall}`,        `${Math.min(99, overall + 7)}`,  `${Math.min(99, overall + 15)}`],
    ['Protein Adequacy',      `${proteinNow}`,     `${Math.min(99, proteinNow + 12)}`, `${Math.min(99, proteinNow + 22)}`],
    ['Muscle Preservation',   `${musclePres}`,     `${Math.min(99, musclePres + 9)}`,  `${Math.min(99, musclePres + 18)}`],
  ];
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
  const colsX = [50, 220, 340, 460];
  rows.forEach((r, i) => {
    y = ensureSpace(doc, y, 16);
    if (i === 0) { doc.setFont('helvetica', 'bold'); doc.setTextColor(NAVY); }
    else { doc.setFont('helvetica', 'normal'); doc.setTextColor(INK); }
    r.forEach((cell, ci) => doc.text(cell, colsX[ci], y));
    y += 14;
    if (i === 0) { doc.setDrawColor('#dcd2b0'); doc.line(50, y - 10, 540, y - 10); }
  });
  y += 4;
  doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.setTextColor(MUTED);
  y = paragraph(doc,
    'Tracked progress columns reflect typical 60–180 day movement when reassessments are performed monthly against a stable baseline at WellneSpirit. Without tracking, score drift cannot be measured reliably.',
    y, { color: MUTED, size: 9 }
  );
  y += 8;

  // 20. WellneSpirit — continue your progress (always last)
  y = ensureSpace(doc, y, 140);
  y = sectionTitle(doc, L(lang, '20 · Continue your progress with WellneSpirit'), y);
  doc.setFillColor('#f7f3e6');
  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.5);
  doc.rect(40, y - 12, 515, 104, 'FD');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(NAVY);
  doc.text(L(lang, 'Free baseline today · Tracked progress with Pro.'), 50, y + 2);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(INK);
  const wsLines = doc.splitTextToSize(
    "This free report is a one-time baseline. For monthly reassessments, score-vs-score comparisons against this baseline (Month 1 → Month 2 → Month 6), and ongoing executive-wellness support from Isabella with full progress tracking, register for the monthly programme at our clinical partner WellneSpirit.",
    495
  );
  doc.text(wsLines, 50, y + 20);
  doc.setFont('helvetica', 'bold'); doc.setTextColor(GOLD);
  doc.text('wellnespirit.com', 50, y + 84);
  y += 112;
}


// ── Recovery & Resilience report ────────────────────────────────────────
function buildRecoveryResilience(doc: jsPDF, data: any, lang: AssessmentLang = DEFAULT_LANG) {
  header(doc, tr(lang, 'recovery_title'), lang);
  let y = 110;

  const sc = data.scores || {};

  // 1. Executive summary
  if (data.executive_summary) {
    y = sectionTitle(doc, L(lang, '1 · Executive summary'), y);
    y = paragraph(doc, data.executive_summary, y);
    y += 8;
  }

  // 2. Headline scores (simplified to the 4 core signals)
  y = ensureSpace(doc, y, 180);
  y = sectionTitle(doc, L(lang, '2 · Core scores'), y);
  y = scoreRow(doc, 'Recovery capacity', sc.recovery_capacity ?? 0, y);
  y = scoreRow(doc, 'Stress load (higher = heavier)', sc.stress_load ?? 0, y);
  y = scoreRow(doc, 'Resilience', sc.resilience ?? 0, y);
  y = scoreRow(doc, 'Burnout risk score (lower = better)', sc.burnout_risk_score ?? 0, y);
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(NAVY);
  doc.text(L(lang, 'Burnout risk indicator:'), 40, y);
  const riskColor = sc.burnout_risk === 'Elevated' ? '#c2553a' : sc.burnout_risk === 'Moderate' ? GOLD : '#2d8a5e';
  doc.setTextColor(riskColor);
  doc.text(String(sc.burnout_risk ?? '—'), 220, y);
  doc.setTextColor(INK);
  y += 18;
  y = scoreRow(doc, 'OVERALL EXECUTIVE WELLNESS', sc.executive_wellness ?? 0, y);
  y += 4;
  y = paragraph(doc, 'Lifestyle recovery and the executive performance factors below feed into these core scores. The lowest score is your highest-leverage area.', y, { color: MUTED, size: 9 });
  y += 6;

  // 2b. Recovery Stage zone
  if (data.recovery_stage) {
    const rs = data.recovery_stage;
    y = ensureSpace(doc, y, 110);
    y = sectionTitle(doc, L(lang, '2b · Your recovery stage'), y);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(GOLD);
    doc.text(`${rs.zone} (${rs.range})`, 40, y); y += 16;
    y = paragraph(doc, rs.summary, y);
    y += 8;
  }

  // 2c. Recovery Archetype
  if (data.recovery_archetype) {
    const a = data.recovery_archetype;
    y = ensureSpace(doc, y, 180);
    y = sectionTitle(doc, L(lang, '2c · Your Isabella recovery archetype'), y);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(NAVY);
    doc.text(a.name, 40, y); y += 16;
    if (Array.isArray(a.characteristics)) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
      doc.text(L(lang, 'Characteristics:'), 40, y); y += 13;
      a.characteristics.forEach((c: string) => {
        y = ensureSpace(doc, y, 14);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(INK);
        doc.text(`- ${c}`, 50, y); y += 12;
      });
      y += 4;
    }
    if (a.typical_risk) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
      doc.text(L(lang, 'Typical risk:'), 40, y); y += 12;
      y = paragraph(doc, a.typical_risk, y, { color: MUTED });
    }
    if (a.primary_focus) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
      doc.text(L(lang, 'Primary focus:'), 40, y); y += 12;
      y = paragraph(doc, a.primary_focus, y, { color: MUTED });
    }
    y += 6;
  }

  // 3. Burnout note (never a diagnosis)
  if (data.burnout_note) {
    y = ensureSpace(doc, y, 90);
    y = sectionTitle(doc, L(lang, '3 · Burnout risk indicators'), y);
    y = paragraph(doc, data.burnout_note, y, { color: MUTED });
    y += 6;
  }


  // 3b. Isabella's clinical observation
  if (data.isabella_observation) {
    y = ensureSpace(doc, y, 110);
    y = sectionTitle(doc, L(lang, "3b · What Isabella noticed"), y);
    y = paragraph(doc, data.isabella_observation, y);
    y += 6;
  }

  // 3c. Dominant recovery patterns
  if (Array.isArray(data.dominant_patterns) && data.dominant_patterns.length) {
    y = ensureSpace(doc, y, 140);
    y = sectionTitle(doc, L(lang, '3c · Dominant recovery patterns'), y);
    data.dominant_patterns.forEach((p: any) => {
      y = ensureSpace(doc, y, 46);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
      doc.text(`- ${p.pattern}`, 40, y); y += 12;
      y = paragraph(doc, `Impact: ${p.impact}`, y, { color: MUTED });
      y += 4;
    });
    y += 4;
  }

  // 3d. Executive dashboard
  if (data.executive_dashboard) {
    const ed = data.executive_dashboard;
    y = ensureSpace(doc, y, 200);
    y = sectionTitle(doc, L(lang, '3d · Executive dashboard — your 14-day leverage'), y);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(NAVY);
    doc.text(L(lang, 'Biggest opportunities (ranked by leverage):'), 40, y); y += 16;
    (ed.biggest_opportunities || []).forEach((o: any, i: number) => {
      y = ensureSpace(doc, y, 36);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
      doc.text(`${i + 1}. ${o.area} (${o.current_score}/100)`, 40, y); y += 12;
      y = paragraph(doc, o.action, y, { color: MUTED });
      y += 4;
    });
    y += 6;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
    doc.text(L(lang, 'Expected 14-day gains:'), 40, y); y += 14;
    const g = ed.expected_14_day_gains || {};
    const rows: Array<[string, any]> = [
      ['Recovery capacity', g.recovery_capacity],
      ['Resilience', g.resilience],
      ['Stress load (lower = better)', g.stress_load],
      ['Executive wellness', g.executive_wellness],
    ];
    rows.forEach(([label, v]) => {
      if (!v) return;
      y = ensureSpace(doc, y, 14);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(INK);
      doc.text(`${label}: ${v.current} -> ${v.projected}`, 50, y); y += 12;
    });
    y += 8;
  }

  // 3e. Recovery drivers (drains vs protectors)
  if (data.recovery_drivers) {
    const rd = data.recovery_drivers;
    y = ensureSpace(doc, y, 180);
    y = sectionTitle(doc, L(lang, '3e · Your recovery drivers'), y);

    if (Array.isArray(rd.drains) && rd.drains.length) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor('#c2553a');
      doc.text(L(lang, 'Biggest recovery drains:'), 40, y); y += 14;
      rd.drains.forEach((d: any, i: number) => {
        y = ensureSpace(doc, y, 40);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
        doc.text(`${i + 1}. ${d.area}  (score impact ${d.score_impact})`, 40, y); y += 12;
        y = paragraph(doc, d.detail, y, { color: MUTED });
        y += 4;
      });
      y += 4;
    }

    if (Array.isArray(rd.protectors) && rd.protectors.length) {
      y = ensureSpace(doc, y, 80);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor('#2d8a5e');
      doc.text(L(lang, 'Biggest recovery protectors:'), 40, y); y += 14;
      rd.protectors.forEach((p: any, i: number) => {
        y = ensureSpace(doc, y, 40);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
        doc.text(`${i + 1}. ${p.area}  (score impact +${p.score_impact})`, 40, y); y += 12;
        y = paragraph(doc, p.detail, y, { color: MUTED });
        y += 4;
      });
      y += 6;
    }
  }




  // 4. Executive performance factors
  const fb = data.factor_breakdown || {};
  const factors: Array<[string, number | undefined]> = [
    ['Sleep duration', fb.sleep_duration],
    ['Sleep quality', fb.sleep_quality],
    ['Movement', fb.movement],
    ['Exercise quality', fb.exercise_quality],
    ['Recovery days', fb.recovery_days],
    ['Outdoor exposure', fb.outdoor_exposure],
    ['Workload intensity', fb.workload_intensity],
    ['Meeting & travel load', fb.meeting_travel_load],
    ['Stress regulation', fb.stress_regulation],
    ['Social support', fb.social_support],
    ['Work–life balance', fb.work_life_balance],
    ['Energy level', fb.energy_level],
    ['Motivation level', fb.motivation_level],
    ['Hydration / alcohol / caffeine', fb.hydration_alcohol_caffeine],
  ];
  y = ensureSpace(doc, y, 200);
  y = sectionTitle(doc, L(lang, '4 · Executive performance factors'), y);
  for (const [label, val] of factors) {
    if (typeof val === 'number') {
      y = ensureSpace(doc, y, 24);
      y = scoreRow(doc, label, val, y);
    }
  }
  y += 6;

  // 5. Fastest wins
  if (Array.isArray(data.fastest_wins) && data.fastest_wins.length) {
    y = ensureSpace(doc, y, 130);
    y = sectionTitle(doc, L(lang, '5 · Fastest wins'), y);
    data.fastest_wins.forEach((w: any, i: number) => {
      y = ensureSpace(doc, y, 50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(NAVY);
      doc.text(`${i + 1}. ${w.area}`, 40, y);
      y += 14;
      y = paragraph(doc, w.action, y, { color: MUTED });
      y += 4;
    });
  }

  // 5b. Nutrition × Recovery integration (only when nutrition scores shared)
  if (data.nutrition_integration) {
    const ni = data.nutrition_integration;
    y = ensureSpace(doc, y, 180);
    y = sectionTitle(doc, L(lang, '5b · Nutrition × Recovery — combined view'), y);
    const ns = ni.nutrition_scores || {};
    const rowsN: Array<[string, any]> = [
      ['Protein', ns.protein],
      ['Hydration', ns.hydration],
      ['Recovery fuel', ns.recovery_fuel],
      ['Muscle preservation', ns.muscle_preservation],
    ];
    rowsN.forEach(([label, v]) => {
      if (typeof v !== 'number') return;
      y = ensureSpace(doc, y, 22);
      y = scoreRow(doc, label, v, y);
    });
    y += 4;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(GOLD);
    doc.text(`Combined Resilience Score: ${ni.combined_resilience_score}/100`, 40, y); y += 16;
    doc.setTextColor(INK);
    if (ni.interpretation) y = paragraph(doc, ni.interpretation, y);
    if (ni.note) y = paragraph(doc, ni.note, y, { color: MUTED, size: 9 });
    y += 6;
  }

  // 5c. Trajectory — "If Nothing Changes" vs "If Recommendations Followed"
  if (data.trajectory) {
    const t = data.trajectory;
    y = ensureSpace(doc, y, 240);
    y = sectionTitle(doc, L(lang, '5c · Your two trajectories'), y);

    const renderTrajectory = (block: any, color: string) => {
      if (!block) return;
      y = ensureSpace(doc, y, 100);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(color);
      doc.text(block.headline, 40, y); y += 14;
      if (block.timeframe) y = paragraph(doc, block.timeframe, y, { color: MUTED });
      (block.outcomes || []).forEach((o: string) => {
        y = ensureSpace(doc, y, 16);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(INK);
        const lines = doc.splitTextToSize(`- ${o}`, 495);
        doc.text(lines, 50, y);
        y += lines.length * 12;
      });
      if (block.note) { y += 2; y = paragraph(doc, block.note, y, { color: MUTED, size: 9 }); }
      y += 6;
    };
    renderTrajectory(t.if_nothing_changes, '#c2553a');
    renderTrajectory(t.if_recommendations_followed, '#2d8a5e');
  }

  // 6. 7-day recovery plan
  if (Array.isArray(data.seven_day_plan) && data.seven_day_plan.length) {
    y = ensureSpace(doc, y, 180);
    y = sectionTitle(doc, L(lang, '6 · 7-day recovery plan'), y);
    data.seven_day_plan.forEach((d: any) => {
      y = ensureSpace(doc, y, 38);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(NAVY);
      doc.text(`${d.day} — ${d.focus}`, 40, y);
      y += 12;
      y = paragraph(doc, d.action, y, { color: MUTED, size: 10 });
      y += 4;
    });
  }


  // 6b. 30 / 60 / 90-day outlook
  if (data.outlook_30_60_90) {
    const o = data.outlook_30_60_90;
    y = ensureSpace(doc, y, 160);
    y = sectionTitle(doc, L(lang, '6b · 30 / 60 / 90-day outlook'), y);
    const horizons: Array<[string, string]> = [
      ['At 30 days', o.day_30],
      ['At 60 days', o.day_60],
      ['At 90 days', o.day_90],
    ];
    horizons.forEach(([label, text]) => {
      if (!text) return;
      y = ensureSpace(doc, y, 46);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
      doc.text(label, 40, y); y += 12;
      y = paragraph(doc, text, y, { color: MUTED });
      y += 4;
    });
  }

  // 6c. Executive Age Impact (educational estimate)
  if (data.executive_age_impact) {
    const ea = data.executive_age_impact;
    y = ensureSpace(doc, y, 130);
    y = sectionTitle(doc, L(lang, '6c · Executive recovery-age estimate'), y);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(NAVY);
    doc.text(`Chronological age: ${ea.chronological_age}`, 40, y); y += 14;
    doc.setTextColor(GOLD);
    doc.text(`Current recovery profile age: ${ea.current_profile_age}`, 40, y); y += 14;
    doc.setTextColor('#2d8a5e');
    doc.text(`Projected 90-day recovery profile age: ${ea.projected_profile_age_90d}`, 40, y); y += 16;
    doc.setTextColor(INK);
    if (ea.narrative) y = paragraph(doc, ea.narrative, y, { color: MUTED });
    y += 6;
  }

  // 7. Closing recommendation (WellneSpirit funnel — no €19 pitch)

  if (data.closing_recommendation) {
    y = ensureSpace(doc, y, 100);
    y = sectionTitle(doc, L(lang, '7 · Next step'), y);
    y = paragraph(doc, data.closing_recommendation, y);
  }
}

function installSanitizer(doc: jsPDF) {
  const anyDoc = doc as any;
  const toSafe = (t: any): any => {
    if (t == null) return '';
    if (typeof t === 'string') return sanitize(t);
    if (Array.isArray(t)) return t.map((x: any) => (x == null ? '' : typeof x === 'string' ? sanitize(x) : sanitize(String(x))));
    return sanitize(String(t));
  };
  const origText = anyDoc.text.bind(doc);
  anyDoc.text = (text: any, ...rest: any[]) => origText(toSafe(text), ...rest);
  const origSplit = anyDoc.splitTextToSize.bind(doc);
  anyDoc.splitTextToSize = (text: any, width: number, opts?: any) => {
    const safe = typeof text === 'string' ? sanitize(text) : (text == null ? '' : sanitize(String(text)));
    return origSplit(safe, width, opts);
  };
}

// ── Receptionist Cost & ROI report ──────────────────────────────────────
function fmtEUR(n: number | undefined | null): string {
  if (typeof n !== 'number' || !isFinite(n)) return '—';
  return `EUR ${Math.round(n).toLocaleString('en-US').replace(/,/g, ' ')}`;
}

function buildBusinessCalculator(doc: jsPDF, data: any, lang: AssessmentLang = DEFAULT_LANG) {
  header(doc, tr(lang, 'receptionist_title'), lang);
  let y = 110;

  // 1. Executive snapshot
  y = sectionTitle(doc, L(lang, '1 - Executive snapshot'), y);
  doc.setFillColor('#f7f3e6');
  doc.rect(40, y - 10, 515, 86, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(NAVY);
  doc.text(`${data.role_label || 'Front-desk role'} - ${data.country_label || data.country}`, 56, y + 8);
  doc.setFontSize(9); doc.setTextColor(MUTED);
  doc.text(`Shifts: ${data.inputs?.shifts || 'business'}  -  Languages: ${data.inputs?.languages || 1}  -  Premium skills: ${data.inputs?.premium_skills ? 'yes' : 'no'}`, 56, y + 24);
  // headline numbers
  const cmp = data.comparison || {};
  doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(NAVY);
  doc.text(fmtEUR(cmp.annual_savings), 56, y + 56);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(MUTED);
  doc.text(L(lang, 'Estimated annual savings vs human (mid)'), 56, y + 70);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(GOLD);
  doc.text(`${cmp.pct_savings ?? 0}%`, 300, y + 56);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(MUTED);
  doc.text(L(lang, 'Cost reduction vs full human TCO'), 300, y + 70);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(NAVY);
  doc.text(cmp.payback_months ? `${cmp.payback_months} mo` : '—', 460, y + 56);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(MUTED);
  doc.text(L(lang, 'Payback period'), 460, y + 70);
  y += 96;

  // 2. Archetype
  if (data.archetype) {
    y = ensureSpace(doc, y, 70);
    y = sectionTitle(doc, L(lang, '2 - Your archetype'), y);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(GOLD);
    doc.text(data.archetype.label, 40, y); y += 14;
    y = paragraph(doc, data.archetype.description, y);
    y += 6;
  }

  // 3. Annual cost breakdown
  y = ensureSpace(doc, y, 200);
  y = sectionTitle(doc, L(lang, '3 - True annual cost of a human (mid estimate)'), y);
  const totalEmp = data.annual_total_employer_cost_eur?.mid ?? 0;
  const gross = data.annual_gross_eur?.mid ?? 0;
  const onCost = totalEmp - gross;
  const hidden = data.hidden_costs_eur || {};
  const rows: Array<[string, number]> = [
    ['Gross salary (mid)', gross],
    [`Employer on-costs (x${data.employer_oncost_multiplier ?? 1.3})`, onCost],
    ['Recruitment (annualized)', hidden.recruitment_annualized ?? 0],
    ['Training & ramp-up loss', hidden.training_ramp ?? 0],
    ['Turnover risk', hidden.turnover_risk ?? 0],
    ['Sick-day cover', hidden.sick_day_cover ?? 0],
    ['Software & phone seat', hidden.software_and_phone ?? 0],
  ];
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(NAVY);
  doc.text(L(lang, 'Cost component'), 40, y); doc.text(L(lang, 'Amount per year'), 420, y); y += 6;
  doc.setDrawColor('#dddddd'); doc.line(40, y, 555, y); y += 10;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(INK);
  rows.forEach(([label, val]) => {
    y = ensureSpace(doc, y, 16);
    doc.text(label, 40, y);
    doc.text(fmtEUR(val), 420, y);
    y += 14;
  });
  doc.setDrawColor('#dddddd'); doc.line(40, y, 555, y); y += 14;
  doc.setFont('helvetica', 'bold'); doc.setTextColor(NAVY);
  doc.text(L(lang, 'True annual cost (mid)'), 40, y);
  doc.text(fmtEUR(data.true_annual_cost_eur?.mid), 420, y);
  y += 18;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(MUTED);
  doc.text(`Range across the band: ${fmtEUR(data.true_annual_cost_eur?.low)} - ${fmtEUR(data.true_annual_cost_eur?.high)}`, 40, y);
  y += 18;

  // 4. Coverage gap
  const cov = data.coverage || {};
  y = ensureSpace(doc, y, 110);
  y = sectionTitle(doc, L(lang, '4 - Coverage gap'), y);
  doc.setFillColor('#f5f5f5'); doc.rect(40, y - 10, 515, 80, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
  doc.text(L(lang, 'Human (single FTE)'), 56, y + 6);
  doc.text('Isabella', 320, y + 6);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(INK);
  doc.text(`${cov.human_productive_hours_per_year ?? 1760} productive hours / year`, 56, y + 24);
  doc.text(`${cov.human_languages ?? 1} language${(cov.human_languages ?? 1) > 1 ? 's' : ''}`, 56, y + 38);
  doc.text(`${cov.sick_days_per_year ?? 10} statutory sick days`, 56, y + 52);
  doc.setTextColor('#2d8a5e');
  doc.text(`${cov.isabella_hours_per_year ?? 8760} hours / year (24/7)`, 320, y + 24);
  doc.text(`${cov.isabella_languages ?? 30}+ languages built-in`, 320, y + 38);
  doc.text(`0 sick days, 0 turnover`, 320, y + 52);
  y += 90;
  doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.setTextColor(MUTED);
  y = paragraph(doc, `Effective coverage multiplier: ${cov.coverage_multiplier ?? 5}x more hours than a single human FTE.`, y, { color: MUTED, size: 9 });
  y += 6;

  // 5. Isabella vs Human side-by-side (annual)
  y = ensureSpace(doc, y, 110);
  y = sectionTitle(doc, L(lang, '5 - Annual cost: human vs Isabella'), y);
  const isabella = data.comparison?.isabella_recommended ?? 0;
  y = scoreRow(doc, `Human (true cost, mid)`, Math.min(100, Math.round((data.true_annual_cost_eur?.mid / Math.max(data.true_annual_cost_eur?.mid, 1)) * 100)), y);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(MUTED);
  doc.text(fmtEUR(data.true_annual_cost_eur?.mid), 40, y); y += 14;
  const ratio = data.true_annual_cost_eur?.mid > 0 ? Math.round((isabella / data.true_annual_cost_eur.mid) * 100) : 0;
  y = scoreRow(doc, `Isabella (${data.recommended_tier || 'pro'} tier)`, ratio, y);
  doc.text(fmtEUR(isabella), 40, y); y += 14;
  doc.setFont('helvetica', 'bold'); doc.setTextColor('#2d8a5e');
  doc.text(`Annual delta: ${fmtEUR(data.comparison?.annual_savings)} (${data.comparison?.pct_savings ?? 0}% reduction)`, 40, y);
  y += 18;

  // 6. 3-year / 5-year TCO
  y = ensureSpace(doc, y, 140);
  y = sectionTitle(doc, L(lang, '6 - Total cost of ownership (3 and 5 years)'), y);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(NAVY);
  doc.text(L(lang, 'Horizon'), 40, y); doc.text(L(lang, 'Human (mid)'), 200, y); doc.text(L(lang, 'Isabella'), 340, y); doc.text(L(lang, 'Savings'), 470, y);
  y += 6; doc.setDrawColor('#dddddd'); doc.line(40, y, 555, y); y += 12;
  const tco3 = data.tco_3yr_eur || {}; const tco5 = data.tco_5yr_eur || {};
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(INK);
  doc.text(L(lang, '3 years'), 40, y); doc.text(fmtEUR(tco3.human_mid), 200, y); doc.text(fmtEUR(tco3.isabella), 340, y);
  doc.setTextColor('#2d8a5e'); doc.text(fmtEUR(tco3.savings), 470, y); doc.setTextColor(INK); y += 16;
  doc.text(L(lang, '5 years'), 40, y); doc.text(fmtEUR(tco5.human_mid), 200, y); doc.text(fmtEUR(tco5.isabella), 340, y);
  doc.setTextColor('#2d8a5e'); doc.text(fmtEUR(tco5.savings), 470, y); doc.setTextColor(INK); y += 16;
  doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(MUTED);
  y = paragraph(doc, 'Assumes 3.5% annual salary inflation on the human side and flat Isabella pricing.', y + 4, { color: MUTED, size: 8 });
  y += 6;

  // 7. Front Office Efficiency Score
  const foe = data.front_office_efficiency;
  if (foe) {
    y = ensureSpace(doc, y, 150);
    y = sectionTitle(doc, L(lang, '7 - Front Office Efficiency Score'), y);
    doc.setFillColor('#f7f3e6'); doc.rect(40, y - 10, 515, 110, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(36); doc.setTextColor(NAVY);
    doc.text(`${foe.overall}`, 56, y + 40);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(MUTED);
    doc.text('/ 100', 110, y + 40);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(GOLD);
    doc.text(foe.band || '—', 56, y + 60);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(INK);
    const dr = foe.drivers || {};
    doc.text(`Coverage: ${dr.coverage ?? '-'}`, 200, y + 16);
    doc.text(`Cost efficiency: ${dr.cost_efficiency ?? '-'}`, 200, y + 32);
    doc.text(`Language support: ${dr.language_support ?? '-'}`, 200, y + 48);
    doc.text(`Scalability: ${dr.scalability ?? '-'}`, 200, y + 64);
    doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.setTextColor(MUTED);
    doc.text(foe.opportunity || '', 200, y + 84);
    y += 120;
  }

  // 8. Revenue Protected
  const rp = data.revenue_protected;
  if (rp) {
    y = ensureSpace(doc, y, 140);
    y = sectionTitle(doc, L(lang, '8 - Revenue protected (estimated)'), y);
    doc.setFillColor('#eef7ef'); doc.rect(40, y - 10, 515, 100, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor('#2d8a5e');
    doc.text(fmtEUR(rp.annual_revenue_at_risk_eur), 56, y + 30);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(MUTED);
    doc.text(L(lang, 'Annual revenue exposed to missed inbound at current capture rate'), 56, y + 46);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(INK);
    doc.text(`Missed inquiries / month: ${rp.missed_inquiries_per_month}`, 56, y + 68);
    doc.text(`Avg deal value: ${fmtEUR(rp.avg_deal_value_eur)}`, 240, y + 68);
    doc.text(`Conversion assumed: ${rp.conversion_pct_assumed}%`, 56, y + 84);
    doc.text(`Monthly inbound: ${rp.monthly_inbound_assumed}`, 240, y + 84);
    y += 110;
    if (!rp.user_provided_inputs) {
      doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(MUTED);
      y = paragraph(doc, 'Based on conservative industry defaults — share your real monthly inbound and average deal value for a sharper figure.', y, { color: MUTED, size: 8 });
    }
  }

  // 9. Industry Benchmark
  const ib = data.industry_benchmark;
  if (ib) {
    y = ensureSpace(doc, y, 130);
    y = sectionTitle(doc, L(lang, '9 - Industry benchmark'), y);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
    doc.text(ib.label, 40, y); y += 14;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(INK);
    const benchRow = (label: string, val: number, color: string) => {
      y = ensureSpace(doc, y, 18);
      doc.text(label, 40, y);
      const barW = 200; const fill = Math.max(2, (val / 100) * barW);
      doc.setFillColor('#eeeeee'); doc.rect(240, y - 8, barW, 8, 'F');
      doc.setFillColor(color); doc.rect(240, y - 8, fill, 8, 'F');
      doc.text(`${val}%`, 460, y);
      y += 16;
    };
    benchRow('Average property captures', ib.average_capture_pct, '#999999');
    benchRow('Top performers capture', ib.top_performer_capture_pct, '#2d8a5e');
    benchRow('Your estimated capture', ib.your_estimated_capture_pct, '#c0392b');
    doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.setTextColor(MUTED);
    y = paragraph(doc, `Gap to top performers: ${ib.gap_to_top_pct} points. Languages — you cover ${ib.your_languages} vs ${ib.languages_covered_avg} avg.`, y + 4, { color: MUTED, size: 9 });
    y += 6;
  }

  // 10. Operational Risk Flags
  const rf = data.risk_flags;
  if (rf) {
    y = ensureSpace(doc, y, 120);
    y = sectionTitle(doc, L(lang, '10 - Operational risk exposure'), y);
    const riskColor = (lvl: string) => lvl === 'High' ? '#c0392b' : lvl === 'Moderate' ? '#d68910' : '#2d8a5e';
    const riskRow = (label: string, lvl: string) => {
      y = ensureSpace(doc, y, 18);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(INK);
      doc.text(label, 40, y);
      doc.setFillColor(riskColor(lvl)); doc.rect(420, y - 9, 80, 12, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor('#ffffff');
      doc.text(lvl, 460, y - 1, { align: 'center' });
      doc.setTextColor(INK);
      y += 18;
    };
    riskRow('After-hours risk', rf.after_hours);
    riskRow('Language risk', rf.language);
    riskRow('Staff turnover risk', rf.staff_turnover);
    riskRow('Coverage risk', rf.coverage);
    y += 6;
  }

  // 11. Cost of Inaction
  const coi = data.cost_of_inaction;
  if (coi) {
    y = ensureSpace(doc, y, 160);
    y = sectionTitle(doc, L(lang, '11 - If you do nothing — 12-month cost of inaction'), y);
    doc.setFillColor('#fff4f2'); doc.rect(40, y - 10, 515, 130, 'F');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(INK);
    doc.text(L(lang, 'Hidden staffing cost'), 56, y + 8);    doc.text(fmtEUR(coi.hidden_staffing_cost_eur), 420, y + 8);
    doc.text(L(lang, 'Missed revenue (annual)'), 56, y + 26); doc.text(fmtEUR(coi.missed_revenue_eur), 420, y + 26);
    doc.text(L(lang, 'Turnover exposure'), 56, y + 44);     doc.text(fmtEUR(coi.turnover_exposure_eur), 420, y + 44);
    doc.setDrawColor('#dddddd'); doc.line(56, y + 56, 499, y + 56);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor('#c0392b');
    doc.text(L(lang, 'Total opportunity cost'), 56, y + 78);
    doc.text(fmtEUR(coi.total_opportunity_cost_eur), 420, y + 78);
    doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.setTextColor(MUTED);
    y = paragraph(doc, coi.narrative || '', y + 96, { color: MUTED, size: 9 });
    y += 6;
  }

  // 11b. Recommended staffing model (Human + Isabella, not pure replacement)
  const staff = data.staffing_recommendation;
  if (staff) {
    y = ensureSpace(doc, y, 160);
    y = sectionTitle(doc, L(lang, '12 - Recommended staffing model (Human + Isabella)'), y);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
    doc.text(L(lang, 'Today'), 40, y); y += 14;
    y = paragraph(doc, staff.current, y, { color: INK, size: 10 });
    y += 4;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
    doc.text(L(lang, 'Recommended'), 330, y);
    (staff.recommended || []).forEach((r: string) => { y = paragraph(doc, `- ${r}`, y); });
    y += 4;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor('#2d8a5e');
    doc.text('Expected outcome', 40, y); y += 14;
    (staff.expected_outcome || []).forEach((r: string) => { y = paragraph(doc, `- ${r}`, y); });
    y += 6;
  }

  // 12. Country context
  if (data.country_note) {
    y = ensureSpace(doc, y, 60);
    y = sectionTitle(doc, L(lang, '13 - Country context'), y);
    y = paragraph(doc, data.country_note, y);
    y += 6;
  }

  // 13. Recommendations
  if (Array.isArray(data.recommendations) && data.recommendations.length) {
    y = ensureSpace(doc, y, 40 + data.recommendations.length * 18);
    y = sectionTitle(doc, L(lang, '14 - Recommendations'), y);
    data.recommendations.forEach((r: string) => {
      y = ensureSpace(doc, y, 18);
      y = paragraph(doc, `- ${r}`, y);
    });
    y += 4;
  }

  // 14. Isabella Business Observation
  if (data.isabella_observation) {
    y = ensureSpace(doc, y, 90);
    y = sectionTitle(doc, L(lang, '15 - Isabella Business Observation'), y);
    doc.setFillColor('#f5f1e4'); doc.rect(40, y - 10, 515, 4, 'F');
    y = paragraph(doc, data.isabella_observation, y + 4, { color: INK, size: 10 });
    y += 8;
  }

  // 15. Next step
  y = ensureSpace(doc, y, 70);
  y = sectionTitle(doc, L(lang, '16 - Next step'), y);
  doc.setFillColor('#f7f3e6'); doc.rect(40, y - 10, 515, 56, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
  doc.text('Deploy Isabella in your front office', 56, y + 8);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(INK);
  doc.text('Talk to the Ovela team for a tailored deployment plan in your country and language.', 56, y + 24);
  doc.setTextColor(GOLD);
  doc.text('www.ovelainteractive.com', 56, y + 40);
  y += 60;
}


function buildMissedCalls(doc: jsPDF, data: any, lang: AssessmentLang = DEFAULT_LANG) {
  header(doc, tr(lang, 'missed_title'), lang);
  let y = 110;
  const annual = data.annual_revenue_loss_eur ?? 0;
  const leak = data.leak_breakdown_eur || {};
  const leakPct = data.leak_breakdown_pct || {};
  const speed = data.speed_to_lead || {};
  const cbc = data.combined_business_case;
  const diag = data.diagnosis_profile;
  const staff = data.staffing_recommendation;
  let section = 0;
  const nextNum = () => String(++section);

  // 1. Lead-first headline (leads, not millions)
  y = sectionTitle(doc, `${nextNum()} - The bottom line — in leads, not just revenue`, y);
  doc.setFillColor('#fff4f2'); doc.rect(40, y - 10, 515, 110, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(NAVY);
  doc.text(`${data.industry_label || 'Business'} — ${data.country || ''}`, 56, y + 8);
  // Big number = missed inquiries / yr (believable)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor('#c0392b');
  doc.text(`${(data.missed_inquiries_per_year ?? (data.missed_inquiries_per_month ?? 0) * 12).toLocaleString('en-US')}`, 56, y + 42);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(MUTED);
  doc.text('Missed inquiries / year', 56, y + 58);
  // Secondary: lost sales opportunities
  doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(NAVY);
  doc.text(`${(data.lost_opportunities_per_year ?? 0).toLocaleString('en-US')}`, 230, y + 42);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(MUTED);
  doc.text('Sales opportunities lost / year', 230, y + 58);
  // Revenue impact (kept smaller, less aggressive)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor(GOLD);
  doc.text(fmtEUR(annual), 400, y + 42);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(MUTED);
  doc.text('Potential annual revenue impact', 400, y + 58);
  doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(MUTED);
  doc.text(`Avg deal value ${fmtEUR(data.inputs?.avg_deal_value_eur)} × ${data.inputs?.conversion_rate_pct ?? '—'}% captured-lead conversion`, 56, y + 84);
  y += 116;

  // 2. Revenue Leakage Profile (diagnosis, not spreadsheet)
  if (diag) {
    y = ensureSpace(doc, y, 90);
    y = sectionTitle(doc, `${nextNum()} - ${diag.name}`, y);
    y = paragraph(doc, diag.narrative, y, { color: INK, size: 10 });
    y += 6;
  }

  // 3. Archetype
  if (data.archetype) {
    y = ensureSpace(doc, y, 70);
    y = sectionTitle(doc, `${nextNum()} - Your archetype`, y);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(GOLD);
    doc.text(data.archetype.label, 40, y); y += 14;
    y = paragraph(doc, data.archetype.description, y);
    y += 6;
  }

  // 4. Revenue Leak Map
  y = ensureSpace(doc, y, 160);
  y = sectionTitle(doc, `${nextNum()} - Revenue Leak Map — where the money disappears`, y);
  const leakRows: Array<[string, number, number]> = [
    [`After-hours calls`,      leak.after_hours      ?? 0, leakPct.after_hours      ?? 0],
    [`Busy-line / overflow`,   leak.busy_line        ?? 0, leakPct.busy_line        ?? 0],
    [`Language-blocked calls`, leak.language_barrier ?? 0, leakPct.language_barrier ?? 0],
  ];
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(NAVY);
  doc.text('Leak source', 40, y); doc.text('Share', 340, y); doc.text('Annual loss', 440, y); y += 6;
  doc.setDrawColor('#dddddd'); doc.line(40, y, 555, y); y += 12;
  leakRows.forEach(([label, val, pct]) => {
    y = ensureSpace(doc, y, 20);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(INK);
    doc.text(label, 40, y);
    const barW = 80; const fill = Math.max(2, Math.min(barW, (pct/100) * barW));
    doc.setFillColor('#eeeeee'); doc.rect(220, y - 8, barW, 8, 'F');
    doc.setFillColor('#c0392b'); doc.rect(220, y - 8, fill, 8, 'F');
    doc.text(`${pct}%`, 340, y);
    doc.setFont('helvetica', 'bold'); doc.setTextColor('#c0392b');
    doc.text(fmtEUR(val), 440, y);
    y += 16;
  });
  doc.setDrawColor('#dddddd'); doc.line(40, y, 555, y); y += 14;
  doc.setFont('helvetica', 'bold'); doc.setTextColor(NAVY);
  doc.text('Total annual revenue leak', 40, y);
  doc.text(fmtEUR(annual), 440, y);
  y += 20;

  // 5. Speed-to-Lead (recalibrated: conversion EFFICIENCY)
  y = ensureSpace(doc, y, 130);
  y = sectionTitle(doc, `${nextNum()} - Speed-to-Lead impact`, y);
  doc.setFillColor('#f5f5f5'); doc.rect(40, y - 10, 515, 100, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
  doc.text('Current response profile', 56, y + 6);
  doc.text('Isabella (sub-5-min responder)', 320, y + 6);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(INK);
  doc.text(`${speed.current_bucket || '—'} avg first response`, 56, y + 24);
  doc.text(`Estimated conversion efficiency: ${speed.current_potential_pct ?? 0}%`, 56, y + 38);
  doc.text(`Status: ${speed.current_label || '—'}`, 56, y + 52);
  doc.setTextColor('#2d8a5e');
  doc.text(`${speed.isabella_bucket || '<5 min'} bucket`, 320, y + 24);
  doc.text(`Estimated conversion efficiency: ${speed.isabella_potential_pct ?? 22}%`, 320, y + 38);
  doc.text(`~${speed.uplift_multiplier ?? '—'}x faster conversion (industry: 5-10x)`, 320, y + 52);
  y += 70;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
  doc.text('Recoverable revenue from speed alone:', 56, y + 8);
  doc.setTextColor('#2d8a5e');
  doc.text(fmtEUR(speed.recoverable_revenue_from_speed_eur), 340, y + 8);
  y += 30;

  // 6. ROI vs Isabella (with capped display)
  y = ensureSpace(doc, y, 110);
  y = sectionTitle(doc, `${nextNum()} - ROI vs Isabella (Pro tier)`, y);
  const isabellaCost = data.isabella_pro_tier_annual_eur ?? 9588;
  const totalRec = data.total_recoverable_annual_eur ?? annual;
  const rows: Array<[string, string]> = [
    ['Annual revenue leak (today)',        fmtEUR(annual)],
    ['Recoverable from speed-to-lead',     fmtEUR(speed.recoverable_revenue_from_speed_eur)],
    ['Total annual recoverable',           fmtEUR(totalRec)],
    ['Isabella Pro tier (annual)',         fmtEUR(isabellaCost)],
    ['Net annual benefit',                 fmtEUR(data.net_annual_benefit_eur)],
    ['ROI',                                data.roi_display || `${data.roi_pct ?? 0}%`],
    ['Payback period',                     data.payback_months ? `${data.payback_months} months` : '—'],
  ];
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(INK);
  rows.forEach(([k, v]) => {
    y = ensureSpace(doc, y, 16);
    doc.text(k, 40, y); doc.text(v, 420, y); y += 14;
  });
  y += 6;

  // 7. Combined Business Case (unlocked when receptionist payload provided)
  if (cbc) {
    y = ensureSpace(doc, y, 130);
    y = sectionTitle(doc, `${nextNum()} - Combined business case (Receptionist + Missed Calls)`, y);
    doc.setFillColor('#f7f3e6'); doc.rect(40, y - 10, 515, 110, 'F');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(INK);
    doc.text('Salary savings vs current human', 56, y + 8);  doc.text(fmtEUR(cbc.salary_savings_eur), 420, y + 8);
    doc.text('Recovered missed revenue',        56, y + 26); doc.text(fmtEUR(cbc.recovered_revenue_eur), 420, y + 26);
    doc.setFont('helvetica', 'bold'); doc.setTextColor(NAVY);
    doc.text('Total annual upside',             56, y + 50); doc.text(fmtEUR(cbc.total_annual_upside_eur), 420, y + 50);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(INK);
    doc.text('Isabella annual cost',            56, y + 68); doc.text(fmtEUR(cbc.isabella_annual_cost_eur), 420, y + 68);
    doc.setFont('helvetica', 'bold'); doc.setTextColor('#2d8a5e');
    doc.text('Combined ROI',                    56, y + 90); doc.text(cbc.combined_roi_display || `${cbc.combined_roi_pct}%`, 420, y + 90);
    y += 116;
  }

  // 8. Recommended staffing model (Human + Isabella)
  if (staff) {
    y = ensureSpace(doc, y, 160);
    y = sectionTitle(doc, `${nextNum()} - Recommended staffing model (Human + Isabella)`, y);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
    doc.text(L(lang, 'Today'), 40, y); y += 14;
    y = paragraph(doc, staff.current, y, { color: INK, size: 10 });
    y += 4;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
    doc.text(L(lang, 'Recommended'), 330, y);
    (staff.recommended || []).forEach((r: string) => { y = paragraph(doc, `- ${r}`, y); });
    y += 4;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor('#2d8a5e');
    doc.text('Expected outcome', 40, y); y += 14;
    (staff.expected_outcome || []).forEach((r: string) => { y = paragraph(doc, `- ${r}`, y); });
    y += 6;
  }

  // 9. Isabella Business Observation
  if (data.isabella_observation) {
    y = ensureSpace(doc, y, 90);
    y = sectionTitle(doc, `${nextNum()} - Isabella Business Observation`, y);
    y = paragraph(doc, data.isabella_observation, y, { color: INK, size: 10 });
    y += 6;
  }

  // 10. Recommendations
  if (Array.isArray(data.recommendations) && data.recommendations.length) {
    y = ensureSpace(doc, y, 40 + data.recommendations.length * 18);
    y = sectionTitle(doc, `${nextNum()} - Recommendations`, y);
    data.recommendations.forEach((r: string) => {
      y = ensureSpace(doc, y, 18);
      y = paragraph(doc, `- ${r}`, y);
    });
    y += 4;
  }

  // 11. Next step
  y = ensureSpace(doc, y, 70);
  y = sectionTitle(doc, `${nextNum()} - Next step`, y);
  doc.setFillColor('#f7f3e6'); doc.rect(40, y - 10, 515, 56, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY);
  doc.text('Plug the leak — deploy Isabella on your inbound', 56, y + 8);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(INK);
  doc.text('Talk to the Ovela team for a tailored deployment plan in your country and language.', 56, y + 24);
  doc.setTextColor(GOLD);
  doc.text('www.ovelainteractive.com', 56, y + 40);
  y += 60;
}



function buildAssessmentDoc(report: AssessmentReport): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  installSanitizer(doc);
  const lang = normLang(report.language);
  if (report.type === 'nutrition_assessment') buildNutrition(doc, report.data, lang);
  else if (report.type === 'business_calculator') {
    if (report.subtype === 'missed_calls') buildMissedCalls(doc, report.data, lang);
    else buildBusinessCalculator(doc, report.data, lang);
  }
  else buildRecoveryResilience(doc, report.data, lang);
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    footer(doc, i, pages, lang);
  }
  return doc;
}

export function assessmentReportFilename(report: AssessmentReport): string {
  const stamp = new Date().toISOString().slice(0, 10);
  if (report.type === 'nutrition_assessment') return `isabella-nutrition-assessment-${stamp}.pdf`;
  if (report.type === 'business_calculator') {
    return report.subtype === 'missed_calls'
      ? `isabella-missed-calls-${stamp}.pdf`
      : `isabella-receptionist-cost-${stamp}.pdf`;
  }
  return `isabella-recovery-resilience-${stamp}.pdf`;
}

/** Build the PDF and trigger the download. */
export function downloadAssessmentReport(report: AssessmentReport) {
  const doc = buildAssessmentDoc(report);
  doc.save(assessmentReportFilename(report));
}

/** Build the PDF and return as base64 (without data URL prefix) for emailing. */
export function assessmentReportToBase64(report: AssessmentReport): string {
  const doc = buildAssessmentDoc(report);
  const dataUri = doc.output('datauristring');
  const idx = dataUri.indexOf(',');
  return idx >= 0 ? dataUri.slice(idx + 1) : dataUri;
}

