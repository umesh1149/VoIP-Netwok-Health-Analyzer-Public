import React, { useState } from 'react';
import { X, Server, Check } from 'lucide-react';

interface ServerConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentServer: string;
  onSave: (newServer: string) => void;
}

export const ServerConfigModal: React.FC<ServerConfigModalProps> = ({
  isOpen,
  onClose,
  currentServer,
  onSave,
}) => {
  const [serverInput, setServerInput] = useState(currentServer);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (serverInput.trim()) {
      onSave(serverInput.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Target PBXware Server</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Enter the PBXware server hostname or IPv4 address to target for SIP/RTP reachability, jitter probing, and diagnostic reports.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1.5">
              PBXware IP or Hostname
            </label>
            <input
              type="text"
              value={serverInput}
              onChange={(e) => setServerInput(e.target.value)}
              placeholder="e.g. 108.60.153.162 or pbx.company.com"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-900/40 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Update Target Server</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
