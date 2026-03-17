'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, Mail, Calendar } from 'lucide-react';

interface Letter {
  _id: string;
  revenueLetterId: string;
  revenueLetterContent: string;
  revenueLetterSentAt: string;
  studentName: string;
  studentEmail: string;
  studentId: string;
  documentType: string;
  department: string;
  program: string;
  academicYear: string;
  sentToRevenueAt: string;
  status: string;
}

export default function LettersTable() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);

  useEffect(() => {
    fetchLetters();
  }, []);

  async function fetchLetters() {
    try {
      const response = await fetch('/api/letters');
      if (response.ok) {
        const data = await response.json();
        setLetters(data);
      }
    } catch (error) {
      console.error('Failed to fetch letters:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading letters...</div>;
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-lg">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Letter ID</th>
              <th className="px-6 py-4 text-left font-semibold">Student Name</th>
              <th className="px-6 py-4 text-left font-semibold">Student ID</th>
              <th className="px-6 py-4 text-left font-semibold">Document Type</th>
              <th className="px-6 py-4 text-left font-semibold">Sent Date</th>
              <th className="px-6 py-4 text-left font-semibold">Status</th>
              <th className="px-6 py-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {letters.map((letter, index) => (
              <tr key={letter._id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-6 py-4">
                  <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {letter.revenueLetterId}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{letter.studentName}</p>
                    <p className="text-xs text-gray-500">{letter.studentEmail}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900">{letter.studentId}</p>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {letter.documentType}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(letter.revenueLetterSentAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Sent to Student
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLetter(letter)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedLetter && (
        <Dialog open={!!selectedLetter} onOpenChange={() => setSelectedLetter(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg p-6">
              <DialogTitle className="text-2xl font-bold">
                Letter: {selectedLetter.revenueLetterId}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 p-6">
              {/* Letter Header */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-lg mb-4 text-gray-900">Student Information</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">Name</label>
                        <p className="text-base font-medium text-gray-900 bg-white p-3 rounded border border-gray-200">
                          {selectedLetter.studentName}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">Student ID</label>
                        <p className="text-base font-medium text-gray-900 bg-white p-3 rounded border border-gray-200">
                          {selectedLetter.studentId}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">Email</label>
                        <p className="text-base font-medium text-gray-900 bg-white p-3 rounded border border-gray-200">
                          {selectedLetter.studentEmail}
                        </p>
                      </div>
                    </div>
                  </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-4 text-gray-900">Academic Details</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">Department</label>
                        <p className="text-base font-medium text-gray-900 bg-white p-3 rounded border border-gray-200">
                          {selectedLetter.department}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">Program</label>
                        <p className="text-base font-medium text-gray-900 bg-white p-3 rounded border border-gray-200">
                          {selectedLetter.program}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">Academic Year</label>
                        <p className="text-base font-medium text-gray-900 bg-white p-3 rounded border border-gray-200">
                          {selectedLetter.academicYear}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              {/* Letter Content */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-lg text-gray-900">Generated Letter Content</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Resend
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded border border-gray-200 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                    {selectedLetter.revenueLetterContent}
                  </pre>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 mt-4">
                  <div>
                    Sent to: {selectedLetter.studentEmail} on {new Date(selectedLetter.revenueLetterSentAt).toLocaleDateString()}
                  </div>
                  <div>
                    Letter ID: {selectedLetter.revenueLetterId}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
