// src/pages/DashboardPage.jsx
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "tasks"), where("uid", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    await addDoc(collection(db, "tasks"), {
      title,
      description,
      uid: user.uid,
      created: Date.now(),
    });
    setTitle("");
    setDescription("");
  };

  const handleDeleteTask = async (id) => {
    await deleteDoc(doc(db, "tasks", id));
  };

  const handleEditTask = (id, currentTitle, currentDescription) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
    setEditingDescription(currentDescription);
  };

  const handleUpdateTask = async (id) => {
    if (!editingTitle.trim() || !editingDescription.trim()) return;
    await updateDoc(doc(db, "tasks", id), { title: editingTitle, description: editingDescription });
    setEditingId(null);
    setEditingTitle("");
    setEditingDescription("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
    setEditingDescription("");
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (loading) return <div className="text-center mt-10 w-full min-h-screen bg-white text-black">Loading...</div>;
  if (!user) return null;

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans text-black">
      {/* Enhanced Animated Gradient Background - removed, now handled by root */}
      {/* Extra Layered Gradient for Glow - removed, now handled by root */}
      {/* Animated Decorative SVG Blobs - removed, now handled by root */}
      {/* Main Content */}
      <header className="flex justify-between items-center px-8 py-6 shadow-lg bg-white/80 backdrop-blur rounded-b-2xl border-b border-blue-200 w-full">
        <h2 className="text-4xl font-extrabold text-blue-700 tracking-tight drop-shadow-lg">My To-Do List</h2>
        <button onClick={handleLogout} className="text-base text-white bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-2 rounded-xl shadow-lg hover:scale-105 hover:from-blue-600 hover:to-blue-800 transition-all duration-200 font-semibold">Logout</button>
      </header>
      <main className="w-full py-12 px-2 sm:px-6 md:px-12 lg:px-24 xl:px-32">
        <form onSubmit={handleAddTask} className="flex flex-col md:flex-row gap-3 mb-10 bg-white/80 p-6 rounded-2xl shadow-lg border border-blue-100 animate-fade-in w-full">
          <input
            type="text"
            placeholder="Title"
            className="px-4 py-3 border-2 border-blue-200 rounded-xl text-black bg-white focus:outline-none focus:border-blue-400 text-lg flex-1 shadow-sm transition-all duration-150"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={50}
          />
          <input
            type="text"
            placeholder="Description"
            className="px-4 py-3 border-2 border-blue-200 rounded-xl text-black bg-white focus:outline-none focus:border-blue-400 text-lg flex-2 shadow-sm transition-all duration-150"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={120}
          />
          <button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-3 rounded-xl shadow-lg hover:scale-105 hover:from-blue-600 hover:to-blue-800 transition-all duration-200 text-lg font-bold">Add</button>
        </form>
        <ul className="space-y-6 w-full">
          {tasks.map((t, idx) => (
            <li key={t.id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/90 px-8 py-6 rounded-2xl shadow-xl border border-blue-100 group transition-all duration-200 animate-fade-in w-full">
              {editingId === t.id ? (
                <div className="flex flex-col md:flex-row w-full items-center gap-4">
                  <input
                    type="text"
                    className="px-3 py-2 border-2 border-blue-200 rounded-xl text-black bg-white text-lg focus:outline-none focus:border-blue-400 flex-1 shadow-sm"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    autoFocus
                    maxLength={50}
                  />
                  <input
                    type="text"
                    className="px-3 py-2 border-2 border-blue-200 rounded-xl text-black bg-white text-lg focus:outline-none focus:border-blue-400 flex-2 shadow-sm"
                    value={editingDescription}
                    onChange={(e) => setEditingDescription(e.target.value)}
                    maxLength={120}
                  />
                  <button onClick={() => handleUpdateTask(t.id)} className="text-green-600 bg-green-100 hover:bg-green-200 rounded-lg px-4 py-2 font-semibold shadow transition-all duration-150">Save</button>
                  <button onClick={handleCancelEdit} className="text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2 font-semibold shadow transition-all duration-150">Cancel</button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="font-bold text-2xl text-blue-700 mb-1 drop-shadow-sm">{t.title}</div>
                    <div className="text-gray-700 mb-2 text-base">{t.description}</div>
                    <div className="text-xs text-gray-400 italic">Created: {t.created ? new Date(t.created).toLocaleString() : "-"}</div>
                  </div>
                  <div className="flex gap-2 ml-4 mt-4 md:mt-0">
                    <button onClick={() => handleEditTask(t.id, t.title, t.description)} className="text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-lg px-4 py-2 font-semibold shadow transition-all duration-150">Edit</button>
                    <button onClick={() => handleDeleteTask(t.id)} className="text-red-600 bg-red-100 hover:bg-red-200 rounded-lg px-4 py-2 font-semibold shadow transition-all duration-150">Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
