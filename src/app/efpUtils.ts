const gradoAddress = '0x14546125429faac7f3aa78da1807069692ec7464'; // Grado's address

export async function getGradoFollowing(): Promise<any> {
  try {
    const response = await fetch(`https://api.ethfollow.xyz/api/v1/users/${gradoAddress}/following`);
    const data = await response.json();
    return data.following; // Assuming the API response structure
  } catch (error) {
    console.error('Error fetching grado.eth following list:', error);
    throw error;
  }
}

export async function isUserFollowedByGrado(userAddress: string): Promise<boolean> {
  try {
    const following = await getGradoFollowing();
    return following.some((follow: Follow) => follow.address.toLowerCase() === userAddress.toLowerCase());
  } catch (error) {
    console.error('Error checking if user is followed by grado.eth:', error);
    return false;
  }
}