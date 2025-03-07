

export async function getGradoFollowing(): Promise<any> {
  try {
    const response = await fetch(`https://api.ethfollow.xyz/api/v1/users/grado.eth/following?limit=1000`);
    const data = await response.json();
    return data.following; // Assuming the API response structure
  } catch (error) {
    console.error('Error fetching grado.eth following list:', error);
    throw error;
  }
}

export interface Follow { // Add "export" here
  efp_list_nft_token_id: string;
  address: string;
  tags: string;
  is_following: boolean;
  is_blocked: boolean;
  is_muted: boolean;
  updated_at: string;
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