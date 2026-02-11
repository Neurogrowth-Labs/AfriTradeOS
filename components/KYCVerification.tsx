import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Shield,
  Building,
  User,
  Camera,
  Loader2,
  Eye,
  Trash2,
  RefreshCw,
  ChevronRight,
  Info,
  ArrowLeft,
  ChevronDown,
  Check,
  Fingerprint,
  ScanLine
} from 'lucide-react';
import { supabase } from '../services/supabase';

interface Document {
  id: string;
  document_type: string;
  file_name: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'expired';
  created_at: string;
  verification_notes?: string;
}

interface KYCRequest {
  id: string;
  request_type: 'kyc' | 'kyb';
  status: 'not_started' | 'documents_pending' | 'under_review' | 'approved' | 'rejected' | 'expired';
  submitted_at?: string;
  review_notes?: string;
  rejection_reason?: string;
}

type VerificationType = 'individual' | 'business';

const REQUIRED_DOCUMENTS = {
  individual: [
    { type: 'identity_document', label: 'Government ID', description: 'Passport, National ID, or Driver\'s License' },
    { type: 'bank_statement', label: 'Proof of Address', description: 'Bank statement or utility bill (last 3 months)' },
  ],
  business: [
    { type: 'business_registration', label: 'Business Registration', description: 'Certificate of Incorporation' },
    { type: 'tax_certificate', label: 'Tax Certificate', description: 'Tax registration or clearance certificate' },
    { type: 'trade_license', label: 'Trade License', description: 'Valid trade or export license' },
    { type: 'identity_document', label: 'Director ID', description: 'ID of company director or authorized signatory' },
  ],
};

