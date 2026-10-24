import Variables from '../Variables.json';

export const sendOrderEmail = async (orderData) => {
    try {
        console.log("Sending order email with data:", orderData);

        // Construct the Ticket1 JSON string
        // The API expects Ticket1 to be a JSON string of an array of objects
        // Example: "[{'FarmerName':'Vishnu','OrderID':'YK260101001',...}]" 
        // Note: The curl example uses single quotes inside the string, but standard JSON uses double quotes. 
        // We will standard JSON serialization which should be compatible if the backend parses standard JSON.
        // If the backend specifically requires single quotes inside the string, we might need a custom stringifier, 
        // but typically JSON.stringify is sufficient for web APIs.

        const ticket1Value = JSON.stringify(orderData);

        const formData = new FormData();
        formData.append('Ticket1', ticket1Value);

        const response = await fetch(`${Variables.baseUrl}/api/Products/SendOrderMailToAdmin`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        console.log("Order email sent response:", result);
        return result;
    } catch (error) {
        console.error("Error sending order email:", error);
        // We generally don't want to break the flow if email fails, so we just log it
        return null;
    }
};

export const sendAdminPushNotification = async (orderId, customerName, totalAmount) => {
    try {
        const textMessage = `New Order Placed! Order ID: ${orderId}, Customer: ${customerName}, Total: Rs. ${totalAmount}`;
        console.log("Sending push notification to admins with text:", textMessage);

        // 1. Send active push notification to trigger device alerts
        const formData = new FormData();
        formData.append('Text', textMessage);

        const response = await fetch(`${Variables.baseUrl}/api/Products/Adminnotificationaftercustomerorderplaced`, {
            method: 'POST',
            body: formData
        });

        const result = await response.text();
        console.log("Admin notification sent response:", result);

        // 2. Insert notification into the Admin_Notification table so it displays in mobile admin history
        try {
            const dbParams = [{
                User_Id: 1,
                Notification: textMessage,
                CreatedBy: "1"
            }];
            const dbFormData = new FormData();
            dbFormData.append('Param', JSON.stringify(dbParams));

            fetch(`${Variables.baseUrl}/api/Products/Add_AdminNotifications`, {
                method: 'POST',
                body: dbFormData
            })
            .then(res => res.text())
            .then(resText => console.log("Admin_Notification table insert response:", resText))
            .catch(dbErr => console.error("Error inserting notification to DB:", dbErr));
        } catch (dbErr) {
            console.error("Error preparing DB notification insert:", dbErr);
        }

        return result;
    } catch (error) {
        console.error("Error sending admin notification:", error);
        return null;
    }
};

