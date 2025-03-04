interface IConnectionBody{
  accountName: string,
  accountType: string,
  scopes?: string[],
  clientSecret?: string,
  clientId?: string,
  apiKey?: string,
  accessToken?: string,
  baseUrl ?: string
}

interface IConnectionResponse {
  id: number,
  accountName: string,
  name: string
}