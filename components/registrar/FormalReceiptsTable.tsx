'use client';

import { useEffect, useState } from 'react';
import { Receipt } from 'lucide-react';

export default function FormalReceiptsTable() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFormalReceipts();
  }, []);

  async function fetchFormalReceipts() {
    try {
      setLoading(true);
      const response = await fetch('/api/registrar/formal-receipts');
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch formal receipts');
        return;
      }
      
      const data = await response.json();
      setReceipts(data);
      setError('');
    } catch (error) {
      console.error('Failed to fetch formal receipts:', error);
      setError('Failed to fetch formal receipts');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading formal receipts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 max-w-md mx-auto">
          <p className="text-red-700 font-medium">Error: {error}</p>
          <button
            onClick={fetchFormalReceipts}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="text-center py-8">
        <Receipt className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg font-medium mb-2">No formal receipts available yet</p>
        <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
          Formal receipts will appear here after revenue officers process payment receipts and forward them to the registrar.
        </p>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-md mx-auto">
          <p className="text-blue-700 text-sm font-medium mb-3">
            <strong>📋 To test this feature:</strong>
          </p>
          <ol className="text-blue-600 text-sm mt-2 text-left space-y-2">
            <li className="flex items-start">
              <span className="font-medium mr-2">1.</span>
              <span>Go to <strong>Revenue Dashboard</strong></span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">2.</span>
              <span>Upload a payment receipt or use existing one</span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">3.</span>
              <span>Click <strong>"Forward to Registrar"</strong> button</span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">4.</span>
              <span>Come back here and check the <strong>"Formal Receipts"</strong> tab</span>
            </li>
          </ol>
          
          <div className="mt-4 p-3 bg-blue-100 rounded border border-blue-300">
            <p className="text-blue-800 text-xs">
              <strong>💡 Tip:</strong> The formal receipt will be generated automatically when you click "Forward to Registrar" in the revenue dashboard.
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200 max-w-md mx-auto">
          <p className="text-yellow-700 text-sm">
            <strong>🔍 Current Status:</strong> No formal receipts have been forwarded yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Receipt className="w-5 h-5 mr-2 text-indigo-600" />
          Formal Receipts ({receipts.length})
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Processed payment receipts with formal receipts issued
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Receipt ID</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Student Name</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Amount</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {receipts.map((receipt: any, index: number) => (
              <tr key={receipt._id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-6 py-4">
                  <span className="font-mono text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                    {receipt.formalReceiptId}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{receipt.studentName}</p>
                    <p className="text-xs text-gray-500">{receipt.studentEmail}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-900 font-medium">
                    {receipt.paymentAmount} ETB
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    receipt.registrarProcessed 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {receipt.registrarProcessed ? 'Processed' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
