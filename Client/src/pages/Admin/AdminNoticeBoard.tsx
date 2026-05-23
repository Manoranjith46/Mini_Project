import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Send,
  Users,
  UserCog,
  Trash2,
  Edit,
  Bell,
  Search,
  Plus,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Notice {
  id: string;
  title: string;
  message: string;
  audience: "all" | "managers" | "citizens";
  createdAt: Date;
  status: "active" | "archived";
}

const AdminNoticeBoard = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState<"all" | "managers" | "citizens">("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([
    {
      id: "1",
      title: "System Maintenance",
      message: "Scheduled maintenance this weekend. System will be down for 2 hours.",
      audience: "managers",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: "active",
    },
    {
      id: "2",
      title: "New Feature Release",
      message: "Citizens can now track the real-time status of their reported issues with live updates.",
      audience: "all",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: "active",
    },
    {
      id: "3",
      title: "Policy Update",
      message: "Important update to issue reporting guidelines. Please review the new requirements.",
      audience: "managers",
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      status: "active",
    },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAudience, setFilterAudience] = useState<"all" | "managers" | "citizens" | "any">("any");
  const [showForm, setShowForm] = useState(false);

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAudience = filterAudience === "any" || notice.audience === filterAudience;
    return matchesSearch && matchesAudience && notice.status === "active";
  });

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newNotice: Notice = {
        id: Date.now().toString(),
        title,
        message,
        audience: targetAudience,
        createdAt: new Date(),
        status: "active",
      };
      setNotices([newNotice, ...notices]);
      toast.success(`Announcement sent to ${getAudienceLabel(targetAudience)}`);
      setTitle("");
      setMessage("");
      setTargetAudience("all");
      setShowForm(false);
      setIsSubmitting(false);
    }, 1000);
  };

  const handleDelete = (id: string) => {
    setNotices(notices.filter((n) => n.id !== id));
    toast.success("Notice deleted");
  };

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case "managers":
        return "Managers Only";
      case "citizens":
        return "Citizens Only";
      case "all":
        return "All Users";
      default:
        return audience;
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case "managers":
        return <UserCog className="w-4 h-4" />;
      case "citizens":
        return <Users className="w-4 h-4" />;
      case "all":
        return <Bell className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getAudienceBgColor = (audience: string) => {
    switch (audience) {
      case "managers":
        return "bg-emerald-100 text-emerald-800 border border-emerald-300";
      case "citizens":
        return "bg-purple-100 text-purple-800 border border-purple-300";
      case "all":
        return "bg-green-100 text-green-800 border border-green-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "just now";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-6"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
              Notice Board
            </h1>
            <p className="text-gray-600 mt-2">
              Broadcast important announcements to users
            </p>
          </div>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              New Announcement
            </Button>
          )}
        </motion.div>

        {/* Create Announcement Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Create New Announcement
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSendAnnouncement} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Announcement Title
                </label>
                <Input
                  placeholder="e.g., System Maintenance Notice"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border-gray-300"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Message
                </label>
                <textarea
                  className="w-full min-h-[150px] p-4 rounded-lg border border-gray-300 bg-white shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Write your announcement here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Target Audience */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Target Audience
                  </label>
                  <div className="space-y-2">
                    {["all", "managers", "citizens"].map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name="audience"
                          value={option}
                          checked={targetAudience === option}
                          onChange={() =>
                            setTargetAudience(
                              option as "all" | "managers" | "citizens"
                            )
                          }
                          className="w-4 h-4 accent-emerald-600"
                        />
                        <div className="flex items-center gap-2">
                          {getAudienceIcon(option)}
                          <span className="font-medium text-gray-700">
                            {getAudienceLabel(option)}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Sending..." : "Broadcast Announcement"}
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
            </div>

            {/* Audience Filter */}
            <div className="flex gap-2">
              {["any", "all", "managers", "citizens"].map((option) => (
                <Button
                  key={option}
                  variant={filterAudience === option ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setFilterAudience(
                      option as "any" | "all" | "managers" | "citizens"
                    )
                  }
                  className={
                    filterAudience === option
                      ? "bg-gradient-to-r from-emerald-700 to-green-600 text-white"
                      : ""
                  }
                >
                  {option === "any" ? "All" : getAudienceLabel(option)}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Announcements List */}
        <div className="space-y-4">
          {filteredNotices.length > 0 ? (
            filteredNotices.map((notice, index) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {notice.title}
                    </h3>

                    <p className="text-gray-600 mb-4 text-sm">{notice.message}</p>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getAudienceBgColor(notice.audience)}`}
                      >
                        {getAudienceIcon(notice.audience)}
                        {getAudienceLabel(notice.audience)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {timeAgo(notice.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-emerald-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-red-600"
                      onClick={() => handleDelete(notice.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No announcements found</p>
              <p className="text-gray-400 text-sm mt-2">
                Create your first announcement to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminNoticeBoard;
