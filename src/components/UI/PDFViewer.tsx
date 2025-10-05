import React from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PDFViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl: string;
  title: string;
}

const PDFViewer = ({ open, onOpenChange, pdfUrl, title }: PDFViewerProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{title}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <iframe
            src={pdfUrl}
            className="w-full h-full"
            title={title}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewer;
