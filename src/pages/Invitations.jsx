import React from "react";
import { UserPlus, X } from "lucide-react";
import Header from "../components/Header";

const invitations = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
];

const Invitations = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Body: Sidebar + Main Content */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white/80 backdrop-blur-sm shadow-lg p-6 min-h-screen border-r border-gray-200/50 overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 mb-8">
          <h1 className="text-2xl font-bold text-white text-center">TaskFlow</h1>
          <p className="text-blue-100 text-sm text-center mt-1">Project Management</p>
        </div>
      </aside>

        {/* Main 

        {/* Main Content */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6">Pending Invitations</h1>
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 shadow-sm rounded-2xl border bg-white"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={invitation.avatar}
                    alt={invitation.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h2 className="font-semibold">{invitation.name}</h2>
                    <p className="text-sm text-gray-500">{invitation.email}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg shadow-sm">
                    <UserPlus className="w-4 h-4" /> Accept
                  </button>
                  <button className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg shadow-sm">
                    <X className="w-4 h-4" /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Invitations;
