
import React from 'react';
import Section from '@/components/UI/Section';
import { FooterMinimal } from '@/components/Home/FooterMinimal';

const Projects = () => {
  const projects = [
    {
      id: 1,
      name: 'Lux Def Tec',
      description: 'Isabella promoted Lux Def Tec\'s latest line of outdoor and sporting firearms. Showcasing custom solutions and applications, Isabella connected with a highly engaged audience of male gun enthusiasts, boosting visibility and driving strong campaign response.',
      logoPlaceholder: 'Lux Def Tec Logo',
      videoPlaceholder: 'Isabella Animation Clip for Lux Def Tec'
    },
    {
      id: 2,
      name: 'Veronica Ristulescu Psychology Group',
      description: 'Veronica Ristulescu\'s therapy group used Isabella as an "after-hours companion." Acting as a first-line contact, Isabella helped people express their needs when therapists weren\'t available, ensuring engagement and support outside office hours.',
      logoPlaceholder: 'Veronica Ristulescu Psychology Group Logo',
      videoPlaceholder: 'Isabella Animation Clip for Psychology Group'
    },
    {
      id: 3,
      name: 'HeShave',
      description: 'Isabella partnered with HeShave to revolutionize men\'s grooming experiences. Through personalized product recommendations and interactive campaigns, Isabella helped connect with modern men seeking premium shaving solutions, driving engagement and brand loyalty.',
      logoPlaceholder: 'HeShave Logo',
      videoPlaceholder: 'Isabella Animation Clip for HeShave'
    }
  ];

  return (
    <div className="pt-16">
      <Section className="text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-xl mb-8">
            <span className="gradient-text">Projects</span>
          </h1>
          <p className="body-lg text-muted-foreground">
            See how Isabella has already worked with brands across industries — adapting to their needs, audiences, and goals.
          </p>
        </div>
      </Section>

      {projects.map((project, idx) => (
        <Section key={project.id} background={idx % 2 === 0 ? 'gray' : 'white'}>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={idx % 2 === 1 ? 'lg:order-2' : ''}>
              <div className="mb-8">
                <div className="bg-gradient-to-br from-electric-blue/10 to-neon-purple/10 rounded-2xl p-6 mb-4 text-center">
                  <div className="text-muted-foreground font-medium">
                    [Placeholder: {project.logoPlaceholder}]
                  </div>
                </div>
              </div>
              
              <h2 className="heading-lg mb-6">{project.name}</h2>
              <p className="body-md text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            </div>
            
            <div className={idx % 2 === 1 ? 'lg:order-1' : ''}>
              <div className="bg-gradient-to-br from-electric-blue/20 to-neon-purple/20 rounded-3xl p-12 glass text-center">
                <div className="text-6xl mb-4">🎬</div>
                <p className="text-muted-foreground">
                  [Placeholder: {project.videoPlaceholder}]
                </p>
              </div>
            </div>
          </div>
        </Section>
      ))}

      <Section background="dark">
        <div className="text-center">
          <h2 className="heading-lg mb-6 text-soft-white">More Projects Coming Soon</h2>
          <p className="body-md text-soft-white/80">
            Isabella is working with more brands across different industries. Check back soon for updates!
          </p>
        </div>
      </Section>
      <FooterMinimal />
    </div>
  );
};

export default Projects;
