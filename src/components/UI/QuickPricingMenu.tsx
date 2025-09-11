import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PricingItem {
  title: string;
  description: string[];
}

export default function QuickPricingMenu() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const pricing: PricingItem[] = [
    {
      title: "Starter – €1,500/month",
      description: [
        "8 posts per month",
        "4 stories per month", 
        "Basic brand customization",
        "Standard resolution",
        "24/7 availability"
      ]
    },
    {
      title: "Growth – €3,500/month (Most Popular)",
      description: [
        "12 posts per month",
        "8 stories per month",
        "2 Reels per month",
        "Advanced customization", 
        "HD quality content",
        "Priority support"
      ]
    },
    {
      title: "Premium – €6,000/month",
      description: [
        "20 posts per month",
        "12 stories per month",
        "4 Reels per month",
        "Trend insights included",
        "4K quality content",
        "Dedicated account manager",
        "Custom integrations"
      ]
    },
    {
      title: "Ambassador Video – from €750",
      description: ["60-second branded spokesperson video"]
    },
    {
      title: "Social Media Shoutout – from €250", 
      description: ["Single post or story"]
    },
    {
      title: "Reel/Short Video – from €500",
      description: ["Up to 30 seconds"]
    },
    {
      title: "Website Integration – €2,000 setup + €500/month",
      description: ["Setup + custom template + interactive Isabella"]
    },
    {
      title: "Add-Ons",
      description: [
        "LoRA Custom Training – €2,000",
        "Custom Voice (ElevenLabs) – €500 per style", 
        "Multi-Language Support – €1,200 per language",
        "Analytics Dashboard – €750 setup + €300/month"
      ]
    },
    {
      title: "Comparison",
      description: [
        "Lil Miquela – €10k/post",
        "Aitana Lopez – €10k/month", 
        "Isabella – from €250/post or €1,500/month"
      ]
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 bg-card shadow-2xl rounded-3xl p-6 border border-border/20 animate-fade-in">
      <h2 className="heading-md text-center mb-6 gradient-text">
        Isabella Quick Pricing Menu
      </h2>
      <div className="space-y-2">
        {pricing.map((item, index) => (
          <Collapsible
            key={index}
            open={openIndex === index}
            onOpenChange={() => toggle(index)}
          >
            <CollapsibleTrigger asChild>
              <div className="w-full border-b border-border/30 last:border-none py-4 cursor-pointer hover:bg-muted/30 rounded-lg px-4 transition-all duration-200">
                <div className="flex justify-between items-center">
                  <h3 className="heading-sm text-left font-medium text-foreground">
                    {item.title}
                  </h3>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-electric-blue" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-electric-blue" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <ul className="mt-2 pl-5 text-muted-foreground list-disc space-y-1">
                {item.description.map((desc, i) => (
                  <li key={i} className="body-md">{desc}</li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}