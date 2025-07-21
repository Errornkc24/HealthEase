export async function uploadToPinata(file) {
  const apiKey = process.env.REACT_APP_PINATA_API_KEY;
  const apiSecret = process.env.REACT_APP_PINATA_API_SECRET;
  const jwt = process.env.REACT_APP_PINATA_JWT;

  console.log('process.env:', process.env);
  console.log('Pinata API KEY:', apiKey);
  console.log('Pinata API SECRET:', apiSecret);
  console.log('Pinata JWT:', jwt);
  if (!apiKey || !apiSecret || !jwt) throw new Error('Pinata credentials not set in .env');

  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  const data = new FormData();
  data.append('file', file);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      pinata_api_key: apiKey,
      pinata_secret_api_key: apiSecret,
      Authorization: `Bearer ${jwt}`
    },
    body: data
  });

  if (!res.ok) throw new Error('Pinata upload failed');
  const json = await res.json();
  return json.IpfsHash;
} 