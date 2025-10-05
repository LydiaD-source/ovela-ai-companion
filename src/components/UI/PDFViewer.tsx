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
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0 overflow-hidden">
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
        <div className="w-full overflow-auto" style={{ height: 'calc(90vh - 56px)' }}>
          <object
            data={`${pdfUrl}#view=FitH`}
            type="application/pdf"
            className="w-full h-full"
            aria-label={title}
            title={title}
          >
            <iframe src={pdfUrl} className="w-full h-full" title={title} />
            <div className="p-6 text-sm">
              Unable to display the PDF.{' '}
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="underline">
                Open in new tab
              </a>
            </div>
          </object>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewer;
