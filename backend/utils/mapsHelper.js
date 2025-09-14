import axios from "axios";

export const getCoordinates = async (address) => {
  try {
    const apiKey = process.env.MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`;

    const { data } = await axios.get(url);

    if (data.status === "OK") {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }

    return { lat: null, lng: null };
  } catch (error) {
    console.error("Maps API error:", error.message);
    return { lat: null, lng: null };
  }
};
