import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Star, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

interface FeatureProblemButtonProps {
  problemId: string;
  isFeatured: boolean;
  onSuccess?: () => void;
}

const FeatureProblemButton: React.FC<FeatureProblemButtonProps> = ({ problemId, isFeatured, onSuccess }) => {
  const [showPaypal, setShowPaypal] = useState(false);
  
  // Substitua pelo seu Client ID real do PayPal Developer Dashboard
  // Idealmente, isto deve estar no .env como VITE_PAYPAL_CLIENT_ID
  const VITE_PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  if (isFeatured) {
    return (
      <div className="flex items-center text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-xs font-medium border border-yellow-200">
        <Star size={12} className="fill-yellow-600 mr-1" />
        Destacado
      </div>
    );
  }

  const handleApprove = async (data: any, actions: any) => {
    try {
      const details = await actions.order.capture();
      
      // Chamar o backend para registar o destaque
      await api.post(`/company/problems/${problemId}/feature`, {
        paymentId: details.id
      });

      toast.success('Pagamento realizado! O desafio está agora em destaque.');
      setShowPaypal(false);
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error("Erro no pagamento:", error);
      toast.error('Erro ao processar o destaque do desafio.');
    }
  };

  return (
    <div className="relative">
      {!showPaypal ? (
        <button
          onClick={() => setShowPaypal(true)}
          className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full hover:shadow-md transition-all transform hover:scale-105"
        >
          <Star size={12} />
          <span>Destacar (15€)</span>
        </button>
      ) : (
        <div className="absolute bottom-full right-0 mb-2 z-50 w-64 bg-white p-4 rounded-xl shadow-xl border border-gray-200">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-gray-800">Confirmar Destaque</h4>
                <button 
                    onClick={() => setShowPaypal(false)}
                    className="text-gray-400 hover:text-gray-600 text-xs"
                >
                    Cancelar
                </button>
            </div>
            <PayPalScriptProvider options={{ "clientId": VITE_PAYPAL_CLIENT_ID, currency: "EUR" }}>
                <PayPalButtons 
                    style={{ layout: "horizontal", height: 35, tagline: false }}
                    createOrder={(data, actions) => {
                        return actions.order.create({
                            intent: "CAPTURE",
                            purchase_units: [
                                {
                                    amount: {
                                        currency_code: "EUR",
                                        value: "15.00",
                                    },
                                    description: "Destaque de Desafio - Solve Edu"
                                },
                            ],
                        });
                    }}
                    onApprove={handleApprove}
                    onError={(err) => {
                        console.error("PayPal Error:", err);
                        toast.error("Ocorreu um erro com o PayPal.");
                    }}
                />
            </PayPalScriptProvider>
        </div>
      )}
    </div>
  );
};

export default FeatureProblemButton;