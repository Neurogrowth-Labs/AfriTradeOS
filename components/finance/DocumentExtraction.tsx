import React, { useState, useCallback } from 'react';
import {
  Upload,
  FileText,
  FileCheck,
  FileX,
  Eye,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
  Filter,
  MoreVertical,
  X,
  ZoomIn,
  ChevronDown
} from 'lucide-react';
import { ApplicationDocument, ExtractedDocumentData, DocumentExtractionResult } from './FinanceApplicationTypes';

interface DocumentExtractionProps {
  applicationId: string;
  documents: ApplicationDocument[];
  onUpload: (files: File[], documentType: ApplicationDocument['type']) => Promise<void>;
  onVerify: (documentId: string) => Promise<void>;
  onReject: (documentId: string, reason: string) => Promise<void>;
  onDelete: (documentId: string) => Promise<void>;
  onExtract: (documentId: string) => Promise<DocumentExtractionResult>;
}

const DOCUMENT_TYPES: { value: ApplicationDocument['type']; label: string; required: boolean }[] = [
  { value: 'invoice', label: 'Commercial Invoice', required: true },
  { value: 'bill_of_lading', label: 'Bill of Lading', required: true },
  { value: 'certificate_of_origin', label: 'Certificate of Origin', required: true },
  { value: 'insurance', label: 'Insurance Certificate', required: true },
  { value: 'customs_declaration', label: 'Customs Declaration', required: false },
  { value: 'contract', label: 'Sales Contract', required: true },
  { value: 'financial_statement', label: 'Financial Statement', required: true },
  { value: 'other', label: 'Other Document', required: false }
];

