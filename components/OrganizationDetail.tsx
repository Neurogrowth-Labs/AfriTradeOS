import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Shield,
  CheckCircle,
  MessageSquare,
  UserPlus,
  Building,
  FileText,
  Award,
  TrendingUp,
  Package,
  Clock,
  Users,
  ExternalLink,
  Heart,
  Share2,
  Flag,
  Loader2
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { DbOrganization } from '../types';

interface OrganizationDetailProps {
  organizationId: string;
  onBack: () => void;
}

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export const OrganizationDetail: React.FC<OrganizationDetailProps> = ({ organizationId, onBack }) => {
  const [organization, setOrganization] = useState<DbOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'reviews' | 'certifications'>('overview');
  const [isSaved, setIsSaved] = useState(false);

  const mockReviews: Review[] = [
    { id: '1', user_name: 'John Mensah', rating: 5, comment: 'Excellent partner for cocoa exports. Very reliable and professional.', created_at: '2024-10-15' },
    { id: '2', user_name: 'Amina Diallo', rating: 4, comment: 'Good communication and timely delivery. Would work with again.', created_at: '2024-09-28' },
    { id: '3', user_name: 'Kwame Asante', rating: 5, comment: 'Best supplier in the region. Highly recommended for bulk orders.', created_at: '2024-09-10' },
  ];

  const mockProducts = [
    { id: '1', name: 'Premium Cocoa Beans', price: '$2,500/ton', origin: 'Ghana', hsCode: '1801.00' },
    { id: '2', name: 'Shea Butter (Refined)', price: '$1,800/ton', origin: 'Ghana', hsCode: '1515.90' },
    { id: '3', name: 'Cashew Nuts (Raw)', price: '$3,200/ton', origin: 'Ivory Coast', hsCode: '0801.31' },
  ];

  const mockCertifications = [
    { id: '1', name: 'Fair Trade Certified', issuer: 'Fairtrade International', validUntil: '2025-12-31', status: 'active' },
    { id: '2', name: 'ISO 9001:2015', issuer: 'SGS', validUntil: '2025-06-30', status: 'active' },
    { id: '3', name: 'HACCP', issuer: 'FDA Ghana', validUntil: '2024-12-31', status: 'expiring' },
  ];

  useEffect(() => {
    fetchOrganization();
  }, [organizationId]);

  const fetchOrganization = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();

      if (error) throw error;
      setOrganization(data);
    } catch (e) {
      console.error('Failed to fetch organization:', e);
      // Use mock data for demo
      setOrganization({
        id: organizationId,
        name: 'Cocoa Processing Co.',
        type: 'buyer',
        location: 'Accra, Ghana',
        verification_status: true,
        rating: 4.8,
        reviews_count: 124,
        tags: ['Agro-Processing', 'Bulk Buyer', 'Fair Trade'],
        description: 'Leading processor of high-quality cocoa beans seeking reliable regional suppliers. We have been in the cocoa business for over 25 years and work with farmers across West Africa.',
        logo_initial: 'C'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    alert('Connection request sent!');
  };

  const handleMessage = () => {
    alert('Opening secure chat...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-trade-primary" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Organization not found</p>
        <button onClick={onBack} className="mt-4 text-trade-primary hover:underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-trade-primary transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Marketplace</span>
      </button>

      {/* Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-trade-primary to-trade-secondary" />
        
        <div className="p-6 -mt-12">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo */}
            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-lg flex items-center justify-center text-3xl font-bold text-trade-primary">
              {organization.logo_initial || organization.name.charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold font-heading text-trade-primary dark:text-white">
                      {organization.name}
                    </h1>
                    {organization.verification_status && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {organization.location}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSaved(!isSaved)}
                    className={`p-2 rounded-lg border transition-colors ${
                      isSaved
                        ? 'bg-red-50 border-red-200 text-red-500'
                        : 'border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }}
                    className="p-2 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-amber-500 fill-current" />
                  <span className="font-bold text-trade-primary dark:text-white">{organization.rating}</span>
                  <span className="text-sm text-gray-500">({organization.reviews_count} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  Member since 2019
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Package className="w-4 h-4" />
                  150+ trades completed
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {(organization.tags || []).map(tag => (
                  <span
                    key={tag}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
            <button
              onClick={handleConnect}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-trade-primary hover:bg-trade-primary/90 text-white font-bold rounded-xl transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Connect
            </button>
            <button
              onClick={handleMessage}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-trade-primary text-trade-primary hover:bg-trade-primary/5 font-bold rounded-xl transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              Message
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {(['overview', 'products', 'reviews', 'certifications'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-700 text-trade-primary shadow-sm'
                : 'text-gray-500 hover:text-trade-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* About */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold font-heading text-trade-primary dark:text-white mb-4">
                  About
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {organization.description}
                </p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Trades', value: '156', icon: Package, color: 'text-blue-600 bg-blue-100' },
                  { label: 'Success Rate', value: '98%', icon: TrendingUp, color: 'text-green-600 bg-green-100' },
                  { label: 'Avg Response', value: '2h', icon: Clock, color: 'text-orange-600 bg-orange-100' },
                  { label: 'Partners', value: '45', icon: Users, color: 'text-purple-600 bg-purple-100' },
                ].map(metric => (
                  <div key={metric.label} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
                    <div className={`w-10 h-10 rounded-lg ${metric.color} flex items-center justify-center mb-3`}>
                      <metric.icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-bold text-trade-primary dark:text-white">{metric.value}</p>
                    <p className="text-xs text-gray-500">{metric.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'products' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
              <h2 className="text-lg font-bold font-heading text-trade-primary dark:text-white mb-4">
                Products & Services
              </h2>
              <div className="space-y-4">
                {mockProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <div>
                      <h3 className="font-bold text-trade-primary dark:text-white">{product.name}</h3>
                      <p className="text-sm text-gray-500">HS Code: {product.hsCode} • Origin: {product.origin}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-trade-success">{product.price}</p>
                      <button onClick={() => alert('Quote request sent! The supplier will contact you soon.')} className="text-xs text-trade-primary hover:underline">Request Quote</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
              <h2 className="text-lg font-bold font-heading text-trade-primary dark:text-white mb-4">
                Reviews ({organization.reviews_count})
              </h2>
              <div className="space-y-4">
                {mockReviews.map(review => (
                  <div key={review.id} className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-trade-primary text-white flex items-center justify-center text-sm font-bold">
                          {review.user_name.charAt(0)}
                        </div>
                        <span className="font-medium text-trade-primary dark:text-white">{review.user_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-amber-500 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>
                    <p className="text-xs text-gray-400 mt-2">{review.created_at}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'certifications' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
              <h2 className="text-lg font-bold font-heading text-trade-primary dark:text-white mb-4">
                Certifications & Licenses
              </h2>
              <div className="space-y-4">
                {mockCertifications.map(cert => (
                  <div key={cert.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                        <Award className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-trade-primary dark:text-white">{cert.name}</h3>
                        <p className="text-sm text-gray-500">Issued by: {cert.issuer}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        cert.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {cert.status === 'active' ? 'Active' : 'Expiring Soon'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">Valid until: {cert.validUntil}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">+233 20 123 4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">contact@cocoaprocessing.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Globe className="w-4 h-4 text-gray-400" />
                <a href="#" className="text-trade-primary hover:underline flex items-center gap-1">
                  www.cocoaprocessing.com
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Trust & Safety */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Trust & Safety</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Identity Verified</span>
              </div>
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Business Registered</span>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Trade License Valid</span>
              </div>
            </div>
          </div>

          {/* Report */}
          <button 
            onClick={() => alert('Report submitted. Our team will review this organization.')}
            className="w-full flex items-center justify-center gap-2 p-3 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
          >
            <Flag className="w-4 h-4" />
            Report this organization
          </button>
        </div>
      </div>
    </div>
  );
};
