import IndustryPage from './IndustryPage';

const Wellness = () => (
  <IndustryPage
    path="/industries/wellness"
    title="AI Concierge For Wellness, Spa & Hospitality | Ovela Interactive"
    description="An AI digital employee for spas, wellness retreats and hotels. Multilingual concierge, booking handler and brand voice — by Ovela Interactive."
    h1="AI Concierges For Wellness & Hospitality"
    intro="Set the experience before guests arrive. Your AI representative presents treatments, answers questions, and books appointments in the guest's own language — 24 hours a day."
    features={[
      { title: 'Pre-arrival experience', body: 'Guests discover treatments, packages and pricing through a calm, on-brand conversation — not a static menu.' },
      { title: 'Booking & upsell', body: 'Personalised recommendations turn enquiries into appointments and packages into add-ons.' },
      { title: 'International guests welcome', body: 'Native multilingual support removes the language barrier most spas quietly lose business to.' },
    ]}
    videoCategoryKey="wellness_spa"
  />
);

export default Wellness;
