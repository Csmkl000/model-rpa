/**
 * Model-RPA Notification Node
 * 通知节点组件
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface NotificationNodeData {
  label: string;
  notificationType: 'system' | 'email' | 'webhook' | 'sound';
  title: string;
  message: string;
  recipient?: string;
  webhookUrl?: string;
  soundFile?: string;
  status: 'idle' | 'sending' | 'sent' | 'failed';
}

const notificationTypeLabels: Record<string, string> = {
  system: '系统通知',
  email: '邮件',
  webhook: 'Webhook',
  sound: '声音',
};

const notificationTypeIcons: Record<string, string> = {
  system: '🔔',
  email: '📧',
  webhook: '🌐',
  sound: '🔊',
};

const statusColors: Record<string, string> = {
  idle: 'border-gray-300 bg-white',
  sending: 'border-blue-400 bg-blue-50',
  sent: 'border-green-400 bg-green-50',
  failed: 'border-red-400 bg-red-50',
};

export const NotificationNode = memo(({ data, selected }: NodeProps<NotificationNodeData>) => {
  const { label, notificationType, title, message, recipient, status } = data;

  return (
    <div
      className={`relative min-w-[200px] rounded-xl border-2 shadow-sm transition-all ${
        statusColors[status]
      } ${selected ? 'ring-2 ring-indigo-400 ring-offset-2' : ''}`}
    >
      {/* 输入连接点 */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
      />

      {/* 节点头部 */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-purple-50 rounded-t-xl">
        <span className="text-lg">{notificationTypeIcons[notificationType]}</span>
        <span className="text-sm font-medium text-purple-700">通知</span>

        {/* 状态指示器 */}
        {status === 'sending' && (
          <div className="ml-auto">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
          </div>
        )}
        {status === 'sent' && (
          <span className="ml-auto text-green-600 text-sm">✓ 已发送</span>
        )}
        {status === 'failed' && (
          <span className="ml-auto text-red-600 text-sm">✕ 失败</span>
        )}
      </div>

      {/* 节点内容 */}
      <div className="px-3 py-2">
        <div className="text-sm font-medium text-gray-900 mb-1">{label}</div>

        {/* 通知类型 */}
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
          <span>{notificationTypeIcons[notificationType]}</span>
          <span>{notificationTypeLabels[notificationType]}</span>
        </div>

        {/* 通知标题 */}
        {title && (
          <div className="text-xs text-gray-700 font-medium mb-1">
            {title}
          </div>
        )}

        {/* 通知消息 */}
        {message && (
          <div className="text-xs text-gray-500 truncate">
            {message}
          </div>
        )}

        {/* 收件人 */}
        {recipient && (
          <div className="text-xs text-gray-400 mt-1">
            收件人: {recipient}
          </div>
        )}
      </div>

      {/* 输出连接点 */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
      />
    </div>
  );
});

NotificationNode.displayName = 'NotificationNode';
