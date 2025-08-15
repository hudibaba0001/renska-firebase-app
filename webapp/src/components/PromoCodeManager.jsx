import React, { useState, useEffect } from 'react';
import { Card, Button, TextInput, Select, Label, Table, Checkbox, Datepicker } from 'flowbite-react';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { db } from '../firebase/init';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { logger } from '../utils/logger';
import toast from 'react-hot-toast';

export default function PromoCodeManager({ companyId }) {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newPromo, setNewPromo] = useState({
    name: '',
    code: '',
    type: 'percentage',
    value: 0,
    active: true,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
  });

  const promoCodesCollectionRef = collection(db, 'companies', companyId, 'promoCodes');

  // Fetch promo codes on component mount
  useEffect(() => {
    const fetchPromoCodes = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(promoCodesCollectionRef);
        const codes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPromoCodes(codes);
        logger.info('PromoCodeManager', 'Promo codes loaded successfully for company:', companyId);
      } catch (error) {
        logger.error('PromoCodeManager', 'Error loading promo codes:', error);
      }
      setLoading(false);
    };

    if (companyId) {
      fetchPromoCodes();
    }
  }, [companyId]);

  const handleCreate = async () => {
    logger.info('PromoCodeManager', 'Attempting to create new promo code:', newPromo);

    // --- Input Validation ---
    if (!newPromo.name.trim()) {
      toast.error('Promo name cannot be empty.');
      return;
    }
    if (!newPromo.code.trim()) {
      toast.error('Promo code cannot be empty.');
      return;
    }
    if (newPromo.value <= 0) {
      toast.error('Discount value must be greater than 0.');
      return;
    }
    if (newPromo.type === 'percentage' && newPromo.value > 100) {
      toast.error('Percentage discount cannot exceed 100%.');
      return;
    }

    // Check for duplicate promo codes
    const q = query(promoCodesCollectionRef, where("code", "==", newPromo.code.trim()));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      toast.error(`Promo code "${newPromo.code.trim()}" already exists.`);
      return;
    }

    try {
      const docRef = await addDoc(promoCodesCollectionRef, newPromo);
      setPromoCodes([...promoCodes, { id: docRef.id, ...newPromo }]);
      setIsCreating(false);
      setNewPromo({
        name: '', code: '', type: 'percentage', value: 0, active: true,
        validFrom: new Date().toISOString().split('T')[0], validUntil: ''
      });
      toast.success('Promo code created successfully!');
      logger.info('PromoCodeManager', 'Promo code created successfully with ID:', docRef.id);
    } catch (error) {
      toast.error('Failed to create promo code.');
      logger.error('PromoCodeManager', 'Error creating promo code:', error);
    }
  };

  const handleDelete = async (id) => {
    logger.info('PromoCodeManager', 'Deleting promo code:', id);
    try {
      await deleteDoc(doc(db, 'companies', companyId, 'promoCodes', id));
      setPromoCodes(promoCodes.filter(p => p.id !== id));
      logger.info('PromoCodeManager', 'Promo code deleted successfully:', id);
    } catch (error) {
      logger.error('PromoCodeManager', 'Error deleting promo code:', error);
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Promotional Codes</h2>
        <Button color="primary" onClick={() => setIsCreating(!isCreating)}>
          <PlusIcon className="h-4 w-4 mr-1" /> {isCreating ? 'Cancel' : 'Add Promo Code'}
        </Button>
      </div>

      {isCreating && (
        <Card className="mb-4 bg-gray-50">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Create New Promo Code</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="promo-name" value="Promo Name" />
                <TextInput id="promo-name" placeholder="e.g. Summer Sale" value={newPromo.name} onChange={e => setNewPromo({...newPromo, name: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="promo-code" value="Promo Code" />
                <TextInput id="promo-code" placeholder="e.g. SUMMER10" value={newPromo.code} onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="promo-type" value="Discount Type" />
                <Select id="promo-type" value={newPromo.type} onChange={e => setNewPromo({...newPromo, type: e.target.value})}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (SEK)</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="promo-value" value="Value" />
                <TextInput id="promo-value" type="number" value={newPromo.value} onChange={e => setNewPromo({...newPromo, value: Number(e.target.value)})} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="promo-from" value="Valid From" />
                 <TextInput id="promo-from" type="date" value={newPromo.validFrom} onChange={e => setNewPromo({...newPromo, validFrom: e.target.value})} />
               </div>
               <div>
                 <Label htmlFor="promo-until" value="Valid Until" />
                 <TextInput id="promo-until" type="date" value={newPromo.validUntil} onChange={e => setNewPromo({...newPromo, validUntil: e.target.value})} />
               </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="promo-active" checked={newPromo.active} onChange={e => setNewPromo({...newPromo, active: e.target.checked})} />
              <Label htmlFor="promo-active">Active</Label>
            </div>
            <Button color="success" onClick={handleCreate}>Create</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div>Loading promo codes...</div>
      ) : (
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Code</Table.HeadCell>
            <Table.HeadCell>Type</Table.HeadCell>
            <Table.HeadCell>Value</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {promoCodes.map(promo => (
              <Table.Row key={promo.id}>
                <Table.Cell className="font-medium">{promo.name}</Table.Cell>
                <Table.Cell>{promo.code}</Table.Cell>
                <Table.Cell>{promo.type}</Table.Cell>
                <Table.Cell>{promo.type === 'percentage' ? `${promo.value}%` : `${promo.value} SEK`}</Table.Cell>
                <Table.Cell>{promo.active ? <span className="text-green-600">Active</span> : <span className="text-red-600">Inactive</span>}</Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button size="xs" color="gray">
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button size="xs" color="failure" onClick={() => handleDelete(promo.id)}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Card>
  );
}
