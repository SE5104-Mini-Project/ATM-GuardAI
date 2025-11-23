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
  const cardBase = "rounded-2xl bg-white shadow-lg p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl";
  const inputBase = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm font-normal";

  const { currentUser } = useContext(AuthContext);

  const [entered, setEntered] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "user",
    status: "Active",
    password: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 40);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/users', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const result = await response.json();
      if (result.success) {
        setUsers(result.data.users || []);
      }
    } catch (err) {
      setError('Failed to load users: ' + err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setError("");
    } else {
      setError(message);
      setSuccess("");
    }
    setTimeout(() => {
      setSuccess("");
      setError("");
    }, 5000);
  };

  const handleAddUser = () => {
    setIsAddingUser(true);
    setEditingUserId(null);
    setNewUser({
      name: "",
      email: "",
      role: "user",
      status: "Active",
      password: ""
    });
    setError("");
    setSuccess("");
  };

  const handleEditUser = (user) => {
    setEditingUserId(user._id);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      password: ""
    });
    setIsAddingUser(true);
    setError("");
    setSuccess("");
  };

  const handleSaveUser = async () => {
    try {
      setError("");
      if (!newUser.name || !newUser.email) {
        setError("Name and email are required");
        return;
      }

      if (!editingUserId && (!newUser.password || newUser.password.length < 6)) {
        setError("Password must be at least 6 characters long");
        return;
      }

      const url = editingUserId
        ? `http://localhost:3001/api/users/${editingUserId}`
        : 'http://localhost:3001/api/users/register';

      const method = editingUserId ? 'PUT' : 'POST';

      const payload = editingUserId
        ? { name: newUser.name, role: newUser.role, status: newUser.status }
        : { ...newUser };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save user');
      }

      if (result.success) {
        showMessage(editingUserId ? 'User updated successfully' : 'User created successfully');
        setIsAddingUser(false);
        setEditingUserId(null);
        fetchUsers();
      }
    } catch (err) {
      setError(err.message);
      console.error('Error saving user:', err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      const response = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete user');
      }

      if (result.success) {
        showMessage('User deleted successfully');
        fetchUsers();
      }
    } catch (err) {
      setError(err.message);
      console.error('Error deleting user:', err);
    }
  };

  const handleCancel = () => {
    setIsAddingUser(false);
    setEditingUserId(null);
    setError("");
    setSuccess("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="px-3 sm:px-6 pt-6 pb-10 text-slate-900">
      {/* Header */}
      <Header />

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

      {/* Add User Section */}
      {isAddingUser && isAdmin && (
        <div className={`${cardBase} mb-6 transition-all ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`} style={{ transitionDelay: "30ms" }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingUserId ? "Edit User" : "Add User"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={newUser.name}
                onChange={handleInputChange}
                className={inputBase}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
                className={inputBase}
                placeholder="Enter email address"
                disabled={!!editingUserId}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                name="role"
                value={newUser.role}
                onChange={handleInputChange}
                className={inputBase}
              >
                {roleOptions.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={newUser.status}
                onChange={handleInputChange}
                className={inputBase}
              >
                {statusOptions.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            {!editingUserId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleInputChange}
                  className={inputBase}
                  placeholder="Min. 6 characters"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveUser}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!newUser.name || !newUser.email || (!editingUserId && (!newUser.password || newUser.password.length < 6))}
            >
              {editingUserId ? "Update User" : "Add User"}
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className={`${cardBase} transition-all overflow-x-auto ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`} style={{ transitionDelay: "60ms" }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">User List</h3>
          {isAdmin && (
            <button
              onClick={handleAddUser}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add User
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                {isAdmin && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-500">{user._id}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {roleOptions.find(r => r.value === user.role)?.label || user.role}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {formatDate(user.lastLogin)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : user.status === "Suspended"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                      }`}>
                      {user.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-900 px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No users found. Click "Add User" to create the first user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}