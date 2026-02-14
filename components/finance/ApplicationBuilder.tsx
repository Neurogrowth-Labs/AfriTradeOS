import React, { useState } from 'react';
import {
  FileText,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  DollarSign,
  Calendar,
  Ship,
  Plane,
  Truck,
  Train,
  Package,
  ChevronRight,
  ChevronLeft,
  Save,
  Send,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { ApplicationFormData, FinanceApplication } from './FinanceApplicationTypes';

interface ApplicationBuilderProps {
  onSubmit: (data: ApplicationFormData) => void;
  onSaveDraft: (data: ApplicationFormData) => void;
  initialData?: Partial<ApplicationFormData>;
}

const APPLICATION_TYPES = [
  { value: 'letter_of_credit', label: 'Letter of Credit', description: 'Documentary credit for international trade' },
  { value: 'trade_finance', label: 'Trade Finance', description: 'Pre/post shipment financing' },
  { value: 'export_credit', label: 'Export Credit', description: 'Credit facility for exporters' },
  { value: 'working_capital', label: 'Working Capital', description: 'Short-term business financing' },
  { value: 'invoice_financing', label: 'Invoice Financing', description: 'Advance against receivables' }
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'ZAR', 'NGN', 'KES', 'EGP', 'MAD', 'GHS', 'XOF', 'XAF'];

const INCOTERMS = ['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP'];

const AFRICAN_COUNTRIES = [
  'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Cape Verde',
  'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Côte d\'Ivoire', 'Djibouti', 'Egypt',
  'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea',
  'Guinea-Bissau', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali',
  'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda',
  'São Tomé and Príncipe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa',
  'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'
];

const STEPS = [
  { id: 1, title: 'Application Type', description: 'Select financing type' },
  { id: 2, title: 'Company Details', description: 'Business information' },
  { id: 3, title: 'Contact Info', description: 'Contact details' },
  { id: 4, title: 'Financing Details', description: 'Amount and terms' },
  { id: 5, title: 'Trade Information', description: 'Trade specifics' },
  { id: 6, title: 'Review & Submit', description: 'Final review' }
];

export const ApplicationBuilder: React.FC<ApplicationBuilderProps> = ({
  onSubmit,
  onSaveDraft,
  initialData
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ApplicationFormData>({
    applicantName: initialData?.applicantName || '',
    companyName: initialData?.companyName || '',
    registrationNumber: initialData?.registrationNumber || '',
    taxId: initialData?.taxId || '',
    address: initialData?.address || '',
    country: initialData?.country || '',
    contactPerson: initialData?.contactPerson || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    applicationType: initialData?.applicationType || 'letter_of_credit',
    amount: initialData?.amount || 0,
    currency: initialData?.currency || 'USD',
    tenor: initialData?.tenor || 90,
    purpose: initialData?.purpose || '',
    tradeDetails: initialData?.tradeDetails || {
      exporterCountry: '',
      importerCountry: '',
      goodsDescription: '',
      hsCode: '',
      incoterms: 'FOB',
      shippingMethod: 'sea',
      estimatedShipmentDate: ''
    },
    annualRevenue: initialData?.annualRevenue,
    yearsInBusiness: initialData?.yearsInBusiness,
    existingRelationship: initialData?.existingRelationship || false,
    previousFinancing: initialData?.previousFinancing || false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const updateTradeDetails = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      tradeDetails: { ...prev.tradeDetails, [field]: value }
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.applicationType) newErrors.applicationType = 'Please select an application type';
        break;
      case 2:
        if (!formData.companyName) newErrors.companyName = 'Company name is required';
        if (!formData.registrationNumber) newErrors.registrationNumber = 'Registration number is required';
        if (!formData.country) newErrors.country = 'Country is required';
        break;
      case 3:
        if (!formData.contactPerson) newErrors.contactPerson = 'Contact person is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Invalid email format';
        }
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        break;
      case 4:
        if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Valid amount is required';
        if (!formData.purpose) newErrors.purpose = 'Purpose is required';
        break;
      case 5:
        if (formData.applicationType !== 'working_capital') {
          if (!formData.tradeDetails?.goodsDescription) newErrors.goodsDescription = 'Goods description is required';
          if (!formData.tradeDetails?.exporterCountry) newErrors.exporterCountry = 'Exporter country is required';
          if (!formData.tradeDetails?.importerCountry) newErrors.importerCountry = 'Importer country is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onSubmit(formData);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {STEPS.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                currentStep > step.id
                  ? 'bg-green-500 text-white'
                  : currentStep === step.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : step.id}
            </div>
            <span className={`text-xs mt-2 ${currentStep >= step.id ? 'text-white' : 'text-slate-500'}`}>
              {step.title}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 ${currentStep > step.id ? 'bg-green-500' : 'bg-slate-700'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderApplicationTypeStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Select Application Type</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {APPLICATION_TYPES.map(type => (
          <button
            key={type.value}
            onClick={() => updateFormData('applicationType', type.value)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              formData.applicationType === type.value
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className={`w-6 h-6 ${formData.applicationType === type.value ? 'text-blue-400' : 'text-slate-400'}`} />
              <div>
                <p className={`font-medium ${formData.applicationType === type.value ? 'text-blue-400' : 'text-white'}`}>
                  {type.label}
                </p>
                <p className="text-sm text-slate-400">{type.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      {errors.applicationType && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <AlertCircle className="w-4 h-4" /> {errors.applicationType}
        </p>
      )}
    </div>
  );

  const renderCompanyDetailsStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Company Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Company Name *</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={formData.companyName}
              onChange={e => updateFormData('companyName', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.companyName ? 'border-red-500' : 'border-slate-600'
              }`}
              placeholder="Enter company name"
            />
          </div>
          {errors.companyName && <p className="text-red-400 text-xs mt-1">{errors.companyName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Registration Number *</label>
          <input
            type="text"
            value={formData.registrationNumber}
            onChange={e => updateFormData('registrationNumber', e.target.value)}
            className={`w-full px-4 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.registrationNumber ? 'border-red-500' : 'border-slate-600'
            }`}
            placeholder="Company registration number"
          />
          {errors.registrationNumber && <p className="text-red-400 text-xs mt-1">{errors.registrationNumber}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Tax ID</label>
          <input
            type="text"
            value={formData.taxId}
            onChange={e => updateFormData('taxId', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tax identification number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Country *</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={formData.country}
              onChange={e => updateFormData('country', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.country ? 'border-red-500' : 'border-slate-600'
              }`}
            >
              <option value="">Select country</option>
              {AFRICAN_COUNTRIES.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          {errors.country && <p className="text-red-400 text-xs mt-1">{errors.country}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-1">Address</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <textarea
              value={formData.address}
              onChange={e => updateFormData('address', e.target.value)}
              rows={2}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Business address"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Years in Business</label>
          <input
            type="number"
            value={formData.yearsInBusiness || ''}
            onChange={e => updateFormData('yearsInBusiness', parseInt(e.target.value) || undefined)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Number of years"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Annual Revenue</label>
          <input
            type="number"
            value={formData.annualRevenue || ''}
            onChange={e => updateFormData('annualRevenue', parseFloat(e.target.value) || undefined)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Annual revenue (USD)"
            min="0"
          />
        </div>
      </div>
    </div>
  );

  const renderContactInfoStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Contact Person *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={formData.contactPerson}
              onChange={e => updateFormData('contactPerson', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.contactPerson ? 'border-red-500' : 'border-slate-600'
              }`}
              placeholder="Full name"
            />
          </div>
          {errors.contactPerson && <p className="text-red-400 text-xs mt-1">{errors.contactPerson}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Applicant Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={formData.applicantName}
              onChange={e => updateFormData('applicantName', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="If different from contact person"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              value={formData.email}
              onChange={e => updateFormData('email', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-slate-600'
              }`}
              placeholder="email@company.com"
            />
          </div>
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Phone *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={e => updateFormData('phone', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? 'border-red-500' : 'border-slate-600'
              }`}
              placeholder="+1 234 567 8900"
            />
          </div>
          {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
        </div>

        <div className="md:col-span-2 flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.existingRelationship}
              onChange={e => updateFormData('existingRelationship', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-300">Existing bank relationship</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.previousFinancing}
              onChange={e => updateFormData('previousFinancing', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-300">Previous trade financing</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderFinancingDetailsStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Financing Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Amount *</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="number"
              value={formData.amount || ''}
              onChange={e => updateFormData('amount', parseFloat(e.target.value) || 0)}
              className={`w-full pl-10 pr-4 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.amount ? 'border-red-500' : 'border-slate-600'
              }`}
              placeholder="Enter amount"
              min="0"
            />
          </div>
          {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Currency</label>
          <select
            value={formData.currency}
            onChange={e => updateFormData('currency', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CURRENCIES.map(currency => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Tenor (Days)</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="number"
              value={formData.tenor}
              onChange={e => updateFormData('tenor', parseInt(e.target.value) || 90)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="90"
              min="1"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-1">Purpose *</label>
          <textarea
            value={formData.purpose}
            onChange={e => updateFormData('purpose', e.target.value)}
            rows={3}
            className={`w-full px-4 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.purpose ? 'border-red-500' : 'border-slate-600'
            }`}
            placeholder="Describe the purpose of this financing..."
          />
          {errors.purpose && <p className="text-red-400 text-xs mt-1">{errors.purpose}</p>}
        </div>
      </div>

      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm text-blue-300 font-medium">Indicative Terms</p>
            <p className="text-xs text-slate-400 mt-1">
              Based on your application type and amount, typical interest rates range from 6-12% p.a. 
              Final terms will be determined after credit assessment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTradeInfoStep = () => {
    const shippingMethods = [
      { value: 'sea', label: 'Sea Freight', icon: Ship },
      { value: 'air', label: 'Air Freight', icon: Plane },
      { value: 'road', label: 'Road Transport', icon: Truck },
      { value: 'rail', label: 'Rail Transport', icon: Train },
      { value: 'multimodal', label: 'Multimodal', icon: Package }
    ];

    if (formData.applicationType === 'working_capital') {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Additional Information</h3>
          <div className="p-4 bg-slate-800/50 border border-slate-600 rounded-lg">
            <p className="text-slate-300">
              Working capital financing does not require specific trade details. 
              Please proceed to review your application.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Trade Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Exporter Country *</label>
            <select
              value={formData.tradeDetails?.exporterCountry || ''}
              onChange={e => updateTradeDetails('exporterCountry', e.target.value)}
              className={`w-full px-4 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.exporterCountry ? 'border-red-500' : 'border-slate-600'
              }`}
            >
              <option value="">Select country</option>
              {AFRICAN_COUNTRIES.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            {errors.exporterCountry && <p className="text-red-400 text-xs mt-1">{errors.exporterCountry}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Importer Country *</label>
            <select
              value={formData.tradeDetails?.importerCountry || ''}
              onChange={e => updateTradeDetails('importerCountry', e.target.value)}
              className={`w-full px-4 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.importerCountry ? 'border-red-500' : 'border-slate-600'
              }`}
            >
              <option value="">Select country</option>
              {AFRICAN_COUNTRIES.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            {errors.importerCountry && <p className="text-red-400 text-xs mt-1">{errors.importerCountry}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-1">Goods Description *</label>
            <textarea
              value={formData.tradeDetails?.goodsDescription || ''}
              onChange={e => updateTradeDetails('goodsDescription', e.target.value)}
              rows={2}
              className={`w-full px-4 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.goodsDescription ? 'border-red-500' : 'border-slate-600'
              }`}
              placeholder="Describe the goods being traded..."
            />
            {errors.goodsDescription && <p className="text-red-400 text-xs mt-1">{errors.goodsDescription}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">HS Code</label>
            <input
              type="text"
              value={formData.tradeDetails?.hsCode || ''}
              onChange={e => updateTradeDetails('hsCode', e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 0901.11"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Incoterms</label>
            <select
              value={formData.tradeDetails?.incoterms || 'FOB'}
              onChange={e => updateTradeDetails('incoterms', e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {INCOTERMS.map(term => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Estimated Shipment Date</label>
            <input
              type="date"
              value={formData.tradeDetails?.estimatedShipmentDate || ''}
              onChange={e => updateTradeDetails('estimatedShipmentDate', e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Shipping Method</label>
            <div className="flex flex-wrap gap-2">
              {shippingMethods.map(method => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => updateTradeDetails('shippingMethod', method.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      formData.tradeDetails?.shippingMethod === method.value
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-slate-600 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReviewStep = () => {
    const selectedType = APPLICATION_TYPES.find(t => t.value === formData.applicationType);

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white mb-4">Review Application</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-800/50 border border-slate-600 rounded-lg">
            <h4 className="text-sm font-medium text-slate-400 mb-3">Application Type</h4>
            <p className="text-white font-medium">{selectedType?.label}</p>
            <p className="text-sm text-slate-400">{selectedType?.description}</p>
          </div>

          <div className="p-4 bg-slate-800/50 border border-slate-600 rounded-lg">
            <h4 className="text-sm font-medium text-slate-400 mb-3">Financing Amount</h4>
            <p className="text-2xl font-bold text-white">
              {formData.currency} {formData.amount.toLocaleString()}
            </p>
            <p className="text-sm text-slate-400">Tenor: {formData.tenor} days</p>
          </div>

          <div className="p-4 bg-slate-800/50 border border-slate-600 rounded-lg">
            <h4 className="text-sm font-medium text-slate-400 mb-3">Company Details</h4>
            <p className="text-white font-medium">{formData.companyName}</p>
            <p className="text-sm text-slate-400">{formData.country}</p>
            <p className="text-sm text-slate-400">Reg: {formData.registrationNumber}</p>
          </div>

          <div className="p-4 bg-slate-800/50 border border-slate-600 rounded-lg">
            <h4 className="text-sm font-medium text-slate-400 mb-3">Contact Information</h4>
            <p className="text-white font-medium">{formData.contactPerson}</p>
            <p className="text-sm text-slate-400">{formData.email}</p>
            <p className="text-sm text-slate-400">{formData.phone}</p>
          </div>

          {formData.applicationType !== 'working_capital' && formData.tradeDetails && (
            <div className="md:col-span-2 p-4 bg-slate-800/50 border border-slate-600 rounded-lg">
              <h4 className="text-sm font-medium text-slate-400 mb-3">Trade Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Route</p>
                  <p className="text-sm text-white">{formData.tradeDetails.exporterCountry} → {formData.tradeDetails.importerCountry}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Goods</p>
                  <p className="text-sm text-white">{formData.tradeDetails.goodsDescription}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Incoterms</p>
                  <p className="text-sm text-white">{formData.tradeDetails.incoterms}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Shipping</p>
                  <p className="text-sm text-white capitalize">{formData.tradeDetails.shippingMethod}</p>
                </div>
              </div>
            </div>
          )}

          <div className="md:col-span-2 p-4 bg-slate-800/50 border border-slate-600 rounded-lg">
            <h4 className="text-sm font-medium text-slate-400 mb-3">Purpose</h4>
            <p className="text-white">{formData.purpose}</p>
          </div>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
            <div>
              <p className="text-sm text-amber-300 font-medium">Before Submitting</p>
              <p className="text-xs text-slate-400 mt-1">
                Please review all information carefully. After submission, you will need to upload 
                supporting documents and the application will proceed to credit assessment.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderApplicationTypeStep();
      case 2: return renderCompanyDetailsStep();
      case 3: return renderContactInfoStep();
      case 4: return renderFinancingDetailsStep();
      case 5: return renderTradeInfoStep();
      case 6: return renderReviewStep();
      default: return null;
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
      {renderStepIndicator()}
      
      <div className="min-h-[400px]">
        {renderCurrentStep()}
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700">
        <button
          onClick={() => onSaveDraft(formData)}
          className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Draft
        </button>

        <div className="flex items-center gap-3">
          {currentStep > 1 && (
            <button
              onClick={handlePrevious}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
          )}

          {currentStep < STEPS.length ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
            >
              <Send className="w-4 h-4" />
              Submit Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationBuilder;
