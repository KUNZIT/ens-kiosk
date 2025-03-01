export async function checkIfWhitelisted(ensName: string): Promise<boolean> {
    try{
        const response = await fetch('/api/whitelist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ensName }),
        });
        const data = await response.json();
        return data.isWhitelisted;
    }catch(error){
        console.error("Error checking whitelist:", error);
        return false;
    }

}