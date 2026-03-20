import { getBookingInitiatedTemplate, getPaymentConfirmedTemplate } from './src/utils/emailTemplates.js';

const mockDetails = {
    userName: 'Jamuna',
    hotelName: 'CJ Pallazzio, Salem',
    hotelAddress: 'Omalur Main Road',
    hotelCity: 'Salem',
    roomType: 'Single',
    guests: 1,
    checkIn: new Date('2026-03-19'),
    checkOut: new Date('2026-03-21'),
    nights: 2,
    pricePerNight: 2500,
    totalAmount: 5000,
    transactionId: 'XXXXX'
};

console.log('--- VERIFYING ENHANCED BOOKING INITIATED TEMPLATE ---');
const initiatedHtml = getBookingInitiatedTemplate(mockDetails);
console.log(initiatedHtml);

console.log('\n\n--- VERIFYING ENHANCED PAYMENT CONFIRMED TEMPLATE ---');
const confirmedHtml = getPaymentConfirmedTemplate(mockDetails);
console.log(confirmedHtml);

// Enhanced keyword check
const keywords = [
    'Elite Guests', '1', 
    'Duration', '2 Nights', 
    'Price per night', '₹2500',
    'CJ Pallazzio', 'Omalur Main Road', 'Single', '₹5000'
];

const missingInitiated = keywords.filter(k => !initiatedHtml.includes(k));
const missingConfirmed = keywords.filter(k => !confirmedHtml.includes(k));

if (missingInitiated.length === 0 && missingConfirmed.length === 0) {
    console.log('\n✅ ENHANCED VERIFICATION SUCCESSFUL: All extra details (Guests, Duration, Price/Night) are present.');
} else {
    console.log('\n❌ ENHANCED VERIFICATION FAILED: Missing keywords:', { missingInitiated, missingConfirmed });
}
