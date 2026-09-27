const PEXELS_BASE_URL = "https://api.pexels.com/v1/search";

export async function getPexelsImage(query) {
  try {
    const response = await fetch(
      `${PEXELS_BASE_URL}?query=${encodeURIComponent(query)}&per_page=1`,
      {
        headers: {
          Authorization: process.env.PEXELS_API_KEY,
        },
        next: { revalidate: 86400 },
      }
    );

    if (!response.ok) {
      return "https://placehold.co/300x300/f5f5f5/000000?text=" + encodeURIComponent(query);
    }

    const data = await response.json();
    const photo = data.photos && data.photos[0];

    return photo
      ? photo.src.medium
      : "https://placehold.co/300x300/f5f5f5/000000?text=" + encodeURIComponent(query);
  } catch (error) {
    return "https://placehold.co/300x300/f5f5f5/000000?text=" + encodeURIComponent(query);
  }
}
