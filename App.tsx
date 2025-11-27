import React, { useState, useEffect } from 'react';
import { RegistrationForm } from './components/RegistrationForm';
import { Logo } from './components/Logo';
import { Lock, X, LogOut, Database, RefreshCw, FileSpreadsheet, FileText } from 'lucide-react';
import { getRegistrations, StoredRegistration } from './services/storageService';

const App: React.FC = () => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registrations, setRegistrations] = useState<StoredRegistration[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Carregamento Assíncrono
  const loadRegistrations = async () => {
    setIsLoadingData(true);
    try {
      const data = await getRegistrations();
      setRegistrations(data);
    } catch (error) {
      console.error("Falha ao carregar dados", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Carregar dados automaticamente ao autenticar
  useEffect(() => {
    if (isAuthenticated) {
      loadRegistrations();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'ecc@admin') {
      setIsAuthenticated(true);
      setShowAdminLogin(false);
      setPassword('');
      setLoginError('');
      // loadRegistrations é chamado pelo useEffect
    } else {
      setLoginError('Senha incorreta');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setRegistrations([]);
  };

  const handleExportCSV = () => {
    if (registrations.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }

    const headers = [
      'Data', 'Hora', 'Nome Ele', 'Nome Ela', 'Celular Ele', 'Celular Ela', 
      'Endereço', 'Estado Civil', 'Participa Pastoral', 'Qual Pastoral'
    ];

    const rows = registrations.map(reg => {
      const dateObj = new Date(reg.date);
      return [
        dateObj.toLocaleDateString('pt-BR'),
        dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        `"${reg.name}"`,
        `"${reg.spouseName}"`,
        `"${reg.phone}"`,
        `"${reg.spousePhone}"`,
        `"${reg.address.replace(/\n/g, ' ')}"`,
        `"${Array.isArray(reg.civilStatus) ? reg.civilStatus.join(', ') : reg.civilStatus}"`,
        `"${reg.participatesInPastoral}"`,
        `"${reg.pastoralName || ''}"`
      ].join(';');
    });

    const csvContent = [headers.join(';'), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ecc-inscricoes-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (registrations.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }

    // @ts-ignore
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const eccBlue = [30, 58, 138];

    doc.setFontSize(18);
    doc.setTextColor(...eccBlue);
    doc.setFont("helvetica", "bold");
    doc.text('Relatório de Inscrições ECC 2025', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);
    doc.text(`Total de inscritos: ${registrations.length}`, 14, 33);

    const tableColumn = ["Data", "Casal", "Contatos", "Estado Civil", "Pastoral"];
    
    const tableRows = registrations.map(reg => {
      const date = new Date(reg.date).toLocaleDateString('pt-BR');
      const couple = `${reg.name}\n& ${reg.spouseName}`;
      const contacts = `Ele: ${reg.phone}\nEla: ${reg.spousePhone}`;
      const civil = Array.isArray(reg.civilStatus) ? reg.civilStatus.join(', ') : reg.civilStatus;
      const pastoral = reg.participatesInPastoral === 'sim' 
        ? (reg.pastoralName || 'Sim') 
        : 'Não';

      return [date, couple, contacts, civil, pastoral];
    });

    // @ts-ignore
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak', valign: 'middle' },
      headStyles: { fillColor: eccBlue, textColor: 255, fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 50 },
        2: { cellWidth: 40 },
        3: { cellWidth: 35 },
        4: { cellWidth: 'auto' }
      },
      alternateRowStyles: { fillColor: [245, 247, 250] }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Página ${i} de ${pageCount} - Sistema ECC`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    doc.save(`ecc-relatorio-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="min-h-screen w-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed bg-gray-100 flex flex-col items-center justify-center p-4 font-sans relative">
      
      <div className="fixed inset-0 bg-gradient-to-b from-blue-50/90 to-white/90 pointer-events-none z-0"></div>
      
      {!isAuthenticated && (
        <button 
          onClick={() => setShowAdminLogin(true)}
          className="fixed top-6 right-6 z-40 bg-white p-3 rounded-full shadow-lg hover:shadow-xl border border-blue-100 text-gray-400 hover:text-ecc-blue transition-all duration-300 transform hover:-translate-y-1 group"
          title="Acesso Administrativo"
        >
          <Lock size={22} className="group-hover:scale-105 transition-transform" />
        </button>
      )}

      {showAdminLogin && !isAuthenticated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-80 relative border-t-4 border-ecc-blue">
            <button 
              onClick={() => { setShowAdminLogin(false); setLoginError(''); setPassword(''); }}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center mb-6">
              <Logo size="small" showTitle={false} className="mb-2" />
              <h3 className="text-lg font-bold text-gray-800">Área Administrativa</h3>
              <p className="text-xs text-gray-500">Acesso restrito à equipe</p>
            </div>
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
                    placeholder="Senha de acesso"
                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all ${
                      loginError ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-ecc-blue'
                    }`}
                    autoFocus
                  />
                  {loginError && <p className="text-xs text-red-500 mt-2 font-bold ml-1">{loginError}</p>}
                </div>
                <button 
                  type="submit"
                  className="w-full bg-ecc-blue text-white font-bold py-3 rounded-xl hover:bg-blue-900 transition-all shadow-lg"
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full flex flex-col items-center py-6 md:py-10">
        <Logo size="large" showTitle={true} />
        
        {isAuthenticated ? (
          <div className="w-full max-w-5xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border-t-[6px] border-ecc-gold animate-fade-in">
             <div className="p-6 md:p-8">
               <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-100 gap-4">
                 <div>
                   <h2 className="text-2xl font-header font-bold text-ecc-blue text-center md:text-left">Painel Admin</h2>
                   <p className="text-xs text-gray-500 uppercase tracking-wider mt-1 text-center md:text-left">
                     Base de Dados Vercel Postgres
                   </p>
                 </div>
                 <div className="flex gap-2 flex-wrap justify-center md:justify-end">
                   <button onClick={handleExportPDF} className="flex items-center gap-2 text-xs text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg font-bold border border-red-200 bg-white">
                     <FileText size={16} /> <span className="hidden sm:inline">GERAR PDF</span>
                   </button>
                   <button onClick={handleExportCSV} className="flex items-center gap-2 text-xs text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg font-bold border border-green-200 bg-white">
                     <FileSpreadsheet size={16} /> <span className="hidden sm:inline">GERAR PLANILHA</span>
                   </button>
                   <button onClick={loadRegistrations} className="flex items-center gap-2 text-xs text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg font-bold border border-gray-200">
                     <RefreshCw size={16} className={isLoadingData ? 'animate-spin' : ''} />
                     <span className="hidden sm:inline">ATUALIZAR</span>
                   </button>
                   <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-gray-500 hover:bg-gray-100 px-3 py-2 rounded-lg font-bold ml-2">
                     <LogOut size={16} /> SAIR
                   </button>
                 </div>
               </div>
               
               {isLoadingData ? (
                 <div className="text-center py-12">
                   <RefreshCw className="animate-spin h-8 w-8 text-ecc-blue mx-auto mb-2" />
                   <p className="text-gray-500">Carregando dados do servidor...</p>
                 </div>
               ) : registrations.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                   <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                     <Database size={32} />
                   </div>
                   <div>
                     <h3 className="text-lg font-bold text-gray-700">Nenhum registro encontrado</h3>
                     <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1">
                       As novas inscrições aparecerão aqui.
                     </p>
                   </div>
                 </div>
               ) : (
                 <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                   <table className="w-full text-left border-collapse min-w-[800px]">
                     <thead>
                       <tr className="text-xs text-gray-500 border-b border-gray-200 bg-gray-50/50">
                         <th className="p-4 font-bold uppercase tracking-wider">Data</th>
                         <th className="p-4 font-bold uppercase tracking-wider">Casal</th>
                         <th className="p-4 font-bold uppercase tracking-wider">Contatos</th>
                         <th className="p-4 font-bold uppercase tracking-wider">Detalhes</th>
                         <th className="p-4 font-bold uppercase tracking-wider">Endereço</th>
                       </tr>
                     </thead>
                     <tbody className="text-sm">
                       {registrations.map((reg) => (
                         <tr key={reg.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                           <td className="p-4 text-xs text-gray-400 align-top whitespace-nowrap">
                             {new Date(reg.date).toLocaleDateString('pt-BR')}<br/>
                             {new Date(reg.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                           </td>
                           <td className="p-4 align-top">
                             <p className="font-bold text-ecc-blue text-base">{reg.name}</p>
                             <p className="text-gray-600 font-medium mt-0.5">{reg.spouseName}</p>
                           </td>
                           <td className="p-4 align-top">
                             <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5"><span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1 rounded">ELE</span> {reg.phone}</div>
                                <div className="flex items-center gap-1.5"><span className="text-[10px] font-bold bg-pink-100 text-pink-700 px-1 rounded">ELA</span> {reg.spousePhone}</div>
                             </div>
                           </td>
                           <td className="p-4 align-top">
                             <div className="space-y-2">
                               <div>
                                 <p className="text-[10px] text-gray-400 font-bold uppercase">Estado Civil</p>
                                 <p className="text-xs text-gray-700">{Array.isArray(reg.civilStatus) ? reg.civilStatus.join(', ') : reg.civilStatus}</p>
                               </div>
                               {reg.participatesInPastoral === 'sim' && (
                                 <div>
                                   <p className="text-[10px] text-gray-400 font-bold uppercase">Pastoral</p>
                                   <p className="text-xs font-bold text-ecc-blue">{reg.pastoralName}</p>
                                 </div>
                               )}
                             </div>
                           </td>
                           <td className="p-4 align-top max-w-[200px]">
                             <p className="text-xs text-gray-600 leading-relaxed">{reg.address}</p>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
             </div>
             <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
               <p className="text-[10px] text-gray-400 uppercase font-bold">Sistema ECC v1.0 - Vercel Postgres</p>
             </div>
          </div>
        ) : (
          <RegistrationForm />
        )}
        
        <div className="mt-8 text-center opacity-70">
          <p className="text-xs text-gray-500 font-serif italic">"Ame e dê provas do seu amor."</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <p className="text-[10px] text-gray-400">Desenvolvido por WR</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;