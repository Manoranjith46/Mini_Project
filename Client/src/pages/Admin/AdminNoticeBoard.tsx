import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Send, Users, UserCog, History } from "lucide-react";
import { toast } from "sonner";

const AdminNoticeBoard = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState<"managers" | "all">("managers");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      toast.success(`Announcement sent to ${targetAudience === 'managers' ? 'Managers' : 'Managers & Citizens'}`);
      setTitle("");
      setMessage("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Notice Board</h1>
          <p className="text-slate-500 mt-1">Broadcast announcements to users</p>
        </div>
        <Button variant="outline" className="gap-2 bg-white hover:bg-slate-50 text-slate-700">
          <History className="h-4 w-4" />
          View History
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">New Announcement</h2>
          
          <form onSubmit={handleSendAnnouncement} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <Input 
                placeholder="Announcement Title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
              <textarea 
                className="w-full min-h-[150px] p-3 rounded-md border border-input bg-transparent shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Write your announcement here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Target Audience</label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${targetAudience === 'managers' ? 'border-[var(--border-active)] bg-[var(--bg-page)] text-[var(--text-primary)] ring-1 ring-[var(--border-active)]' : 'border-[var(--border-default)] hover:bg-[var(--bg-page)]'}`}>
                  <input 
                    type="radio" 
                    name="audience" 
                    value="managers" 
                    checked={targetAudience === 'managers'}
                    onChange={() => setTargetAudience('managers')}
                    className="sr-only"
                  />
                  <UserCog className="h-5 w-5" />
                  <span className="font-medium">Managers Only</span>
                </label>
                
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${targetAudience === 'all' ? 'border-[var(--border-active)] bg-[var(--bg-page)] text-[var(--text-primary)] ring-1 ring-[var(--border-active)]' : 'border-[var(--border-default)] hover:bg-[var(--bg-page)]'}`}>
                  <input 
                    type="radio" 
                    name="audience" 
                    value="all" 
                    checked={targetAudience === 'all'}
                    onChange={() => setTargetAudience('all')}
                    className="sr-only"
                  />
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Managers & Citizens</span>
                </label>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="gap-2 btn-primary">
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Sending...' : 'Broadcast Announcement'}
              </Button>
            </div>
          </form>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Recent Announcements</h2>
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium text-slate-800 text-sm">System Maintenance</h3>
                <span className="text-xs text-slate-400">2 days ago</span>
              </div>
              <p className="text-xs text-slate-600 mb-2">Scheduled maintenance this weekend. System will be down for 2 hours.</p>
              <div className="flex items-center gap-1 text-[10px] text-[var(--text-primary)] font-medium bg-[var(--bg-page)] w-fit px-2 py-0.5 rounded-full border border-[var(--border-primary)]">
                <UserCog className="h-3 w-3" /> Managers Only
              </div>
            </div>
            
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium text-slate-800 text-sm">New Feature Release</h3>
                <span className="text-xs text-slate-400">1 week ago</span>
              </div>
              <p className="text-xs text-slate-600 mb-2">Citizens can now track the real-time status of their reported issues.</p>
              <div className="flex items-center gap-1 text-[10px] text-[var(--text-primary)] font-medium bg-[var(--bg-page)] w-fit px-2 py-0.5 rounded-full border border-[var(--border-primary)]">
                <Users className="h-3 w-3" /> All Users
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNoticeBoard;
