/**
 * BiometricAuth Service
 * 
 * Provides biometric authentication functionality using WebAuthn and the Web Authentication API
 * for Face ID, Touch ID, Windows Hello, and fingerprint sensors.
 */

interface BiometricCredential {
  id: string;
  type: 'face' | 'fingerprint' | 'other';
  createdAt: Date;
  lastUsedAt: Date;
}

// Cache for storing user biometric credentials locally
const CREDENTIAL_STORAGE_KEY = 'weparlay-biometric-credentials';

/**
 * Check if biometric authentication is available on the current device
 */
export async function isBiometricsAvailable(): Promise<boolean> {
  if (!window.PublicKeyCredential) {
    return false;
  }
  
  try {
    // Check if platform authenticator is available
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return false;
  }
}

/**
 * Get the type of biometric authentication available
 * @returns The type of biometric authentication or null if not available
 */
export async function getAvailableBiometricType(): Promise<'face' | 'fingerprint' | 'other' | null> {
  if (!await isBiometricsAvailable()) {
    return null;
  }
  
  // There's no direct API to detect the exact biometric type
  // Try to make an educated guess based on user agent and platform
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
    // iOS devices typically use Face ID for newer devices, Touch ID for older
    if (userAgent.includes('iphone') && parseInt(userAgent.split('iphone os ')[1], 10) >= 11) {
      return 'face'; // Likely Face ID
    }
    return 'fingerprint'; // Likely Touch ID
  } else if (userAgent.includes('mac')) {
    return 'fingerprint'; // MacBooks use Touch ID
  } else if (userAgent.includes('android')) {
    return 'fingerprint'; // Most Android devices use fingerprint
  } else if (userAgent.includes('windows')) {
    // Windows devices might use Windows Hello
    return 'face'; // Windows Hello often uses facial recognition
  }
  
  // Default fallback
  return 'other';
}

/**
 * Register a new biometric credential for the current user
 * @param userId The user ID to associate with the biometric credential
 * @returns A promise that resolves to the created credential
 */
export async function registerBiometricCredential(userId: string): Promise<BiometricCredential | null> {
  if (!await isBiometricsAvailable()) {
    throw new Error('Biometric authentication is not available on this device');
  }
  
  try {
    // This challenge would normally come from your server in a real implementation
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);
    
    // Create a PublicKeyCredentialCreationOptions object
    const createCredentialOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'WeParlay',
        id: window.location.hostname
      },
      user: {
        id: Uint8Array.from(userId, c => c.charCodeAt(0)),
        name: userId,
        displayName: userId
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 } // RS256
      ],
      timeout: 60000, // 1 minute
      attestation: 'none', // Don't require attestation
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Use the platform authenticator (built-in biometric)
        userVerification: 'required', // Require user verification (biometric)
        requireResidentKey: false
      }
    };
    
    // Create the credential
    const credential = await navigator.credentials.create({
      publicKey: createCredentialOptions
    }) as PublicKeyCredential;
    
    if (!credential) {
      throw new Error('Failed to create credential');
    }
    
    // Determine the biometric type
    const biometricType = await getAvailableBiometricType() || 'other';
    
    // Create the credential object
    const biometricCredential: BiometricCredential = {
      id: bufferToBase64(credential.rawId),
      type: biometricType,
      createdAt: new Date(),
      lastUsedAt: new Date()
    };
    
    // Save the credential to localStorage
    saveCredential(userId, biometricCredential);
    
    return biometricCredential;
  } catch (error) {
    console.error('Error registering biometric credential:', error);
    return null;
  }
}

/**
 * Authenticate a user using biometric authentication
 * @param userId The user ID to authenticate
 * @returns A promise that resolves to true if authentication was successful
 */
export async function authenticateWithBiometrics(userId: string): Promise<boolean> {
  if (!await isBiometricsAvailable()) {
    throw new Error('Biometric authentication is not available on this device');
  }
  
  try {
    // Get the saved credential
    const savedCredential = getCredential(userId);
    
    if (!savedCredential) {
      throw new Error('No saved biometric credential found for this user');
    }
    
    // This challenge would normally come from your server in a real implementation
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);
    
    // Create a PublicKeyCredentialRequestOptions object
    const getCredentialOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      timeout: 60000, // 1 minute
      userVerification: 'required',
      rpId: window.location.hostname,
      allowCredentials: [{
        id: base64ToBuffer(savedCredential.id),
        type: 'public-key',
        transports: ['internal']
      }]
    };
    
    // Request the credential
    const credential = await navigator.credentials.get({
      publicKey: getCredentialOptions
    }) as PublicKeyCredential;
    
    if (!credential) {
      throw new Error('Failed to get credential');
    }
    
    // Update the last used date
    savedCredential.lastUsedAt = new Date();
    saveCredential(userId, savedCredential);
    
    return true;
  } catch (error) {
    console.error('Error authenticating with biometrics:', error);
    return false;
  }
}

/**
 * Check if a user has a registered biometric credential
 * @param userId The user ID to check
 * @returns True if the user has a registered biometric credential
 */
export function hasBiometricCredential(userId: string): boolean {
  return !!getCredential(userId);
}

/**
 * Remove a user's biometric credential
 * @param userId The user ID to remove the credential for
 */
export function removeBiometricCredential(userId: string): void {
  const credentials = getCredentials();
  delete credentials[userId];
  localStorage.setItem(CREDENTIAL_STORAGE_KEY, JSON.stringify(credentials));
}

// Helper functions

function getCredentials(): Record<string, BiometricCredential> {
  const credentialsJson = localStorage.getItem(CREDENTIAL_STORAGE_KEY);
  return credentialsJson ? JSON.parse(credentialsJson) : {};
}

function getCredential(userId: string): BiometricCredential | null {
  const credentials = getCredentials();
  return credentials[userId] || null;
}

function saveCredential(userId: string, credential: BiometricCredential): void {
  const credentials = getCredentials();
  credentials[userId] = credential;
  localStorage.setItem(CREDENTIAL_STORAGE_KEY, JSON.stringify(credentials));
}

// Buffer conversion utilities
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}