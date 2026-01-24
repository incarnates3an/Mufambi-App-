
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, AlertTriangle, Flag, Ban, Image, CheckCircle, Shield, MessageSquare, Download } from 'lucide-react';
import { Message, DriverBid, ReportReason, Report } from '../../types';

interface MessageCenterProps {
  driver: DriverBid;
  currentUserId: string;
  currentUserName: string;
  rideId: string;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onReportDriver: (report: Omit<Report, 'id' | 'timestamp' | 'status'>) => void;
  onBlockDriver: (driverId: string) => void;
  onClose: () => void;
}

const MessageCenter: React.FC<MessageCenterProps> = ({
  driver,
  currentUserId,
  currentUserName,
  rideId,
  messages,
  onSendMessage,
  onReportDriver,
  onBlockDriver,
  onClose
}) => {
  const [inputText, setInputText] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>(ReportReason.HARASSMENT);
  const [reportDescription, setReportDescription] = useState('');
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReport = () => {
    if (!reportDescription.trim()) {
      alert('Please provide a description of the incident');
      return;
    }

    onReportDriver({
      reporterId: currentUserId,
      reporterName: currentUserName,
      reporterRole: 'passenger',
      reportedUserId: driver.id,
      reportedUserName: driver.driverName,
      reportedUserRole: 'driver',
      reason: reportReason,
      description: reportDescription,
      rideId: rideId,
      messageHistory: messages // Preserve all messages as evidence
    });

    setReportSubmitted(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportSubmitted(false);
      setReportDescription('');
    }, 2000);
  };

  const handleBlock = () => {
    onBlockDriver(driver.id);
    setShowBlockConfirm(false);
    onClose();
  };

  const downloadChatHistory = () => {
    const chatText = messages.map(msg =>
      `[${new Date(msg.timestamp).toLocaleString()}] ${msg.senderName}: ${msg.text}`
    ).join('\n');

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ride-${rideId}-chat-history.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-black uppercase tracking-tight text-sm">{driver.driverName}</h3>
            <div className="flex items-center gap-2">
              <p className="text-[8px] text-indigo-300 font-black uppercase tracking-widest">{driver.carModel}</p>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`w-1 h-1 rounded-full ${i < Math.floor(driver.rating) ? 'bg-amber-400' : 'bg-gray-600'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadChatHistory}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
            title="Download chat history"
          >
            <Download className="w-4 h-4 text-gray-400" />
          </button>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="px-4 py-3 bg-amber-500/10 border-b border-amber-500/20">
        <div className="flex items-start gap-3">
          <Shield className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] text-amber-400 font-black uppercase tracking-wider">Safety Protection Active</p>
            <p className="text-[8px] text-amber-200/80 font-bold mt-1 leading-relaxed">
              All messages are permanently saved and encrypted. Screenshot evidence is preserved. Any harassment will result in immediate driver suspension.
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div ref={messageContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 scroll-hide">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <div className="p-4 bg-white/5 rounded-full">
              <MessageSquare className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-xs text-gray-500 font-black uppercase tracking-widest">No messages yet</p>
            <p className="text-[10px] text-gray-600 max-w-xs">
              Start a conversation with your driver. All messages are saved and can be used as evidence if needed.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              const isOwnMessage = msg.senderId === currentUserId;
              return (
                <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[75%] ${isOwnMessage ? 'bg-indigo-600' : 'bg-[#1a1a1f] border border-white/10'} rounded-2xl ${isOwnMessage ? 'rounded-br-none' : 'rounded-bl-none'} overflow-hidden shadow-lg`}>
                    <div className="px-4 py-2">
                      {!isOwnMessage && (
                        <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1">{msg.senderName}</p>
                      )}
                      <p className="text-sm text-white leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>
                    <div className={`px-4 py-1 ${isOwnMessage ? 'bg-indigo-700/50' : 'bg-black/20'} flex items-center justify-between`}>
                      <span className="text-[9px] text-gray-400 font-bold">{formatTime(msg.timestamp)}</span>
                      <span className="text-[8px] text-gray-500 font-black uppercase tracking-wider">Saved</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Report & Block Buttons */}
      <div className="px-4 py-2 bg-[#0a0a0c] border-t border-white/5 flex gap-2">
        <button
          onClick={() => setShowReportModal(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600/20 border border-red-500/30 rounded-2xl text-red-400 hover:bg-red-600/30 transition-all active:scale-95"
        >
          <Flag className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Report Driver</span>
        </button>
        <button
          onClick={() => setShowBlockConfirm(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:bg-white/10 transition-all active:scale-95"
        >
          <Ban className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Block Driver</span>
        </button>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#050505] border-t border-white/10">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-[#1a1a1f] border border-white/10 rounded-2xl px-4 py-3 focus-within:border-indigo-500/50 transition-all">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full bg-transparent text-white text-sm outline-none resize-none placeholder:text-gray-600 max-h-24"
              rows={1}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[8px] text-gray-600 font-bold mt-2 text-center">Messages are encrypted and permanently saved as evidence</p>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f0f12] border border-red-500/30 rounded-[3rem] p-6 max-w-md w-full animate-in zoom-in duration-300">
            {reportSubmitted ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-600/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Report Submitted</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Your report has been received and is under review. All messages have been preserved as evidence. We take safety seriously.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-600/20 border border-red-500/30 rounded-2xl">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Report Driver</h3>
                  </div>
                  <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-white/5 rounded-full">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Reason for Report</label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value as ReportReason)}
                      className="w-full bg-[#1a1a1f] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:border-red-500/50 transition-all"
                    >
                      {Object.values(ReportReason).map((reason) => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description (Required)</label>
                    <textarea
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Please provide details about the incident. Be as specific as possible..."
                      className="w-full bg-[#1a1a1f] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:border-red-500/50 transition-all resize-none h-32"
                    />
                  </div>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                    <p className="text-[9px] text-amber-400 font-bold leading-relaxed">
                      <strong>Evidence Preserved:</strong> All {messages.length} message(s) from this ride will be included as evidence. You can also screenshot this chat for additional proof.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowReportModal(false)}
                      className="flex-1 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReport}
                      className="flex-1 py-3 bg-red-600 border border-red-500 rounded-2xl text-white font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all active:scale-95"
                    >
                      Submit Report
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {showBlockConfirm && (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f0f12] border border-white/10 rounded-[3rem] p-6 max-w-sm w-full animate-in zoom-in duration-300">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 border-2 border-white/10 rounded-full flex items-center justify-center mx-auto">
                <Ban className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Block Driver?</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                You will no longer receive ride requests from {driver.driverName}. This action can be reversed in settings.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowBlockConfirm(false)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlock}
                  className="flex-1 py-3 bg-red-600 border border-red-500 rounded-2xl text-white font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all active:scale-95"
                >
                  Block Driver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageCenter;
