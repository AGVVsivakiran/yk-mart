import { useContext, useEffect, useState } from "react";
import { UserContext } from "../Controllers/UserContext";
import Variables from "../Variables.json";
import Breadcrumb from "../Components/Breadcrumb";
import "./track.css";

const baseUrl = Variables.baseUrl;

export default function TrackOrder() {
    const { userData } = useContext(UserContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [trackedOrder, setTrackedOrder] = useState(null);
    const [trackLoading, setTrackLoading] = useState(false);

    useEffect(() => {
        if (userData?.UserId || userData?.Id) {
            fetchOrders();
        }
    }, [userData]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const customerId = (userData?.id || userData?.UserId || userData?.Id || '').toString();
            if (!customerId) return;
            const formdata = new FormData();
            formdata.append("Param", JSON.stringify([
                { CustomerID: customerId }
            ]));

            const response = await fetch(
                `${baseUrl}/api/Products/Get_All_Customer_Orders_Basedon_CustomerID`,
                {
                    method: "POST",
                    body: formdata
                }
            );

            const result = await response.json();
            if (Array.isArray(result)) {
                setOrders(result);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const trackOrder = async () => {
        if (!orderId.trim()) return;
        try {
            setTrackLoading(true);
            const formdata = new FormData();
            formdata.append("Param", JSON.stringify([
                { OrderID: orderId.replace('#', '') }
            ]));

            const response = await fetch(
                `${baseUrl}/api/Products/Get_Order_By_OrderID`, // Assuming this endpoint exists
                {
                    method: "POST",
                    body: formdata
                }
            );

            const result = await response.json();
            if (Array.isArray(result) && result.length > 0) {
                setTrackedOrder(result[0]);
            } else {
                setTrackedOrder(null);
                alert('Order not found');
            }
        } catch (error) {
            console.error("Error tracking order:", error);
            alert('Error tracking order');
        } finally {
            setTrackLoading(false);
        }
    };

    return (
        <div className="container mt-2 mb-5">
            <Breadcrumb />
            <div className="track-container">
                <h1 className="track-title">Track Your Order</h1>
            <div className="track-form">
                <p>Enter your Order ID to track your order status.</p>
                <input
                    type="text"
                    placeholder="e.g. #YK251224005"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="track-input"
                />
                <button
                    onClick={trackOrder}
                    disabled={trackLoading}
                    className="track-btn"
                >
                    {trackLoading ? 'Tracking...' : 'Track Order'}
                </button>
            </div>

            {/* {trackedOrder && (
                <div className="order-card">
                    <div className="order-header">
                        <div>
                            <h3>Order #{trackedOrder.OrderID}</h3>
                            <p className="order-date">
                                {new Date(trackedOrder.OrderDate).toLocaleString()}
                            </p>
                        </div>
                        <span className={`order-status ${trackedOrder.StatusName?.toLowerCase()}`}>
                            {trackedOrder.StatusName || "Pending"}
                        </span>
                    </div>

                    <div className="order-body">
                        <div className="order-row">
                            <span>Payment Type</span>
                            <span>{trackedOrder.PaymentType}</span>
                        </div>
                        <div className="order-row">
                            <span>Transaction ID</span>
                            <span>{trackedOrder.TransactionID}</span>
                        </div>
                        <div className="order-row">
                            <span>Transaction Status</span>
                            <span className="success">
                                {trackedOrder.TransactionStatus}
                            </span>
                        </div>
                    </div>

                    <div className="order-body">
                        <div className="order-row">
                            <span>Subtotal</span>
                            <span>₹{trackedOrder.TotalPrice?.toFixed(2)}</span>
                        </div>
                        <div className="order-row">
                            <span>Delivery Charge</span>
                            <span>₹{trackedOrder.DeliveryCharge?.toFixed(2)}</span>
                        </div>
                        <div className="order-row total">
                            <span>Grand Total</span>
                            <span>
                                ₹{(
                                    (trackedOrder.TotalPrice || 0) +
                                    (trackedOrder.DeliveryCharge || 0) -
                                    (trackedOrder.OfferPrice || 0)
                                ).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <div className="order-footer">
                        <h4>Delivery Address</h4>
                        <p>
                            {trackedOrder.Name}<br />
                            {trackedOrder.HNo} {trackedOrder.Area}<br />
                            {trackedOrder.City}, {trackedOrder.State} - {trackedOrder.Pincode}<br />
                            Mobile: {trackedOrder.MobileNo}
                        </p>
                    </div>
                </div>
            )}

            {(userData?.FarmerName || userData?.UserId || userData?.Id) && (
                <>
                    <h2 className="track-title">My Orders</h2>

                    {loading && <p>Loading orders...</p>}

                    {!loading && orders.length === 0 && (
                        <p>No orders found.</p>
                    )}

                    <div className="order-list">
                        {orders.map(order => (
                            <div key={order.Id} className="order-card">
                                <div className="order-header">
                                    <div>
                                        <h3>Order #{order.OrderID}</h3>
                                        <p className="order-date">
                                            {new Date(order.OrderDate).toLocaleString()}
                                        </p>
                                    </div>
                                    <span className={`order-status ${order.StatusName?.toLowerCase()}`}>
                                        {order.StatusName || "Pending"}
                                    </span>
                                </div>

                                <div className="order-body">
                                    <div className="order-row">
                                        <span>Payment Type</span>
                                        <span>{order.PaymentType}</span>
                                    </div>
                                    <div className="order-row">
                                        <span>Transaction ID</span>
                                        <span>{order.TransactionID}</span>
                                    </div>
                                    <div className="order-row">
                                        <span>Transaction Status</span>
                                        <span className="success">
                                            {order.TransactionStatus}
                                        </span>
                                    </div>
                                </div>

                                <div className="order-body">
                                    <div className="order-row">
                                        <span>Subtotal</span>
                                        <span>₹{order.TotalPrice?.toFixed(2)}</span>
                                    </div>
                                    <div className="order-row">
                                        <span>Delivery Charge</span>
                                        <span>₹{order.DeliveryCharge?.toFixed(2)}</span>
                                    </div>
                                    <div className="order-row total">
                                        <span>Grand Total</span>
                                        <span>
                                            ₹{(
                                                (order.TotalPrice || 0) +
                                                (order.DeliveryCharge || 0) -
                                                (order.OfferPrice || 0)
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <div className="order-footer">
                                    <h4>Delivery Address</h4>
                                    <p>
                                        {order.Name}<br />
                                        {order.HNo} {order.Area}<br />
                                        {order.City}, {order.State} - {order.Pincode}<br />
                                        Mobile: {order.MobileNo}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )} */}
        </div>
        </div>
    );
}