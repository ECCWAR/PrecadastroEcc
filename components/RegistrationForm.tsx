import React, { useState } from 'react';
import { FormData, FormErrors, RegistrationStep } from '../types';
import { InputField } from './InputField';
import { formatPhoneNumber, validatePhoneNumber } from '../utils/formatters';
import { generateWelcomeMessage } from '../services/geminiService';
import { saveRegistration } from '../services/storageService';
import { CheckCircle, Loader2, Send, Users, HeartHandshake, Phone } from 'lucide-react';
import { Logo } from './Logo';

export const RegistrationForm: React.FC = () => {
  const [step, setStep] = useState<RegistrationStep>(RegistrationStep.FORM);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    spouseName: '',
    phone: '',
    spousePhone: '',
    address: '',
    civilStatus: [],
    participatesInPastoral: '',
    pastoralName: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');

  const validateField = (name: string, value: any): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'O nome é obrigatório.';
        if (value.trim().length < 3) return 'Digite o nome completo.';
        return undefined;
      case 'spouseName':
        if (!value.trim()) return 'O nome do cônjuge é obrigatório.';
        if (value.trim().length < 3) return 'Digite o nome completo.';
        return undefined;
      case 'phone':
        if (!value.trim()) return 'O celular é obrigatório.';
        if (!validatePhoneNumber(value)) return 'Formato inválido. Use (DD) 9XXXX-XXXX';
        return undefined;
      case 'spousePhone':
        if (!value.trim()) return 'O celular do cônjuge é obrigatório.';
        if (!validatePhoneNumber(value)) return 'Formato inválido. Use (DD) 9XXXX-XXXX';
        return undefined;
      case 'address':
        if (!value.trim()) return 'O endereço é obrigatório.';
        if (value.trim().length < 10) return 'O endereço parece incompleto.';
        return undefined;
      case 'civilStatus':
        if (!value || value.length === 0) return 'Selecione pelo menos uma opção.';
        return undefined;
      case 'participatesInPastoral':
        if (!value) return 'Selecione uma opção.';
        return undefined;
      case 'pastoralName':
        if (formData.participatesInPastoral === 'sim' && !value.trim()) return 'Informe qual pastoral.';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate standard text fields
    (Object.keys(formData) as Array<keyof FormData>).forEach(key => {
      // Skip validating pastoralName if participatesInPastoral is 'nao'
      if (key === 'pastoralName' && formData.participatesInPastoral !== 'sim') return;
      
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let finalValue = value;
    
    if (name === 'phone' || name === 'spousePhone') {
      finalValue = formatPhoneNumber(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCheckboxChange = (value: string) => {
    setFormData(prev => {
      const current = prev.civilStatus;
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      
      return { ...prev, civilStatus: updated };
    });
    
    if (errors.civilStatus) {
      setErrors(prev => ({ ...prev, civilStatus: undefined }));
    }
  };

  const handleRadioChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      participatesInPastoral: value,
      pastoralName: value === 'nao' ? '' : prev.pastoralName 
    }));
    
    if (errors.participatesInPastoral) {
      setErrors(prev => ({ ...prev, participatesInPastoral: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const coupleName = `${formData.name} e ${formData.spouseName}`;
      
      // Save registration to local storage
      saveRegistration(formData);
      
      const message = await generateWelcomeMessage(coupleName);
      setWelcomeMessage(message);
      setStep(RegistrationStep.SUCCESS);
    } catch (error) {
      console.error("Error submitting form:", error);
      setWelcomeMessage(`Sejam bem-vindos, ${formData.name} e ${formData.spouseName}!`);
      setStep(RegistrationStep.SUCCESS);
    } finally {
      setLoading(false);
    }
  };

  const renderFormStep = () => (
    <div className="animate-fade-in">
      <div className="space-y-4">
        <InputField 
          id="name" 
          name="name" 
          label="Seu Nome" 
          value={formData.name} 
          onChange={handleChange} 
          onBlur={handleBlur}
          placeholder="Seu nome completo"
          error={errors.name}
        />

        <InputField 
          id="phone" 
          name="phone" 
          label="Seu Celular (WhatsApp)" 
          value={formData.phone} 
          onChange={handleChange} 
          onBlur={handleBlur}
          placeholder="(XX) 9XXXX-XXXX"
          type="tel"
          maxLength={15}
          error={errors.phone}
        />

        <hr className="border-gray-100 my-2"/>

        <InputField 
          id="spouseName" 
          name="spouseName" 
          label="Nome do Cônjuge" 
          value={formData.spouseName} 
          onChange={handleChange} 
          onBlur={handleBlur}
          placeholder="Nome completo do esposo(a)"
          error={errors.spouseName}
        />

        <InputField 
          id="spousePhone" 
          name="spousePhone" 
          label="Celular do Cônjuge (WhatsApp)" 
          value={formData.spousePhone} 
          onChange={handleChange} 
          onBlur={handleBlur}
          placeholder="(XX) 9XXXX-XXXX"
          type="tel"
          maxLength={15}
          error={errors.spousePhone}
        />
        
        <hr className="border-gray-100 my-2"/>

        <InputField 
          id="address" 
          name="address" 
          label="Endereço Residencial" 
          value={formData.address} 
          onChange={handleChange} 
          onBlur={handleBlur}
          multiline
          placeholder="Rua, Número, Bairro, Cidade - UF"
          error={errors.address}
        />

        {/* Estado Civil - Checkboxes */}
        <div className="mb-5">
          <label className="block text-sm font-bold text-gray-700 mb-2 font-body uppercase tracking-wide text-xs">
            Estado Civil (Pode marcar mais de um) <span className="text-ecc-red">*</span>
          </label>
          <div className={`p-4 rounded-lg border transition-all duration-200 bg-white ${errors.civilStatus ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}>
            <div className="space-y-3">
              {[
                { id: 'religioso', label: 'Casado Religioso' },
                { id: 'civil', label: 'Casado Civil' },
                { id: 'uniao_estavel', label: 'União Estável' }
              ].map((option) => (
                <label key={option.id} className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.civilStatus.includes(option.label)}
                      onChange={() => handleCheckboxChange(option.label)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-ecc-blue peer-checked:border-ecc-blue transition-colors"></div>
                    <div className="absolute top-1 left-1 w-3 h-3 bg-white scale-0 peer-checked:scale-100 transition-transform rounded-sm clip-path-check"></div>
                    {/* Custom checkmark SVG for better control */}
                    <svg className="absolute top-0.5 left-0.5 w-4 h-4 text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-body group-hover:text-ecc-blue transition-colors">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
          {errors.civilStatus && (
            <p className="mt-2 text-xs text-red-600 flex items-center font-bold animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              {errors.civilStatus}
            </p>
          )}
        </div>

        {/* Participa de Pastoral - Radio + Conditional Input */}
        <div className="mb-5">
          <label className="block text-sm font-bold text-gray-700 mb-2 font-body uppercase tracking-wide text-xs">
            Participa de Pastoral? <span className="text-ecc-red">*</span>
          </label>
          <div className={`p-4 rounded-lg border transition-all duration-200 bg-white ${errors.participatesInPastoral ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}>
            <div className="flex space-x-6">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="participatesInPastoral"
                  value="sim"
                  checked={formData.participatesInPastoral === 'sim'}
                  onChange={() => handleRadioChange('sim')}
                  className="w-5 h-5 text-ecc-blue border-gray-300 focus:ring-ecc-blue"
                />
                <span className="text-gray-700 font-body group-hover:text-ecc-blue transition-colors">Sim</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="participatesInPastoral"
                  value="nao"
                  checked={formData.participatesInPastoral === 'nao'}
                  onChange={() => handleRadioChange('nao')}
                  className="w-5 h-5 text-ecc-blue border-gray-300 focus:ring-ecc-blue"
                />
                <span className="text-gray-700 font-body group-hover:text-ecc-blue transition-colors">Não</span>
              </label>
            </div>
          </div>
          {errors.participatesInPastoral && (
            <p className="mt-2 text-xs text-red-600 flex items-center font-bold animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              {errors.participatesInPastoral}
            </p>
          )}
        </div>

        {/* Conditional Input for Pastoral Name */}
        {formData.participatesInPastoral === 'sim' && (
          <div className="animate-fade-in-down">
            <InputField 
              id="pastoralName" 
              name="pastoralName" 
              label="Qual pastoral?" 
              value={formData.pastoralName} 
              onChange={handleChange} 
              onBlur={handleBlur}
              placeholder="Ex: Pastoral do Dízimo, Catequese, etc."
              error={errors.pastoralName}
            />
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full mt-8 bg-ecc-blue hover:bg-blue-900 text-white font-bold py-4 px-6 rounded-xl shadow-xl shadow-blue-900/20 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={24} />
        ) : (
          <>
            <span className="uppercase tracking-wider text-sm">ENVIAR</span>
            <Send size={24} />
          </>
        )}
      </button>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center animate-fade-in py-4">
      <Logo size="medium" showTitle={false} className="mb-4" />
      
      <div className="flex justify-center mb-4">
        <div className="bg-green-100 text-green-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2">
          <CheckCircle size={14} />
          Inscrição Confirmada
        </div>
      </div>

      <h2 className="text-3xl font-header font-bold text-ecc-blue mb-2">Glória a Deus!</h2>
      <p className="text-gray-500 uppercase tracking-widest text-xs mb-8">Obrigado por dizer SIM!</p>
      
      <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-ecc-gold"></div>
        <p className="text-gray-700 italic font-header text-lg leading-relaxed">
          "{welcomeMessage}"
        </p>
      </div>

      <div className="text-left bg-blue-50 p-6 rounded-xl border border-blue-100 text-sm space-y-3">
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-ecc-blue flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide font-bold">Casal</p>
            <p className="font-bold text-gray-800">{formData.name} & {formData.spouseName}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Phone className="w-5 h-5 text-ecc-blue flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide font-bold">Contatos</p>
            <p className="text-gray-700"><span className="font-bold">Ele:</span> {formData.phone}</p>
            <p className="text-gray-700"><span className="font-bold">Ela:</span> {formData.spousePhone}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <HeartHandshake className="w-5 h-5 text-ecc-blue flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide font-bold">Estado Civil</p>
            <p className="font-medium text-gray-800">{formData.civilStatus.join(', ')}</p>
          </div>
        </div>

        {formData.participatesInPastoral === 'sim' && (
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 flex items-center justify-center">
              <div className="w-2 h-2 bg-ecc-blue rounded-full"></div>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide font-bold">Pastoral</p>
              <p className="font-medium text-gray-800">{formData.pastoralName}</p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => window.location.reload()}
        className="mt-8 px-8 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-full text-sm font-bold transition-colors shadow-sm hover:shadow"
      >
        Nova Inscrição
      </button>
    </div>
  );

  return (
    <div className="w-full max-w-lg bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border-t-[6px] border-ecc-blue">
      <div className="p-8 md:p-10">
        {step === RegistrationStep.FORM && renderFormStep()}
        {step === RegistrationStep.SUCCESS && renderSuccessStep()}
      </div>
      
      <div className="bg-gray-50/80 px-8 py-5 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 uppercase tracking-widest font-bold">
        <span>Pastoral Familiar</span>
        <span>ECC 2025</span>
      </div>
    </div>
  );
};