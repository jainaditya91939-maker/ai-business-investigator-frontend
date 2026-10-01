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

  const [saving, setSaving] =
    useState(false);


  // ==========================================
  // VOICE STATES
  // ==========================================

  const [listening, setListening] =
    useState(false);

  const [voiceText, setVoiceText] =
    useState("");

  const [voiceResult, setVoiceResult] =
    useState(null);

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
  // SUPPLIER NAME NORMALIZATION
  // ==========================================
  //
  // Voice recognition can return:
  //
  // हैवेल्स       -> Havells
  // पॉलीकैब       -> Polycab
  // पॉलेसी        -> Polycab
  // एबीसी         -> ABC
  // इलेक्ट्रिकल   -> Electrical
  //
  // This keeps supplier names in English/Hinglish
  // instead of saving Hindi ASR text directly.
  // ==========================================

  const supplierWordMap = {
    // Common electrical brands
    "हैवेल्स": "Havells",
    "हैवेल": "Havells",
    "हैवल्स": "Havells",
    "हैवल": "Havells",
    "हैवेलस": "Havells",

    "पॉलीकैब": "Polycab",
    "पॉलीकैब्स": "Polycab",
    "पॉलेसी": "Polycab",
    "पॉलीकेब": "Polycab",
    "पोलिकैब": "Polycab",
    "पॉलीकब": "Polycab",

    "एंकर": "Anchor",
    "एंकर बाय पैनासोनिक": "Anchor",
    "फिनोलेक्स": "Finolex",
    "फिनोलेक्स": "Finolex",
    "क्रॉम्पटन": "Crompton",
    "लेग्रैंड": "Legrand",
    "लेग्रां": "Legrand",
    "श्नाइडर": "Schneider",
    "फिलिप्स": "Philips",
    "विप्रो": "Wipro",
    "बजाज": "Bajaj",
    "आरआर": "RR",
    "आर आर": "RR",

    // Common company words
    "इलेक्ट्रिकल": "Electrical",
    "इलेक्ट्रिकल्स": "Electricals",
    "इलेक्ट्रिक": "Electric",
    "इलेक्ट्रॉनिक्स": "Electronics",
    "इलेक्ट्रॉनिक": "Electronic",

    "ट्रेडर्स": "Traders",
    "ट्रेडर": "Trader",
    "एंटरप्राइजेज": "Enterprises",
    "एंटरप्राइज": "Enterprise",
    "इंटरप्राइजेज": "Enterprises",
    "इंटरप्राइज": "Enterprise",
    "हार्डवेयर": "Hardware",
    "सप्लायर्स": "Suppliers",
    "सप्लायर": "Supplier",
    "स्टोर्स": "Stores",
    "स्टोर": "Store",
    "इंडस्ट्रीज": "Industries",
    "इंडस्ट्री": "Industry",
    "कॉर्पोरेशन": "Corporation",
    "कॉरपोरेशन": "Corporation",
    "कंपनी": "Company",

    // Alphabet ASR variants
    "एबीसी": "ABC",
    "ए बी सी": "ABC",
    "एबीसीडी": "ABCD",
    "आरएस": "RS",
    "आर एस": "RS",
    "एसके": "SK",
    "एस के": "SK",
    "एमके": "MK",
    "एम के": "MK",
  };


  // ------------------------------------------
  // Generic Hindi -> Hinglish transliteration
  // ------------------------------------------

  const devanagariToLatin = (text) => {

    const consonants = {
      "क": "k",
      "ख": "kh",
      "ग": "g",
      "घ": "gh",
      "ङ": "ng",

      "च": "ch",
      "छ": "chh",
      "ज": "j",
      "झ": "jh",
      "ञ": "ny",

      "ट": "t",
      "ठ": "th",
      "ड": "d",
      "ढ": "dh",
      "ण": "n",

      "त": "t",
      "थ": "th",
      "द": "d",
      "ध": "dh",
      "न": "n",

      "प": "p",
      "फ": "ph",
      "ब": "b",
      "भ": "bh",
      "म": "m",

      "य": "y",
      "र": "r",
      "ल": "l",
      "व": "v",

      "श": "sh",
      "ष": "sh",
      "स": "s",
      "ह": "h",

      "क्ष": "ksh",
      "त्र": "tr",
      "ज्ञ": "gya",
    };


    const vowels = {
      "अ": "a",
      "आ": "aa",
      "इ": "i",
      "ई": "ee",
      "उ": "u",
      "ऊ": "oo",
      "ए": "e",
      "ऐ": "ai",
      "ओ": "o",
      "औ": "au",
    };


    const matras = {
      "ा": "aa",
      "ि": "i",
      "ी": "ee",
      "ु": "u",
      "ू": "oo",
      "ृ": "ri",
      "े": "e",
      "ै": "ai",
      "ो": "o",
      "ौ": "au",
    };


    const special = {
      "ं": "n",
      "ँ": "n",
      "ः": "h",
      "़": "",
      "्": "",
    };


    let result = "";

    for (let i = 0; i < text.length; i++) {

      const char = text[i];

      // Handle common conjuncts
      if (
        text.slice(i, i + 2) === "क्ष"
      ) {
        result += "ksh";
        i++;
        continue;
      }

      if (
        text.slice(i, i + 2) === "त्र"
      ) {
        result += "tr";
        i++;
        continue;
      }

      if (
        text.slice(i, i + 2) === "ज्ञ"
      ) {
        result += "gya";
        i++;
        continue;
      }


      if (consonants[char]) {

        result += consonants[char];

        // Look ahead for matra
        const next = text[i + 1];

        if (matras[next]) {

          result += matras[next];

          i++;

        } else if (next === "्") {

          // Halant means no automatic vowel.
          // The next consonant follows directly.
          i++;

        } else {

          // Natural Hindi default vowel.
          result += "a";

        }

        continue;
      }


      if (vowels[char]) {

        result += vowels[char];

        continue;
      }


      if (matras[char]) {

        result += matras[char];

        continue;
      }


      if (special[char]) {

        result += special[char];

        continue;
      }


      // Numbers, English letters, spaces etc.
      result += char;
    }


    return result;
  };


  // ------------------------------------------
  // Convert ASR supplier name to English
  // ------------------------------------------

  const normalizeSupplierName = (rawName) => {

    if (!rawName) {
      return "";
    }


    let name = rawName
      .trim()
      .replace(/\s+/g, " ");


    // --------------------------------------
    // Exact common-name match
    // --------------------------------------

    const exactMatch =
      supplierWordMap[name];

    if (exactMatch) {
      return exactMatch;
    }


    // --------------------------------------
    // Replace known Hindi words inside name
    // --------------------------------------

    const words =
      name.split(" ");


    const convertedWords =
      words.map((word) => {

        if (supplierWordMap[word]) {

          return supplierWordMap[word];

        }

        return word;

      });


    name =
      convertedWords.join(" ");


    // --------------------------------------
    // Special phrase replacements
    // --------------------------------------

    const phraseMap = [
      ["एबीसी इलेक्ट्रिकल", "ABC Electrical"],
      ["एबीसी इलेक्ट्रिकल्स", "ABC Electricals"],

      ["हैवेल्स इलेक्ट्रिकल", "Havells Electrical"],
      ["हैवेल्स इलेक्ट्रिकल्स", "Havells Electricals"],

      ["पॉलीकैब इलेक्ट्रिकल", "Polycab Electrical"],
      ["पॉलीकैब इलेक्ट्रिकल्स", "Polycab Electricals"],

      ["पॉलेसी इलेक्ट्रिकल", "Polycab Electrical"],
      ["पॉलेसी इलेक्ट्रिकल्स", "Polycab Electricals"],

      ["एंकर इलेक्ट्रिकल", "Anchor Electrical"],
      ["एंकर इलेक्ट्रिकल्स", "Anchor Electricals"],

      ["फिनोलेक्स इलेक्ट्रिकल", "Finolex Electrical"],
      ["फिनोलेक्स इलेक्ट्रिकल्स", "Finolex Electricals"],
    ];


    for (const [hindi, english] of phraseMap) {

      if (
        name
          .toLowerCase()
          .includes(hindi.toLowerCase())
      ) {

        name =
          name.replace(
            new RegExp(hindi, "gi"),
            english
          );

      }

    }


    // --------------------------------------
    // If Devanagari is still present,
    // transliterate remaining text.
    // --------------------------------------

    if (/[\u0900-\u097F]/.test(name)) {

      name =
        devanagariToLatin(name);

    }


    // --------------------------------------
    // Clean spacing
    // --------------------------------------

    name =
      name
        .replace(/\s+/g, " ")
        .trim();


    // --------------------------------------
    // Make first letter of words uppercase
    // but preserve acronyms like ABC / RR.
    // --------------------------------------

    name =
      name
        .split(" ")
        .map((word) => {

          if (!word) {
            return word;
          }

          if (
            /^[A-Z0-9]+$/.test(word)
          ) {
            return word;
          }

          return (
            word.charAt(0).toUpperCase() +
            word.slice(1)
          );

        })
        .join(" ");


    return name;
  };


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
  // SEND VOICE TEXT
  // ==========================================

  const sendVoiceText =
    async (spokenText) => {

      const response =
        await aiFetch(
          "/api/v1/ai/voice/transaction",
          {
            method: "POST",

            body: JSON.stringify({
              text: spokenText,
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
  // ADD UNKNOWN VOICE SUPPLIER
  // ==========================================

  const handleAddVoiceSupplier =
    async () => {

      if (
        !voiceResult?.supplier_name ||
        !voiceText
      ) {

        return;

      }


      // --------------------------------------
      // IMPORTANT:
      // Convert Hindi ASR name to English/
      // Hinglish before saving.
      // --------------------------------------

      const detectedSupplierName =
        voiceResult.supplier_name.trim();


      const supplierName =
        normalizeSupplierName(
          detectedSupplierName
        );


      if (!supplierName) {

        setVoiceResult({

          status:
            "ERROR",

          message:
            "Could not determine supplier name.",

          supplier_name:
            detectedSupplierName,

        });

        return;

      }


      const addConfirmed =
        window.confirm(

          `Supplier "${detectedSupplierName}" was not found.\n\n` +

          `It will be saved as "${supplierName}".\n\n` +

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
              created,
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
        // RETRY ORIGINAL VOICE TRANSACTION
        // ------------------------------------

        const retryData =
          await sendVoiceText(
            voiceText
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
        "hi-IN";

      recognition.continuous =
        false;

      recognition.interimResults =
        false;


      recognition.onstart =
        () => {

          setListening(true);

        };


      recognition.onresult =
        async (event) => {

          const spokenText =
            event.results[0][0]
              .transcript;


          setVoiceText(
            spokenText
          );


          setListening(false);


          try {

            const data =
              await sendVoiceText(
                spokenText
              );


            setVoiceResult(
              data
            );


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

          }

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
              "Could not understand the speech.",

          });

        };


      recognition.onend =
        () => {

          setListening(false);

        };


      recognition.start();

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
            addingVoiceSupplier
          }
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