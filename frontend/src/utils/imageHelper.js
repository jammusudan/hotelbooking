const hotelGallery = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1542314831-c6a4d27ce66f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1551882547-ff43c63faf7c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1521783988744-8097c76d460d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4df85b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1535827848741-08c35a74bfad?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1560624052-449f5ddf0c31?auto=format&fit=crop&w=1200&q=80"
];

/**
 * Deterministically picks a hotel image based on the hotel ID for visual variety.
 * @param {Object|string} hotel - The hotel object or its ID string
 * @returns {string} - A high-quality Unsplash image URL from our curated gallery
 */
export const getHotelImage = (hotel) => {
    // If the hotel has real images in the DB, always use the first one
    if (hotel && hotel.images && hotel.images.length > 0) {
        return hotel.images[0];
    }

    // Determine a stable ID string for hashing (fallback for hotels with no images)
    let id = "";
    
    if (typeof hotel === 'string') {
        id = hotel;
    } else if (hotel && hotel._id) {
        id = hotel._id.toString();
    } else if (hotel && hotel.id) {
        id = hotel.id.toString();
    }

    // Safety check - if no ID found, use a default high-quality image
    if (!id) return hotelGallery[1]; // Using the second one as it's very "hotel-like"

    // Create a deterministic hash from the ID string
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Map the hash to an index in our 14-image gallery
    const index = Math.abs(hash) % hotelGallery.length;
    return hotelGallery[index];
};

export const DEFAULT_PLACEHOLDER = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";
