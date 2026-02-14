import React, { useState } from 'react';
import {
  GitBranch,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  User,
  Calendar,
  ChevronRight,
  ArrowRight,
  FileText,
  Shield,
  DollarSign,
  Send,
  MessageSquare,
  Bell,
  Settings,
  Plus,
  X,
  Edit2
} from 'lucide-react';
import { WorkflowStage, WorkflowAction, WorkflowEvent, WorkflowTemplate } from './FinanceApplicationTypes';

interface WorkflowAutomationProps {
  applicationId: string;
  workflow: WorkflowStage;
  templates: WorkflowTemplate[];
  onActionComplete: (actionId: string) => Promise<void>;
  onActionAssign: (actionId: string, userId: string) => Promise<void>;
  onAddAction: (action: Omit<WorkflowAction, 'id'>) => Promise<void>;
  onApplyTemplate: (templateId: string) => Promise<void>;
}

const STAGE_ORDER = ['application', 'document_collection', 'verification', 'credit_assessment', 'approval', 'disbursement'];

const STAGE_INFO: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  application: { label: 'Application', icon: FileText, color: 'blue' },
  document_collection: { label: 'Document Collection', icon: FileText, color: 'purple' },
  verification: { label: 'Verification', icon: Shield, color: 'cyan' },
  credit_assessment: { label: 'Credit Assessment', icon: DollarSign, color: 'amber' },
  approval: { label: 'Approval', icon: CheckCircle2, color: 'green' },
  disbursement: { label: 'Disbursement', icon: Send, color: 'emerald' }
};

const ACTION_ICONS: Record<string, React.ElementType> = {
  upload_document: FileText,
  verify_document: Shield,
  credit_check: DollarSign,
  manager_approval: User,
  compliance_review: Shield,
  disbursement: Send
};

