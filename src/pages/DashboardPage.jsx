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
  const [task, setTask] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
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
    if (!task.trim()) return;
    await addDoc(collection(db, "tasks"), {
      text: task,
      uid: user.uid,
      created: Date.now(),
    });
    setTask("");
  };

  const handleDeleteTask = async (id) => {
    await deleteDoc(doc(db, "tasks", id));
  };

  const handleEditTask = (id, currentText) => {
    setEditingId(id);
    setEditingText(currentText);
  };

  const handleUpdateTask = async (id) => {
    if (!editingText.trim()) return;
    await updateDoc(doc(db, "tasks", id), { text: editingText });
    setEditingId(null);
    setEditingText("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (loading) return <div className="text-center mt-10 w-full min-h-screen bg-white text-black">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-white text-black">
      <header className="flex justify-between items-center px-8 py-6 shadow-sm bg-white">
        <h2 className="text-3xl font-bold text-blue-700 tracking-tight">My To-Do List</h2>
        <button onClick={handleLogout} className="text-base text-white bg-blue-600 px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition">Logout</button>
      </header>
      <main className="max-w-3xl mx-auto py-10 px-4">
        <form onSubmit={handleAddTask} className="flex mb-8">
          <input
            type="text"
            placeholder="Add a new task..."
            className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-l-lg text-black bg-white focus:outline-none focus:border-blue-400 text-lg"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 text-lg font-semibold">Add</button>
        </form>
        <ul className="space-y-4">
          {tasks.map((t) => (
            <li key={t.id} className="flex justify-between items-center bg-white px-6 py-4 rounded-lg shadow border border-blue-100">
              {editingId === t.id ? (
                <div className="flex w-full items-center gap-4">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border-2 border-blue-200 rounded text-black bg-white text-lg focus:outline-none focus:border-blue-400"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    autoFocus
                  />
                  <button onClick={() => handleUpdateTask(t.id)} className="text-green-600 hover:underline text-base font-medium px-3">Save</button>
                  <button onClick={handleCancelEdit} className="text-gray-500 hover:underline text-base font-medium px-3">Cancel</button>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-lg text-gray-800">{t.text}</span>
                  <div className="flex gap-4 ml-4">
                    <button onClick={() => handleEditTask(t.id, t.text)} className="text-blue-500 hover:underline text-base font-medium px-3">Edit</button>
                    <button onClick={() => handleDeleteTask(t.id)} className="text-red-500 hover:underline text-base font-medium px-3">Delete</button>
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
