import { useEffect, useState } from "react";
import { API_URL, authFetch } from "../api";

function Products() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  // =========================
  // GET PRODUCTS
  // =========================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authFetch(
        `${API_URL}/api/v1/products`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Products error:", error);
      setError("Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GET SUPPLIERS
  // =========================

  const fetchSuppliers = async () => {
    try {
      setLoadingSuppliers(true);

      const response = await authFetch(
        `${API_URL}/api/v1/suppliers`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch suppliers");
      }

      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error("Suppliers error:", error);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setName("");
    setCategory("");
    setSupplierId("");
    setPrice("");
    setStock("");
    setEditingProduct(null);
  };

  // =========================
  // OPEN ADD FORM
  // =========================

  const handleAddProduct = () => {
    resetForm();
    setShowForm(true);
  };

  // =========================
  // OPEN EDIT FORM
  // =========================

  const handleEdit = (product) => {
    setEditingProduct(product);

    setName(product.name || "");
    setCategory(product.category || "");

    setSupplierId(
      product.supplier_id
        ? String(product.supplier_id)
        : ""
    );

    setPrice(
      product.price !== null &&
      product.price !== undefined
        ? String(product.price)
        : ""
    );

    setStock(
      product.stock !== null &&
      product.stock !== undefined
        ? String(product.stock)
        : ""
    );

    setShowForm(true);
  };

  // =========================
  // ADD / UPDATE PRODUCT
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      alert("Please enter product name.");
      return;
    }

    if (price === "" || Number(price) < 0) {
      alert("Please enter a valid price.");
      return;
    }

    if (stock === "" || Number(stock) < 0) {
      alert("Please enter valid stock.");
      return;
    }

    try {
      setSaving(true);

      const isEditing = editingProduct !== null;

      const url = isEditing
        ? `${API_URL}/api/v1/products/${editingProduct.id}`
        : `${API_URL}/api/v1/products`;

      const method = isEditing ? "PUT" : "POST";

      const response = await authFetch(url, {
        method: method,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: name.trim(),

          category:
            category.trim() || null,

          supplier_id:
            supplierId !== ""
              ? Number(supplierId)
              : null,

          price: Number(price),

          stock: Number(stock),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to save product"
        );
      }

      if (isEditing) {
        alert("Product updated successfully!");
      } else {
        alert("Product added successfully!");
      }

      resetForm();
      setShowForm(false);

      await fetchProducts();
    } catch (error) {
      console.error(
        "Save product error:",
        error
      );

      alert(
        error.message ||
          "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE PRODUCT
  // =========================

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingProduct(product.id);

      const response = await authFetch(
        `${API_URL}/api/v1/products/${product.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to delete product"
        );
      }

      alert("Product deleted successfully!");

      await fetchProducts();
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      alert(
        error.message ||
          "Unable to delete product."
      );
    } finally {
      setDeletingProduct(null);
    }
  };

  // =========================
  // MONEY FORMAT
  // =========================

  const formatMoney = (amount) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="page">

      {/* PAGE HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1>Products</h1>

          <p className="subtitle">
            Manage your inventory and monitor product stock.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddProduct}
          style={{
            background: "#2563eb",
            color: "#ffffff",
            border: "none",
            padding: "11px 18px",
            borderRadius: "9px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow:
              "0 4px 12px rgba(37, 99, 235, 0.2)",
          }}
        >
          + Add Product
        </button>
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div
          className="card"
          style={{
            marginTop: "25px",
            padding: "26px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "22px",
              gap: "15px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "20px",
                  marginBottom: "5px",
                }}
              >
                {editingProduct
                  ? "Edit Product"
                  : "Add Product"}
              </h2>

              <p
                style={{
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                {editingProduct
                  ? "Update product information and inventory."
                  : "Add a new product to your inventory."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "18px",
              }}
            >

              {/* PRODUCT NAME */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "7px",
                  }}
                >
                  Product Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. LED Bulb 12W"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "12px 13px",
                    border: "1px solid #d1d5db",
                    borderRadius: "9px",
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* CATEGORY */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "7px",
                  }}
                >
                  Category
                </label>

                <input
                  type="text"
                  placeholder="e.g. Lighting"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "12px 13px",
                    border: "1px solid #d1d5db",
                    borderRadius: "9px",
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* SUPPLIER */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "7px",
                  }}
                >
                  Supplier
                </label>

                {loadingSuppliers ? (
                  <div
                    style={{
                      padding: "12px 13px",
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "9px",
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                  >
                    Loading suppliers...
                  </div>
                ) : (
                  <select
                    value={supplierId}
                    onChange={(e) =>
                      setSupplierId(
                        e.target.value
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "12px 13px",
                      border: "1px solid #d1d5db",
                      borderRadius: "9px",
                      fontSize: "14px",
                      background: "#ffffff",
                    }}
                  >
                    <option value="">
                      Select Supplier
                    </option>

                    {suppliers.map(
                      (supplier) => (
                        <option
                          key={supplier.id}
                          value={supplier.id}
                        >
                          {supplier.name}
                        </option>
                      )
                    )}
                  </select>
                )}
              </div>

              {/* PRICE */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "7px",
                  }}
                >
                  Price
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "12px 13px",
                    border: "1px solid #d1d5db",
                    borderRadius: "9px",
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* STOCK */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "7px",
                  }}
                >
                  Stock Quantity
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Enter stock quantity"
                  value={stock}
                  onChange={(e) =>
                    setStock(e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "12px 13px",
                    border: "1px solid #d1d5db",
                    borderRadius: "9px",
                    fontSize: "14px",
                  }}
                />
              </div>

            </div>

            {/* FORM ACTIONS */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "24px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                disabled={saving}
                style={{
                  background: "#ffffff",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  padding: "10px 17px",
                  borderRadius: "9px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  saving ||
                  loadingSuppliers
                }
                style={{
                  background: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "9px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {saving
                  ? "Saving..."
                  : editingProduct
                  ? "Update Product"
                  : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* INVENTORY SECTION */}
      <div className="section">

        <div
          style={{
            marginBottom: "16px",
          }}
        >
          <h2
            style={{
              marginBottom: "5px",
            }}
          >
            Inventory
          </h2>

          <p
            style={{
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Track products, prices and available stock.
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="card">
            <p>Loading products...</p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div
            className="card"
            style={{
              borderLeft:
                "4px solid #dc2626",
            }}
          >
            <p
              style={{
                color: "#dc2626",
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* PRODUCTS TABLE */}
        {!loading && !error && (
          <div className="table-container">

            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Supplier</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#6b7280",
                      }}
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id}>

                      {/* PRODUCT */}
                      <td>
                        <strong>
                          {product.name}
                        </strong>
                      </td>

                      {/* CATEGORY */}
                      <td>
                        {product.category || "-"}
                      </td>

                      {/* STOCK */}
                      <td>
                        <span
                          className={
                            Number(product.stock) === 0
                              ? "status status-danger"
                              : Number(product.stock) <= 5
                              ? "status status-warning"
                              : "status status-success"
                          }
                        >
                          {product.stock} units
                        </span>
                      </td>

                      {/* PRICE */}
                      <td>
                        <strong>
                          {formatMoney(
                            product.price
                          )}
                        </strong>
                      </td>

                      {/* SUPPLIER */}
                      <td>
                        {product.supplier_name ||
                          "-"}
                      </td>

                      {/* ACTIONS */}
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(product)
                            }
                            disabled={
                              deletingProduct ===
                              product.id
                            }
                            style={{
                              background: "#eff6ff",
                              color: "#2563eb",
                              border:
                                "1px solid #bfdbfe",
                              padding:
                                "7px 11px",
                              borderRadius: "7px",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                            }}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(product)
                            }
                            disabled={
                              deletingProduct ===
                              product.id
                            }
                            style={{
                              background: "#fef2f2",
                              color: "#dc2626",
                              border:
                                "1px solid #fecaca",
                              padding:
                                "7px 11px",
                              borderRadius: "7px",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor:
                                deletingProduct ===
                                product.id
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            {deletingProduct ===
                            product.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>

          </div>
        )}
      </div>
    </div>
  );
}

export default Products;