import { useEffect, useState } from "react";
import supabase from "./supabase-client";
import "./App.css";

function App() {
  const [todoList, setTodoList] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const { data, error } = await supabase.from("TodoList").select("*");
    if (error) {
      console.log("❌ Error fetching todos:", error.message);
    } else {
      setTodoList(data);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const addTodo = async () => {
    if (!newTodo) return;

    setUploading(true);
    let imageUrl = null;

    try {
      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `todo-images/${fileName}`;

        // Upload file
        const { error: uploadError } = await supabase
          .storage
          .from("images") // <-- bucket name
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: publicData, error: urlError } = supabase
          .storage
          .from("images")
          .getPublicUrl(filePath);

        if (urlError) {
          throw urlError;
        }

        imageUrl = publicData?.publicUrl || null;
      }

      // Insert todo with imageUrl
      const { data, error } = await supabase
        .from("TodoList")
        .insert([{ name: newTodo, isCompleted: false,}])
        .single();

      if (error) throw error;

      setTodoList((prev) => [...prev, data]);
      setNewTodo("");
      setFile(null);
    } catch (err) {
      console.error("❌ Error adding todo:", err.message);
      alert("Lỗi khi thêm todo: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const completeTask = async (id, isCompleted) => {
    const { data, error } = await supabase
      .from("TodoList")
      .update({ isCompleted: !isCompleted })
      .eq("id", id);

    if (error) {
      console.log("❌ Error updating todo:", error.message);
    } else {
      setTodoList((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, isCompleted: !isCompleted } : todo
        )
      );
    }
  };

  const deleteTask = async (id) => {
    const { error } = await supabase
      .from("TodoList")
      .delete()
      .eq("id", id);

    if (error) {
      console.log("❌ Error deleting todo:", error.message);
    } else {
      setTodoList((prev) => prev.filter((todo) => todo.id !== id));
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-4 text-center">📋 Todo List</h1>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Tên công việc..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={addTodo}
          disabled={uploading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
        >
          {uploading ? "Đang tải ảnh..." : "➕ Thêm công việc"}
        </button>
      </div>

      <ul className="space-y-4">
        {todoList.map((todo) => (
          <li
            key={todo.id}
            className={`border p-4 rounded shadow ${
              todo.isCompleted ? "bg-green-100" : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <p
                className={`text-lg ${
                  todo.isCompleted ? "line-through text-gray-500" : ""
                }`}
              >
                {todo.name}
              </p>
              <div className="space-x-2">
                <button
                  onClick={() => completeTask(todo.id, todo.isCompleted)}
                  className="px-2 py-1 bg-yellow-400 rounded text-sm"
                >
                  {todo.isCompleted ? "↩️ Undo" : "✅ Done"}
                </button>
                <button
                  onClick={() => deleteTask(todo.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                >
                  🗑 Delete
                </button>
              </div>
            </div>

            {todo.imageUrl && (
              <img
                src={todo.imageUrl}
                alt="Todo"
                className="mt-3 w-full rounded shadow"
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
