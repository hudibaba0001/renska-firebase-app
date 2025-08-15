import React from 'react';
import { useParams } from 'react-router-dom';
import PromoCodeManager from '../components/PromoCodeManager';
import PageHeader from '../components/PageHeader';

export default function AdminPromoCodesPage() {
  const { companyId } = useParams();

  return (
    <div>
      <PageHeader
        title="Promotional Codes"
        subtitle="Create and manage discount codes for your customers."
      />
      <div className="mt-6">
        <PromoCodeManager companyId={companyId} />
      </div>
    </div>
  );
}
