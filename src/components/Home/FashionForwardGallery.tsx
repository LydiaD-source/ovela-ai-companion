import React, { useState } from 'react';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import VideoPlayer from '@/components/UI/VideoPlayer';

interface MediaItem {
  type: 'image' | 'video';
  src: string;
  title: string;
}

const galleryItems: MediaItem[] = [
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1760381801/Flux_Dev_Medium_shot_Isabella_sitting_on_concrete_urban_stairs_0_whbaex.jpg',
    title: 'Urban Elegance'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1760381797/Flux_Dev_Mediumfull_body_shot_Isabella_walking_on_a_modern_bri_0_heiee8.jpg',
    title: 'Contemporary Fashion'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1765301159/Flux_Dev_A_woman_walking_gracefully_on_a_bridge_at_sunset_wear_0_bwcm1u.jpg',
    title: 'Sunset Bridge Walk'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1765301159/Flux_Dev_A_woman_standing_beside_a_modern_architectural_struct_1_fvr6di.jpg',
    title: 'Architectural Elegance'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1765301159/Flux_Dev_A_stylish_young_woman_sitting_confidently_on_outdoor__1_lq2owv.jpg',
    title: 'Confident Style'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1765301158/Flux_Dev_A_model_posing_on_a_city_rooftop_with_skyline_backgro_1_fdwdtw.jpg',
    title: 'City Skyline Portrait'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1765301158/Flux_Dev_A_highfashion_portrait_of_a_woman_in_a_beige_minimali_1_rafapc.jpg',
    title: 'Minimalist Chic'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1765301158/Flux_Dev_A_model_posing_on_a_city_rooftop_with_skyline_backgro_0_tsgo43.jpg',
    title: 'Urban Rooftop'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1765301158/Flux_Dev_A_fashionable_woman_walking_in_a_European_street_wear_1_zagdmk.jpg',
    title: 'European Street Style'
  }
];

interface FashionForwardGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FashionForwardGallery = ({ isOpen, onClose }: FashionForwardGalleryProps) => {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  return (
    <>
      {/* Main Gallery Dialog */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogOverlay className="bg-black/90 backdrop-blur-md" />
        <DialogContent className="max-w-7xl w-[95vw] max-h-[90vh] overflow-y-auto bg-background/95 border-primary/20">
          <div className="relative">

            <div className="pt-8 pb-4">
              <h2 className="text-3xl font-playfair text-primary mb-2">Fashion Forward Portfolio</h2>
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
                        className="w-full h-full object-cover"
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
