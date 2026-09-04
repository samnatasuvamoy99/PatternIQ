"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import {
  Users,
  User,
  Shield,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Mail,
  Copy,
  Check,
  Calendar,
  BookOpen,
  MessageSquare,
  Code2,
  ShieldCheck,
  UserCheck,
  UserX,
  X,
  Eye,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  isActive: boolean;
  avatar?: string | null;
  bio?: string | null;
  createdAt: string;
  _count?: {
    articles: number;
    comments: number;
    problemProgress: number;
  };
}

interface AdminUsersTabProps {
  currentAdminId?: string;
  onShowSuccess: (msg: string) => void;
  onShowError: (msg: string) => void;
  onUserCountChange?: (count: number) => void;
}

export function AdminUsersTab({
  currentAdminId,
  onShowSuccess,
  onShowError,
  onUserCountChange,
}: AdminUsersTabProps) {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "STUDENT" | "ADMIN">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Modal states
  const [inspectUser, setInspectUser] = useState<AdminUserRecord | null>(null);
  const [userToToggleStatus, setUserToToggleStatus] = useState<AdminUserRecord | null>(null);
  const [userToChangeRole, setUserToChangeRole] = useState<AdminUserRecord | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Load all users
  const fetchUsers = async (searchParam?: string) => {
    setIsLoading(true);
    try {
      const endpoint = searchParam ? `/admin/users?search=${encodeURIComponent(searchParam)}` : "/admin/users";
      const res = await apiClient<AdminUserRecord[]>(endpoint);
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
        if (onUserCountChange) {
          onUserCountChange(res.data.length);
        }
      } else {
        onShowError(res.error?.message || "Failed to load registered users");
      }
    } catch (err: any) {
      onShowError(err?.message || "Error fetching registered users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered list
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return users.filter((u) => {
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q);

      const matchesRole =
        roleFilter === "ALL" || u.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && u.isActive) ||
        (statusFilter === "INACTIVE" && !u.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const admins = users.filter((u) => u.role === "ADMIN").length;
    const students = users.filter((u) => u.role === "STUDENT").length;
    return { total, active, inactive: total - active, admins, students };
  }, [users]);

  // Copy email to clipboard
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Toggle active status (activate / deactivate)
  const handleConfirmToggleStatus = async () => {
    if (!userToToggleStatus) return;
    if (userToToggleStatus.id === currentAdminId) {
      onShowError("You cannot deactivate your own administrative account.");
      setUserToToggleStatus(null);
      return;
    }

    setIsProcessingAction(true);
    const targetStatus = !userToToggleStatus.isActive;
    const endpoint = targetStatus
      ? `/admin/users/${userToToggleStatus.id}/activate`
      : `/admin/users/${userToToggleStatus.id}/deactivate`;

    try {
      const res = await apiClient(endpoint, { method: "PATCH" });
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userToToggleStatus.id ? { ...u, isActive: targetStatus } : u))
        );
        if (inspectUser && inspectUser.id === userToToggleStatus.id) {
          setInspectUser({ ...inspectUser, isActive: targetStatus });
        }
        onShowSuccess(
          `User "${userToToggleStatus.name}" has been ${targetStatus ? "activated" : "deactivated"}.`
        );
        setUserToToggleStatus(null);
      } else {
        onShowError(res.error?.message || "Failed to update user account status");
      }
    } catch (err: any) {
      onShowError(err?.message || "Network error updating status");
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Change user role (STUDENT <-> ADMIN)
  const handleConfirmChangeRole = async () => {
    if (!userToChangeRole) return;
    if (userToChangeRole.id === currentAdminId) {
      onShowError("You cannot change the role of your own administrative account.");
      setUserToChangeRole(null);
      return;
    }

    setIsProcessingAction(true);
    const nextRole: "STUDENT" | "ADMIN" = userToChangeRole.role === "ADMIN" ? "STUDENT" : "ADMIN";

    try {
      const res = await apiClient(`/admin/users/${userToChangeRole.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: nextRole }),
      });
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userToChangeRole.id ? { ...u, role: nextRole } : u))
        );
        if (inspectUser && inspectUser.id === userToChangeRole.id) {
          setInspectUser({ ...inspectUser, role: nextRole });
        }
        onShowSuccess(
          `User "${userToChangeRole.name}" role changed to ${nextRole}.`
        );
        setUserToChangeRole(null);
      } else {
        onShowError(res.error?.message || "Failed to update user role");
      }
    } catch (err: any) {
      onShowError(err?.message || "Network error updating role");
    } finally {
      setIsProcessingAction(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || "U";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Registered Users</h2>
            <Badge variant="secondary" className="font-mono text-xs">
              {stats.total} Total
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            View all registered platform accounts, inspect learner progress, and manage role permissions.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => fetchUsers(searchQuery)}
          disabled={isLoading}
          className="gap-1.5 text-xs h-9 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
          <span>Refresh List</span>
        </Button>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border/70 bg-card/60 p-3.5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
            <Users className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground font-medium truncate">Total Users</div>
            <div className="text-lg font-bold font-mono text-foreground">{stats.total}</div>
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card/60 p-3.5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground font-medium truncate">Active Accounts</div>
            <div className="text-lg font-bold font-mono text-emerald-500">{stats.active}</div>
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card/60 p-3.5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
            <Shield className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground font-medium truncate">Administrators</div>
            <div className="text-lg font-bold font-mono text-purple-400">{stats.admins}</div>
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card/60 p-3.5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500 shrink-0">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground font-medium truncate">Students</div>
            <div className="text-lg font-bold font-mono text-sky-400">{stats.students}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 bg-card/70 backdrop-blur-sm border-border">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name, email, or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 text-xs h-9 bg-background/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Role Filter */}
            <div className="flex items-center rounded-lg border border-border bg-background/50 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setRoleFilter("ALL")}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium",
                  roleFilter === "ALL"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All Roles
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter("STUDENT")}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium",
                  roleFilter === "STUDENT"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Students ({stats.students})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter("ADMIN")}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium",
                  roleFilter === "ADMIN"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Admins ({stats.admins})
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex items-center rounded-lg border border-border bg-background/50 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium",
                  statusFilter === "ALL"
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All Status
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("ACTIVE")}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium",
                  statusFilter === "ACTIVE"
                    ? "bg-emerald-500/20 text-emerald-400 font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("INACTIVE")}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium",
                  statusFilter === "INACTIVE"
                    ? "bg-destructive/20 text-destructive font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Suspended
              </button>
            </div>
          </div>
        </div>

        {/* Showing count indicator */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-3 pt-2 border-t border-border/50">
          <span>
            Showing <strong className="text-foreground">{filteredUsers.length}</strong> of{" "}
            <strong>{users.length}</strong> registered users
          </span>
          {(searchQuery || roleFilter !== "ALL" || statusFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("ALL");
                setStatusFilter("ALL");
              }}
              className="text-primary hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      </Card>

      {/* Users List / Table */}
      <Card className="overflow-hidden border-border">
        {isLoading ? (
          <div className="p-16 text-center space-y-3">
            <Loader2 className="h-7 w-7 animate-spin mx-auto text-primary" />
            <p className="text-xs text-muted-foreground">Loading registered users from database...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="divide-y divide-border/60">
            {filteredUsers.map((userItem) => {
              const isCurrentUser = userItem.id === currentAdminId;
              const initials = getInitials(userItem.name);

              return (
                <div
                  key={userItem.id}
                  className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-muted/15 transition-colors"
                >
                  {/* User Identity Column */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    {/* Avatar Initials Badge */}
                    <div
                      className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center text-xs font-bold font-mono shrink-0 shadow-sm",
                        userItem.role === "ADMIN"
                          ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white"
                          : "bg-gradient-to-br from-blue-600 to-cyan-600 text-white"
                      )}
                    >
                      {userItem.avatar ? (
                        <img
                          src={userItem.avatar}
                          alt={userItem.name}
                          className="h-full w-full rounded-xl object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>

                    {/* Name, Email, Tags */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground truncate">
                          {userItem.name}
                        </span>

                        {isCurrentUser && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/30"
                          >
                            You
                          </Badge>
                        )}

                        <Badge
                          variant={userItem.role === "ADMIN" ? "default" : "secondary"}
                          className={cn(
                            "text-[10px] px-1.5 py-0 gap-1",
                            userItem.role === "ADMIN"
                              ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {userItem.role === "ADMIN" ? (
                            <Shield className="h-2.5 w-2.5" />
                          ) : (
                            <User className="h-2.5 w-2.5" />
                          )}
                          <span>{userItem.role}</span>
                        </Badge>

                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-1.5 py-0 gap-1",
                            userItem.isActive
                              ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
                              : "text-destructive border-destructive/30 bg-destructive/10"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              userItem.isActive ? "bg-emerald-500" : "bg-destructive"
                            )}
                          />
                          <span>{userItem.isActive ? "Active" : "Suspended"}</span>
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <span className="truncate max-w-[220px] sm:max-w-xs">{userItem.email}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyEmail(userItem.email)}
                          className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                          title="Copy email to clipboard"
                        >
                          {copiedEmail === userItem.email ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Joined {formatDate(userItem.createdAt)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Stats & Actions Column */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/40">
                    {/* Activity Counters */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="text-center" title="Articles Authored">
                        <div className="flex items-center gap-1 font-mono font-bold text-foreground">
                          <BookOpen className="h-3 w-3 text-primary" />
                          <span>{userItem._count?.articles ?? 0}</span>
                        </div>
                        <span className="text-[10px]">Articles</span>
                      </div>

                      <div className="text-center" title="Comments Posted">
                        <div className="flex items-center gap-1 font-mono font-bold text-foreground">
                          <MessageSquare className="h-3 w-3 text-amber-500" />
                          <span>{userItem._count?.comments ?? 0}</span>
                        </div>
                        <span className="text-[10px]">Comments</span>
                      </div>

                      <div className="text-center" title="Practice Problems Attempted">
                        <div className="flex items-center gap-1 font-mono font-bold text-foreground">
                          <Code2 className="h-3 w-3 text-emerald-500" />
                          <span>{userItem._count?.problemProgress ?? 0}</span>
                        </div>
                        <span className="text-[10px]">Problems</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setInspectUser(userItem)}
                        className="text-xs h-8 px-2.5 gap-1 cursor-pointer"
                        title="View Full Profile Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Details</span>
                      </Button>

                      {/* Status Toggle Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isCurrentUser}
                        onClick={() => setUserToToggleStatus(userItem)}
                        className={cn(
                          "text-xs h-8 px-2.5 gap-1 cursor-pointer",
                          userItem.isActive
                            ? "text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                            : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                        )}
                        title={
                          isCurrentUser
                            ? "Cannot deactivate your own account"
                            : userItem.isActive
                            ? "Suspend account access"
                            : "Reactivate account"
                        }
                      >
                        {userItem.isActive ? (
                          <>
                            <UserX className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Suspend</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Activate</span>
                          </>
                        )}
                      </Button>

                      {/* Role Toggle Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isCurrentUser}
                        onClick={() => setUserToChangeRole(userItem)}
                        className="text-xs h-8 px-2.5 gap-1 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 cursor-pointer"
                        title={
                          isCurrentUser
                            ? "Cannot change your own role"
                            : userItem.role === "ADMIN"
                            ? "Demote to Student"
                            : "Promote to Administrator"
                        }
                      >
                        <Shield className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">
                          {userItem.role === "ADMIN" ? "Demote" : "Promote"}
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <Users className="h-10 w-10 text-muted-foreground/50 mx-auto" />
            <h3 className="text-sm font-semibold text-foreground">No users match your criteria</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Try adjusting your search query or reset the filters to view all registered platform accounts.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("ALL");
                setStatusFilter("ALL");
              }}
              className="text-xs h-8 cursor-pointer"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </Card>

      {/* ============================================================== */}
      {/* MODAL 1: VIEW USER DETAILS */}
      {/* ============================================================== */}
      {inspectUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-bold font-mono text-white shadow-md",
                    inspectUser.role === "ADMIN"
                      ? "bg-gradient-to-br from-purple-500 to-indigo-600"
                      : "bg-gradient-to-br from-blue-600 to-cyan-600"
                  )}
                >
                  {inspectUser.avatar ? (
                    <img
                      src={inspectUser.avatar}
                      alt={inspectUser.name}
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  ) : (
                    getInitials(inspectUser.name)
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">{inspectUser.name}</h3>
                    {inspectUser.id === currentAdminId && (
                      <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary">
                        You
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">{inspectUser.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectUser(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Grid Info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                <span className="text-muted-foreground font-medium text-[11px]">System Role</span>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <Badge
                    variant={inspectUser.role === "ADMIN" ? "default" : "secondary"}
                    className="text-xs gap-1"
                  >
                    {inspectUser.role === "ADMIN" ? (
                      <Shield className="h-3 w-3 text-purple-400" />
                    ) : (
                      <User className="h-3 w-3" />
                    )}
                    <span>{inspectUser.role}</span>
                  </Badge>
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                <span className="text-muted-foreground font-medium text-[11px]">Account Status</span>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs gap-1",
                      inspectUser.isActive
                        ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
                        : "text-destructive border-destructive/30 bg-destructive/10"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        inspectUser.isActive ? "bg-emerald-500" : "bg-destructive"
                      )}
                    />
                    <span>{inspectUser.isActive ? "Active Account" : "Suspended"}</span>
                  </Badge>
                </div>
              </div>

              <div className="col-span-2 rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                <span className="text-muted-foreground font-medium text-[11px]">User Database ID</span>
                <div className="flex items-center justify-between font-mono text-[11px] text-foreground">
                  <span className="truncate">{inspectUser.id}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(inspectUser.id);
                      onShowSuccess("User ID copied to clipboard");
                    }}
                    className="text-primary hover:underline flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              <div className="col-span-2 rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                <span className="text-muted-foreground font-medium text-[11px]">Registered Date</span>
                <div className="text-foreground font-medium flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{new Date(inspectUser.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {inspectUser.bio && (
                <div className="col-span-2 rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                  <span className="text-muted-foreground font-medium text-[11px]">Biography</span>
                  <p className="text-xs text-foreground leading-relaxed italic">
                    &quot;{inspectUser.bio}&quot;
                  </p>
                </div>
              )}
            </div>

            {/* Platform Activity Stats */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-foreground">Platform Activity Metrics</span>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-border/60 bg-card p-3 text-center">
                  <div className="text-lg font-bold font-mono text-primary">
                    {inspectUser._count?.articles ?? 0}
                  </div>
                  <div className="text-[11px] text-muted-foreground">Articles</div>
                </div>
                <div className="rounded-xl border border-border/60 bg-card p-3 text-center">
                  <div className="text-lg font-bold font-mono text-amber-500">
                    {inspectUser._count?.comments ?? 0}
                  </div>
                  <div className="text-[11px] text-muted-foreground">Comments</div>
                </div>
                <div className="rounded-xl border border-border/60 bg-card p-3 text-center">
                  <div className="text-lg font-bold font-mono text-emerald-500">
                    {inspectUser._count?.problemProgress ?? 0}
                  </div>
                  <div className="text-[11px] text-muted-foreground">Problems</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <a
                href={`mailto:${inspectUser.email}`}
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Send Email</span>
              </a>

              <div className="flex items-center gap-2">
                {inspectUser.id !== currentAdminId && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setUserToChangeRole(inspectUser);
                        setInspectUser(null);
                      }}
                      className="text-xs h-8"
                    >
                      {inspectUser.role === "ADMIN" ? "Demote to Student" : "Promote to Admin"}
                    </Button>
                    <Button
                      size="sm"
                      variant={inspectUser.isActive ? "destructive" : "default"}
                      onClick={() => {
                        setUserToToggleStatus(inspectUser);
                        setInspectUser(null);
                      }}
                      className="text-xs h-8"
                    >
                      {inspectUser.isActive ? "Suspend Account" : "Activate Account"}
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInspectUser(null)}
                  className="text-xs h-8"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: CONFIRM STATUS TOGGLE (ACTIVATE / DEACTIVATE) */}
      {/* ============================================================== */}
      {userToToggleStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-foreground">
              <div
                className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                  userToToggleStatus.isActive
                    ? "bg-destructive/10 text-destructive"
                    : "bg-emerald-500/10 text-emerald-500"
                )}
              >
                {userToToggleStatus.isActive ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold">
                  {userToToggleStatus.isActive ? "Suspend User Account?" : "Reactivate User Account?"}
                </h3>
                <p className="text-xs text-muted-foreground">Action requires administrative authorization</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {userToToggleStatus.isActive ? (
                <>
                  Are you sure you want to suspend{" "}
                  <strong className="text-foreground">{userToToggleStatus.name}</strong> (
                  <span className="font-mono">{userToToggleStatus.email}</span>)? The user will be
                  prevented from logging in and accessing interactive features.
                </>
              ) : (
                <>
                  Are you sure you want to reactivate{" "}
                  <strong className="text-foreground">{userToToggleStatus.name}</strong> (
                  <span className="font-mono">{userToToggleStatus.email}</span>)? The user will
                  regain full platform access immediately.
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                size="sm"
                variant="outline"
                disabled={isProcessingAction}
                onClick={() => setUserToToggleStatus(null)}
                className="text-xs h-8 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant={userToToggleStatus.isActive ? "destructive" : "default"}
                disabled={isProcessingAction}
                onClick={handleConfirmToggleStatus}
                className="text-xs h-8 gap-1.5 cursor-pointer"
              >
                {isProcessingAction && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>
                  {userToToggleStatus.isActive ? "Confirm Suspension" : "Confirm Reactivation"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: CONFIRM ROLE CHANGE */}
      {/* ============================================================== */}
      {userToChangeRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-foreground">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">
                  {userToChangeRole.role === "ADMIN" ? "Demote to Student?" : "Promote to Administrator?"}
                </h3>
                <p className="text-xs text-muted-foreground">Modify security & permission level</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {userToChangeRole.role === "ADMIN" ? (
                <>
                  Are you sure you want to revoke administrator rights from{" "}
                  <strong className="text-foreground">{userToChangeRole.name}</strong>? They will
                  lose access to the Admin Console, curriculum editors, and moderation workflows.
                </>
              ) : (
                <>
                  Are you sure you want to promote{" "}
                  <strong className="text-foreground">{userToChangeRole.name}</strong> to{" "}
                  <strong className="text-purple-400">ADMINISTRATOR</strong>? They will receive full
                  administrative authority over curriculum, content moderation, and registered users.
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                size="sm"
                variant="outline"
                disabled={isProcessingAction}
                onClick={() => setUserToChangeRole(null)}
                className="text-xs h-8 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isProcessingAction}
                onClick={handleConfirmChangeRole}
                className="text-xs h-8 gap-1.5 bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
              >
                {isProcessingAction && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>
                  {userToChangeRole.role === "ADMIN" ? "Confirm Demotion" : "Confirm Promotion"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