export const WorkflowAutomation: React.FC<WorkflowAutomationProps> = ({
  applicationId,
  workflow,
  templates,
  onActionComplete,
  onActionAssign,
  onAddAction,
  onApplyTemplate
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showAddAction, setShowAddAction] = useState(false);
  const [newAction, setNewAction] = useState<Partial<WorkflowAction>>({
    type: 'upload_document',
    description: '',
    status: 'pending'
  });
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const currentStageIndex = STAGE_ORDER.indexOf(workflow.currentStage);

  const handleCompleteAction = async (actionId: string) => {
    setProcessingAction(actionId);
    try {
      await onActionComplete(actionId);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleApplyTemplate = async () => {
    if (selectedTemplate) {
      await onApplyTemplate(selectedTemplate);
      setSelectedTemplate('');
    }
  };

  const handleAddAction = async () => {
    if (newAction.type && newAction.description) {
      await onAddAction(newAction as Omit<WorkflowAction, 'id'>);
      setNewAction({ type: 'upload_document', description: '', status: 'pending' });
      setShowAddAction(false);
    }
  };

  const getActionStatusStyle = (status: WorkflowAction['status']) => {
    switch (status) {
      case 'completed':
        return { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400', icon: CheckCircle2 };
      case 'in_progress':
        return { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400', icon: Play };
      case 'blocked':
        return { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400', icon: AlertCircle };
      default:
        return { bg: 'bg-slate-500/20', border: 'border-slate-500/30', text: 'text-slate-400', icon: Circle };
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Workflow Progress */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-blue-400" />
          Workflow Progress
        </h3>

        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-slate-700 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${((currentStageIndex + 1) / STAGE_ORDER.length) * 100}%` }}
            />
          </div>

          {/* Stages */}
          <div className="relative flex justify-between">
            {STAGE_ORDER.map((stage, index) => {
              const info = STAGE_INFO[stage];
              const Icon = info.icon;
              const isCompleted = workflow.completedStages.includes(stage);
              const isCurrent = workflow.currentStage === stage;
              const isPending = index > currentStageIndex;

              return (
                <div key={stage} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-blue-500 text-white ring-4 ring-blue-500/30'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                  </div>
                  <span className={`text-xs mt-3 text-center max-w-[80px] ${
                    isCurrent ? 'text-white font-medium' : isPending ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {info.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pending Actions */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Pending Actions
          </h3>
          <button
            onClick={() => setShowAddAction(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Action
          </button>
        </div>

        {workflow.pendingActions.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-slate-400">All actions completed for current stage</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workflow.pendingActions.map(action => {
              const ActionIcon = ACTION_ICONS[action.type] || Circle;
              const statusStyle = getActionStatusStyle(action.status);
              const StatusIcon = statusStyle.icon;

              return (
                <div
                  key={action.id}
                  className={`p-4 rounded-lg border ${statusStyle.bg} ${statusStyle.border}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-800 rounded-lg">
                        <ActionIcon className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{action.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className={`flex items-center gap-1 ${statusStyle.text}`}>
                            <StatusIcon className="w-4 h-4" />
                            {action.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          {action.assignedTo && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <User className="w-4 h-4" />
                              {action.assignedTo}
                            </span>
                          )}
                          {action.dueDate && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <Calendar className="w-4 h-4" />
                              Due: {new Date(action.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {action.status !== 'completed' && (
                        <button
                          onClick={() => handleCompleteAction(action.id)}
                          disabled={processingAction === action.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50"
                        >
                          {processingAction === action.id ? (
                            <RotateCcw className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Workflow Templates */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" />
          Workflow Templates
        </h3>

        <div className="flex items-center gap-4">
          <select
            value={selectedTemplate}
            onChange={e => setSelectedTemplate(e.target.value)}
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a template...</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name} ({template.applicationType.replace('_', ' ')})
              </option>
            ))}
          </select>
          <button
            onClick={handleApplyTemplate}
            disabled={!selectedTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            Apply Template
          </button>
        </div>

        {selectedTemplate && (
          <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
            {(() => {
              const template = templates.find(t => t.id === selectedTemplate);
              if (!template) return null;
              return (
                <div>
                  <p className="text-white font-medium mb-3">{template.name}</p>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {template.stages.map((stage, idx) => (
                      <React.Fragment key={stage.id}>
                        <div className="flex-shrink-0 p-3 bg-slate-700 rounded-lg min-w-[150px]">
                          <p className="text-sm text-white font-medium">{stage.name}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {stage.requiredDocuments.length} docs • {stage.slaHours}h SLA
                          </p>
                        </div>
                        {idx < template.stages.length - 1 && (
                          <ArrowRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          Activity Timeline
        </h3>

        {workflow.timeline.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No activity yet</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700" />
            <div className="space-y-4">
              {workflow.timeline.map((event, idx) => (
                <div key={event.id} className="relative flex items-start gap-4 pl-10">
                  <div className="absolute left-2.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-900" />
                  <div className="flex-1 p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium">{event.action}</p>
                      <span className="text-xs text-slate-500">{formatTimestamp(event.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="w-3 h-3 text-slate-500" />
                      <span className="text-sm text-slate-400">{event.actor}</span>
                    </div>
                    {event.details && (
                      <p className="text-sm text-slate-400 mt-2">{event.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Action Modal */}
      {showAddAction && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Add New Action</h3>
              <button
                onClick={() => setShowAddAction(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Action Type</label>
                <select
                  value={newAction.type}
                  onChange={e => setNewAction(prev => ({ ...prev, type: e.target.value as WorkflowAction['type'] }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="upload_document">Upload Document</option>
                  <option value="verify_document">Verify Document</option>
                  <option value="credit_check">Credit Check</option>
                  <option value="manager_approval">Manager Approval</option>
                  <option value="compliance_review">Compliance Review</option>
                  <option value="disbursement">Disbursement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={newAction.description}
                  onChange={e => setNewAction(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the action..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Assign To (Optional)</label>
                <input
                  type="text"
                  value={newAction.assignedTo || ''}
                  onChange={e => setNewAction(prev => ({ ...prev, assignedTo: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="User name or ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Due Date (Optional)</label>
                <input
                  type="date"
                  value={newAction.dueDate || ''}
                  onChange={e => setNewAction(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddAction(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAction}
                disabled={!newAction.description}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowAutomation;