export const KYCVerification: React.FC = () => {
  const [verificationType, setVerificationType] = useState<VerificationType>('individual');
  const [kycRequest, setKycRequest] = useState<KYCRequest | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
  // B12: Interactive verification flow
  const [wizardStep, setWizardStep] = useState(0); // 0 = overview, 1-N = document steps, N+1 = review, N+2 = submit
  const [showWizard, setShowWizard] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch KYC request
      const { data: kycData } = await supabase
        .from('kyc_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (kycData) {
        setKycRequest(kycData);
        setVerificationType(kycData.request_type === 'kyb' ? 'business' : 'individual');
      }

      // Fetch documents
      const { data: docsData } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (docsData) {
        setDocuments(docsData);
      }
    } catch (e) {
      console.error('Failed to fetch KYC status:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (docType: string) => {
    setSelectedDocType(docType);
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDocType) return;

    setUploading(selectedDocType);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${selectedDocType}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          document_type: selectedDocType,
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
          mime_type: file.type,
          status: 'pending',
        })
        .select()
        .single();

      if (docError) throw docError;

      setDocuments(prev => [docData, ...prev]);

      // Create or update KYC request if not exists
      if (!kycRequest) {
        const { data: newKyc } = await supabase
          .from('kyc_requests')
          .insert({
            user_id: user.id,
            request_type: verificationType === 'business' ? 'kyb' : 'kyc',
            status: 'documents_pending',
          })
          .select()
          .single();

        if (newKyc) setKycRequest(newKyc);
      }

    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(null);
      setSelectedDocType(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmitForReview = async () => {
    if (!kycRequest) return;

    try {
      const { error } = await supabase
        .from('kyc_requests')
        .update({
          status: 'under_review',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', kycRequest.id);

      if (error) throw error;

      setKycRequest(prev => prev ? { ...prev, status: 'under_review', submitted_at: new Date().toISOString() } : null);
    } catch (err: any) {
      setError(err.message || 'Failed to submit for review');
    }
  };

  const getDocumentForType = (docType: string) => {
    return documents.find(d => d.document_type === docType);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3" /> Approved</span>;
      case 'rejected':
        return <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full"><XCircle className="w-3 h-3" /> Rejected</span>;
      case 'under_review':
        return <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full"><Clock className="w-3 h-3" /> Under Review</span>;
      case 'expired':
        return <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full"><AlertTriangle className="w-3 h-3" /> Expired</span>;
      default:
        return <span className="flex items-center gap-1 text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-full"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  const requiredDocs = REQUIRED_DOCUMENTS[verificationType];
  const uploadedCount = requiredDocs.filter(doc => getDocumentForType(doc.type)).length;
  const allDocsUploaded = uploadedCount === requiredDocs.length;
  const canSubmit = allDocsUploaded && (!kycRequest || kycRequest.status === 'documents_pending' || kycRequest.status === 'not_started');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-trade-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-trade-primary dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-trade-secondary" />
            Identity Verification
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Complete your KYC/KYB verification to unlock all platform features
          </p>
        </div>
        {kycRequest && getStatusBadge(kycRequest.status)}
      </div>

      {/* Verification Type Selector */}
      {!kycRequest && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold font-heading text-trade-primary dark:text-white mb-4">
            Select Verification Type
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setVerificationType('individual')}
              className={`p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                verificationType === 'individual'
                  ? 'border-trade-primary bg-trade-primary/5'
                  : 'border-gray-200 dark:border-slate-700 hover:border-trade-primary/50'
              }`}
            >
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-trade-primary dark:text-white">Individual (KYC)</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  For personal accounts and sole traders
                </p>
              </div>
            </button>

            <button
              onClick={() => setVerificationType('business')}
              className={`p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                verificationType === 'business'
                  ? 'border-trade-primary bg-trade-primary/5'
                  : 'border-gray-200 dark:border-slate-700 hover:border-trade-primary/50'
              }`}
            >
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Building className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-trade-primary dark:text-white">Business (KYB)</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  For registered companies and enterprises
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold font-heading text-trade-primary dark:text-white">
            Document Upload Progress
          </h2>
          <span className="text-sm font-bold text-trade-primary">
            {uploadedCount} / {requiredDocs.length} Documents
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-trade-success transition-all duration-500"
            style={{ width: `${(uploadedCount / requiredDocs.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Document Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requiredDocs.map(doc => {
          const uploadedDoc = getDocumentForType(doc.type);
          const isUploading = uploading === doc.type;

          return (
            <div
              key={doc.type}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${uploadedDoc ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-slate-700'}`}>
                    <FileText className={`w-5 h-5 ${uploadedDoc ? 'text-green-600' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-trade-primary dark:text-white">{doc.label}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{doc.description}</p>
                  </div>
                </div>
                {uploadedDoc && getStatusBadge(uploadedDoc.status)}
              </div>

              {uploadedDoc ? (
                <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                      {uploadedDoc.file_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                    {uploadedDoc.status !== 'approved' && (
                      <button
                        onClick={() => handleFileSelect(doc.type)}
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                      >
                        <RefreshCw className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleFileSelect(doc.type)}
                  disabled={isUploading}
                  className="w-full mt-4 p-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl hover:border-trade-primary dark:hover:border-trade-primary transition-colors flex flex-col items-center justify-center gap-2 group"
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-trade-primary" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-gray-400 group-hover:text-trade-primary transition-colors" />
                      <span className="text-sm text-gray-500 group-hover:text-trade-primary transition-colors">
                        Click to upload
                      </span>
                    </>
                  )}
                </button>
              )}

              {uploadedDoc?.verification_notes && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 flex items-start gap-2">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {uploadedDoc.verification_notes}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileUpload}
      />

      {/* Submit Button + Wizard Launch */}
      <div className="flex justify-between items-center">
        {!showWizard && (
          <button onClick={() => { setShowWizard(true); setWizardStep(0); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors">
            <ScanLine className="w-5 h-5" /> Start Guided Verification
          </button>
        )}
        {canSubmit && (
          <button
            onClick={handleSubmitForReview}
            className="flex items-center gap-2 px-6 py-3 bg-trade-primary hover:bg-trade-primary/90 text-white font-bold rounded-xl transition-colors ml-auto"
          >
            Submit for Verification
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* B12: INTERACTIVE VERIFICATION WIZARD */}
      {showWizard && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Wizard Header */}
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-trade-primary dark:text-white flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-indigo-500" /> Verification Wizard
                </h2>
                <button onClick={() => setShowWizard(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              {/* Step Progress */}
              <div className="flex items-center gap-1">
                {['Type', ...requiredDocs.map(d => d.label.split(' ')[0]), 'Review'].map((label, idx) => (
                  <React.Fragment key={idx}>
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold transition-all ${
                      wizardStep > idx ? 'bg-green-500 text-white' :
                      wizardStep === idx ? 'bg-indigo-600 text-white' :
                      'bg-gray-200 dark:bg-slate-700 text-gray-500'
                    }`}>
                      {wizardStep > idx ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    {idx < requiredDocs.length + 1 && <div className={`flex-1 h-1 rounded ${wizardStep > idx ? 'bg-green-500' : 'bg-gray-200 dark:bg-slate-700'}`} />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Wizard Content */}
            <div className="p-6">
              {/* Step 0: Choose Verification Type */}
              {wizardStep === 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-white">Select Verification Type</h3>
                  <p className="text-sm text-gray-500">Choose whether you are verifying as an individual or a business entity.</p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <button onClick={() => { setVerificationType('individual'); setWizardStep(1); }}
                      className={`p-5 rounded-xl border-2 text-center transition-all hover:border-indigo-500 ${
                        verificationType === 'individual' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : 'border-gray-200 dark:border-slate-700'
                      }`}>
                      <User className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
                      <h4 className="font-bold text-gray-900 dark:text-white">Individual</h4>
                      <p className="text-[10px] text-gray-500 mt-1">KYC for personal accounts</p>
                    </button>
                    <button onClick={() => { setVerificationType('business'); setWizardStep(1); }}
                      className={`p-5 rounded-xl border-2 text-center transition-all hover:border-indigo-500 ${
                        verificationType === 'business' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : 'border-gray-200 dark:border-slate-700'
                      }`}>
                      <Building className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                      <h4 className="font-bold text-gray-900 dark:text-white">Business</h4>
                      <p className="text-[10px] text-gray-500 mt-1">KYB for registered companies</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Steps 1-N: Document Upload for each required doc */}
              {wizardStep > 0 && wizardStep <= requiredDocs.length && (() => {
                const docIdx = wizardStep - 1;
                const doc = requiredDocs[docIdx];
                const uploadedDoc = getDocumentForType(doc.type);
                const isUploading = uploading === doc.type;
                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                        <FileText className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{doc.label}</h3>
                        <p className="text-sm text-gray-500">{doc.description}</p>
                      </div>
                    </div>

                    {uploadedDoc ? (
                      <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-900/30">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <div>
                            <p className="font-bold text-green-800 dark:text-green-300">Document Uploaded</p>
                            <p className="text-xs text-green-600">{uploadedDoc.file_name}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(doc.type); }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOver(null);
                          const file = e.dataTransfer.files[0];
                          if (file) {
                            setSelectedDocType(doc.type);
                            const dt = new DataTransfer();
                            dt.items.add(file);
                            if (fileInputRef.current) {
                              fileInputRef.current.files = dt.files;
                              fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                          }
                        }}
                        className={`p-8 border-2 border-dashed rounded-xl text-center transition-all cursor-pointer ${
                          dragOver === doc.type ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : 'border-gray-300 dark:border-slate-600 hover:border-indigo-400'
                        }`}
                        onClick={() => handleFileSelect(doc.type)}
                      >
                        {isUploading ? (
                          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
                        ) : (
                          <>
                            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                            <p className="font-bold text-gray-700 dark:text-gray-300">Drag & drop or click to upload</p>
                            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (max 10MB)</p>
                          </>
                        )}
                      </div>
                    )}

                    <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Ensure the document is clear, unedited, and matches your registered details. Blurry or expired documents will be rejected.
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Final Step: Review */}
              {wizardStep === requiredDocs.length + 1 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" /> Review & Submit
                  </h3>
                  <p className="text-sm text-gray-500">Review your uploaded documents before submitting for verification.</p>
                  <div className="space-y-3 mt-4">
                    {requiredDocs.map(doc => {
                      const uploaded = getDocumentForType(doc.type);
                      return (
                        <div key={doc.type} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${uploaded ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                              {uploaded ? <Check className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{doc.label}</p>
                              <p className="text-[10px] text-gray-500">{uploaded ? uploaded.file_name : 'Not uploaded'}</p>
                            </div>
                          </div>
                          {uploaded ? (
                            <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Ready</span>
                          ) : (
                            <button onClick={() => setWizardStep(requiredDocs.indexOf(doc) + 1)}
                              className="text-xs text-indigo-600 font-bold hover:underline">Upload</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {allDocsUploaded && (
                    <button onClick={() => { handleSubmitForReview(); setShowWizard(false); }}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-trade-primary hover:bg-trade-primary/90 text-white font-bold rounded-xl transition-colors mt-4">
                      <Shield className="w-5 h-5" /> Submit for Verification
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Wizard Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex justify-between">
              <button onClick={() => wizardStep > 0 ? setWizardStep(wizardStep - 1) : setShowWizard(false)}
                className="flex items-center gap-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg font-medium">
                <ArrowLeft className="w-4 h-4" /> {wizardStep > 0 ? 'Back' : 'Close'}
              </button>
              {wizardStep < requiredDocs.length + 1 && wizardStep > 0 && (
                <button onClick={() => setWizardStep(wizardStep + 1)}
                  className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold">
                  {getDocumentForType(requiredDocs[wizardStep - 1]?.type) ? 'Next' : 'Skip'} <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {kycRequest?.status === 'under_review' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 flex items-start gap-4">
          <Clock className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-blue-800 dark:text-blue-300">Verification In Progress</h3>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Your documents are being reviewed. This typically takes 1-2 business days.
              You'll receive a notification once the review is complete.
            </p>
          </div>
        </div>
      )}

      {kycRequest?.status === 'approved' && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 flex items-start gap-4">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-green-800 dark:text-green-300">Verification Complete</h3>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Your identity has been verified. You now have full access to all platform features.
            </p>
          </div>
        </div>
      )}

      {kycRequest?.status === 'rejected' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex items-start gap-4">
          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-red-800 dark:text-red-300">Verification Failed</h3>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {kycRequest.rejection_reason || 'Your documents could not be verified. Please re-upload the required documents.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
