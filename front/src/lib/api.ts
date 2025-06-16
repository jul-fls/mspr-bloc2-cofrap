const FUNCTIONS_URL = import.meta.env.VITE_FUNCTIONS_URL;

// Types for API requests and responses
export interface LoginRequest {
  username: string;
  password: string;
  totp: string;
}

export interface Generate2FARequest {
  username: string;
}

export interface Generate2FAResponse {
  secret: string;
  otpauth: string;
  qr: string;
}

export interface GeneratePasswordRequest {
  username: string;
}

export interface GeneratePasswordResponse {
  password: string;
  qr: string;
}

export class ApiError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = "ApiError";
  }
}

// User login
export async function loginUser(data: LoginRequest): Promise<void> {
  const response = await fetch(
    `${FUNCTIONS_URL}/auth-user`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorCode = response.status;
    let errorMessage = "Une erreur est survenue";

    switch (errorCode) {
      case 400:
        errorMessage = "Il manque un paramètre";
        break;
      case 401:
        errorMessage = "Identifiants invalides";
        break;
      case 500:
        errorMessage = "Code 2FA invalide";
        break;
      case 403:
        errorMessage = "Mot de passe expiré";
        break;
    }

    throw new ApiError(errorMessage, errorCode);
  }
}

// Generate 2FA secret and QR code
export async function generate2FA(
  data: Generate2FARequest
): Promise<Generate2FAResponse> {
  const response = await fetch(
    `${FUNCTIONS_URL}/generate-2fa`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorCode = response.status;
    let errorMessage = "Une erreur est survenue";

    switch (errorCode) {
      case 400:
        errorMessage = "L'utilisateur n'existe pas";
        break;
      case 500:
        errorMessage = "Erreur serveur";
        break;
    }
    throw new ApiError(errorMessage, errorCode);
  }

  return await response.json();
}

// Generate a new password and QR code
export async function generatePassword(
  data: GeneratePasswordRequest
): Promise<GeneratePasswordResponse> {
  const response = await fetch(
    `${FUNCTIONS_URL}/generate-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorCode = response.status;
    let errorMessage = "Une erreur est survenue";
    
    if (errorCode === 400) {
      errorMessage = "Il manque un paramètre";
    }
    throw new ApiError(errorMessage, errorCode);
  }

  return await response.json();
}
