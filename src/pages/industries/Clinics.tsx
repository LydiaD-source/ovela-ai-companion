import IndustryPage from './IndustryPage';

const Clinics = () => (
  <IndustryPage
    path="/industries/clinics"
    title="AI Receptionist For Clinics & Medical Practices | Ovela Interactive"
    description="Deploy a multilingual AI receptionist for your clinic. Handle bookings, FAQs, and patient communication 24/7 — by Ovela Interactive."
    h1="AI Receptionists For Modern Clinics"
    intro="An always-on AI digital employee that greets patients, answers common questions, guides them through services, and captures bookings — in any language, on every device."
    features={[
      { title: '24/7 patient triage', body: 'Isabella answers routine questions and routes urgent ones — your team stops repeating the same explanations.' },
      { title: 'Multilingual reception', body: 'Native-feel conversations in English, Spanish, French, German, Portuguese and Catalan from day one.' },
      { title: 'Live booking capture', body: 'Qualified leads delivered to your CRM in real time — no missed after-hours enquiries.' },
    ]}
    videoCategoryKey="wellness_spa"
  />
);

export default Clinics;
