'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface DocumentDetailProps {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DocumentDetail({ id, open, onOpenChange }: DocumentDetailProps) {
  const [document, setDocument] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !id) return;

    async function fetchDocument() {
      try {
        const response = await fetch(`/api/documents/${id}`);
        if (response.ok) {
          setDocument(await response.json());
        }
      } catch (error) {
        console.error('Failed to fetch document:', error);
      }
    }

    fetchDocument();
  }, [id, open]);

  async function handleGenerateQR() {
    setLoading(true);
    try {
      const response = await fetch(`/api/documents/${id}/qrcode`);
      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qrCode);
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPDF() {
    try {
      const response = await fetch(`/api/documents/${id}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document-${document.trackingNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  }

  if (!document) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="capitalize">{document.documentType}</DialogTitle>
          <DialogDescription>Tracking: {document.trackingNumber}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Status</label>
            <div className="mt-1">
              <Badge className={getStatusColor(document.status)}>
                {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <p className="text-sm text-muted-foreground mt-1">{document.description}</p>
          </div>

          <div>
            <label className="text-sm font-medium">Purpose</label>
            <p className="text-sm text-muted-foreground mt-1">{document.purpose}</p>
          </div>

          {document.rejectionReason && (
            <div className="bg-destructive/10 p-3 rounded text-sm text-destructive">
              <strong>Rejection Reason:</strong> {document.rejectionReason}
            </div>
          )}

          {document.status === 'approved' && (
            <div className="space-y-3">
              {qrCode ? (
                <div className="flex flex-col items-center gap-2">
                  <Image
                    src={qrCode}
                    alt="QR Code"
                    width={200}
                    height={200}
                  />
                </div>
              ) : (
                <Button
                  onClick={handleGenerateQR}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Generating...' : 'Generate QR Code'}
                </Button>
              )}

              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                className="w-full"
              >
                Download PDF
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