export const DocumentExtraction: React.FC<DocumentExtractionProps> = ({
  applicationId,
  documents,
  onUpload,
  onVerify,
  onReject,
  onDelete,
  onExtract
}) => {
  const [selectedType, setSelectedType] = useState<ApplicationDocument['type']>('invoice');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<ApplicationDocument | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [rejectModal, setRejectModal] = useState<{ docId: string; open: boolean }>({ docId: '', open: false });
  const [rejectReason, setRejectReason] = useState('');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setUploading(true);
      try {
        await onUpload(files, selectedType);
      } finally {
        setUploading(false);
      }
    }
  }, [onUpload, selectedType]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      setUploading(true);
      try {
        await onUpload(files, selectedType);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleExtract = async (docId: string) => {
    setExtracting(docId);
    try {
      await onExtract(docId);
    } finally {
      setExtracting(null);
    }
  };

  const handleReject = async () => {
    if (rejectModal.docId && rejectReason) {
      await onReject(rejectModal.docId, rejectReason);
      setRejectModal({ docId: '', open: false });
      setRejectReason('');
    }
  };

  const getStatusIcon = (status: ApplicationDocument['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'rejected':
        return <FileX className="w-4 h-4 text-red-400" />;
      case 'uploaded':
        return <FileCheck className="w-4 h-4 text-blue-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: ApplicationDocument['status']) => {
    const styles = {
      pending: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      uploaded: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      verified: 'bg-green-500/20 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full border ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredDocuments = documents.filter(doc => 
    filterStatus === 'all' || doc.status === filterStatus
  );

  const documentStats = {
    total: documents.length,
    verified: documents.filter(d => d.status === 'verified').length,
    pending: documents.filter(d => d.status === 'pending' || d.status === 'uploaded').length,
    rejected: documents.filter(d => d.status === 'rejected').length
  };

  const requiredDocs = DOCUMENT_TYPES.filter(t => t.required);
  const uploadedTypes = new Set(documents.map(d => d.type));
  const missingRequired = requiredDocs.filter(t => !uploadedTypes.has(t.value));

  return (
    <div className="space-y-6">
      {/* Document Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <p className="text-2xl font-bold text-white">{documentStats.total}</p>
          <p className="text-sm text-slate-400">Total Documents</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <p className="text-2xl font-bold text-green-400">{documentStats.verified}</p>
          <p className="text-sm text-slate-400">Verified</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <p className="text-2xl font-bold text-amber-400">{documentStats.pending}</p>
          <p className="text-sm text-slate-400">Pending Review</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <p className="text-2xl font-bold text-red-400">{documentStats.rejected}</p>
          <p className="text-sm text-slate-400">Rejected</p>
        </div>
      </div>

      {/* Missing Required Documents Alert */}
      {missingRequired.length > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
            <div>
              <p className="text-sm text-amber-300 font-medium">Missing Required Documents</p>
              <p className="text-xs text-slate-400 mt-1">
                Please upload: {missingRequired.map(d => d.label).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Upload Documents</h3>
        
        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm text-slate-400">Document Type:</label>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value as ApplicationDocument['type'])}
            className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DOCUMENT_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label} {type.required ? '*' : ''}
              </option>
            ))}
          </select>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-600 hover:border-slate-500'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mb-4" />
              <p className="text-white">Uploading documents...</p>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-white mb-2">Drag and drop files here</p>
              <p className="text-sm text-slate-400 mb-4">or</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                Browse Files
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-slate-500 mt-4">
                Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB per file)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Document List */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Uploaded Documents</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents..."
                className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 hover:text-white transition-colors">
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filter</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {['all', 'pending', 'uploaded', 'verified', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No documents found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map(doc => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(doc.status)}
                  <div>
                    <p className="text-white font-medium">{doc.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400">
                        {DOCUMENT_TYPES.find(t => t.value === doc.type)?.label}
                      </span>
                      {doc.uploadedDate && (
                        <span className="text-xs text-slate-500">
                          Uploaded: {new Date(doc.uploadedDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(doc.status)}

                  {doc.extractedData && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded text-purple-400 text-xs">
                      <Sparkles className="w-3 h-3" />
                      {Math.round(doc.extractedData.confidence * 100)}% extracted
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {doc.status === 'uploaded' && (
                      <>
                        <button
                          onClick={() => handleExtract(doc.id)}
                          disabled={extracting === doc.id}
                          className="p-2 text-purple-400 hover:text-purple-300 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                          title="Extract Data"
                        >
                          {extracting === doc.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => onVerify(doc.id)}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-slate-700 rounded-lg transition-colors"
                          title="Verify"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setRejectModal({ docId: doc.id, open: true })}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <FileX className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    <button
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDelete(doc.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div>
                <h3 className="text-lg font-semibold text-white">{previewDoc.name}</h3>
                <p className="text-sm text-slate-400">
                  {DOCUMENT_TYPES.find(t => t.value === previewDoc.type)?.label}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 h-[600px]">
              {/* Document Preview */}
              <div className="bg-slate-800 flex items-center justify-center border-r border-slate-700">
                <div className="text-center">
                  <FileText className="w-24 h-24 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Document Preview</p>
                  <p className="text-xs text-slate-500 mt-1">PDF/Image viewer would render here</p>
                </div>
              </div>

              {/* Extracted Data */}
              <div className="p-4 overflow-y-auto">
                <h4 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Extracted Data
                </h4>

                {previewDoc.extractedData ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <p className="text-xs text-purple-400 mb-1">Confidence Score</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${previewDoc.extractedData.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-white font-medium">
                          {Math.round(previewDoc.extractedData.confidence * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {previewDoc.extractedData.documentNumber && (
                        <div>
                          <p className="text-xs text-slate-500">Document Number</p>
                          <p className="text-white">{previewDoc.extractedData.documentNumber}</p>
                        </div>
                      )}
                      {previewDoc.extractedData.issueDate && (
                        <div>
                          <p className="text-xs text-slate-500">Issue Date</p>
                          <p className="text-white">{previewDoc.extractedData.issueDate}</p>
                        </div>
                      )}
                      {previewDoc.extractedData.amount && (
                        <div>
                          <p className="text-xs text-slate-500">Amount</p>
                          <p className="text-white">
                            {previewDoc.extractedData.currency} {previewDoc.extractedData.amount.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {previewDoc.extractedData.parties && previewDoc.extractedData.parties.length > 0 && (
                        <div>
                          <p className="text-xs text-slate-500">Parties</p>
                          {previewDoc.extractedData.parties.map((party, idx) => (
                            <p key={idx} className="text-white">{party}</p>
                          ))}
                        </div>
                      )}
                      {previewDoc.extractedData.origin && (
                        <div>
                          <p className="text-xs text-slate-500">Origin</p>
                          <p className="text-white">{previewDoc.extractedData.origin}</p>
                        </div>
                      )}
                      {previewDoc.extractedData.destination && (
                        <div>
                          <p className="text-xs text-slate-500">Destination</p>
                          <p className="text-white">{previewDoc.extractedData.destination}</p>
                        </div>
                      )}
                      {previewDoc.extractedData.hsCode && (
                        <div>
                          <p className="text-xs text-slate-500">HS Code</p>
                          <p className="text-white">{previewDoc.extractedData.hsCode}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No data extracted yet</p>
                    <button
                      onClick={() => handleExtract(previewDoc.id)}
                      disabled={extracting === previewDoc.id}
                      className="mt-4 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors mx-auto"
                    >
                      {extracting === previewDoc.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      Extract Data with AI
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Reject Document</h3>
            <p className="text-sm text-slate-400 mb-4">
              Please provide a reason for rejecting this document.
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              placeholder="Enter rejection reason..."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejectModal({ docId: '', open: false });
                  setRejectReason('');
                }}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentExtraction;
