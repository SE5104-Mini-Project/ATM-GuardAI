// web/src/pages/Users.jsx
import { useState, useEffect } from "react";

// map frontend labels <-> backend role values
const roleOptions = [
  { label: "Administrator", value: "admin" },
  { label: "Operator", value: "operator" },
  { label: "Viewer", value: "viewer" },
  { label: "User", value: "user" },
];

export default function Users() {
  const cardBase = "rounded-2xl bg-white shadow-lg p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl";
  const inputBase = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm font-normal";

  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 40);
    return () => clearTimeout(t);
  }, []);

  const [users, setUsers] = useState([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "user", status: "Active" });
  const [me, setMe] = useState(null);
  const isAdmin = me?.role === "admin";

  // Mock data for demonstration
  useEffect(() => {
    const mockUsers = [
      {
        id: "1",
        uid: "user1",
        email: "admin@example.com",
        role: "admin",
        lastLogin: new Date().toLocaleString(),
        status: "Active",
        name: "Admin User"
      },
      {
        id: "2",
        uid: "user2",
        email: "user@example.com",
        role: "user",
        lastLogin: new Date().toLocaleString(),
        status: "Active",
        name: "Regular User"
      }
    ];
    
    const mockMe = {
      _id: "1",
      id: "1",
      uid: "user1",
      email: "admin@example.com",
      role: "admin",
      updatedAt: new Date().toISOString(),
      disabled: false,
      name: "Admin User"
    };

    setUsers(mockUsers);
    setMe(mockMe);
  }, []);

  const handleAddUser = () => {
    setIsAddingUser(true);
    setEditingUserId(null);
    setNewUser({ name: "", email: "", role: "user", status: "Active", password: "" });
  };

  const handleEditUser = (user) => {
    setEditingUserId(user.id);
    setNewUser({ name: user.name, email: user.email, role: user.role, status: user.status, password: "" });
    setIsAddingUser(true);
  };

  const handleSaveUser = async () => {
    try {
      if (!newUser.name || !newUser.email) return alert("Name and email required");
      
      if (editingUserId) {
        // Update existing user
        setUsers(users.map(u => (u.id === editingUserId ? { ...u, ...newUser, lastLogin: "Just now" } : u)));
      } else {
        // Create new user
        const newUserObj = {
          id: Date.now().toString(),
          uid: `user${Date.now()}`,
          email: newUser.email,
          role: newUser.role,
          name: newUser.name,
          lastLogin: "Just now",
          status: newUser.status
        };
        setUsers([newUserObj, ...users]);
      }
      setIsAddingUser(false);
    } catch (err) {
      console.error(err);
      alert("Save failed: " + err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setUsers(users.filter(u => u.id !== id));
  };

  const handleCancel = () => {
    setIsAddingUser(false);
    setEditingUserId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };


  return (
    <div className="px-3 sm:px-6 pt-6 pb-10 text-slate-900">
      {/* Header */ }
      <div className={`${cardBase} mb-6 px-5 py-4 flex items-center justify-between`}>
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="flex items-center gap-6">
          <span className="text-sm text-blue-700">Total Users: <span className="font-semibold">{users.length}</span></span>
          <div className="relative">
            <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">3</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            {me?.email || "Admin"}
          </div>
        </div>
      </div>

      {/* Add User Section */}
      <div className={`${cardBase} mb-6 transition-all ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`} style={{ transitionDelay: "30ms" }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingUserId ? "Edit User" : "Add User"}</h3>

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
                {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={newUser.status} onChange={handleInputChange} className={inputBase}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            {!editingUserId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                <input type="password" name="password" value={newUser.password || ""} onChange={handleInputChange} className={inputBase} placeholder="Min. 6 characters" required />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            {editingUserId && (
              <button onClick={handleCancel} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            )}
            <button onClick={handleSaveUser} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" disabled={!newUser.name || !newUser.email || (!editingUserId && (!newUser.password || newUser.password.length < 6))}>
              {editingUserId ? "Update User" : "Add User"}
            </button>
          </div>
      </div>

      {/* Users Table */}
      <div className={`${cardBase} transition-all overflow-x-auto ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`} style={{ transitionDelay: "60ms" }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">User List</h3>
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
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{roleOptions.find(r => r.value === user.role)?.label || user.role}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{user.lastLogin}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {isAdmin && <button onClick={() => handleEditUser(user)} className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded">Edit</button>}
                    {isAdmin && <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900 px-2 py-1 rounded">Delete</button>}
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