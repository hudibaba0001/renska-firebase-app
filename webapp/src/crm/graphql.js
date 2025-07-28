import { gql } from '@apollo/client';

// GraphQL Queries
export const GET_CUSTOMERS = gql`
  query GetCustomers($companyId: ID!) {
    customers(companyId: $companyId) {
      id
      name
      email
      phone
      address
      multipleAddresses
      rutRotEligible
      propertyDetails
      internalNotes
      leadSource
      preferredContactMethod
      customerTags
      bookingFrequency
      feedbackRating
      isCompany
      contactPerson
      secondaryPhone
      secondaryEmail
      companySize
      branchCount
      createdAt
      updatedAt
    }
  }
`;

export const GET_LEADS = gql`
  query GetLeads($companyId: ID!, $filter: LeadFilter) {
    leads(companyId: $companyId, filter: $filter) {
      id
      title
      status
      priority
      value
      currency
      expectedCloseDate
      assignedTo
      source
      createdAt
    }
  }
`;

export const GET_LEAD = gql`
  query GetLead($id: ID!) {
    lead(id: $id) {
      id
      title
      description
      status
      priority
      value
      currency
      expectedCloseDate
      assignedTo
      source
      areaTag
      notes
      createdAt
      updatedAt
    }
  }
`;

// GraphQL Mutations
export const CREATE_CUSTOMER = gql`
  mutation CreateCustomer($input: CustomerInput!) {
    createCustomer(input: $input) {
      id
      first_name
      last_name
      email
      phone
      address
      status
      tags
      notes
      created_at
      updated_at
    }
  }
`;

export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($id: ID!, $input: CustomerInput!) {
    updateCustomer(id: $id, input: $input) {
      id
      first_name
      last_name
      email
      phone
      address
      status
      tags
      notes
      updated_at
    }
  }
`;

export const DELETE_CUSTOMER = gql`
  mutation DeleteCustomer($id: ID!) {
    deleteCustomer(id: $id) {
      id
    }
  }
`;

export const CREATE_LEAD = gql`
  mutation CreateLead($input: CreateLeadInput!) {
    createLead(input: $input) {
      id
      title
      status
    }
  }
`;

export const UPDATE_LEAD = gql`
  mutation UpdateLead($id: ID!, $input: UpdateLeadInput!) {
    updateLead(id: $id, input: $input) {
      id
      title
      status
    }
  }
`;

export const DELETE_LEAD = gql`
  mutation DeleteLead($id: ID!) {
    deleteLead(id: $id)
  }
`; 