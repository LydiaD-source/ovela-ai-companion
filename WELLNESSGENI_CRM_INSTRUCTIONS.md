# WellnessGeni CRM Dashboard Instructions

## Overview
This document contains instructions for implementing the Admin CRM Dashboard in the **WellnessGeni** project to manage leads captured from Ovela Interactive.

---

## Database Setup (Already Complete in Ovela)

The `crm_leads` table has been created in the shared Supabase instance with the following schema:

```sql
CREATE TABLE public.crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  inquiry_type TEXT NOT NULL,
  message TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'ovela',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

The edge function `crm-new-lead` is also deployed and functional.

---

## Tasks for WellnessGeni Project

### 1. Create Admin CRM Dashboard Component

Create a new file: `src/components/Admin/CRMDashboard.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Mail, MessageSquare, Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface CRMLead {
  id: string;
  name: string;
  email: string;
  inquiry_type: string;
  message: string;
  source: string;
  created_at: string;
}

export const CRMDashboard = () => {
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'ovela' | 'instagram'>('all');

  useEffect(() => {
    fetchLeads();
  }, [sourceFilter]);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('crm_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (sourceFilter !== 'all') {
        query = query.eq('source', sourceFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInquiryBadgeColor = (type: string) => {
    const colors = {
      modeling: 'bg-purple-500',
      collaboration: 'bg-blue-500',
      brand: 'bg-green-500',
      general: 'bg-gray-500',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const getSourceBadgeColor = (source: string) => {
    return source === 'ovela' ? 'bg-amber-500' : 'bg-pink-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">CRM Leads</h2>
          <p className="text-muted-foreground">
            Manage leads from Ovela Interactive and Instagram
          </p>
        </div>
        <Button onClick={fetchLeads} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ovela Site</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.filter(l => l.source === 'ovela').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Instagram</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.filter(l => l.source === 'instagram').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.filter(l => {
                const leadDate = new Date(l.created_at);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return leadDate >= weekAgo;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={sourceFilter === 'all' ? 'default' : 'outline'}
          onClick={() => setSourceFilter('all')}
        >
          All Sources
        </Button>
        <Button
          variant={sourceFilter === 'ovela' ? 'default' : 'outline'}
          onClick={() => setSourceFilter('ovela')}
        >
          Ovela
        </Button>
        <Button
          variant={sourceFilter === 'instagram' ? 'default' : 'outline'}
          onClick={() => setSourceFilter('instagram')}
        >
          Instagram
        </Button>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : leads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No leads found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Message Preview</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(lead.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>
                      <Badge className={getInquiryBadgeColor(lead.inquiry_type)}>
                        {lead.inquiry_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSourceBadgeColor(lead.source)}>
                        {lead.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {lead.message.substring(0, 60)}...
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLead(lead)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Name
                  </label>
                  <p className="text-lg font-semibold">{selectedLead.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <a 
                      href={`mailto:${selectedLead.email}`}
                      className="text-lg font-semibold hover:underline"
                    >
                      {selectedLead.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Inquiry Type
                  </label>
                  <div className="mt-1">
                    <Badge className={getInquiryBadgeColor(selectedLead.inquiry_type)}>
                      {selectedLead.inquiry_type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Source
                  </label>
                  <div className="mt-1">
                    <Badge className={getSourceBadgeColor(selectedLead.source)}>
                      {selectedLead.source}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Received
                </label>
                <p className="text-lg">
                  {format(new Date(selectedLead.created_at), 'MMMM d, yyyy \'at\' h:mm a')}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Message
                </label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedLead.message}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button asChild className="flex-1">
                  <a href={`mailto:${selectedLead.email}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
```

### 2. Add CRM Route to Admin Panel

Update your admin routes file (e.g., `src/pages/Admin.tsx` or your routing configuration):

```tsx
import { CRMDashboard } from '@/components/Admin/CRMDashboard';

// Add to your admin navigation/routes:
<Route path="/admin/crm" element={<CRMDashboard />} />
```

### 3. Add Navigation Link

In your admin sidebar/navigation, add:

```tsx
<Link to="/admin/crm">
  <LayoutGrid className="mr-2 h-4 w-4" />
  CRM Leads
</Link>
```

### 4. Optional: Email Notifications

To send email notifications when new leads arrive, create an edge function:

**File:** `supabase/functions/crm-notify/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, inquiry_type, source } = await req.json();
    
    // Use Resend or your email service
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Isabella <isabella@ovela.ai>',
        to: ['contact@wellnessgeni.ai'],
        subject: `New ${inquiry_type} Lead from ${source}`,
        html: `
          <h2>New Lead Received</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Type:</strong> ${inquiry_type}</p>
          <p><strong>Source:</strong> ${source}</p>
          <p><a href="https://youradminurl.com/admin/crm">View in Dashboard</a></p>
        `,
      }),
    });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

Then update `crm-new-lead` function to call this notification function after inserting a lead.

---

## Instagram DM Integration (Future)

When ready to integrate Instagram DMs:

1. Set up Meta Graph API webhook
2. Create edge function `instagram-webhook` to receive DM events
3. Parse Instagram messages and extract lead info
4. Insert into `crm_leads` with `source: 'instagram'`

**Placeholder endpoint:**

```typescript
// supabase/functions/instagram-webhook/index.ts
serve(async (req) => {
  // Verify webhook signature
  // Parse Instagram event
  // Extract name, email, message from DM
  // Insert into crm_leads
});
```

---

## Testing

1. Visit Ovela Contact page: `https://ovela.ai/contact`
2. Click "Start Conversation with Isabella"
3. Chat should open on home page
4. Test lead submission (future implementation in Isabella chat)
5. Check WellnessGeni admin panel at `/admin/crm` to see leads

---

## Summary

✅ Database table `crm_leads` created  
✅ Edge function `crm-new-lead` deployed  
✅ Ovela Contact page created  
✅ Navigation updated  
⏳ WellnessGeni Admin CRM Dashboard (follow instructions above)  
⏳ Email notifications (optional)  
⏳ Instagram DM integration (future)