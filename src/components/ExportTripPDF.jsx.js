import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export const generatePDF = async (trip, collection) => {
  if (!trip || !collection) {
    Alert.alert("Error", "Trip data is missing.");
    return;
  }

  const html = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; }
        </style>
      </head>
      <body>
        <h1>${collection.name} - Trip Report</h1>
        <p><strong>Trip Date:</strong> ${new Date(
          trip.startTime
        ).toLocaleDateString()}</p>
        <p><strong>Duration:</strong> ${formatDuration(
          trip.startTime,
          trip.endTime
        )}</p>
        <p><strong>Total Collection:</strong> ₹${trip.totalAmount}</p>
        <p><strong>Shops Visited:</strong> ${
          trip.visitedShops
        } | <strong>Shops Closed:</strong> ${trip.closedShops || 0}</p>
        
        <h2>Shop Details</h2>
        <table>
          <tr>
            <th>Shop Name</th>
            <th>Time</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
          ${trip.shops
            .map(
              (shop) => `
                <tr>
                  <td>${shop.name}</td>
                  <td>${new Date(shop.visitTime).toLocaleTimeString()}</td>
                  <td>₹${shop.amount || 0}</td>
                  <td>${shop.isClosed ? "Closed" : "Open"}</td>
                </tr>
              `
            )
            .join("")}
        </table>
      </body>
      </html>
    `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  } catch (error) {
    Alert.alert("Error", "Failed to generate PDF.");
  }
};

const formatDuration = (startTime, endTime) => {
  const duration = new Date(endTime) - new Date(startTime);
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};
