
import { ScanRecord, StaffDetails } from "../types";

export const sendManagerAlert = async (record: ScanRecord, staff: StaffDetails): Promise<boolean> => {
  // In a real production environment, this would call a backend endpoint 
  // (e.g., AWS Lambda + SES, SendGrid, or Twilio)
  
  console.log(`[ALERT] Sending notification to manager at: ${staff.managerEmail}`);
  console.log(`[ALERT] High-Risk Fraud detected at ${staff.stationName}`);
  console.log(`[ALERT] Transaction details:`, {
    customer: record.customerName,
    plate: record.vehiclePlate,
    discrepancy: `${record.currency}${record.discrepancy}`,
    summary: record.summary
  });

  // Simulate network latency for the notification delivery
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1500);
  });
};
