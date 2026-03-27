import { apiClient } from "../apiClient";

export async function callLoginApi(identifier: string, password: string) {
  let formattedIdentifier = identifier.trim();
  
  // If it's a phone number (e.g. 010...), format it for the backend
  if (formattedIdentifier.startsWith("0") && formattedIdentifier.length === 11) {
    formattedIdentifier = "+2" + formattedIdentifier;
  } else if (/^[1-9][0-9]{9}$/.test(formattedIdentifier)) {
    // If it's 10 digits starting with 1 (e.g. 10...), assume it needs +20
    formattedIdentifier = "+20" + formattedIdentifier;
  }

  return apiClient({
    endpoint: "/auth/login",
    method: "POST",
    body: { identifier: formattedIdentifier, password },
  });
}
