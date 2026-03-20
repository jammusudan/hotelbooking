import { getBookingInitiatedTemplate, getPaymentConfirmedTemplate } from './src/utils/emailTemplates.js';

const mockDetails = {
    userName: 'Jamuna',
    hotelName: 'Radisson Grand Salem',
    hotelAddress: 'Bangalore Highway, Mamangam',
    hotelCity: 'Salem',
    roomType: 'Deluxe Suite',
    checkIn: new Date(),
    checkOut: new Date(Date.now() + 86400000), // Tomorrow
    totalAmount: 29000,
    transactionId: 'pay_mock_123456789'
};

console.log('--- VERIFYING BOOKING INITIATED TEMPLATE ---');
const initiatedHtml = getBookingInitiatedTemplate(mockDetails);
console.log(initiatedHtml);

console.log('\n\n--- VERIFYING PAYMENT CONFIRMED TEMPLATE ---');
const confirmedHtml = getPaymentConfirmedTemplate(mockDetails);
console.log(confirmedHtml);

// Basic check for required keywords
const keywords = ['Radisson Grand Salem', 'Mamangam', 'Salem', 'Deluxe Suite', '₹29000'];
const missingInitiated = keywords.filter(k => !initiatedHtml.includes(k));
const missingConfirmed = keywords.filter(k => !confirmedHtml.includes(k));

if (missingInitiated.length === 0 && missingConfirmed.length === 0) {
    console.log('\n✅ VERIFICATION SUCCESSFUL: All details are present in both templates.');
} else {
    console.log('\n❌ VERIFICATION FAILED: Missing keywords:', { missingInitiated, missingConfirmed });
}
