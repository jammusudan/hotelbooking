const navanBrand = {
  primaryColor: '#d4af37', // Gold
  secondaryColor: '#1a1a1a', // Dark Gray
  bgColor: '#ffffff',
  accentColor: '#888888',
};

const baseTemplate = (content) => `
<div style="font-family: 'Georgia', serif; color: ${navanBrand.secondaryColor}; max-width: 600px; margin: auto; border: 1px solid #e5e5e5; padding: 40px; background-color: ${navanBrand.bgColor};">
  <div style="text-align: center; margin-bottom: 30px;">
    <div style="margin-bottom: 15px;">
    <h1 style="text-transform: uppercase; letter-spacing: 0.2em; color: ${navanBrand.primaryColor}; margin: 0;">Navan</h1>
    <p style="text-transform: uppercase; font-size: 10px; letter-spacing: 0.3em; color: ${navanBrand.accentColor}; margin: 5px 0 0 0;">Excellence in Hospitality</p>
  </div>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  
  ${content}
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  
  <div style="text-align: center; font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 0.1em;">
    <p>Sent via Navan Secure Concierge Service</p>
    <p>© ${new Date().getFullYear()} Navan Collective. All rights reserved.</p>
  </div>
</div>
`;

/**
 * Generates HTML for Booking Initiated email
 */
export const getBookingInitiatedTemplate = (details) => {
  const { userName, hotelName, hotelAddress, hotelCity, roomType, checkIn, checkOut, totalAmount, guests, nights, pricePerNight } = details;
  
  const content = `
    <p>Dear ${userName},</p>
    <p>Your booking request has been successfully initiated. To secure your stay at <strong>${hotelName}</strong>, please proceed to fulfill the payment protocol.</p>
    
    <div style="background: #f9f9f9; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #f0f0f0;">
      <h3 style="text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em; color: ${navanBrand.primaryColor}; margin-top: 0;">Reservation Details</h3>
      
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: #666;">Property</td>
          <td style="padding: 8px 0; font-weight: bold; text-align: right;">${hotelName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Location</td>
          <td style="padding: 8px 0; font-weight: bold; text-align: right;">${hotelAddress? `${hotelAddress}, ` : ''}${hotelCity}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Chamber Type</td>
          <td style="padding: 8px 0; font-weight: bold; text-align: right;">${roomType}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Elite Guests</td>
          <td style="padding: 8px 0; font-weight: bold; text-align: right;">${guests}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Check-In</td>
          <td style="padding: 8px 0; font-weight: bold; text-align: right;">${new Date(checkIn).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Check-Out</td>
          <td style="padding: 8px 0; font-weight: bold; text-align: right;">${new Date(checkOut).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Duration</td>
          <td style="padding: 8px 0; font-weight: bold; text-align: right;">${nights} ${nights === 1 ? 'Night' : 'Nights'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Price per night</td>
          <td style="padding: 8px 0; font-weight: bold; text-align: right;">₹${pricePerNight}</td>
        </tr>
      </table>
      
      <div style="border-top: 1px solid #eee; margin-top: 15px; padding-top: 15px; text-align: right;">
        <span style="font-size: 12px; color: #888; text-transform: uppercase;">Total Settlement</span>
        <div style="font-size: 20px; font-weight: bold; color: ${navanBrand.secondaryColor};">₹${totalAmount}</div>
      </div>
    </div>
    
    <p style="font-size: 14px; line-height: 1.6; color: #444;">Please note that reservations are held for 15 minutes. Failure to complete the transaction within this window will result in automatic release of the chamber.</p>
  `;
  
  return baseTemplate(content);
};

/**
 * Generates HTML for Payment Confirmed email
 */
