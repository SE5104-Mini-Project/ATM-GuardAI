import { useState, useEffect } from "react";
import LogoutButton from "../components/LogoutButton";

export default function Users() {
  const cardBase = "rounded-2xl bg-white shadow-lg p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl";
  const inputBase = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm font-normal";

  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 40);
    return () => clearTimeout(t);
  }, []);

  const [users, setUsers] = useState([
    { id: 1, name: "John Smith",   email: "john.smith@company.com", role: "Administrator",   lastLogin: "Today, 09:15 AM", status: "Active" },
    { id: 2, name: "Sarah Johnson", email: "sarah.j@company.com",   role: "Security Officer", lastLogin: "Yesterday, 02:30 PM", status: "Active" },
    { id: 3, name: "Michael Brown", email: "m.brown@company.com",   role: "Security Officer", lastLogin: "Oct 26, 2023", status: "Inactive" },
    { id: 4, name: "Emily Davis",   email: "emily.d@company.com",   role: "Auditor",         lastLogin: "Today, 08:45 AM", status: "Active" },
    { id: 5, name: "Robert Wilson", email: "robert.w@company.com",  role: "Security Officer", lastLogin: "Oct 27, 2023", status: "Active" },
  ]);

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Security Officer", status: "Active" });

  const handleAddUser = () => {
    setIsAddingUser(true);
    setEditingUserId(null);
    setNewUser({ name: "", email: "", role: "Security Officer", status: "Active" });
  };

  const handleEditUser = (user) => {
    setEditingUserId(user.id);
    setNewUser({ name: user.name, email: user.email, role: user.role, status: user.status });
    setIsAddingUser(true);
  };

  const handleSaveUser = () => {
    if (editingUserId) {
      setUsers(users.map((u) => (u.id === editingUserId ? { ...u, ...newUser, lastLogin: "Just now" } : u)));
      setEditingUserId(null);
    } else {
      const newUserWithId = { ...newUser, id: Math.max(...users.map((u) => u.id)) + 1, lastLogin: "Just now" };
      setUsers([...users, newUserWithId]);
    }
    setIsAddingUser(false);
  };

  const handleDeleteUser = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const handleCancel = () => {
    setIsAddingUser(false);
    setEditingUserId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const Bell = () => (
    <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z" />
    </svg>
  );

  return (
    <div className="px-3 sm:px-6 pt-6 pb-10 text-slate-900">
      {/* Header */}
      <div className={`${cardBase} mb-6 px-5 py-4 flex items-center justify-between`}>
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="flex items-center gap-6">
          <span className="text-sm text-blue-700">
            Total Users: <span className="font-semibold">{users.length}</span>
          </span>
          <div className="relative">
            <Bell />
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">3</span>
          </div>

          {/* Admin badge + compact icon-only Logout */}
          <LogoutButton showEmail={false} showIcon label="Admin" compact iconOnly className="px-0" />
        </div>
      </div>

      {/* Section title */}
      <h3 className={`text-xl font-semibold text-gray-900 mb-3 transition-all ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`} style={{ transitionDelay: "30ms" }}>
        User Management
      </h3>

      {/* Add/Edit User */}
      {isAddingUser && (
        <div className={`${cardBase} mb-6 transition-all ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`} style={{ transitionDelay: "30ms" }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingUserId ? "Edit User" : "Add New User"}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" name="name" value={newUser.name} onChange={handleInputChange} className={inputBase} placeholder="Enter full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={newUser.email} onChange={handleInputChange} className={inputBase} placeholder="Enter email address" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select name="role" value={newUser.role} onChange={handleInputChange} className={inputBase}>
                <option value="Administrator">Administrator</option>
                <option value="Security Officer">Security Officer</option>
                <option value="Auditor">Auditor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={newUser.status} onChange={handleInputChange} className={inputBase}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button onClick={handleCancel} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={handleSaveUser} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" disabled={!newUser.name || !newUser.email}>
              {editingUserId ? "Update User" : "Add User"}
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className={`${cardBase} transition-all overflow-x-auto ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`} style={{ transitionDelay: "60ms" }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">User List</h3>
          <button onClick={handleAddUser} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New User
          </button>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{user.role}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{user.lastLogin}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button onClick={() => handleEditUser(user)} className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded">Edit</button>
                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900 px-2 py-1 rounded">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
