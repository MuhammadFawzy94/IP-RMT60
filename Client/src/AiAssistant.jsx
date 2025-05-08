import { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faRobot,
  faSpinner,
  faSearch,
  faMotorcycle,
  faWrench,
  faTools,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import ReactMarkdown from "react-markdown";

function AiAssistant() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const API_URL = "http://localhost:80/api/gemini";

  const commonPrompts = [
    "Bagaimana memeriksa dan mengganti oli motor?",
    "Kenapa motor saya bunyi aneh saat digas?",
    "Langkah-langkah mengganti busi motor",
    "Penyebab motor sulit dinyalakan di pagi hari",
    "Tips merawat rantai motor supaya awet",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!prompt.trim()) {
      Swal.fire({
        title: "Input Kosong",
        text: "Silakan masukkan pertanyaan atau kata kunci",
        icon: "warning",
        confirmButtonColor: "#0d6efd",
      });
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Sending request to:", API_URL, "with prompt:", prompt);

      // Tambahkan timeout untuk request
      const result = await axios.get(API_URL, {
        params: { prompt },
        timeout: 20000, // 20 detik timeout
      });

      console.log("Response received:", result);

      // Verifikasi respons sebelum menggunakannya
      if (result.data && result.data.success && result.data.data) {
        const newResponse = result.data.data;
        setResponse(newResponse);

        // Add to history
        setHistory((prev) => [
          ...prev,
          { prompt, response: newResponse, timestamp: new Date() },
        ]);

        // Clear prompt after successful submission
        setPrompt("");
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      console.error("Error fetching Gemini response:", err);

      // Pesan error yang lebih spesifik
      let errorMessage;

      if (err.code === "ECONNABORTED") {
        errorMessage =
          "Request timeout. Server tidak merespons dalam waktu yang ditentukan.";
      } else if (!err.response) {
        errorMessage =
          "Tidak dapat terhubung ke server. Periksa koneksi jaringan Anda.";
      } else if (err.response.status === 500) {
        errorMessage = `Error server: ${
          err.response.data?.error || "Internal Server Error"
        }`;
      } else {
        errorMessage =
          err.response?.data?.message ||
          "Gagal mendapatkan jawaban dari Gemini AI";
      }

      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#dc3545",
      });

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Function to format markdown-like text
  const formatAiResponse = (text) => {
    if (!text) return "";

    // Format bold text
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Format headers
    formattedText = formattedText.replace(/^# (.*?)$/gm, "<h3>$1</h3>");
    formattedText = formattedText.replace(/^## (.*?)$/gm, "<h4>$1</h4>");
    formattedText = formattedText.replace(/^### (.*?)$/gm, "<h5>$1</h5>");

    // Format lists
    formattedText = formattedText.replace(/^- (.*?)$/gm, "<li>$1</li>");
    formattedText = formattedText.replace(
      /(<li>.*?<\/li>)(?=\n<li>|$)/gs,
      "<ul>$1</ul>"
    );

    // Format numbered lists
    formattedText = formattedText.replace(/^\d+\. (.*?)$/gm, "<li>$1</li>");
    formattedText = formattedText.replace(
      /(<li>.*?<\/li>)(?=\n<li>|$)/gs,
      "<ol>$1</ol>"
    );

    // Format paragraphs
    formattedText = formattedText.replace(
      /(?<!\n<h[3-5]>|\n<\/[uo]l>|\n<li>)(.*?)(?!\n<h[3-5]>|\n<\/[uo]l>|\n<li>)/gs,
      "<p>$1</p>"
    );

    return formattedText;
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="text-center mb-5">
        <div className="d-inline-block p-3 bg-primary rounded-circle mb-3">
          <FontAwesomeIcon icon={faRobot} className="text-white" size="3x" />
        </div>
        <h1 className="display-5 fw-bold">Motor Maintenance Assistant</h1>
        <p className="lead text-secondary">
          Tanya apa saja tentang perawatan motor atau masalah pada kendaraan
          Anda
        </p>
      </div>

      {/* Main Content */}
      <div className="row">
        <div className="col-lg-4 mb-4">
          {/* Common Questions Card */}
          <div className="card shadow-sm h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faMotorcycle} className="me-2" />
                Pertanyaan Umum
              </h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                {commonPrompts.map((preset, index) => (
                  <button
                    key={index}
                    className="list-group-item list-group-item-action d-flex align-items-center"
                    onClick={() => {
                      setPrompt(preset);
                      window.scrollTo({
                        top:
                          document.getElementById("search-form").offsetTop -
                          100,
                        behavior: "smooth",
                      });
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faTools}
                      className="me-2 text-primary"
                    />
                    <span>{preset}</span>
                  </button>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          {/* Search Form */}
          <div className="card shadow-sm mb-4" id="search-form">
            <div className="card-body">
              <h5 className="card-title">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="me-2 text-primary"
                />
                Cari Informasi Tentang Perawatan Motor
              </h5>
              <form onSubmit={handleSubmit}>
                <div className="input-group mb-3">
                  <textarea
                    className="form-control"
                    placeholder="Tulis pertanyaan Anda tentang motor..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={loading}
                    rows={3}
                  ></textarea>
                </div>
                <div className="d-flex justify-content-end">
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <FontAwesomeIcon
                          icon={faSpinner}
                          spin
                          className="me-2"
                        />
                        Mendapatkan jawaban...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                        Kirim Pertanyaan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* AI Response */}
          {response && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faRobot} className="me-2" />
                  Jawaban AI
                </h5>
              </div>
              <div className="card-body">
                <div className="ai-response">
                  {/* Gunakan try-catch dengan fallback rendering */}
                  {(() => {
                    try {
                      return <ReactMarkdown>{response}</ReactMarkdown>;
                    } catch (err) {
                      console.error("Error rendering Markdown:", err);
                      return (
                        <div className="alert alert-warning">
                          <p>
                            <strong>Catatan:</strong> Ada masalah rendering
                            format markdown.
                          </p>
                          <p className="mb-0">{response}</p>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
              <div className="card-footer bg-light text-center small text-muted">
                <FontAwesomeIcon icon={faRobot} className="me-1" />
                Jawaban ini digenerate oleh Gemini AI dari Google
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faCog} className="me-2 text-primary" />
                  Riwayat Pertanyaan
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="accordion" id="historyAccordion">
                  {history
                    .slice()
                    .reverse()
                    .map((item, index) => (
                      <div className="accordion-item" key={index}>
                        <h2 className="accordion-header">
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#collapse${index}`}
                          >
                            <span className="fw-bold">{item.prompt}</span>
                            <small className="ms-auto text-muted">
                              {new Date(item.timestamp).toLocaleString()}
                            </small>
                          </button>
                        </h2>
                        <div
                          id={`collapse${index}`}
                          className="accordion-collapse collapse"
                          data-bs-parent="#historyAccordion"
                        >
                          <div className="accordion-body">
                            <div className="ai-response">
                              <ReactMarkdown>{item.response}</ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !response && history.length === 0 && (
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <FontAwesomeIcon
                  icon={faMotorcycle}
                  className="text-primary mb-3"
                  size="3x"
                />
                <h5>Asisten Perawatan Motor</h5>
                <p className="text-muted">
                  Tanyakan seputar perawatan atau masalah sepeda motor Anda
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AiAssistant;
