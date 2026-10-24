import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../Controllers/UserContext';
import { FiPackage, FiShoppingBag, FiTruck, FiCheckCircle, FiClock, FiMapPin, FiRefreshCw } from 'react-icons/fi';
import './orders.css';
import Breadcrumb from '../Components/Breadcrumb';
import Variables from '../Variables.json';

const Orders = () => {
    const { userData } = useContext(UserContext);
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [productLookup, setProductLookup] = useState({}); // {productId: name}

    useEffect(() => {
        fetchAllProducts();
    }, []);

    const fetchAllProducts = async () => {
        try {
            // Fetch products from search API with an empty/generic query to get a broad list
            const formData = new FormData();
            formData.append('productName', JSON.stringify([{ productname: "" }]));

            const response = await fetch(`${Variables.baseUrl}/api/Products/GetAll_SearchingProducts`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                const lookup = {};
                data.forEach(p => {
                    const id = p.Productid || p.ProductId;
                    if (id) lookup[id.toString()] = p.productname || p.ProductName;
                });
                setProductLookup(lookup);
            }
        } catch (error) {
            console.error("Error building product lookup:", error);
        }
    };

    useEffect(() => {
        if (userData && (userData.isLoggedIn || userData.id || userData.Id || userData.UserId)) {
            fetchOrders();
        }
    }, [userData]);

    const fetchOrders = async () => {
        const id = userData.id || userData.Id || userData.UserId;
        if (!id) return;

        setLoading(true);
        try {
            const formData = new FormData();
            const customerId = id.toString();

            formData.append("Param", JSON.stringify([{ "CustomerID": customerId }]));

            console.log("Fetching orders for CustomerID:", customerId);

            const response = await fetch(`${Variables.baseUrl}/api/Products/Get_All_Customer_Orders_Basedon_CustomerID`, {
                method: "POST",
                body: formData,
            });

            console.log("Orders Response Status:", response.status);
            const text = await response.text();
            console.log("Raw Response Text:", text);

            if (!text || text === '""' || text === 'null') {
                console.warn("API returned empty result for ID:", customerId);
                setOrders([]);
                return;
            }

            const data = JSON.parse(text);
            console.log("Parsed Orders Data:", data);

            if (Array.isArray(data)) {
                // Group by TransactionID or OrderID
                const grouped = data.reduce((acc, order) => {
                    // Try to find a shared identifier for grouping items in the same order
                    const txn = (order.TransactionID && order.TransactionID !== "0" && order.TransactionID !== "null") ? order.TransactionID : null;
                    const orderId = order.OrderID || order.OrderId || "";
                    const dateStr = order.OrderDate ? new Date(order.OrderDate).getTime().toString() : "";

                    // Group by TransactionID if available, else by OrderID. 
                    // If multiple items have different OrderIDs but same TransactionID, they group.
                    const key = txn || orderId || dateStr || Math.random().toString();

                    const price = parseFloat(order.Price || order.price || order.ItemPrice || 0);
                    const qty = parseInt(order.Quantity || order.quantity || order.Qty || order.qty || order.Product_Qty || 1);
                    const itemTotal = parseFloat(order.TotalPrice || (price * qty) || 0);

                    if (!acc[key]) {
                        acc[key] = {
                            ...order,
                            items: [order],
                            totalAmount: itemTotal
                        };
                    } else {
                        // Avoid adding exact duplicate records if API is weird
                        const isDuplicate = acc[key].items.some(item =>
                            (item.ProductId === order.ProductId || item.Productid === order.Productid) &&
                            (item.Quantity === order.Quantity || item.quantity === order.quantity)
                        );

                        if (!isDuplicate) {
                            acc[key].items.push(order);
                            acc[key].totalAmount += itemTotal;
                        }
                    }
                    return acc;
                }, {});
                //Before UPdate code by vishnu
                // const sortedGroups = Object.values(grouped).sort((a, b) => {
                //     const idA = (a.OrderID || a.OrderId || "").toString();
                //     const idB = (b.OrderID || b.OrderId || "").toString();
                //     return idB.localeCompare(idA, undefined, { numeric: true, sensitivity: 'base' });
                // });
                //After update code by vishnu
                const sortedGroups = Object.values(grouped).sort((a, b) => {
                    const dateA = new Date(a.OrderDate || a.orderDate || 0);
                    const dateB = new Date(b.OrderDate || b.orderDate || 0);
                    return dateB - dateA; // Latest orders first
                });


                setOrders(sortedGroups);
            } else if (data && typeof data === 'object') {
                if (data.status === 0 || data.Message || Object.keys(data).length === 0) {
                    setOrders([]);
                } else {
                    setOrders([{ ...data, items: [data], totalAmount: parseFloat(data.TotalPrice || 0) }]);
                }
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };
    // Vishnu wrote this code of
    // 🚀 Fetch Order Details by Order ID (Full Product List)
    // const fetchOrderDetails = async (orderId) => {
    //     try {
    //         const formData = new FormData();
    //         formData.append("Param", JSON.stringify([{ OrderID: orderId }]));

    //         const res = await fetch(`${Variables.baseUrl}/api/Products/Get_All_Customer_Ordersdetails_Basedon_OrderID`, {
    //             method: "POST",
    //             body: formData
    //         });

    //         const text = await res.text();
    //         if (!text || text === '""' || text === 'null') return;

    //         const data = JSON.parse(text);

    //         // Grouping multiple products for same order
    //         const totalSum = data.reduce((acc, item) => acc + (parseFloat(item.TotalPrice) || 0), 0);

    //         const detailOrder = {
    //             ...data[0],
    //             items: data,          // <-- 👈 All products stored here
    //             totalAmount: totalSum // <-- 👈 correct total for multi items
    //         };

    //         setSelectedOrder(detailOrder);
    //     } catch (error) {
    //         console.error("Error fetching order details", error);
    //     }
    // };

    // this is properly working fetch order details
    // 🚀 Fetch Order Details by Order ID (Improved Version)
    let orderAbortController = null; // Track active requests

    const fetchOrderDetails = async (orderId) => {
        // Cancel previous request if still running (prevents memory leaks)
        if (orderAbortController) {
            orderAbortController.abort();
        }

        orderAbortController = new AbortController();

        try {
            const formData = new FormData();
            formData.append("Param", JSON.stringify([{ OrderID: orderId }]));

            const res = await fetch(
                `${Variables.baseUrl}/api/Products/Get_All_Customer_Ordersdetails_Basedon_OrderID`,
                {
                    method: "POST",
                    body: formData,
                    signal: orderAbortController.signal // Enable request cancellation
                }
            );

            // Check if response is successful
            if (!res.ok) {
                console.error(`HTTP error! status: ${res.status}`);
                return;
            }

            const text = await res.text();

            // Early return for empty responses
            if (!text || text === '""' || text === 'null') {
                setSelectedOrder(null);
                return;
            }

            const data = JSON.parse(text);

            // Validate data
            if (!Array.isArray(data) || data.length === 0) {
                console.error('Invalid order data received');
                return;
            }

            // Calculate total amount
            const totalSum = data.reduce(
                (acc, item) => acc + (parseFloat(item.TotalPrice) || 0),
                0
            );

            // Create order object without data duplication
            const detailOrder = {
                ...data[0],      // Order-level fields
                items: data,     // All product items
                totalAmount: totalSum
            };

            setSelectedOrder(detailOrder);

        } catch (error) {
            // Ignore abort errors (normal when switching orders quickly)
            if (error.name === 'AbortError') {
                return;
            }

            console.error("Error fetching order details:", error);
            setSelectedOrder(null);

        } finally {
            orderAbortController = null; // Cleanup
        }
    };






    if (!(userData.isLoggedIn || userData.id || userData.Id || userData.UserId)) {
        return (
            <div className="container mt-5 py-5 text-center">
                <FiPackage size={80} className="text-muted mb-3" />
                <h2 className="fw-bold">Please log in to view your orders</h2>
                <p className="text-muted">Track your purchases and stay updated on your delivery status.</p>
                <button className="btn btn-success mt-3 px-4" onClick={() => window.location.href = '/'}>Go Home</button>
            </div>
        );
    }

    return (
        <div className="orders-page-container container mt-2 mb-5">
            <Breadcrumb />
            <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
                <div>
                    <h1 className="fw-bold mb-1 text-dark">My Orders</h1>
                    <p className="text-muted mb-0">Track and manage your recent organic purchases</p>
                </div>
                <div className="text-end">
                    <button className="btn btn-sm btn-outline-success mb-2" onClick={fetchOrders} disabled={loading}>
                        <FiRefreshCw className={loading ? 'spin' : ''} /> Refresh
                    </button>
                    <div className="badge bg-success d-block px-3 py-2">Logged in: {userData.name || userData.FarmerName || 'User'}</div>
                </div>
            </div>

            {loading && orders.length === 0 ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Fetching your orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="card border-0 shadow-sm py-5 text-center my-5">
                    <div className="card-body">
                        <FiShoppingBag size={100} className="text-light mb-4" />
                        <h3 className="fw-bold">No orders yet</h3>
                        <p className="text-muted mb-4">You have not placed any orders yet. Start shopping to see them here!</p>
                        <button className="btn btn-success btn-lg px-5" onClick={() => window.location.href = '/'}>
                            Start Shopping
                        </button>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    {orders.map((orderGroup, index) => (
                        <div key={orderGroup.TransactionID || orderGroup.OrderID || index} className="col-12">
                            <div className="card border-0 shadow-sm h-100 overflow-hidden">
                                <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center position-relative">
                                    {(orderGroup.TransactionStatus === 'Success' || orderGroup.StatusName === 'Confirmed') && (
                                        // <div className="position-absolute top-0 end-0 p-1" style={{ zIndex: 10 }}>
                                        <div className=" p-1" style={{ zIndex: 10 }}>
                                            <span className=" bg-success text-white px-3 py-1 shadow-sm" style={{ fontSize: '0.7rem', borderRadius: '0!important', fontWeight: '800' }}>
                                                <FiCheckCircle size={12} className="me-1" /> PAID
                                            </span>
                                        </div>
                                    )}
                                    <div className="d-flex align-items-center">
                                        <div className="bg-light p-2 rounded-3 me-3">
                                            <FiPackage className="text-success" size={20} />
                                        </div>
                                        <div>
                                            <div className="small text-muted">Order ID</div>
                                            <div className="fw-bold text-uppercase">#{orderGroup.OrderID || orderGroup.OrderId || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className="text-end me-5">
                                        <div className="small text-muted">Order Date</div>
                                        <div className="fw-bold">{(orderGroup.OrderDate || orderGroup.Order_Date || orderGroup.orderdate || orderGroup.Orderdate || orderGroup.Date || orderGroup.CreatedDate)
                                            ? new Date(orderGroup.OrderDate || orderGroup.Order_Date || orderGroup.orderdate || orderGroup.Orderdate || orderGroup.Date || orderGroup.CreatedDate).toLocaleString()
                                            : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body border-top border-bottom">
                                    <div className="row gy-3">
                                        <div className="col-md-5">
                                            <div className="small text-muted mb-2"><FiMapPin className="me-1" /> Delivery Address</div>
                                            <div className="small text-dark fw-medium lh-base">
                                                {orderGroup.Name || orderGroup.FarmerName || userData.name || 'Your Address'}<br />
                                                {orderGroup.HNo || ''} {orderGroup.Area || ''}, {orderGroup.City || ''}, {orderGroup.State || ''} - {orderGroup.Pincode || orderGroup.PinCode || ''}
                                            </div>
                                        </div>
                                        <div className="col-md-3 border-start border-end px-3">
                                            <div className="small text-muted mb-2">Payment Status</div>
                                            <div className="d-flex flex-column gap-1">
                                                {/* <span className={`badge ${orderGroup.TransactionStatus === 'Success' || orderGroup.PaymentType === 'online' ? 'bg-success' : 'bg-warning'} text-white px-3 py-2 fw-bold`} style={{ fontSize: '0.7rem', width: 'fit-content' }}> */}
                                                {/* <span className={`badge ${orderGroup.PaymentType === 'online' ? 'bg-success' : 'bg-warning'} text-white px-3 py-2 fw-bold`} style={{ fontSize: '0.7rem', width: 'fit-content' }}>
                                                    {orderGroup.TransactionStatus?.toUpperCase() || (orderGroup.PaymentType === 'online' ? 'SUCCESS' : 'PENDING')}
                                                </span> */}
                                                <div className="small text-muted mt-1">Order: <span className="text-success fw-bold">{orderGroup.StatusName || 'Confirmed'}</span></div>
                                            </div>
                                        </div>
                                        <div className="col-md-4 text-md-end">
                                            <div className="small text-muted mb-1">Total Amount</div>
                                            <div className="h4 fw-bold text-success mb-0">₹{parseFloat(orderGroup.totalAmount || 0).toFixed(2)}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                                    <div className="flex-grow-1 overflow-hidden">
                                        <div className="d-flex align-items-start">
                                            <FiTruck className="me-2 text-success mt-1 flex-shrink-0" size={18} />
                                            <div>
                                                <div className="small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Ordered Products</div>
                                                <div className="order-items-list">
                                                    {orderGroup.items.map((item, i) => {
                                                        const id = item.ProductId || item.Productid || "";
                                                        const lookupName = productLookup[id.toString()];
                                                        const name = item.ProductName || item.productname || item.productName || item.Productname || item.Product_Name || item.Product_name || item.product_name || item.Product || item.product || item.ItemName || item.item_name || item.Itemname || item.pname || lookupName || 'Item';
                                                        const q = item.Quantity || item.quantity || 1;
                                                        console.log("item", item);
                                                        return (
                                                            <div key={i} className="small text-dark fw-medium mb-1">
                                                                <span className="text-success me-1">•</span> {name} <span className="text-muted">× {q}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-outline-success btn-sm px-4"
                                        onClick={() => fetchOrderDetails(orderGroup.OrderID)}
                                        data-bs-toggle="modal"
                                        data-bs-target="#orderDetailsModal"
                                    >
                                        View Details
                                    </button>

                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Order Details Modal */}
            <div className="modal fade" id="orderDetailsModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content border-0 shadow">
                        <div className="modal-header border-bottom py-3">
                            <h5 className="modal-title fw-bold">Order Details</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body p-4">
                            {selectedOrder && (
                                <>
                                    <div className="row g-4 mb-4">
                                        <div className="col-md-6 border-end">
                                            <h6 className="fw-bold text-uppercase mb-3 small text-muted">Delivery Address</h6>
                                            <p className="mb-1 fw-bold">{selectedOrder.Name || selectedOrder.FarmerName || userData.name}</p>
                                            <p className="mb-1 text-muted small">{selectedOrder.HNo} {selectedOrder.Area}</p>
                                            <p className="mb-1 text-muted small">{selectedOrder.City}, {selectedOrder.State} - {selectedOrder.Pincode || selectedOrder.PinCode}</p>
                                            <p className="mb-0 text-muted small">Ph: {selectedOrder.MobileNo || selectedOrder.Mobile || userData.mobile}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <h6 className="fw-bold text-uppercase mb-3 small text-muted">Payment Info</h6>
                                            <p className="mb-1 small">Transaction ID: <span className="fw-bold">{selectedOrder.TransactionID}</span></p>
                                            <p className="mb-1 small">Payment Type: <span className="fw-bold">{selectedOrder.PaymentType}</span></p>
                                            <p className="mb-1 small">Order Status: <span className="bg-success rounded-pill py-1 px-3 align-middle text-white">{selectedOrder.StatusName || 'Confirmed'}</span></p>
                                            <p className="mb-0 small">Order Date: {(selectedOrder.OrderDate || selectedOrder.Order_Date || selectedOrder.orderdate || selectedOrder.Orderdate || selectedOrder.Date || selectedOrder.CreatedDate)
                                                ? new Date(selectedOrder.OrderDate || selectedOrder.Order_Date || selectedOrder.orderdate || selectedOrder.Orderdate || selectedOrder.Date || selectedOrder.CreatedDate).toLocaleString()
                                                : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <h6 className="fw-bold text-uppercase mb-3 small text-muted">Order Items</h6>
                                    <div className="table-responsive">
                                        <table className="table table-borderless align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="small">Product</th>
                                                    <th className="text-center small">Qty</th>
                                                    <th className="text-end small">Price</th>
                                                    <th className="text-end small">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedOrder.items.map((item, idx) => {
                                                    const priceVal = parseFloat(item.Price || item.price || item.ItemPrice || item.itemPrice || (item.TotalPrice / (item.Quantity || 1)) || 0);
                                                    const qtyVal = parseInt(item.Quantity || item.quantity || item.Qty || item.qty || item.Product_Qty || item.product_qty || 1);
                                                    const rowTotal = parseFloat(item.TotalPrice || (priceVal * qtyVal) || 0);

                                                    const id = item.ProductId || item.Productid || "";
                                                    const lookupName = productLookup[id.toString()];
                                                    const itemName = item.ProductName || item.productname || item.productName || item.Productname || item.Product_Name || item.Product_name || item.product_name || item.Product || item.product || item.ItemName || item.item_name || item.Itemname || item.pname || lookupName || 'Order Item';

                                                    return (
                                                        <tr key={idx} className="border-bottom">
                                                            <td className="py-3">
                                                                <div className="fw-bold text-dark">{itemName}</div>
                                                                <div className="text-muted small">Unit Price: ₹{priceVal.toFixed(2)}</div>
                                                            </td>
                                                            <td className="text-center py-3 fw-bold text-dark">{qtyVal}</td>
                                                            <td className="text-end py-3 text-muted">₹{priceVal.toFixed(2)}</td>
                                                            <td className="text-end py-3 fw-bold text-dark">₹{rowTotal.toFixed(2)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                            <tfoot>
                                                {selectedOrder.DeliveryCharge > 0 && (
                                                    <tr>
                                                        <td colSpan="3" className="text-end py-1 small">Delivery Charge</td>
                                                        <td className="text-end py-1 small">₹{parseFloat(selectedOrder.DeliveryCharge).toFixed(2)}</td>
                                                    </tr>
                                                )}
                                                {selectedOrder.OfferPrice > 0 && (
                                                    <tr>
                                                        <td colSpan="3" className="text-end py-1 small text-success">Discount</td>
                                                        <td className="text-end py-1 small text-success">-₹{parseFloat(selectedOrder.OfferPrice).toFixed(2)}</td>
                                                    </tr>
                                                )}
                                                <tr>
                                                    <td colSpan="3" className="text-end py-3 fw-bold">Grand Total</td>
                                                    <td className="text-end py-3 h5 fw-bold text-success">₹{parseFloat((selectedOrder.totalAmount || 0) + (selectedOrder.DeliveryCharge || 0) - (selectedOrder.OfferPrice || 0)).toFixed(2)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Orders;