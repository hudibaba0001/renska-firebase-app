import { gql } from '@apollo/client';

export const GET_LEADS = gql`
  query GetLeads($companyId: ID!, $filter: LeadFilterInput) {
    leads(companyId: $companyId, filter: $filter) {
      id
      title
      status
      priority
      value
      currency
      expectedCloseDate
      source
      createdAt
    }
  }
`;

export const DELETE_LEAD = gql`
  mutation DeleteLead($id: ID!) {
    deleteLead(id: $id) {
      id
    }
  }
`;