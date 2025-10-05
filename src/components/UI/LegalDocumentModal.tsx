import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface LegalDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: 'privacy_policy' | 'terms_of_service';
  title: string;
}

const LegalDocumentModal = ({ open, onOpenChange, documentType, title }: LegalDocumentModalProps) => {
  const [content, setContent] = useState<string>('');
  const [version, setVersion] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchDocument();
    }
  }, [open, documentType]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('legal_documents')
        .select('content, version')
        .eq('type', documentType)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        setContent(data.content);
        setVersion(data.version);
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      toast({
        title: 'Error',
        description: 'Failed to load document. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const trackConsent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data: versions } = await supabase.rpc('get_current_legal_versions');
      
      if (!versions || versions.length === 0) return;

      const { privacy_version, terms_version } = versions[0];

      await supabase
        .from('user_consents')
        .insert({
          user_id: user.id,
          privacy_policy_version: privacy_version || '1.0',
          terms_of_service_version: terms_version || '1.0',
          user_agent: navigator.userAgent,
          consent_date: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error tracking consent:', error);
    }
  };

  const handleClose = () => {
    trackConsent();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            {version && (
              <span className="text-sm font-normal text-muted-foreground">
                Version {version}
              </span>
            )}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="overflow-auto p-6" style={{ height: 'calc(90vh - 56px)' }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LegalDocumentModal;
