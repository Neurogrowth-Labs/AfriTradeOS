import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  Globe,
  Building2,
  DollarSign,
  FileText,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Info,
  Target,
  Zap
} from 'lucide-react';
import { CreditAssessment, ScoreComponent, FinancialRatio, RiskFactor } from './FinanceApplicationTypes';

interface CreditScoringProps {
  applicationId: string;
  assessment: CreditAssessment | null;
  onRunAssessment: () => Promise<void>;
  onUpdateAssessment: (assessment: Partial<CreditAssessment>) => Promise<void>;
  isLoading?: boolean;
}

const SCORE_THRESHOLDS = {
  excellent: 800,
  good: 700,
  fair: 600,
  poor: 500
};

export const CreditScoring: React.FC<CreditScoringProps> = ({
  applicationId,
  assessment,
  onRunAssessment,
  onUpdateAssessment,
  isLoading = false
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['score', 'ratios', 'risks']));
  const [running, setRunning] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleRunAssessment = async () => {
    setRunning(true);
    try {
      await onRunAssessment();
    } finally {
      setRunning(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= SCORE_THRESHOLDS.excellent) return 'text-green-400';
    if (score >= SCORE_THRESHOLDS.good) return 'text-blue-400';
    if (score >= SCORE_THRESHOLDS.fair) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= SCORE_THRESHOLDS.excellent) return 'from-green-500 to-emerald-500';
    if (score >= SCORE_THRESHOLDS.good) return 'from-blue-500 to-cyan-500';
    if (score >= SCORE_THRESHOLDS.fair) return 'from-amber-500 to-yellow-500';
    return 'from-red-500 to-orange-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= SCORE_THRESHOLDS.excellent) return 'Excellent';
    if (score >= SCORE_THRESHOLDS.good) return 'Good';
    if (score >= SCORE_THRESHOLDS.fair) return 'Fair';
    if (score >= SCORE_THRESHOLDS.poor) return 'Poor';
    return 'Very Poor';
  };

  const getRecommendationStyle = (rec: CreditAssessment['recommendation']) => {
    switch (rec) {
      case 'approve':
        return { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400', icon: CheckCircle2 };
      case 'approve_with_conditions':
        return { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400', icon: Info };
      case 'refer':
        return { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400', icon: AlertTriangle };
      case 'decline':
        return { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400', icon: XCircle };
    }
  };

  const getRatioStatus = (ratio: FinancialRatio) => {
    switch (ratio.status) {
      case 'good':
        return { color: 'text-green-400', bg: 'bg-green-500', icon: TrendingUp };
      case 'acceptable':
        return { color: 'text-amber-400', bg: 'bg-amber-500', icon: Activity };
      case 'poor':
        return { color: 'text-red-400', bg: 'bg-red-500', icon: TrendingDown };
    }
  };

  const getRiskSeverityStyle = (severity: RiskFactor['severity']) => {
    switch (severity) {
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  const getRiskCategoryIcon = (category: RiskFactor['category']) => {
    switch (category) {
      case 'country': return Globe;
      case 'industry': return Building2;
      case 'financial': return DollarSign;
      case 'operational': return Activity;
      case 'compliance': return Shield;
    }
  };

  if (!assessment) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Credit Assessment</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Run an AI-powered credit assessment to evaluate the applicant's creditworthiness, 
            financial health, and risk profile.
          </p>
          <button
            onClick={handleRunAssessment}
            disabled={running || isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {running ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Running Assessment...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Run Credit Assessment
              </>
            )}
          </button>
          <p className="text-xs text-slate-500 mt-4">
            Assessment includes credit score, financial ratios, and risk analysis
          </p>
        </div>
      </div>
    );
  }

  const recStyle = getRecommendationStyle(assessment.recommendation);
  const RecIcon = recStyle.icon;

  return (
    <div className="space-y-6">
      {/* Credit Score Overview */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Credit Score
          </h3>
          <button
            onClick={handleRunAssessment}
            disabled={running}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-800 text-slate-300 rounded-lg hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Score */}
          <div className="md:col-span-1">
            <div className="relative">
              <div className="w-40 h-40 mx-auto">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#scoreGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(assessment.creditScore / 1000) * 283} 283`}
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" className={`${getScoreGradient(assessment.creditScore).split(' ')[0].replace('from-', 'text-')}`} stopColor="currentColor" />
                      <stop offset="100%" className={`${getScoreGradient(assessment.creditScore).split(' ')[1].replace('to-', 'text-')}`} stopColor="currentColor" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-bold ${getScoreColor(assessment.creditScore)}`}>
                    {assessment.creditScore}
                  </span>
                  <span className="text-sm text-slate-400">/ 1000</span>
                </div>
              </div>
              <p className={`text-center mt-4 font-medium ${getScoreColor(assessment.creditScore)}`}>
                {getScoreLabel(assessment.creditScore)}
              </p>
            </div>
          </div>

          {/* Recommendation */}
          <div className="md:col-span-2">
            <div className={`p-4 rounded-lg border ${recStyle.bg} ${recStyle.border}`}>
              <div className="flex items-start gap-3">
                <RecIcon className={`w-6 h-6 ${recStyle.text} mt-0.5`} />
                <div>
                  <p className={`font-semibold ${recStyle.text}`}>
                    {assessment.recommendation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  {assessment.conditions && assessment.conditions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-slate-400 mb-1">Conditions:</p>
                      <ul className="space-y-1">
                        {assessment.conditions.map((condition, idx) => (
                          <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-slate-500">•</span>
                            {condition}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-500">Assessment Date</p>
                <p className="text-white">{new Date(assessment.assessmentDate).toLocaleDateString()}</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-500">Assessed By</p>
                <p className="text-white">{assessment.assessedBy}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="bg-slate-900 rounded-xl border border-slate-700">
        <button
          onClick={() => toggleSection('score')}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-400" />
            Score Breakdown
          </h3>
          {expandedSections.has('score') ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {expandedSections.has('score') && (
          <div className="p-4 pt-0 space-y-4">
            {assessment.scoreBreakdown.map((component, idx) => (
              <div key={idx} className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{component.category}</span>
                  <span className="text-slate-400 text-sm">
                    {component.score} / {component.maxScore} ({Math.round(component.weight * 100)}% weight)
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient((component.score / component.maxScore) * 1000)}`}
                    style={{ width: `${(component.score / component.maxScore) * 100}%` }}
                  />
                </div>
                {component.factors.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {component.factors.map((factor, fIdx) => (
                      <span key={fIdx} className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded">
                        {factor}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Financial Ratios */}
      <div className="bg-slate-900 rounded-xl border border-slate-700">
        <button
          onClick={() => toggleSection('ratios')}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Financial Ratios
          </h3>
          {expandedSections.has('ratios') ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {expandedSections.has('ratios') && (
          <div className="p-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessment.financialRatios.map((ratio, idx) => {
                const status = getRatioStatus(ratio);
                const StatusIcon = status.icon;
                const percentage = Math.min((ratio.value / ratio.benchmark) * 100, 150);

                return (
                  <div key={idx} className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-medium">{ratio.name}</span>
                      <div className={`flex items-center gap-1 ${status.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-sm capitalize">{ratio.status}</span>
                      </div>
                    </div>
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Value: {ratio.value.toFixed(2)}</span>
                          <span>Benchmark: {ratio.benchmark.toFixed(2)}</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden relative">
                          <div
                            className={`h-full rounded-full ${status.bg}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-white"
                            style={{ left: '66.67%' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Risk Factors */}
      <div className="bg-slate-900 rounded-xl border border-slate-700">
        <button
          onClick={() => toggleSection('risks')}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            Risk Factors
          </h3>
          {expandedSections.has('risks') ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {expandedSections.has('risks') && (
          <div className="p-4 pt-0 space-y-3">
            {assessment.riskFactors.map((risk, idx) => {
              const CategoryIcon = getRiskCategoryIcon(risk.category);
              return (
                <div key={idx} className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-700 rounded-lg">
                      <CategoryIcon className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium capitalize">{risk.category} Risk</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${getRiskSeverityStyle(risk.severity)}`}>
                          {risk.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">{risk.description}</p>
                      {risk.mitigants && risk.mitigants.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-slate-500 mb-1">Mitigants:</p>
                          <ul className="space-y-1">
                            {risk.mitigants.map((mitigant, mIdx) => (
                              <li key={mIdx} className="text-xs text-slate-400 flex items-start gap-1">
                                <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                                {mitigant}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditScoring;
