import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Filter } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import MoonLoader from '../common/MoonLoader';

interface ReportData {
  userGrowth: { month: string; count: number }[];
  completionRate: number;
  companySatisfaction: number;
  averageResponseTime: number;
}

const AdminReports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<ReportData | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const response = await adminService.getReports();
        if (response.success) {
          setReports(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios e Analytics</h1>
            <p className="text-gray-600 mt-1">Análise detalhada do desempenho da plataforma</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={20} />
            <span>Exportar Dados</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-8 flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2 text-gray-600">
            <Filter size={20} />
            <span className="font-medium">Filtros:</span>
          </div>
          <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-solve-blue">
            <option>Últimos 30 dias</option>
            <option>Últimos 3 meses</option>
            <option>Este ano</option>
          </select>
          <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-solve-blue">
            <option>Todos os Utilizadores</option>
            <option>Estudantes</option>
            <option>Empresas</option>
            <option>Instituições</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-20">
            <MoonLoader />
          </div>
        ) : !reports ? (
          <div className="text-center p-20 text-gray-500">Não foi possível carregar os dados.</div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Growth Chart Placeholder */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            {...({ className: "bg-white p-6 rounded-2xl shadow-sm border border-gray-200"} as any)}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Crescimento de Utilizadores</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {reports.userGrowth.map((monthData, i) => (
                <div key={i} className="w-full bg-blue-100 rounded-t-lg relative group">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-solve-blue rounded-t-lg transition-all duration-500"
                    style={{ height: `${(monthData.count / Math.max(...reports.userGrowth.map(d => d.count))) * 100}%` }}
                  ></div>
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity">
                    {monthData.count}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-gray-500">
              <span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span>
              <span>Jul</span><span>Ago</span><span>Set</span><span>Out</span><span>Nov</span><span>Dez</span>
            </div>
          </motion.div>

          {/* Activity Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            {...({ className: "bg-white p-6 rounded-2xl shadow-sm border border-gray-200"} as any)}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Atividade da Plataforma</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Taxa de Conclusão de Desafios</span>
                  <span className="font-semibold text-gray-900">{reports.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${reports.completionRate}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Satisfação das Empresas</span>
                  <span className="font-semibold text-gray-900">{reports.companySatisfaction}/5.0</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(reports.companySatisfaction / 5) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Tempo Médio de Resposta</span>
                  <span className="font-semibold text-gray-900">{reports.averageResponseTime} dias</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${(reports.averageResponseTime / 5) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;