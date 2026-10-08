import { useEffect, useState } from "react";
import { aiFetch, apiFetch } from "../api";

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

  const [loadingSuppliers, setLoadingSuppliers] =
    useState(true);

  const [saving, setSaving] = useState(false);


  // ==========================================
  // VOICE STATES
  // ==========================================

  const [listening, setListening] =
    useState(false);

  const [voiceText, setVoiceText] =
    useState("");

  const [voiceResult, setVoiceResult] =
    useState(null);

  const [voiceProcessing, setVoiceProcessing] =
    useState(false);

  const [addingVoiceSupplier, setAddingVoiceSupplier] =
    useState(false);


  // ==========================================
  // INVOICE STATES
  // ==========================================

  const [invoiceFile, setInvoiceFile] =
    useState(null);

  const [invoiceLoading, setInvoiceLoading] =
    useState(false);

  const [invoiceResult, setInvoiceResult] =
    useState(null);


  // ==========================================
  // FETCH SUPPLIERS
  // ==========================================

  useEffect(() => {

    const fetchSuppliers = async () => {

      try {

        const response =
          await apiFetch(
            "/api/v1/suppliers"
          );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch suppliers"
          );
        }

        const data =
          await response.json();

        setSuppliers(data);

      } catch (error) {

        console.error(error);

        alert(
          "Unable to load suppliers."
        );

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

      alert(
        "Please select a supplier."
      );

      return;

    }

    if (
      !amount ||
      Number(amount) <= 0
    ) {

      alert(
        "Please enter a valid amount."
      );

      return;

    }

    if (!date) {

      alert(
        "Please select a date."
      );

      return;

    }

    try {

      setSaving(true);

      const response =
        await apiFetch(
          "/api/v1/transactions",
          {
            method: "POST",

            body: JSON.stringify({

              supplier_id:
                Number(supplierId),

              transaction_type:
                type,

              amount:
                Number(amount),

              transaction_date:
                date,

              reference_number:
                referenceNumber.trim() ||
                null,

              notes:
                notes.trim() ||
                null,

            }),

          }
        );

      const responseData =
        await response.json();

      if (
        response.status === 409
      ) {

        alert(
          "Duplicate transaction detected. This transaction was not saved."
        );

        return;

      }

      if (!response.ok) {

        throw new Error(
          responseData.detail ||
          "Failed to add transaction"
        );

      }

      alert(
        "Transaction added successfully!"
      );

      setType("PURCHASE");
      setSupplierId("");
      setAmount("");
      setDate("");
      setReferenceNumber("");
      setNotes("");

      window.location.href =
        "/transactions";

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
  // SEND VOICE TEXT TO AI
  // ==========================================

  const sendVoiceText =
    async (spokenText) => {

      if (!spokenText?.trim()) {

        throw new Error(
          "Please enter a voice sentence first."
        );

      }

      const response =
        await aiFetch(
          "/api/v1/ai/voice/transaction",
          {
            method: "POST",

            body: JSON.stringify({
              text: spokenText.trim(),
            }),

          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Voice transaction failed"
        );

      }

      return data;

    };


  // ==========================================
  // PROCESS EDITED VOICE TEXT
  // ==========================================

  const handleProcessVoice =
    async () => {

      const cleanedText =
        voiceText.trim();

      if (!cleanedText) {

        alert(
          "Please enter or edit the sentence first."
        );

        return;

      }

      try {

        setVoiceProcessing(true);

        setVoiceResult(null);

        const data =
          await sendVoiceText(
            cleanedText
          );

        setVoiceResult(data);

        if (
          data.status ===
          "SUCCESS"
        ) {

          alert(
            "Voice transaction saved successfully!"
          );

          window.location.href =
            "/transactions";

        }

      } catch (error) {

        console.error(error);

        setVoiceResult({

          status:
            "ERROR",

          message:
            error.message ||
            "Voice transaction failed",

        });

      } finally {

        setVoiceProcessing(
          false
        );

      }

    };


  // ==========================================
  // ADD UNKNOWN VOICE SUPPLIER
  // ==========================================

  const handleAddVoiceSupplier =
    async () => {

      if (
        !voiceResult?.supplier_name ||
        !voiceText.trim()
      ) {

        return;

      }

      const supplierName =
        voiceResult.supplier_name.trim();

      const addConfirmed =
        window.confirm(
          `Supplier "${supplierName}" is not in your supplier list.\n\n` +
          `Do you want to add "${supplierName}" as a new supplier?`
        );

      if (!addConfirmed) {
        return;
      }

      try {

        setAddingVoiceSupplier(true);

        // ------------------------------------
        // CREATE SUPPLIER
        // ------------------------------------

        const createResponse =
          await apiFetch(
            "/api/v1/suppliers",
            {
              method: "POST",

              body: JSON.stringify({

                name:
                  supplierName,

                phone:
                  null,

                address:
                  null,

              }),

            }
          );

        const createData =
          await createResponse.json();

        if (
          createResponse.status !== 409 &&
          !createResponse.ok
        ) {

          throw new Error(
            createData.detail ||
            "Unable to create supplier"
          );

        }

        // ------------------------------------
        // UPDATE SUPPLIER LIST
        // ------------------------------------

        setSuppliers(
          (current) => {

            if (
              createResponse.status ===
              409
            ) {

              return current;

            }

            const created =
              createData.supplier;

            if (!created) {
              return current;
            }

            return [
              ...current,
              created
            ];

          }
        );

        // ------------------------------------
        // CONFIRM TRANSACTION
        // ------------------------------------

        const saveConfirmed =
          window.confirm(
            `"${supplierName}" is ready.\n\n` +
            `Do you want to save this voice transaction now?`
          );

        if (!saveConfirmed) {

          setVoiceResult({

            status:
              "SUPPLIER_ADDED",

            message:
              `Supplier "${supplierName}" was added. Transaction was not saved.`,

            supplier_name:
              supplierName,

          });

          return;

        }

        // ------------------------------------
        // RETRY ORIGINAL EDITED VOICE TEXT
        // ------------------------------------

        const retryData =
          await sendVoiceText(
            voiceText.trim()
          );

        setVoiceResult(
          retryData
        );

        if (
          retryData.status ===
          "SUCCESS"
        ) {

          alert(
            "Supplier added and voice transaction saved successfully!"
          );

          window.location.href =
            "/transactions";

        }

      } catch (error) {

        console.error(error);

        setVoiceResult({

          status:
            "ERROR",

          message:
            error.message ||
            "Unable to add supplier or save transaction.",

          supplier_name:
            supplierName,

        });

      } finally {

        setAddingVoiceSupplier(
          false
        );

      }

    };


  // ==========================================
  // VOICE TRANSACTION
  // ==========================================

  const handleVoiceTransaction =
    () => {

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

      const recognition =
        new SpeechRecognition();

      recognition.lang =
        "en-IN";

      recognition.maxAlternatives =
        3;

      recognition.continuous =
        false;

      recognition.interimResults =
        false;

      recognition.onstart =
        () => {

          setListening(true);

        };

      recognition.onresult =
        (event) => {

          const spokenText =
            event.results[0][0]
              .transcript
              .trim();

          setVoiceText(
            spokenText
          );

          setVoiceResult(null);

          setListening(false);

        };

      recognition.onerror =
        (event) => {

          console.error(
            "Speech recognition error:",
            event.error
          );

          setListening(false);

          setVoiceResult({

            status:
              "ERROR",

            message:
              "Could not understand the speech. Please try again.",

          });

        };

      recognition.onend =
        () => {

          setListening(false);

        };

      try {

        recognition.start();

      } catch (error) {

        console.error(error);

        setListening(false);

        setVoiceResult({

          status:
            "ERROR",

          message:
            "Unable to start microphone. Please try again.",

        });

      }

    };


  // ==========================================
  // INVOICE FILE SELECT
  // ==========================================

  const handleInvoiceChange =
    (event) => {

      const file =
        event.target.files?.[0];

      setInvoiceResult(null);

      if (!file) {

        setInvoiceFile(null);

        return;

      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        alert(
          "Please select an invoice image."
        );

        event.target.value =
          "";

        setInvoiceFile(null);

        return;

      }

      setInvoiceFile(file);

    };


  // ==========================================
  // INVOICE UPLOAD
  // ==========================================

  const handleInvoiceUpload =
    async () => {

      if (!invoiceFile) {

        alert(
          "Please select an invoice image first."
        );

        return;

      }

      try {

        setInvoiceLoading(true);

        setInvoiceResult(null);

        const formData =
          new FormData();

        formData.append(
          "file",
          invoiceFile
        );

        const response =
          await aiFetch(
            "/api/v1/ai/invoice/transaction",
            {
              method: "POST",
              body: formData,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {

          throw new Error(
            data.detail ||
            "Invoice processing failed"
          );

        }

        setInvoiceResult(
          data
        );

        if (
          data.status ===
          "SUCCESS"
        ) {

          alert(
            "Invoice transaction saved successfully!"
          );

          window.location.href =
            "/transactions";

        }

      } catch (error) {

        console.error(error);

        setInvoiceResult({

          status:
            "ERROR",

          message:
            error.message ||
            "Unable to process invoice.",

        });

      } finally {

        setInvoiceLoading(
          false
        );

      }

    };


  // ==========================================
  // RENDER
  // ==========================================

  return (

    <div className="page">

      <h1>
        Add Transaction
      </h1>

      <p className="subtitle">
        Record a purchase, payment,
        return or credit note.
      </p>


      {/* =====================================
          VOICE TRANSACTION
      ===================================== */}

      <div
        style={{
          background: "#ffffff",
          padding: "24px",
          borderRadius: "16px",
          marginBottom: "30px",
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.08)",
        }}
      >

        <h2>
          🎤 Add Transaction by Voice
        </h2>

        <p>
          Example:
          "Polycab se 500 rupaye ka
          purchase kiya"
        </p>

        <button
          type="button"
          onClick={
            handleVoiceTransaction
          }
          disabled={
            listening ||
            voiceProcessing ||
            addingVoiceSupplier
          }
        >

          {listening
            ? "🎤 Listening..."
            : "🎤 Speak Transaction"}

        </button>


        {/* =================================
            EDITABLE VOICE TEXT
        ================================= */}

        {voiceText && (

          <div
            style={{
              marginTop: "20px",
              padding: "18px",
              background: "#f5f5f5",
              borderRadius: "12px",
              border: "1px solid #ddd",
            }}
          >

            <strong>
              📝 Check / edit your sentence
            </strong>

            <p
              style={{
                marginTop: "8px",
                marginBottom: "10px",
                color: "#666",
              }}
            >
              If speech recognition heard
              something incorrectly, edit
              the sentence below before
              processing.
            </p>

            <textarea
              value={voiceText}
              onChange={(e) => {
                setVoiceText(
                  e.target.value
                );

                if (voiceResult) {
                  setVoiceResult(null);
                }
              }}
              rows={3}
              placeholder="Example: Polycab se 500 rupaye ka purchase kiya"
              disabled={
                voiceProcessing ||
                addingVoiceSupplier
              }
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "16px",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "12px",
              }}
            >

              <button
                type="button"
                onClick={
                  handleVoiceTransaction
                }
                disabled={
                  listening ||
                  voiceProcessing ||
                  addingVoiceSupplier
                }
              >
                🔄 Re-record
              </button>

              <button
                type="button"
                onClick={
                  handleProcessVoice
                }
                disabled={
                  voiceProcessing ||
                  addingVoiceSupplier ||
                  !voiceText.trim()
                }
              >
                {voiceProcessing
                  ? "🤖 Processing..."
                  : "🤖 Process & Save"}
              </button>

            </div>

          </div>

        )}


        {voiceResult && (

          <div
            style={{
              marginTop: "15px",
              padding: "15px",
              borderRadius: "10px",
              background:
                voiceResult.status ===
                  "SUCCESS" ||
                voiceResult.status ===
                  "SUPPLIER_ADDED"
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
                Missing:{" "}
                {
                  voiceResult
                    .missing_fields
                    .join(", ")
                }
              </p>

            )}


            {voiceResult.supplier_name && (

              <p>
                Supplier:{" "}
                {
                  voiceResult
                    .supplier_name
                }
              </p>

            )}


            {voiceResult.status ===
              "SUPPLIER_NOT_FOUND" && (

              <button
                type="button"
                onClick={
                  handleAddVoiceSupplier
                }
                disabled={
                  addingVoiceSupplier
                }
                style={{
                  marginTop: "10px",
                }}
              >

                {addingVoiceSupplier
                  ? "Adding Supplier..."
                  : "➕ Add Supplier & Continue"}

              </button>

            )}


            {voiceResult.transaction && (

              <div>

                <p>
                  <strong>
                    Supplier:
                  </strong>{" "}
                  {
                    voiceResult
                      .transaction
                      .supplier_name ||
                    "Not found"
                  }
                </p>

                <p>
                  <strong>
                    Amount:
                  </strong>{" "}
                  ₹
                  {
                    voiceResult
                      .transaction
                      .amount ??
                    "Not found"
                  }
                </p>

                <p>
                  <strong>
                    Date:
                  </strong>{" "}
                  {
                    voiceResult
                      .transaction
                      .transaction_date ||
                    "Not found"
                  }
                </p>

                <p>
                  <strong>
                    Reference:
                  </strong>{" "}
                  {
                    voiceResult
                      .transaction
                      .reference_number ||
                    "Not found"
                  }
                </p>

              </div>

            )}

          </div>

        )}

      </div>


      {/* =====================================
          INVOICE TRANSACTION
      ===================================== */}

      <div
        style={{
          background: "#ffffff",
          padding: "24px",
          borderRadius: "16px",
          marginBottom: "30px",
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.08)",
        }}
      >

        <h2>
          🧾 Add Transaction by Invoice
        </h2>

        <p>
          Upload a GST/tax invoice and AI
          will extract the transaction
          details.
        </p>


        <input
          type="file"
          accept="image/*"
          onChange={
            handleInvoiceChange
          }
          disabled={
            invoiceLoading
          }
        />


        {invoiceFile && (

          <p
            style={{
              marginTop: "10px",
            }}
          >

            Selected:{" "}
            <strong>
              {invoiceFile.name}
            </strong>

          </p>

        )}


        <button
          type="button"
          onClick={
            handleInvoiceUpload
          }
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
                invoiceResult.status ===
                "SUCCESS"
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
              </strong>{" "}
              {
                invoiceResult.status
              }
            </p>


            {invoiceResult.message && (

              <p>
                {
                  invoiceResult.message
                }
              </p>

            )}


            {invoiceResult.missing_fields && (

              <p>
                <strong>
                  Missing:
                </strong>{" "}
                {
                  invoiceResult
                    .missing_fields
                    .join(", ")
                }
              </p>

            )}


            {invoiceResult.supplier_name && (

              <p>
                <strong>
                  Supplier:
                </strong>{" "}
                {
                  invoiceResult
                    .supplier_name
                }
              </p>

            )}


            {invoiceResult.transaction && (

              <div>

                <p>
                  <strong>
                    Supplier:
                  </strong>{" "}
                  {
                    invoiceResult
                      .transaction
                      .supplier_name ||
                    "Not found"
                  }
                </p>

                <p>
                  <strong>
                    Amount:
                  </strong>{" "}
                  ₹
                  {
                    invoiceResult
                      .transaction
                      .amount ??
                    "Not found"
                  }
                </p>

                <p>
                  <strong>
                    Date:
                  </strong>{" "}
                  {
                    invoiceResult
                      .transaction
                      .transaction_date ||
                    "Not found"
                  }
                </p>

                <p>
                  <strong>
                    Reference:
                  </strong>{" "}
                  {
                    invoiceResult
                      .transaction
                      .reference_number ||
                    "Not found"
                  }
                </p>

              </div>

            )}

          </div>

        )}

      </div>


      {/* =====================================
          MANUAL TRANSACTION
      ===================================== */}

      <form
        onSubmit={
          handleSubmit
        }
      >

        <div>

          <label>
            Transaction Type
          </label>

          <br />

          <select
            value={type}
            onChange={
              (e) =>
                setType(
                  e.target.value
                )
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
              value={
                supplierId
              }
              onChange={
                (e) =>
                  setSupplierId(
                    e.target.value
                  )
              }
            >

              <option value="">
                Select Supplier
              </option>

              {suppliers.map(
                (supplier) => (

                  <option
                    key={
                      supplier.id
                    }
                    value={
                      supplier.id
                    }
                  >
                    {
                      supplier.name
                    }
                  </option>

                )
              )}

            </select>

          )}

        </div>


        <br />


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
            onChange={
              (e) =>
                setAmount(
                  e.target.value
                )
            }
          />

        </div>


        <br />


        <div>

          <label>
            Transaction Date
          </label>

          <br />

          <input
            type="date"
            value={date}
            onChange={
              (e) =>
                setDate(
                  e.target.value
                )
            }
          />

        </div>


        <br />


        <div>

          <label>
            Reference Number
          </label>

          <br />

          <input
            type="text"
            placeholder="e.g. INV001"
            value={
              referenceNumber
            }
            onChange={
              (e) =>
                setReferenceNumber(
                  e.target.value
                )
            }
          />

        </div>


        <br />


        <div>

          <label>
            Notes
          </label>

          <br />

          <textarea
            placeholder="Enter notes"
            value={notes}
            onChange={
              (e) =>
                setNotes(
                  e.target.value
                )
            }
          />

        </div>


        <br />


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