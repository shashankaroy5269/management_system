import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { RoleBadge } from '../common/Badge';

export const TaskComments = ({ comments = [], onAddComment, isSubmitting = false }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAddComment(text);
    setText('');
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        <h4 className="font-bold text-slate-900 text-sm">Discussion Thread ({comments.length})</h4>
      </div>

      {/* Comments List */}
      <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1 mb-4">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center italic">
            No discussion comments yet. Be the first to share an update!
          </p>
        ) : (
          comments.map((comment, index) => {
            const dateStr = new Date(comment.createdAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div key={comment._id || index} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 bg-slate-50 border border-slate-200/90 rounded-xl p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {comment.user?.name || 'Unknown User'}
                      </span>
                      {comment.user?.role && <RoleBadge role={comment.user.role} />}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{dateStr}</span>
                  </div>
                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {comment.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Comment Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Write a message or update on this task..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!text.trim() || isSubmitting}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Post</span>
        </button>
      </form>
    </div>
  );
};
