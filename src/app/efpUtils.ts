export async function getGradoFollowing(): Promise<any> {
  try {
    const response = await fetch(`https://api.ethfollow.xyz/api/v1/users/grado.eth/following?limit=2000`);
    const data = await response.json();
    return data.following;
  } catch (error) {
    throw error;
  }
}

export interface Follow {
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
    return false;
  }
}
