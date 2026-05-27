import IndustryPage from './IndustryPage';

const RealEstate = () => (
  <IndustryPage
    path="/industries/real-estate"
    title="AI Property Presenter For Real Estate | Ovela Interactive"
    description="A 24/7 AI digital employee that presents listings, qualifies leads, and speaks every buyer's language — by Ovela Interactive."
    h1="AI Representatives For Real Estate Agencies"
    intro="Stop losing after-hours buyers. Your AI digital employee presents every property, qualifies every lead, and follows up in the buyer's own language — instantly."
    features={[
      { title: 'Interactive property tours', body: 'Buyers explore listings with a presenter who knows every detail and answers in real time.' },
      { title: 'International lead capture', body: 'Multilingual conversations turn foreign visitors into qualified leads, not lost traffic.' },
      { title: 'Always-on agent backup', body: 'Your team focuses on closings; the AI representative handles enquiries around the clock.' },
    ]}
    videoCategoryKey="real_estate"
  />
);

export default RealEstate;
