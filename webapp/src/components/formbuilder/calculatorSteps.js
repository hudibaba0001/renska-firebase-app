import * as Yup from 'yup';

// Step configuration schema
export const stepSchema = {
  zipCode: {
    id: 'zipCode',
    title: 'Postnummer',
    description: 'Ange ditt postnummer för att se tillgängliga tjänster',
    validation: Yup.object().shape({
      zipCode: Yup.string()
        .required('Postnummer krävs')
        .matches(/^[0-9]{5}$/, 'Ogiltigt postnummerformat')
    }),
    fields: [
      {
        type: 'text',
        name: 'zipCode',
        label: 'Postnummer',
        placeholder: '12345',
        maxLength: 5,
        pattern: '[0-9]*',
        required: true
      }
    ]
  },
  
  serviceSelect: {
    id: 'serviceSelect',
    title: 'Välj tjänst',
    description: 'Välj den tjänst du är intresserad av',
    validation: Yup.object().shape({
      serviceId: Yup.string().required('Välj en tjänst')
    }),
    fields: [
      {
        type: 'select',
        name: 'serviceId',
        label: 'Tjänst',
        required: true,
        // Options will be populated from available services
      }
    ]
  },
  
  serviceDetails: {
    id: 'serviceDetails',
    title: 'Anpassa tjänst',
    description: 'Anpassa tjänsten efter dina behov',
    validation: Yup.object().shape({
      area: Yup.number()
        .min(1, 'Area måste vara större än 0')
        .required('Area krävs'),
      frequency: Yup.string().required('Välj frekvens')
    }),
    fields: [
      {
        type: 'number',
        name: 'area',
        label: 'Area (kvm)',
        placeholder: '100',
        min: 1,
        required: true
      },
      {
        type: 'select',
        name: 'frequency',
        label: 'Frekvens',
        required: true,
        options: [
          { value: 'once', label: 'Engångsbokning' },
          { value: 'weekly', label: 'Varje vecka' },
          { value: 'biweekly', label: 'Varannan vecka' },
          { value: 'monthly', label: 'Varje månad' }
        ]
      },
      {
        type: 'checkboxGroup',
        name: 'addOns',
        label: 'Tilläggstjänster',
        // Options will be populated from service configuration
      }
    ]
  },
  
  customerInfo: {
    id: 'customerInfo',
    title: 'Dina uppgifter',
    description: 'Fyll i dina kontaktuppgifter',
    validation: Yup.object().shape({
      name: Yup.string().required('Namn krävs'),
      email: Yup.string().email('Ogiltig e-postadress').required('E-post krävs'),
      phone: Yup.string().required('Telefonnummer krävs'),
      address: Yup.string().required('Adress krävs'),
      personnummer: Yup.string().when('useRut', {
        is: true,
        then: Yup.string()
          .matches(/^[0-9]{8}-[0-9]{4}$/, 'Ogiltigt personnummerformat (YYYYMMDD-XXXX)')
          .required('Personnummer krävs för RUT-avdrag')
      })
    }),
    fields: [
      {
        type: 'text',
        name: 'name',
        label: 'Namn',
        required: true
      },
      {
        type: 'email',
        name: 'email',
        label: 'E-post',
        required: true
      },
      {
        type: 'tel',
        name: 'phone',
        label: 'Telefon',
        required: true
      },
      {
        type: 'text',
        name: 'address',
        label: 'Adress',
        required: true
      },
      {
        type: 'checkbox',
        name: 'useRut',
        label: 'Jag vill använda RUT-avdrag'
      },
      {
        type: 'text',
        name: 'personnummer',
        label: 'Personnummer',
        placeholder: 'YYYYMMDD-XXXX',
        dependsOn: {
          field: 'useRut',
          value: true
        }
      },
      {
        type: 'textarea',
        name: 'specialInstructions',
        label: 'Särskilda instruktioner',
        rows: 3
      }
    ]
  },
  
  preview: {
    id: 'preview',
    title: 'Granska & bekräfta',
    description: 'Granska din bokning innan du bekräftar',
    validation: Yup.object().shape({
      consent: Yup.boolean()
        .oneOf([true], 'Du måste godkänna villkoren')
        .required('Du måste godkänna villkoren')
    }),
    fields: [
      {
        type: 'checkbox',
        name: 'consent',
        label: 'Jag godkänner villkoren och samtycker till hantering av mina personuppgifter',
        required: true
      }
    ]
  }
};

// Step order configuration
export const stepOrder = [
  'zipCode',
  'serviceSelect',
  'serviceDetails',
  'customerInfo',
  'preview'
];

// Helper to get step by index
export const getStepByIndex = (index) => {
  const stepId = stepOrder[index];
  return stepSchema[stepId];
};

// Helper to get total number of steps
export const getTotalSteps = () => stepOrder.length;

// Helper to check if step is last
export const isLastStep = (index) => index === stepOrder.length - 1;

// Helper to check if step is first
export const isFirstStep = (index) => index === 0;