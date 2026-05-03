import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setQuotes(data);
    setLoading(false);
  };

  return (
    <section className="section">
      <div className="glass-box">
        <h1>MKETICS Admin Dashboard</h1>
        <p>View quote requests from your website.</p>

        <Link to="/" className="btn secondary">
          Back to Website
        </Link>
      </div>

      {loading ? (
        <h2>Loading quotes...</h2>
      ) : (
        <div className="admin-grid">
          {quotes.map((quote) => (
            <div className="card" key={quote.id}>
              <h3>{quote.service}</h3>
              <p><strong>Name:</strong> {quote.name}</p>
              <p><strong>Phone:</strong> {quote.phone}</p>
              <p><strong>Email:</strong> {quote.email}</p>
              <p><strong>Message:</strong> {quote.message}</p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(quote.created_at).toLocaleString()}
              </p>

              <a
                href={`https://wa.me/27${quote.phone.replace(/^0/, "")}?text=${encodeURIComponent(
                  `Hi ${quote.name}, this is MKETICS. We received your ${quote.service} quote request.`
                )}`}
                className="btn primary"
                target="_blank"
                rel="noreferrer"
              >
                Reply on WhatsApp
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}