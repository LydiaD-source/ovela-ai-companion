import React, { useState } from 'react';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';

interface MediaItem {
  type: 'image' | 'video';
  src: string;
  title: string;
}

const galleryItems: MediaItem[] = [
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1765301819/Flux_Dev_A_futuristic_minimalist_product_layout_inspired_by_mo_0_rw7xte.jpg',
    title: 'Futuristic Product Layout'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1765301818/Flux_Dev_A_designer_desk_with_sketches_logo_drafts_color_cards_0_t1e2ln.jpg',
    title: 'Designer Desk Setup'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1765301816/Flux_Dev_Aesthetic_tech_branding_scene_with_devices_inspired_b_1_cuitu2.jpg',
    title: 'Tech Branding Scene'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1765301815/Flux_Dev_A_single_cosmetic_or_jewelry_product_displayed_on_a_m_1_vejsr7.jpg',
    title: 'Luxury Product Display'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1765301789/Flux_Dev_A_premium_flat_lay_of_cosmetic_or_fashion_products_wi_0_nfa6ob.jpg',
    title: 'Premium Flat Lay'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1765301787/Flux_Dev_A_premium_flat_lay_inspired_by_Dior_and_Chanel_beauty_1_ujtnli.jpg',
    title: 'Dior & Chanel Inspired'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1765301786/Flux_Dev_A_modern_lifestyle_product_scene_inspired_by_the_refi_0_hnrqkz.jpg',
    title: 'Modern Lifestyle Scene'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1765301785/Flux_Dev_A_moodboard_inspired_by_DIOR__FENTY_BEAUTY_and_CHANEL_1_kupfw8.jpg',
    title: 'Brand Moodboard'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1765301785/Flux_Dev_A_moodboard_inspired_by_DIOR__FENTY_BEAUTY_and_CHANEL_0_y78jem.jpg',
    title: 'Luxury Brand Collage'
  }
];

interface MultiBrandGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MultiBrandGallery = ({ isOpen, onClose }: MultiBrandGalleryProps) => {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  return (
    <>
      {/* Main Gallery Dialog */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogOverlay className="bg-black/90 backdrop-blur-md" />
        <DialogContent className="max-w-7xl w-[95vw] max-h-[90vh] overflow-y-auto bg-background/95 border-primary/20">
          <div className="relative">

            <div className="pt-8 pb-4">
              <h2 className="text-3xl font-playfair text-primary mb-2">Multi-Brand Excellence Portfolio</h2>
              <p className="text-muted-foreground mb-8">Click on any image to view it in full screen</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryItems.map((item, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105"
                    onClick={() => setSelectedItem(item)}
                  >
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-full h-full object-cover object-top"
                    />
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
              <img
                src={selectedItem.src}
                alt={selectedItem.title}
                className="max-h-[90vh] w-auto rounded-lg object-contain"
              />
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
