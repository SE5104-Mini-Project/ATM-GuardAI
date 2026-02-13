import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";

const roleOptions = [
  { label: "Administrator", value: "admin" },
  { label: "Moderator", value: "moderator" },
  { label: "User", value: "user" },
];

const statusOptions = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
  { label: "Suspended", value: "Suspended" },
];

export default function Users() {
  const { currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "user",
    status: "Active",
    password: "",
  });

  const isAdmin = currentUser?.role === "admin";

  /* ---------- Icons ---------- */
  const Icon = {
    user: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
    active: (
      <svg
        className="w-4 h-4 text-emerald-500"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="12" cy="12" r="10" />
        <path
          d="M9 12l2 2 4-4"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    inactive: (
      <svg
        className="w-4 h-4 text-gray-500"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    suspended: (
      <svg
        className="w-4 h-4 text-red-500"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="12" cy="12" r="10" />
        <path
          d="M15 9l-6 6m0-6l6 6"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    refresh: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
        <path d="M21 3v5h-5"></path>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
        <path d="M3 21v-5h5"></path>
      </svg>
    ),
    add: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 5v14m-7-7h14" />
      </svg>
    ),
    close: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    ),
    edit: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
    ),
    delete: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    ),
  };

  /* ---------- API Functions ---------- */
  const API_BASE = "http://localhost:3001/api";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/users`, {
        credentials: "include",
      });
      const result = await response.json();

      if (result.success) {
        setUsers(result.data.users || []);
      } else {
        setError("Failed to fetch users");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData) => {
    try {
      const response = await fetch(`${API_BASE}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });
      const result = await response.json();

      if (result.success) {
        await fetchUsers();
        return { success: true, data: result.data };
      } else {
        return { success: false, message: result.message };
      }
    } catch (err) {
      return { success: false, message: "Error creating user", err };
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });
      const result = await response.json();

      if (result.success) {
        await fetchUsers();
        return { success: true, data: result.data };
      } else {
        return { success: false, message: result.message };
      }
    } catch (err) {
      return { success: false, message: "Error updating user", err };
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json();

      if (result.success) {
        await fetchUsers();
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (err) {
      return { success: false, message: "Error deleting user", err };
    }
  };

  /* ---------- Effects ---------- */
  useEffect(() => {
    fetchUsers();
  }, []);

  /* ---------- Filters ---------- */
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter((user) => {
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user._id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesRole && matchesSearch;
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "Active").length,
    inactive: users.filter((u) => u.status === "Inactive").length,
    suspended: users.filter((u) => u.status === "Suspended").length,
  };

  const StatusBadge = ({ status }) => {
    const config = {
      Active: {
        class: "bg-emerald-100 text-emerald-800 border-emerald-200",
        text: "Active",
        icon: Icon.active,
      },
      Inactive: {
        class: "bg-gray-100 text-gray-800 border-gray-200",
        text: "Inactive",
        icon: Icon.inactive,
      },
      Suspended: {
        class: "bg-red-100 text-red-800 border-red-200",
        text: "Suspended",
        icon: Icon.suspended,
      },
    };

    const configItem = config[status] || config.Inactive;

    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${configItem.class}`}
      >
        {configItem.icon}
        {configItem.text}
      </div>
    );
  };

  const RoleBadge = ({ role }) => {
    const config = {
      admin: { class: "bg-purple-100 text-purple-800", text: "Admin" },
      moderator: { class: "bg-blue-100 text-blue-800", text: "Moderator" },
      user: { class: "bg-gray-100 text-gray-800", text: "User" },
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config[role]?.class || config.user.class}`}
      >
        {config[role]?.text || "User"}
      </span>
    );
  };

  /* ---------- User Management Functions ---------- */
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert("Please fill in all required fields");
      return;
    }

    if (newUser.password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    const result = await createUser(newUser);

    if (result.success) {
      setShowAddUser(false);
      setNewUser({
        name: "",
        email: "",
        role: "user",
        status: "Active",
        password: "",
      });
      setSuccess("User created successfully");
      setTimeout(() => setSuccess(""), 5000);
    } else {
      setError(result.message);
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser.name || !editingUser.email) {
      alert("Please fill in all required fields");
      return;
    }

    const result = await updateUser(editingUser._id, {
      name: editingUser.name,
      role: editingUser.role,
      status: editingUser.status,
    });

    if (result.success) {
      setShowEditUser(false);
      setEditingUser(null);
      setSuccess("User updated successfully");
      setTimeout(() => setSuccess(""), 5000);
    } else {
      setError(result.message);
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      const result = await deleteUser(userId);

      if (result.success) {
        setSuccess("User deleted successfully");
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(result.message);
        setTimeout(() => setError(""), 5000);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setNewUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditInputChange = (field, value) => {
    setEditingUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const openEditModal = (user) => {
    setEditingUser({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setShowEditUser(true);
  };

  const formatLastLogin = (lastLogin) => {
    if (!lastLogin) return "Never";

    const now = new Date();
    const lastActive = new Date(lastLogin);
    const diffMs = now - lastActive;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="px-3 sm:px-6 pt-6 pb-10 text-slate-900">
      {/* Header */}
      <Header title={"User Management"} />

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Users",
            value: stats.total,
            color: "bg-blue-50 text-blue-600 ring-blue-200",
          },
          {
            label: "Active",
            value: stats.active,
            color: "bg-emerald-50 text-emerald-600 ring-emerald-200",
          },
          {
            label: "Inactive",
            value: stats.inactive,
            color: "bg-gray-50 text-gray-600 ring-gray-200",
          },
          {
            label: "Suspended",
            value: stats.suspended,
            color: "bg-red-50 text-red-600 ring-red-200",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="rounded-2xl bg-white shadow-lg p-5 flex items-center gap-4 ring-1 ring-gray-200"
          >
            <div className={`rounded-xl p-3 ring-1 ${stat.color}`}>
              {Icon.user}
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* LEFT SIDE — Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-72 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pl-11 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
              <svg
                className="absolute left-4 top-3 h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="user">User</option>
            </select>
          </div>

          {/* RIGHT SIDE — Buttons */}
          <div className="flex gap-3 w-full lg:w-auto">
            {isAdmin && (
              <button
                onClick={() => setShowAddUser(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md hover:scale-[1.02] transition-all"
              >
                {Icon.add}
                Add User
              </button>
            )}

            <button
              onClick={fetchUsers}
              disabled={loading}
              className="inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-gray-50 hover:shadow-md transition-all disabled:opacity-50"
            >
              {Icon.refresh}
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      )}

      {/* Users Table */}
      {!loading && (
        <div className="rounded-2xl bg-white shadow-lg ring-1 ring-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="group hover:bg-gray-50 transition-all duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="relative flex-shrink-0 h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
                          <span className="text-sm">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </span>
                        </div>

                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">
                            {user._id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.lastLogin)}
                      <div className="text-xs text-gray-400">
                        {formatLastLogin(user.lastLogin)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={user.status} />
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-3">
                          <button
                            onClick={() => openEditModal(user)}
                            className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                          >
                            {Icon.edit}
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-800 inline-flex items-center gap-1"
                          >
                            {Icon.delete}
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setRoleFilter("all");
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-[#102a56] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add New User</h3>
              <button
                onClick={() => setShowAddUser(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                {Icon.close}
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newUser.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowAddUser(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && editingUser && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-[#102a56] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit User</h3>
              <button
                onClick={() => setShowEditUser(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                {Icon.close}
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) =>
                    handleEditInputChange("name", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-100 text-gray-500"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={(e) =>
                      handleEditInputChange("role", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editingUser.status}
                    onChange={(e) =>
                      handleEditInputChange("status", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowEditUser(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditUser}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
