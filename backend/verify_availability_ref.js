import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true
});

async function verifyAvailability() {
    try {
        console.log('--- STARTING AVAILABILITY VERIFICATION ---');
        
        // This will fail if not logged in, but we can check the error message or structure
        // In a real verification, we'd need a token, but here we can check if the route exists and handles errors
        try {
            await api.post('/bookings/check-availability', {});
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Route exists and is protected (401 Unauthorized as expected).');
            } else if (error.response?.status === 400) {
                console.log('✅ Route exists and validates inputs (400 Bad Request).');
            } else {
                console.log('❌ Unexpected error:', error.response?.status);
            }
        }

        console.log('--- VERIFICATION COMPLETE ---');
    } catch (error) {
        console.error('Verification failed:', error.message);
    }
}

verifyAvailability();
