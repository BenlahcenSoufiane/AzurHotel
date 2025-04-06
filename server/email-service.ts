import { MailService } from '@sendgrid/mail';

// Check if SendGrid API key exists and is valid
const isValidApiKey = process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.');
if (!isValidApiKey) {
  console.warn("Warning: SENDGRID_API_KEY environment variable is not set or is invalid. Email confirmations will be disabled.");
}

const mailService = new MailService();
if (isValidApiKey) {
  try {
    mailService.setApiKey(process.env.SENDGRID_API_KEY!);
    console.log("SendGrid API initialized successfully");
  } catch (error) {
    console.error("Error initializing SendGrid API:", error);
  }
}

// The email address that will appear as the sender
const FROM_EMAIL = 'reservations@luxuryresort.com';

interface EmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send an email using SendGrid
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!isValidApiKey) {
    console.log("Email would have been sent:", params);
    return false;
  }

  try {
    await mailService.send({
      to: params.to,
      from: FROM_EMAIL,
      subject: params.subject,
      text: params.text || '',
      html: params.html || '',
    });
    console.log(`Email sent to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

/**
 * Send a hotel room booking confirmation email
 */
export async function sendRoomBookingConfirmation(
  guestEmail: string,
  guestName: string,
  roomName: string,
  checkInDate: string,
  checkOutDate: string,
  totalPrice: number,
): Promise<boolean> {
  const formattedCheckIn = new Date(checkInDate).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedCheckOut = new Date(checkOutDate).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const subject = 'Your Room Booking Confirmation';
  const text = `
    Dear ${guestName},

    Thank you for booking with us. Your reservation has been confirmed.

    Booking Details:
    - Room: ${roomName}
    - Check-in: ${formattedCheckIn}
    - Check-out: ${formattedCheckOut}
    - Total Price: $${totalPrice}

    If you have any questions about your reservation, please contact our front desk.

    We look forward to welcoming you!

    Best regards,
    The Luxury Resort Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #4a5568; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Room Booking Confirmation</h2>
      <p style="color: #4a5568;">Dear ${guestName},</p>
      <p style="color: #4a5568;">Thank you for booking with us. Your reservation has been confirmed.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #4a5568; margin-top: 0;">Booking Details</h3>
        <p style="margin: 5px 0;"><strong>Room:</strong> ${roomName}</p>
        <p style="margin: 5px 0;"><strong>Check-in:</strong> ${formattedCheckIn}</p>
        <p style="margin: 5px 0;"><strong>Check-out:</strong> ${formattedCheckOut}</p>
        <p style="margin: 5px 0;"><strong>Total Price:</strong> $${totalPrice}</p>
      </div>
      
      <p style="color: #4a5568;">If you have any questions about your reservation, please contact our front desk.</p>
      <p style="color: #4a5568;">We look forward to welcoming you!</p>
      
      <p style="color: #4a5568; margin-top: 30px;">Best regards,<br>The Luxury Resort Team</p>
    </div>
  `;

  return sendEmail({
    to: guestEmail,
    subject,
    text,
    html,
  });
}

/**
 * Send a spa booking confirmation email
 */
export async function sendSpaBookingConfirmation(
  guestEmail: string,
  guestName: string,
  serviceName: string,
  date: string,
  time: string,
  totalPrice: number,
): Promise<boolean> {
  const formattedDate = new Date(date).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const subject = 'Your Spa Booking Confirmation';
  const text = `
    Dear ${guestName},

    Thank you for booking a spa service with us. Your appointment has been confirmed.

    Booking Details:
    - Service: ${serviceName}
    - Date: ${formattedDate}
    - Time: ${time}
    - Total Price: $${totalPrice}

    If you need to reschedule or have any questions, please contact our spa reception.

    We look forward to providing you with a relaxing experience!

    Best regards,
    The Luxury Resort Spa Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #4a5568; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Spa Booking Confirmation</h2>
      <p style="color: #4a5568;">Dear ${guestName},</p>
      <p style="color: #4a5568;">Thank you for booking a spa service with us. Your appointment has been confirmed.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #4a5568; margin-top: 0;">Booking Details</h3>
        <p style="margin: 5px 0;"><strong>Service:</strong> ${serviceName}</p>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
        <p style="margin: 5px 0;"><strong>Total Price:</strong> $${totalPrice}</p>
      </div>
      
      <p style="color: #4a5568;">If you need to reschedule or have any questions, please contact our spa reception.</p>
      <p style="color: #4a5568;">We look forward to providing you with a relaxing experience!</p>
      
      <p style="color: #4a5568; margin-top: 30px;">Best regards,<br>The Luxury Resort Spa Team</p>
    </div>
  `;

  return sendEmail({
    to: guestEmail,
    subject,
    text,
    html,
  });
}

/**
 * Send a restaurant booking confirmation email
 */
export async function sendRestaurantBookingConfirmation(
  guestEmail: string,
  guestName: string,
  date: string,
  time: string,
  partySize: number,
  mealPeriod: string,
): Promise<boolean> {
  const formattedDate = new Date(date).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const subject = 'Your Restaurant Reservation Confirmation';
  const text = `
    Dear ${guestName},

    Thank you for your restaurant reservation. Your table has been confirmed.

    Reservation Details:
    - Date: ${formattedDate}
    - Time: ${time}
    - Party Size: ${partySize} ${partySize === 1 ? 'person' : 'people'}
    - Meal: ${mealPeriod.charAt(0).toUpperCase() + mealPeriod.slice(1)}

    If you need to change your reservation or have any questions, please contact our restaurant.

    We look forward to serving you!

    Best regards,
    The Luxury Resort Restaurant Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #4a5568; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Restaurant Reservation Confirmation</h2>
      <p style="color: #4a5568;">Dear ${guestName},</p>
      <p style="color: #4a5568;">Thank you for your restaurant reservation. Your table has been confirmed.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #4a5568; margin-top: 0;">Reservation Details</h3>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
        <p style="margin: 5px 0;"><strong>Party Size:</strong> ${partySize} ${partySize === 1 ? 'person' : 'people'}</p>
        <p style="margin: 5px 0;"><strong>Meal:</strong> ${mealPeriod.charAt(0).toUpperCase() + mealPeriod.slice(1)}</p>
      </div>
      
      <p style="color: #4a5568;">If you need to change your reservation or have any questions, please contact our restaurant.</p>
      <p style="color: #4a5568;">We look forward to serving you!</p>
      
      <p style="color: #4a5568; margin-top: 30px;">Best regards,<br>The Luxury Resort Restaurant Team</p>
    </div>
  `;

  return sendEmail({
    to: guestEmail,
    subject,
    text,
    html,
  });
}