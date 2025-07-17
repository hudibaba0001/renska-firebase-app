import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase/init';
import { doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  Card,
  Label,
  TextInput,
  Select,
  Button,
  Spinner,
  Alert,
  Textarea,
  ToggleSwitch
} from 'flowbite-react';
import PageHeader from '../components/PageHeader';
import toast from 'react-hot-toast';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPaymentSettings() {
  const { companyId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState({
    mode: 'manual', // 'manual' or 'online'
    provider: 'stripe', // Default provider
    publishableKey: '',
    secretKey: '', // This is write-only for security
    instructions: '' // For manual payments
  });
  const [secretKeyStored, setSecretKeyStored] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, `companies/${companyId}/paymentConfig/settings`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setConfig({
            mode: data.mode || 'manual',
            provider: data.provider || 'stripe',
            publishableKey: data.publishableKey || '',
            instructions: data.instructions || '',
            secretKey: '' // Always keep secret key field blank on load
          });
          setSecretKeyStored(!!data.secretKeyStored);
        }
      } catch (err) {
        console.error("Error fetching payment config:", err);
        setError("Kunde inte ladda betalningsinställningar.");
        toast.error("Kunde inte ladda betalningsinställningar.");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [companyId]);

  const handleSave = async () => {
    setSaving(true);
    setError('');

    if (config.mode === 'online') {
      if (!config.publishableKey) {
        setError("För online-betalningar måste du ange en Publishable Key.");
        setSaving(false);
        return;
      }
      if (!secretKeyStored && !config.secretKey) {
        setError("Första gången du konfigurerar online-betalningar måste du ange en Secret Key.");
        setSaving(false);
        return;
      }
    }

    try {
      const functions = getFunctions();
      const updatePaymentSettings = httpsCallable(functions, 'updatePaymentSettings');
      
      await updatePaymentSettings({ companyId, ...config });

      toast.success('Betalningsinställningar sparade!');
      if (config.secretKey) {
        setSecretKeyStored(true);
      }
      setConfig(c => ({ ...c, secretKey: '' }));
      
    } catch (err) {
      console.error("Error saving payment settings:", err);
      setError(`Ett fel uppstod när inställningarna skulle sparas: ${err.message}`);
      toast.error("Kunde inte spara inställningar.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setConfig(c => ({ ...c, [id]: value }));
  };
  
  const handleSwitchChange = (checked) => {
    setConfig(c => ({ ...c, mode: checked ? 'online' : 'manual' }));
  };
  
  if (loading) return <div className="flex justify-center items-center h-64"><Spinner size="xl" /></div>;

  return (
    <div>
      <PageHeader
        title="Betalningsinställningar"
        subtitle="Hantera hur ditt företag tar emot betalningar och bokningar."
      />
      {error && <Alert color="failure" onDismiss={() => setError('')} className="mb-4">{error}</Alert>}
      
      <Card className="max-w-2xl">
        <div className="space-y-6">
          <div>
            <Label htmlFor="paymentMode" className="text-lg font-semibold">Betalningssätt</Label>
            <div className="flex items-center gap-4 mt-2">
              <ToggleSwitch
                checked={config.mode === 'online'}
                label={config.mode === 'online' ? "Online-betalningar" : "Manuella bokningar"}
                onChange={handleSwitchChange}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Välj "Online-betalningar" för att ta betalt direkt via en leverantör som Stripe. Välj "Manuella bokningar" för att hantera fakturering själv.
            </p>
          </div>

          <AnimatePresence>
            {config.mode === 'manual' && (
               <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-4 border-t"
              >
                 <div>
                    <Label htmlFor="instructions" className="font-semibold">Instruktioner för manuell betalning</Label>
                    <Textarea
                        id="instructions"
                        value={config.instructions}
                        onChange={handleInputChange}
                        placeholder="Ange betalningsinformation som visas för kunden, t.ex. Bankgiro, Swish-nummer eller andra instruktioner."
                        rows={4}
                    />
                 </div>
              </motion.div>
            )}
            {config.mode === 'online' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-4 border-t"
              >
                <div>
                  <Label htmlFor="provider" className="font-semibold">Betalningsleverantör</Label>
                  <Select id="provider" value={config.provider} onChange={handleInputChange} required>
                    <option value="stripe">Stripe</option>
                    <option value="klarna" disabled>Klarna (Kommer snart)</option>
                    <option value="paypal" disabled>PayPal (Kommer snart)</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="publishableKey" className="font-semibold">Publishable Key</Label>
                  <TextInput id="publishableKey" type="text" value={config.publishableKey} onChange={handleInputChange} placeholder="pk_test_..." required />
                </div>
                <div>
                  <Label htmlFor="secretKey" className="font-semibold">Secret Key</Label>
                  <TextInput id="secretKey" type="password" value={config.secretKey} onChange={handleInputChange} placeholder={secretKeyStored ? "Lämnas tom för att inte ändra" : "sk_test_..."} required />
                   <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <ShieldCheckIcon className="h-4 w-4 text-green-600"/> Din hemliga nyckel sparas alltid krypterat och visas aldrig igen.
                    </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end pt-4 border-t">
            <Button color="blue" onClick={handleSave} disabled={saving}>
              {saving ? <><Spinner size="sm" /> Sparar...</> : 'Spara inställningar'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}