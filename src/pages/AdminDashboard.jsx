import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function AdminDashboard() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch quotes
  const fetchQuotes = async () => {
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setQuotes(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchQuotes();

    // 🔥 REAL-TIME updates
    const channel = supabase
      .channel("quotes-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "quotes" },
        (payload) => {
          setQuotes((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>📊 MKETICS Admin Dashboard</h1>

      {loading ? (
        <p>Loading quotes...</p>
      ) : quotes.length === 0 ? (
        <p>No quotes yet.</p>
      ) : (
        <div style={{ marginTop: "20px" }}>
          {quotes.map((q) => (
            <div
              key={q.id}
              style={{
                border: "1px solid #38bdf8",
                padding: "20px",
                borderRadius: "12px",
                marginBottom: "15px",
              }}
            >
              <h3>{q.name}</h3>
              <p><strong>Phone:</strong> {q.phone}</p>
              <p><strong>Email:</strong> {q.email}</p>
              <p><strong>Service:</strong> {q.service}</p>
              <p><strong>Message:</strong> {q.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}