import { useEffect, useState } from "react";
import { API_URL, AI_API_URL } from "../api";


function AddTransaction() {

  // ==========================================
  // MANUAL TRANSACTION STATES
  // ==========================================

  const [suppliers, setSuppliers] = useState([]);

  const [type, setType] = useState("PURCHASE");
  const [supplierId, setSupplierId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [saving, setSaving] = useState(false);


  // ==========================================
  // VOICE STATES
  // ==========================================

  const [listening, setListening] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [voiceResult, setVoiceResult] = useState(null);


  // ==========================================
  // INVOICE STATES
  // ==========================================

  const [invoiceFile, setInvoiceFile] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceResult, setInvoiceResult] = useState(null);


  // ==========================================
  // FETCH SUPPLIERS
  // ==========================================

  useEffect(() => {

    const fetchSuppliers = async () => {

      try {

        const response = await fetch(
          `${API_URL}/api/v1/suppliers`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch suppliers");
        }

        const data = await response.json();

        setSuppliers(data);

      } catch (error) {

        console.error(error);

        alert("Unable to load suppliers.");

      } finally {

        setLoadingSuppliers(false);

      }

    };

    fetchSuppliers();

  }, []);


  // ==========================================
  // MANUAL TRANSACTION SUBMIT
  // ==========================================

  const handleSubmit = async (event) => {

    event.preventDefault();


    if (!supplierId) {

      alert("Please select a supplier.");

      return;

    }


    if (!amount || Number(amount) <= 0) {

      alert("Please enter a valid amount.");

      return;

    }


    if (!date) {

      alert("Please select a date.");

      return;

    }


    try {

      setSaving(true);


      const response = await fetch(
        `${API_URL}/api/v1/transactions`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({

            supplier_id: Number(supplierId),

            transaction_type: type,

            amount: Number(amount),

            transaction_date: date,

            reference_number:
              referenceNumber.trim() || null,

            notes:
              notes.trim() || null,

          }),

        }
      );


      const responseData = await response.json();


      // Duplicate
      if (response.status === 409) {

        alert(
          "Duplicate transaction detected. This transaction was not saved."
        );

        return;

      }


      // Other backend errors
      if (!response.ok) {

        throw new Error(
          responseData.detail ||
          "Failed to add transaction"
        );

      }


      // Success
      alert("Transaction added successfully!");


      // Clear form
      setType("PURCHASE");
      setSupplierId("");
      setAmount("");
      setDate("");
      setReferenceNumber("");
      setNotes("");


      window.location.href = "/transactions";


    } catch (error) {

      console.error(error);

      alert(
        error.message ||
        "Unable to add transaction."
      );

    } finally {

      setSaving(false);

    }

  };


  // ==========================================
  // VOICE TRANSACTION
  // ==========================================

  const handleVoiceTransaction = () => {

    setVoiceResult(null);
    setVoiceText("");


    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

      alert(
        "Speech recognition is not supported in this browser."
      );

      return;

    }


    const recognition = new SpeechRecognition();


    recognition.lang = "hi-IN";

    recognition.continuous = false;

    recognition.interimResults = false;


    recognition.onstart = () => {

      setListening(true);

    };


    recognition.onresult = async (event) => {

      const text =
        event.results[0][0].transcript;


      setVoiceText(text);

      setListening(false);


      // Send speech text to AI service
      try {

        const response = await fetch(
          `${AI_API_URL}/api/v1/ai/voice/transaction`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              text: text,
            }),

          }
        );


        const data = await response.json();


        if (!response.ok) {

          throw new Error(
            data.detail ||
            "Voice transaction failed"
          );

        }


        setVoiceResult(data);


        // Successful transaction
        if (data.status === "SUCCESS") {

          alert(
            "Voice transaction saved successfully!"
          );

          window.location.href = "/transactions";

        }

      } catch (error) {

        console.error(error);

        setVoiceResult({
          status: "ERROR",
          message:
            error.message ||
            "Voice transaction failed",
        });

      }

    };


    recognition.onerror = (event) => {

      console.error(
        "Speech recognition error:",
        event.error
      );

      setListening(false);

      setVoiceResult({
        status: "ERROR",
        message:
          "Could not understand the speech.",
      });

    };


    recognition.onend = () => {

      setListening(false);

    };


    recognition.start();

  };


  // ==========================================
  // INVOICE FILE SELECT
  // ==========================================

  const handleInvoiceChange = (event) => {

    const file = event.target.files?.[0];

    setInvoiceResult(null);


    if (!file) {

      setInvoiceFile(null);

      return;

    }


    if (!file.type.startsWith("image/")) {

      alert(
        "Please select an invoice image."
      );

      event.target.value = "";

      setInvoiceFile(null);

      return;

    }


    setInvoiceFile(file);

  };


  // ==========================================
  // INVOICE UPLOAD
  // ==========================================

  const handleInvoiceUpload = async () => {

    if (!invoiceFile) {

      alert(
        "Please select an invoice image first."
      );

      return;

    }


    try {

      setInvoiceLoading(true);

      setInvoiceResult(null);


      const formData = new FormData();

      formData.append(
        "file",
        invoiceFile
      );


      const response = await fetch(
        `${AI_API_URL}/api/v1/ai/invoice/transaction`,
        {
          method: "POST",
          body: formData,
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Invoice processing failed"
        );

      }


      setInvoiceResult(data);


      // Successful invoice transaction
      if (data.status === "SUCCESS") {

        alert(
          "Invoice transaction saved successfully!"
        );

        window.location.href = "/transactions";

      }

    } catch (error) {

      console.error(error);

      setInvoiceResult({
        status: "ERROR",
        message:
          error.message ||
          "Unable to process invoice.",
      });

    } finally {

      setInvoiceLoading(false);

    }

  };


  // ==========================================
  // RENDER
  // ==========================================

  return (

    <div className="page">

      <h1>Add Transaction</h1>

      <p className="subtitle">
        Record a purchase, payment, return or credit note.
      </p>


      {/* ======================================
          VOICE TRANSACTION
      ====================================== */}

      <div
        style={{
          background: "#ffffff",
          padding: "24px",
          borderRadius: "16px",
          marginBottom: "30px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
        }}
      >

        <h2>
          🎤 Add Transaction by Voice
        </h2>

        <p>
          Example:
          "ABC Electricals se 5000 rupaye ka purchase 12 September 2026 ko kiya"
        </p>


        <button
          type="button"
          onClick={handleVoiceTransaction}
          disabled={listening}
        >

          {listening
            ? "🎤 Listening..."
            : "🎤 Speak Transaction"}

        </button>


        {voiceText && (

          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              background: "#f5f5f5",
              borderRadius: "10px",
            }}
          >

            <strong>
              You said:
            </strong>

            <p>
              {voiceText}
            </p>

          </div>

        )}


        {voiceResult && (

          <div
            style={{
              marginTop: "15px",
              padding: "15px",
              borderRadius: "10px",
              background:
                voiceResult.status === "SUCCESS"
                  ? "#e8f7e8"
                  : "#ffe8e8",
            }}
          >

            <strong>
              {voiceResult.status}
            </strong>

            <p>
              {voiceResult.message}
            </p>


            {voiceResult.missing_fields && (

              <p>
                Missing:
                {" "}
                {voiceResult.missing_fields.join(", ")}
              </p>

            )}


            {voiceResult.supplier_name && (

              <p>
                Supplier:
                {" "}
                {voiceResult.supplier_name}
              </p>

            )}

          </div>

        )}

      </div>


      {/* ======================================
          INVOICE TRANSACTION
      ====================================== */}

      <div
        style={{
          background: "#ffffff",
          padding: "24px",
          borderRadius: "16px",
          marginBottom: "30px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
        }}
      >

        <h2>
          🧾 Add Transaction by Invoice
        </h2>

        <p>
          Upload a GST/tax invoice and AI will
          extract the transaction details.
        </p>


        <input
          type="file"
          accept="image/*"
          onChange={handleInvoiceChange}
          disabled={invoiceLoading}
        />


        {invoiceFile && (

          <p
            style={{
              marginTop: "10px",
            }}
          >

            Selected:
            {" "}
            <strong>
              {invoiceFile.name}
            </strong>

          </p>

        )}


        <button
          type="button"
          onClick={handleInvoiceUpload}
          disabled={
            invoiceLoading ||
            !invoiceFile
          }
        >

          {invoiceLoading
            ? "Processing Invoice..."
            : "🧾 Upload & Process Invoice"}

        </button>


        {invoiceResult && (

          <div
            style={{
              marginTop: "20px",
              padding: "18px",
              borderRadius: "10px",
              background:
                invoiceResult.status === "SUCCESS"
                  ? "#e8f7e8"
                  : "#ffe8e8",
            }}
          >

            <h3>
              Invoice Result
            </h3>


            <p>
              <strong>
                Status:
              </strong>
              {" "}
              {invoiceResult.status}
            </p>


            {invoiceResult.message && (

              <p>
                {invoiceResult.message}
              </p>

            )}


            {invoiceResult.missing_fields && (

              <p>
                <strong>
                  Missing:
                </strong>
                {" "}
                {invoiceResult.missing_fields.join(", ")}
              </p>

            )}


            {invoiceResult.supplier_name && (

              <p>
                <strong>
                  Supplier:
                </strong>
                {" "}
                {invoiceResult.supplier_name}
              </p>

            )}


            {invoiceResult.transaction && (

              <div>

                <p>
                  <strong>
                    Supplier:
                  </strong>
                  {" "}
                  {invoiceResult.transaction.supplier_name ||
                    "Not found"}
                </p>

                <p>
                  <strong>
                    Amount:
                  </strong>
                  {" "}
                  ₹
                  {invoiceResult.transaction.amount ?? "Not found"}
                </p>

                <p>
                  <strong>
                    Date:
                  </strong>
                  {" "}
                  {invoiceResult.transaction.transaction_date ||
                    "Not found"}
                </p>

                <p>
                  <strong>
                    Reference:
                  </strong>
                  {" "}
                  {invoiceResult.transaction.reference_number ||
                    "Not found"}
                </p>

              </div>

            )}

          </div>

        )}

      </div>


      {/* ======================================
          MANUAL TRANSACTION
      ====================================== */}

      <form onSubmit={handleSubmit}>

        {/* Transaction Type */}

        <div>

          <label>
            Transaction Type
          </label>

          <br />

          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value)
            }
          >

            <option value="PURCHASE">
              Purchase
            </option>

            <option value="PAYMENT">
              Payment
            </option>

            <option value="RETURN">
              Return
            </option>

            <option value="CREDIT_NOTE">
              Credit Note
            </option>

          </select>

        </div>


        <br />


        {/* Supplier */}

        <div>

          <label>
            Supplier
          </label>

          <br />

          {loadingSuppliers ? (

            <p>
              Loading suppliers...
            </p>

          ) : (

            <select
              value={supplierId}
              onChange={(e) =>
                setSupplierId(e.target.value)
              }
            >

              <option value="">
                Select Supplier
              </option>

              {suppliers.map((supplier) => (

                <option
                  key={supplier.id}
                  value={supplier.id}
                >
                  {supplier.name}
                </option>

              ))}

            </select>

          )}

        </div>


        <br />


        {/* Amount */}

        <div>

          <label>
            Amount
          </label>

          <br />

          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
          />

        </div>


        <br />


        {/* Date */}

        <div>

          <label>
            Transaction Date
          </label>

          <br />

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
          />

        </div>


        <br />


        {/* Reference Number */}

        <div>

          <label>
            Reference Number
          </label>

          <br />

          <input
            type="text"
            placeholder="e.g. INV001"
            value={referenceNumber}
            onChange={(e) =>
              setReferenceNumber(e.target.value)
            }
          />

        </div>


        <br />


        {/* Notes */}

        <div>

          <label>
            Notes
          </label>

          <br />

          <textarea
            placeholder="Enter notes"
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
          />

        </div>


        <br />


        {/* Save */}

        <button
          type="submit"
          disabled={
            saving ||
            loadingSuppliers
          }
        >

          {saving
            ? "Saving..."
            : "Save Transaction"}

        </button>

      </form>

    </div>

  );

}


export default AddTransaction;