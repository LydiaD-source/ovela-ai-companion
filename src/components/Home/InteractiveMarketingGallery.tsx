import React, { useState } from 'react';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import VideoPlayer from '@/components/UI/VideoPlayer';

interface MediaItem {
  type: 'image' | 'video';
  src: string;
  title: string;
}

const galleryItems: MediaItem[] = [
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1760381193/P_2_hnksyr.jpg',
    title: 'Dior Lipstick Campaign'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1760381195/P_4_a3gjit.jpg',
    title: 'Chanel Perfume'
  },
  {
    type: 'video',
    src: 'https://res.cloudinary.com/di5gj4nyp/video/upload/v1760381202/portfolio_2_1_ezrolh.mp4',
    title: 'Interactive Campaign Video'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1760381188/Portfolio_1_2_ziy05h.jpg',
    title: 'Dior Nail Polish'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1760358485/Flux_Dev_Use_Character_Element_fictional_female_character_insp_0_5_xuyw8u.jpg',
    title: 'Apple Campaign'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1760381185/Flux_Dev_Use_Character_Element_fictional_female_character_insp_0_7_g2vqdu.jpg',
    title: 'Luxury Flatlay'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1760381191/Portfolio_Interactive_Mark_1_fdizhj.jpg',
    title: 'Interactive Marketing Portfolio'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1765301700/Flux_Dev_A_desk_setup_with_camera_ring_light_smartphone_editin_1_by8lak.jpg',
    title: 'Content Creator Setup'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1765301699/Flux_Dev_A_creative_office_wall_filled_with_content_planning_b_1_hvqzfp.jpg',
    title: 'Content Planning Board'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1765301698/Flux_Dev_A_young_marketing_professional_standing_in_front_of_a_0_nnljul.jpg',
    title: 'Marketing Professional'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1765301677/Flux_Dev_A_sleek_digital_marketing_workspace_with_a_large_inte_0_qwup0s.jpg',
    title: 'Digital Marketing Workspace'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1765301677/Flux_Dev_A_modern_workspace_with_a_laptop_floating_social_medi_1_pedfup.jpg',
    title: 'Social Media Hub'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1765301677/Flux_Dev_A_female_digital_marketer_working_on_a_laptop_editing_0_fwuwxl.jpg',
    title: 'Digital Marketer at Work'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1765301676/Flux_Dev_A_modern_meeting_room_with_two_professionals_discussi_0_xzczzj.jpg',
    title: 'Strategy Meeting'
  }
];

interface InteractiveMarketingGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InteractiveMarketingGallery = ({ isOpen, onClose }: InteractiveMarketingGalleryProps) => {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  return (
    <>
      {/* Main Gallery Dialog */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogOverlay className="bg-black/90 backdrop-blur-md" />
        <DialogContent className="max-w-7xl w-[95vw] max-h-[90vh] overflow-y-auto bg-background/95 border-primary/20">
          <div className="relative">

            <div className="pt-8 pb-4">
              <h2 className="text-3xl font-playfair text-primary mb-2">Interactive Marketing Portfolio</h2>
              <p className="text-muted-foreground mb-8">Click on any image to view it in full screen</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryItems.map((item, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105"
                    onClick={() => setSelectedItem(item)}
                  >
                    {item.type === 'video' ? (
                      <div className="relative w-full h-full">
                        <video
                          src={item.src}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-primary/80 flex items-center justify-center">
                            <div className="w-0 h-0 border-l-[16px] border-l-white border-y-[10px] border-y-transparent ml-1" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={item.src}
                        alt={item.title}
                        className="w-full h-full object-cover object-top"
                      />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm font-medium">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Media Viewer Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogOverlay className="bg-black/95 backdrop-blur-lg" />
          <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto bg-transparent border-none shadow-none p-0 [&>button]:bg-white/10 [&>button]:hover:bg-white/20 [&>button]:text-white [&>button]:-top-12 [&>button]:right-0">

            <div className="relative flex items-center justify-center max-h-[90vh]">
              {selectedItem.type === 'video' ? (
                <VideoPlayer
                  src={selectedItem.src}
                  controls={true}
                  autoplay={true}
                  loop={true}
                  muted={false}
                  className="max-h-[90vh] w-auto rounded-lg"
                />
              ) : (
                <img
                  src={selectedItem.src}
                  alt={selectedItem.title}
                  className="max-h-[90vh] w-auto rounded-lg object-contain"
                />
              )}
            </div>

            <div className="absolute -bottom-12 left-0 right-0 text-center">
              <p className="text-white text-lg font-medium">{selectedItem.title}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