export const getPaymentConfirmedTemplate = (details) => {
  const { userName, hotelName, hotelAddress, hotelCity, roomType, checkIn, checkOut, transactionId, totalAmount, guests, nights, pricePerNight } = details;
  
  const content = `
    <p>Dear ${userName},</p>
    <p>Your transaction has been successfully cleared. Your stay at <strong>${hotelName}</strong> is now officially confirmed and reserved.</p>
    
    <div style="background: #f9f9f9; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #f0f0f0;">
      <h3 style="text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em; color: ${navanBrand.primaryColor}; margin-top: 0;">Confirmed Reservation</h3>
      
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: #666;">Property</td>
          <td style="padding: 8px 0; font-weight: bold; text-align: right;">${hotelName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Location</td>
          <td style="padding: 8px 0; font-weight: bold; text-align: right;">${hotelAddress? `${hotelAddress}, ` : ''}${hotelCity}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Chamber Type</td>
          <td style="padding: 8px 0; font-weight: bold; text-align: right;">${roomType}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Elite Guests</td>
          <td style="padding: 8px 0; font-weight: bold; text-align: right;">${guests}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Check-In</td>
          <td style="padding: 8px 0; font-weight: bold; text-align: right;">${new Date(checkIn).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Check-Out</td>
          <td style="padding: 8px 0; font-weight: bold; text-align: right;">${new Date(checkOut).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Duration</td>
          <td style="padding: 8px 0; font-weight: bold; text-align: right;">${nights} ${nights === 1 ? 'Night' : 'Nights'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Price per night</td>
          <td style="padding: 8px 0; font-weight: bold; text-align: right;">₹${pricePerNight}</td>
        </tr>
      </table>

      <div style="border-top: 1px solid #eee; margin-top: 15px; padding-top: 15px; text-align: right;">
        <span style="font-size: 12px; color: #888; text-transform: uppercase;">Total Settlement</span>
        <div style="font-size: 20px; font-weight: bold; color: ${navanBrand.secondaryColor};">₹${totalAmount}</div>
      </div>
      
      <div style="background: #ffffff; border: 1px dashed #ddd; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <p style="margin: 0; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.05em;">Transaction ID</p>
        <p style="margin: 5px 0 0 0; font-family: monospace; font-size: 14px; font-weight: bold; color: ${navanBrand.secondaryColor};">${transactionId}</p>
      </div>
    </div>
    
    <p style="font-size: 14px; line-height: 1.6; color: #444;">You may access your digital invoice and additional property details via your Navan Dashboard.</p>
    <p style="font-size: 14px; line-height: 1.6; color: #444;">We look forward to hosting you.</p>
  `;
  
  return baseTemplate(content);
};

/**
 * Generates HTML for Promotion Created email
 */
export const getPromotionCreatedTemplate = (details) => {
  const { code, discount, type, minBookingAmount, expiryDate, maxDiscount } = details;
  
  const discountDisplay = type === 'percentage' ? `${discount}% OFF` : `₹${discount} OFF`;
  const additionalDetails = [];
  if (minBookingAmount > 0) additionalDetails.push(`Minimum booking amount: ₹${minBookingAmount}`);
  if (maxDiscount > 0 && type === 'percentage') additionalDetails.push(`Up to a maximum discount of: ₹${maxDiscount}`);
  
  const expiryDateDisplay = new Date(expiryDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });
  
  const content = `
    <h2 style="text-align: center; color: ${navanBrand.primaryColor};">Exclusive Offer Just For You!</h2>
    <p>Dear Valued Guest,</p>
    <p>We are excited to announce a new promotional offer to make your next stay with us even more rewarding.</p>
    
    <div style="background: #f9f9f9; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px dashed ${navanBrand.primaryColor}; text-align: center;">
      <h3 style="text-transform: uppercase; font-size: 14px; letter-spacing: 0.1em; color: ${navanBrand.secondaryColor}; margin-top: 0;">Use Promo Code</h3>
      <div style="font-size: 28px; font-weight: bold; font-family: monospace; color: ${navanBrand.primaryColor}; background: #fff; padding: 10px; border: 1px solid #eee; display: inline-block; margin: 10px 0;">${code}</div>
      <p style="font-size: 18px; font-weight: bold; margin: 10px 0;">Get ${discountDisplay} on your next booking!</p>
      ${additionalDetails.map(detail => '<p style="font-size: 13px; color: #666; margin: 5px 0;">' + detail + '</p>').join('')}
      <p style="font-size: 13px; color: #d9534f; font-weight: bold; margin-top: 15px;">Valid until: ${expiryDateDisplay}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/hotels" style="background-color: ${navanBrand.primaryColor}; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em; font-size: 14px;">Book Now</a>
    </div>
    
    <p style="font-size: 14px; line-height: 1.6; color: #444;">We look forward to hosting you soon.</p>
  `;
  
  return baseTemplate(content);
};
