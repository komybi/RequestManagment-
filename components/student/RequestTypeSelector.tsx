'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DocumentRequestForm from './DocumentRequestForm';
import IDReplacementForm from './IDReplacementForm';
import ClearanceForm from './ClearanceForm';
import CostShareForm from './CostShareForm';

type RequestType = 'document' | 'id-replacement' | 'clearance' | 'cost-share' | null;

export default function RequestTypeSelector() {
  const [selectedRequest, setSelectedRequest] = useState<RequestType>(null);

  const requestTypes = [
    {
      id: 'document',
      title: 'Document Request',
      description: 'Request academic documents like transcripts, certificates, and letters',
      icon: '📄',
    },
    {
      id: 'id-replacement',
      title: 'ID Replacement',
      description: 'Request a replacement for lost or damaged student ID',
      icon: '🪪',
    },
    {
      id: 'clearance',
      title: 'Clearance Request',
      description: 'Request clearance certificates for various purposes',
      icon: '✅',
    },
    {
      id: 'cost-share',
      title: 'Cost Share Request',
      description: 'Request cost sharing for educational expenses',
      icon: '💰',
    },
  ];

  if (selectedRequest) {
    const renderForm = () => {
      switch (selectedRequest) {
        case 'document':
          return <DocumentRequestForm />;
        case 'id-replacement':
          return <IDReplacementForm />;
        case 'clearance':
          return <ClearanceForm />;
        case 'cost-share':
          return <CostShareForm />;
        default:
          return null;
      }
    };

    return (
      <div>
        <Button
          variant="outline"
          onClick={() => setSelectedRequest(null)}
          className="mb-4"
        >
          ← Back to Request Types
        </Button>
        {renderForm()}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">What would you like to request?</h2>
      <div className="space-y-4">
        {requestTypes.map((type) => (
          <Card
            key={type.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedRequest(type.id as RequestType)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{type.icon}</div>
                <div>
                  <CardTitle className="text-lg">{type.title}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
