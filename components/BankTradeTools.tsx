import React, { useState } from 'react';
import {
  Zap,
  Shield,
  Link2,
  Globe,
  FileText,
  Calculator,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Percent,
  Building2,
  Ship,
  Package,
  MapPin,
  Calendar,
  Lock,
  Unlock,
  Eye,
  Copy,
  ExternalLink,
  Info,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';

interface InsuranceQuote {
  id: string;
  provider: string;
  coverageType: 'marine' | 'cargo' | 'credit' | 'political_risk';
  premium: number;
  coverage: number;
  currency: string;
  deductible: number;
  validUntil: string;
  terms: string[];
  rating: number;
}

interface BlockchainRecord {
  id: string;
  documentType: string;
  documentHash: string;
  timestamp: string;
  blockNumber: number;
  network: string;
  status: 'verified' | 'pending' | 'invalid';
  issuer: string;
  verifications: number;
}

interface AfCFTAResult {
  hsCode: string;
  productDescription: string;
  originCountry: string;
  destinationCountry: string;
  isEligible: boolean;
  tariffRate: number;
  mfnRate: number;
  savings: number;
  ruleOfOrigin: string;
  requiredDocuments: string[];
  restrictions?: string[];
  notes?: string;
}

interface BankTradeToolsProps {
  userRole?: string;
}

const MOCK_INSURANCE_QUOTES: InsuranceQuote[] = [
  {
    id: 'INS-001',
    provider: 'African Trade Insurance Agency (ATI)',
    coverageType: 'credit',
    premium: 12500,
    coverage: 500000,
    currency: 'USD',
    deductible: 25000,
    validUntil: '2024-02-15',
    terms: ['90-day payment default coverage', 'Political risk included', 'Currency inconvertibility'],
    rating: 4.8
  },
  {
    id: 'INS-002',
    provider: 'Afreximbank Insurance',
    coverageType: 'cargo',
    premium: 8750,
    coverage: 350000,
    currency: 'USD',
    deductible: 15000,
    validUntil: '2024-02-15',
    terms: ['All-risk marine cargo', 'Warehouse to warehouse', 'General average'],
    rating: 4.5
  },
  {
    id: 'INS-003',
    provider: 'MIGA (World Bank)',
    coverageType: 'political_risk',
    premium: 18000,
    coverage: 750000,
    currency: 'USD',
    deductible: 50000,
    validUntil: '2024-02-15',
    terms: ['Expropriation', 'War and civil disturbance', 'Breach of contract'],
    rating: 4.9
  }
];

const MOCK_BLOCKCHAIN_RECORDS: BlockchainRecord[] = [
  {
    id: 'BLK-001',
    documentType: 'Bill of Lading',
    documentHash: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    timestamp: '2024-01-15T10:30:00Z',
    blockNumber: 18234567,
    network: 'Ethereum',
    status: 'verified',
    issuer: 'Maersk Line',
    verifications: 12
  },
  {
    id: 'BLK-002',
    documentType: 'Certificate of Origin',
    documentHash: '0x3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d',
    timestamp: '2024-01-14T14:20:00Z',
    blockNumber: 18234123,
    network: 'Ethereum',
    status: 'verified',
    issuer: 'Kenya Chamber of Commerce',
    verifications: 8
  },
  {
    id: 'BLK-003',
    documentType: 'Insurance Certificate',
    documentHash: '0x2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
    timestamp: '2024-01-16T09:15:00Z',
    blockNumber: 18235890,
    network: 'Ethereum',
    status: 'pending',
    issuer: 'ATI Insurance',
    verifications: 3
  }
];

export const BankTradeTools: React.FC<BankTradeToolsProps> = () => {
  const [activeTool, setActiveTool] = useState<'insurance' | 'blockchain' | 'afcfta'>('insurance');
  
  // Insurance state
  const [insuranceForm, setInsuranceForm] = useState({
    shipmentValue: 250000,
    currency: 'USD',
    origin: 'Kenya',
    destination: 'Germany',
    goodsType: 'Agricultural Products',
    coverageType: 'cargo' as InsuranceQuote['coverageType'],
    shipmentDate: '2024-02-01'
  });
  const [insuranceQuotes, setInsuranceQuotes] = useState<InsuranceQuote[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  // Blockchain state
  const [documentHash, setDocumentHash] = useState('');
  const [verificationResult, setVerificationResult] = useState<BlockchainRecord | null>(null);
  const [verifying, setVerifying] = useState(false);

  // AfCFTA state
  const [afcftaForm, setAfcftaForm] = useState({
    hsCode: '',
    originCountry: 'Kenya',
    destinationCountry: 'Nigeria',
    productDescription: ''
  });
  const [afcftaResult, setAfcftaResult] = useState<AfCFTAResult | null>(null);
  const [checkingAfcfta, setCheckingAfcfta] = useState(false);

  const handleGetQuotes = async () => {
    setLoadingQuotes(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setInsuranceQuotes(MOCK_INSURANCE_QUOTES);
    setLoadingQuotes(false);
  };

  const handleVerifyDocument = async () => {
    if (!documentHash) return;
    setVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const found = MOCK_BLOCKCHAIN_RECORDS.find(r => 
      r.documentHash.toLowerCase().includes(documentHash.toLowerCase().slice(0, 10))
    );
    
    if (found) {
      setVerificationResult(found);
    } else {
      setVerificationResult({
        id: 'NOT_FOUND',
        documentType: 'Unknown',
        documentHash: documentHash,
        timestamp: '',
        blockNumber: 0,
        network: 'Ethereum',
        status: 'invalid',
        issuer: 'Unknown',
        verifications: 0
      });
    }
    setVerifying(false);
  };

  const handleCheckAfcfta = async () => {
    if (!afcftaForm.hsCode) return;
    setCheckingAfcfta(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setAfcftaResult({
      hsCode: afcftaForm.hsCode,
      productDescription: afcftaForm.productDescription || 'Coffee, not roasted, not decaffeinated',
      originCountry: afcftaForm.originCountry,
      destinationCountry: afcftaForm.destinationCountry,
      isEligible: true,
      tariffRate: 0,
      mfnRate: 20,
      savings: 50000,
      ruleOfOrigin: 'Wholly obtained or produced in the territory of a State Party',
      requiredDocuments: [
        'AfCFTA Certificate of Origin',
        'Commercial Invoice',
        'Packing List',
        'Bill of Lading'
      ],
      notes: 'Product qualifies for preferential treatment under AfCFTA. Ensure Certificate of Origin is issued by authorized body.'
    });
    setCheckingAfcfta(false);
  };

  const AFRICAN_COUNTRIES = [
    'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Cape Verde',
    'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Cote d\'Ivoire', 'Djibouti', 'Egypt',
    'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea',
    'Guinea-Bissau', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali',
    'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda',
    'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa',
    'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'
  ];

  const renderInsuranceTool = () => (
    <div className="space-y-6">
      {/* Quote Request Form */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-400" />
          Get Insurance Quote
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Shipment Value</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                value={insuranceForm.shipmentValue}
                onChange={e => setInsuranceForm(prev => ({ ...prev, shipmentValue: parseFloat(e.target.value) || 0 }))}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Currency</label>
            <select
              value={insuranceForm.currency}
              onChange={e => setInsuranceForm(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Coverage Type</label>
            <select
              value={insuranceForm.coverageType}
              onChange={e => setInsuranceForm(prev => ({ ...prev, coverageType: e.target.value as InsuranceQuote['coverageType'] }))}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cargo">Cargo Insurance</option>
              <option value="marine">Marine Insurance</option>
              <option value="credit">Credit Insurance</option>
              <option value="political_risk">Political Risk</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Origin Country</label>
            <select
              value={insuranceForm.origin}
              onChange={e => setInsuranceForm(prev => ({ ...prev, origin: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {AFRICAN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Destination</label>
            <input
              type="text"
              value={insuranceForm.destination}
              onChange={e => setInsuranceForm(prev => ({ ...prev, destination: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Germany"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Shipment Date</label>
            <input
              type="date"
              value={insuranceForm.shipmentDate}
              onChange={e => setInsuranceForm(prev => ({ ...prev, shipmentDate: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-300 mb-1">Goods Description</label>
          <input
            type="text"
            value={insuranceForm.goodsType}
            onChange={e => setInsuranceForm(prev => ({ ...prev, goodsType: e.target.value }))}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Agricultural Products, Electronics, Textiles"
          />
        </div>

        <button
          onClick={handleGetQuotes}
          disabled={loadingQuotes}
          className="mt-4 flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
        >
          {loadingQuotes ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Getting Quotes...
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4" />
              Get Quotes
            </>
          )}
        </button>
      </div>

      {/* Quotes Results */}
      {insuranceQuotes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Available Quotes</h3>
          {insuranceQuotes.map(quote => (
            <div key={quote.id} className="bg-slate-900 rounded-xl border border-slate-700 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Shield className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{quote.provider}</h4>
                    <p className="text-sm text-slate-400 capitalize">{quote.coverageType.replace('_', ' ')} Insurance</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{quote.currency} {quote.premium.toLocaleString()}</p>
                  <p className="text-sm text-slate-400">Premium</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-700">
                <div>
                  <p className="text-xs text-slate-500">Coverage</p>
                  <p className="text-white font-medium">{quote.currency} {quote.coverage.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Deductible</p>
                  <p className="text-white font-medium">{quote.currency} {quote.deductible.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Valid Until</p>
                  <p className="text-white font-medium">{quote.validUntil}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Rating</p>
                  <p className="text-amber-400 font-medium">★ {quote.rating}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-2">Coverage Terms</p>
                <div className="flex flex-wrap gap-2">
                  {quote.terms.map((term, idx) => (
                    <span key={idx} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded">
                      {term}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors">
                  <CheckCircle2 className="w-4 h-4" />
                  Select Quote
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
                  <Download className="w-4 h-4" />
                  Download Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderBlockchainTool = () => (
    <div className="space-y-6">
      {/* Verification Form */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-purple-400" />
          Document Verification
        </h3>

        <p className="text-slate-400 mb-4">
          Verify trade documents on the blockchain to ensure authenticity and prevent fraud.
        </p>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={documentHash}
              onChange={e => setDocumentHash(e.target.value)}
              placeholder="Enter document hash (0x...)"
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={handleVerifyDocument}
            disabled={verifying || !documentHash}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50"
          >
            {verifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Verify
              </>
            )}
          </button>
        </div>
      </div>

      {/* Verification Result */}
      {verificationResult && (
        <div className={`bg-slate-900 rounded-xl border p-6 ${
          verificationResult.status === 'verified' ? 'border-green-500/50' :
          verificationResult.status === 'pending' ? 'border-amber-500/50' :
          'border-red-500/50'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${
              verificationResult.status === 'verified' ? 'bg-green-500/20' :
              verificationResult.status === 'pending' ? 'bg-amber-500/20' :
              'bg-red-500/20'
            }`}>
              {verificationResult.status === 'verified' ? (
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              ) : verificationResult.status === 'pending' ? (
                <Clock className="w-8 h-8 text-amber-400" />
              ) : (
                <XCircle className="w-8 h-8 text-red-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h4 className={`text-xl font-semibold ${
                  verificationResult.status === 'verified' ? 'text-green-400' :
                  verificationResult.status === 'pending' ? 'text-amber-400' :
                  'text-red-400'
                }`}>
                  {verificationResult.status === 'verified' ? 'Document Verified' :
                   verificationResult.status === 'pending' ? 'Verification Pending' :
                   'Document Not Found'}
                </h4>
              </div>
              
              {verificationResult.status !== 'invalid' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-slate-500">Document Type</p>
                    <p className="text-white">{verificationResult.documentType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Issuer</p>
                    <p className="text-white">{verificationResult.issuer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Network</p>
                    <p className="text-white">{verificationResult.network}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Verifications</p>
                    <p className="text-white">{verificationResult.verifications}</p>
                  </div>
                </div>
              )}

              {verificationResult.blockNumber > 0 && (
                <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Document Hash</p>
                      <p className="text-white font-mono text-sm">{verificationResult.documentHash}</p>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-slate-400">Block #{verificationResult.blockNumber}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-400">{new Date(verificationResult.timestamp).toLocaleString()}</span>
                    <a href="#" className="flex items-center gap-1 text-blue-400 hover:text-blue-300">
                      View on Explorer <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Verifications */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Verifications</h3>
        <div className="space-y-3">
          {MOCK_BLOCKCHAIN_RECORDS.map(record => (
            <div key={record.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                {record.status === 'verified' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-400" />
                )}
                <div>
                  <p className="text-white">{record.documentType}</p>
                  <p className="text-xs text-slate-400 font-mono">{record.documentHash.slice(0, 20)}...</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">{record.issuer}</p>
                <p className="text-xs text-slate-500">{new Date(record.timestamp).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAfcftaTool = () => (
    <div className="space-y-6">
      {/* AfCFTA Checker Form */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-green-400" />
          AfCFTA Eligibility Checker
        </h3>

        <p className="text-slate-400 mb-4">
          Check if your products qualify for preferential tariffs under the African Continental Free Trade Area agreement.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">HS Code *</label>
            <input
              type="text"
              value={afcftaForm.hsCode}
              onChange={e => setAfcftaForm(prev => ({ ...prev, hsCode: e.target.value }))}
              placeholder="e.g., 0901.11"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Product Description</label>
            <input
              type="text"
              value={afcftaForm.productDescription}
              onChange={e => setAfcftaForm(prev => ({ ...prev, productDescription: e.target.value }))}
              placeholder="e.g., Coffee beans, not roasted"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Origin Country *</label>
            <select
              value={afcftaForm.originCountry}
              onChange={e => setAfcftaForm(prev => ({ ...prev, originCountry: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {AFRICAN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Destination Country *</label>
            <select
              value={afcftaForm.destinationCountry}
              onChange={e => setAfcftaForm(prev => ({ ...prev, destinationCountry: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {AFRICAN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleCheckAfcfta}
          disabled={checkingAfcfta || !afcftaForm.hsCode}
          className="mt-4 flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50"
        >
          {checkingAfcfta ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Check Eligibility
            </>
          )}
        </button>
      </div>

      {/* AfCFTA Result */}
      {afcftaResult && (
        <div className={`bg-slate-900 rounded-xl border p-6 ${
          afcftaResult.isEligible ? 'border-green-500/50' : 'border-red-500/50'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${afcftaResult.isEligible ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {afcftaResult.isEligible ? (
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              ) : (
                <XCircle className="w-8 h-8 text-red-400" />
              )}
            </div>
            <div className="flex-1">
              <h4 className={`text-xl font-semibold ${afcftaResult.isEligible ? 'text-green-400' : 'text-red-400'}`}>
                {afcftaResult.isEligible ? 'Eligible for AfCFTA Preferential Tariff' : 'Not Eligible'}
              </h4>
              <p className="text-slate-400 mt-1">{afcftaResult.productDescription}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-xs text-slate-500">HS Code</p>
                  <p className="text-white font-mono">{afcftaResult.hsCode}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Trade Route</p>
                  <p className="text-white">{afcftaResult.originCountry} → {afcftaResult.destinationCountry}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">AfCFTA Tariff</p>
                  <p className="text-green-400 font-bold">{afcftaResult.tariffRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">MFN Rate</p>
                  <p className="text-slate-400">{afcftaResult.mfnRate}%</p>
                </div>
              </div>

              {afcftaResult.isEligible && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="w-6 h-6 text-green-400" />
                    <div>
                      <p className="text-green-400 font-semibold">Potential Savings</p>
                      <p className="text-2xl font-bold text-white">USD {afcftaResult.savings.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <p className="text-sm font-medium text-slate-300 mb-2">Rule of Origin</p>
                <p className="text-slate-400 text-sm">{afcftaResult.ruleOfOrigin}</p>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-slate-300 mb-2">Required Documents</p>
                <div className="flex flex-wrap gap-2">
                  {afcftaResult.requiredDocuments.map((doc, idx) => (
                    <span key={idx} className="flex items-center gap-1 px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded">
                      <FileText className="w-3 h-3" />
                      {doc}
                    </span>
                  ))}
                </div>
              </div>

              {afcftaResult.notes && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                    <p className="text-sm text-blue-300">{afcftaResult.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AfCFTA Info */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">About AfCFTA</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <Globe className="w-8 h-8 text-green-400 mb-2" />
            <h4 className="text-white font-medium">54 Countries</h4>
            <p className="text-sm text-slate-400">Largest free trade area by number of countries</p>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <Building2 className="w-8 h-8 text-blue-400 mb-2" />
            <h4 className="text-white font-medium">$3.4 Trillion GDP</h4>
            <p className="text-sm text-slate-400">Combined economic output of member states</p>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <TrendingUp className="w-8 h-8 text-purple-400 mb-2" />
            <h4 className="text-white font-medium">90% Tariff Elimination</h4>
            <p className="text-sm text-slate-400">Target for goods traded between members</p>
          </div>
        </div>
      </div>
    </div>
  );

  const tools = [
    { id: 'insurance', label: 'Insurance Quoting', icon: Shield, color: 'blue' },
    { id: 'blockchain', label: 'Blockchain Verification', icon: Link2, color: 'purple' },
    { id: 'afcfta', label: 'AfCFTA Checker', icon: Globe, color: 'green' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Zap className="w-8 h-8 text-amber-400" />
            </div>
            Trade Tools
          </h1>
          <p className="text-slate-400 mt-2">
            Insurance quoting, blockchain verification, and AfCFTA eligibility checking
          </p>
        </div>

        {/* Tool Selector */}
        <div className="flex items-center gap-2 mb-6">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as typeof activeTool)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTool === tool.id
                  ? `bg-${tool.color}-600 text-white`
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              style={{
                backgroundColor: activeTool === tool.id ? 
                  (tool.color === 'blue' ? '#2563eb' : tool.color === 'purple' ? '#9333ea' : '#16a34a') : 
                  undefined
              }}
            >
              <tool.icon className="w-4 h-4" />
              {tool.label}
            </button>
          ))}
        </div>

        {/* Tool Content */}
        {activeTool === 'insurance' && renderInsuranceTool()}
        {activeTool === 'blockchain' && renderBlockchainTool()}
        {activeTool === 'afcfta' && renderAfcftaTool()}
      </div>
    </div>
  );
};

export default BankTradeTools;
