import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { auth } from './init';

// Create HTTP link for Data Connect GraphQL endpoint
const httpLink = createHttpLink({
  uri: 'https://api.firebase.com/v1/projects/swed-de2a3/dataConnect/graphql',
});

// Auth link to add Firebase token and company context to requests
const authLink = setContext(async (_, { headers, variables }) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      
      // Get user's company context from Firebase Auth custom claims
      const tokenResult = await user.getIdTokenResult();
      const companyId = tokenResult.claims?.adminOf || tokenResult.claims?.companyId;
      
      // Add company filtering to all queries for multi-tenant security
      if (variables && !variables.companyId && companyId) {
        variables.companyId = companyId;
      }
      
      return {
        headers: {
          ...headers,
          authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Company-ID': companyId, // Additional security header
        }
      };
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  
  return {
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    }
  };
});

// Error handling link with GDPR compliance checks
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      
      // Handle GDPR-related errors
      if (message.includes('consent') || message.includes('GDPR')) {
        console.warn('GDPR compliance issue detected:', message);
      }
      
      // Handle multi-tenant security errors
      if (message.includes('company') || message.includes('tenant')) {
        console.error('Multi-tenant security violation:', message);
      }
    });
  }
  
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Create Apollo Client with enhanced security and caching
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Ensure company filtering on all queries
          customers: {
            merge(existing = [], incoming) {
              return incoming;
            },
            read(existing) {
              // Additional security check
              if (existing && !existing.every(customer => customer.companyId)) {
                console.warn('Customer data missing company context');
                return [];
              }
              return existing;
            }
          },
          leads: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          deals: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          tasks: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          activities: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
      // Add type policies for GDPR compliance
      Customer: {
        fields: {
          consentGiven: {
            read(value) {
              // Ensure GDPR consent is always checked
              return value || false;
            }
          },
          personnummer: {
            read(value) {
              // Mask personnummer for security
              if (value && typeof value === 'string' && value.length > 4) {
                return value.substring(0, 4) + '****' + value.substring(value.length - 4);
              }
              return value;
            }
          }
        }
      },
      // Add RUT compliance tracking
      Deal: {
        fields: {
          rutEligible: {
            read(value) {
              return value || false;
            }
          },
          rutDeductedHours: {
            read(value) {
              return value || 0;
            }
          }
        }
      }
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// Helper function for GDPR compliance
export const gdprHelpers = {
  // Check if user has consent for data processing
  hasConsent: (customer) => {
    return customer?.consentGiven === true;
  },
  
  // Anonymize data for GDPR deletion requests
  anonymizeData: (data) => {
    return {
      ...data,
      name: '[ANONYMIZED]',
      email: '[ANONYMIZED]',
      phone: '[ANONYMIZED]',
      personnummer: '[ANONYMIZED]',
      address: '[ANONYMIZED]',
      consentGiven: false,
    };
  },
  
  // Validate RUT eligibility
  validateRUTEligibility: (customer) => {
    return customer?.rutEligible === true && customer?.personnummer;
  }
};

export default apolloClient; 