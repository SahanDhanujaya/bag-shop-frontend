const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

const getUserProfile = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", 
    });

    if (!response.ok) {
      // Handle 401 Unauthorized or other errors
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch profile");
    }

    return await response.json();
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    throw error;
  }
};

export { getUserProfile };