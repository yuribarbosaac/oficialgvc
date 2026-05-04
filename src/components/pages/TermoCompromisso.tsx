import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Printer, Download, ArrowLeft } from 'lucide-react';

interface TermoFormData {
  nome: string;
  endereco: string;
  cpfCnpj: string;
  espacos: string;
  dataEvento: string;
  horarioInicio: string;
  horarioFim: string;
  atividade: string;
}

export default function TermoCompromisso() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TermoFormData>({
    nome: '',
    endereco: '',
    cpfCnpj: '',
    espacos: '',
    dataEvento: '',
    horarioInicio: '',
    horarioFim: '',
    atividade: ''
  });

  const handlePrint = () => {
    window.print();
  };

  const updateForm = (field: keyof TermoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Printer size={18} />
            Imprimir Termo
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl">
                <FileText size={28} />
              </div>
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900">
              TERMO DE COMPROMISSO E RESPONSABILIDADE
            </h1>
            <p className="text-slate-600 mt-2">Anexo I - Portaria nº 169/2023 - FEM</p>
          </div>

          <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
            <p className="text-justify">
              Eu_____________________________________________, domiciliado(a) ou sediado(a) na_________________________________________________,
              CPF/CNPJ no_____________, doravante denominado(a) COMPROMISSADO(A), de acordo com o previsto na Portaria nº 169/2023 e com base no 
              Pedido de Utilização nº ______/2023 protocolado na FEM em __________, firma o presente Termo, nas seguintes condições:
            </p>

            <div className="bg-slate-50 p-4 rounded-lg space-y-4">
              <h3 className="font-bold text-slate-900">Preencha os dados do evento:</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo / Razão Social</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => updateForm('nome', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="Seu nome ou da empresa"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CPF ou CNPJ</label>
                  <input
                    type="text"
                    value={formData.cpfCnpj}
                    onChange={(e) => updateForm('cpfCnpj', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Endereço Completo</label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => updateForm('endereco', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  placeholder="Rua, número, bairro, cidade"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Espaço Cultural</label>
                <input
                  type="text"
                  value={formData.espacos}
                  onChange={(e) => updateForm('espacos', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  placeholder="Nome do espaço cultural"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data do Evento</label>
                  <input
                    type="date"
                    value={formData.dataEvento}
                    onChange={(e) => updateForm('dataEvento', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hora Início</label>
                  <input
                    type="time"
                    value={formData.horarioInicio}
                    onChange={(e) => updateForm('horarioInicio', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hora Término</label>
                  <input
                    type="time"
                    value={formData.horarioFim}
                    onChange={(e) => updateForm('horarioFim', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição da Atividade</label>
                <textarea
                  value={formData.atividade}
                  onChange={(e) => updateForm('atividade', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  rows={2}
                  placeholder="Descreva o tipo de evento"
                />
              </div>
            </div>

            <p className="text-justify">
              <strong>1.</strong> O presente Termo tem por objeto a utilização, pelo COMPROMISSADO(A), do <span className="bg-yellow-100">{formData.espacos || '_____________________'}</span>, 
              situado ________________________________, para a realização exclusiva da atividade <span className="bg-yellow-100">{formData.atividade || '________________________________'}</span>, 
              no(s) dia(s) <span className="bg-yellow-100">{formData.dataEvento || '_______'}</span> do mês de ______ de 20___, 
              das <span className="bg-yellow-100">{formData.horarioInicio || '____'}</span> às <span className="bg-yellow-100">{formData.horarioFim || '____'}</span>.
            </p>

            <p className="text-justify">
              <strong>2.</strong> O (A) COMPROMISSADO(A) assumirá o encargo de segurança e produção do evento, bem como os custos de materiais de consumo 
              e expediente a serem utilizados no evento.
            </p>

            <p className="text-justify">
              <strong>3.</strong> São obrigações do(a) COMPROMISSADO(A):
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>I - Manter sob sua guarda e responsabilidade o bem cujo uso fora autorizado;</li>
              <li>II - não dar ao bem imóvel destinação diversa ou estranha à prevista no item 1 deste Termo;</li>
              <li>III - não ceder, nem transferir, no todo ou em parte, o seu uso a terceiros;</li>
              <li>IV - Zelar pela manutenção e conservação do imóvel, ao longo do período da autorização;</li>
              <li>V - Responder por todos os danos causados ao imóvel durante o período da autorização;</li>
              <li>VI - Responder por danos pessoais e materiais causados a terceiros decorrente da realização da atividade;</li>
              <li>VII - responsabilizar-se pelo cumprimento de toda a legislação trabalhista e previdenciária;</li>
              <li>VIII - providenciar todas as autorizações e medidas necessárias para a realização do evento;</li>
              <li>IX - respeitar os horários de funcionamento do espaço;</li>
              <li>X - respeitar a lotação máxima das dependências dos espaços culturais;</li>
              <li>XIII - fixar a classificação indicativa de cada evento conforme legislação vigente;</li>
              <li>XIV - dispor de responsáveis pela montagem e desmontagem dos equipamentos;</li>
              <li>XV - arcar com as despesas de segurança, controle de acesso e limpeza;</li>
              <li>XVI - mencionar em qualquer instrumento de divulgação o apoio do Governo do Estado através da FEM;</li>
              <li>XVII - informar a desistência do uso com no mínimo 3 dias de antecedência;</li>
              <li>XVIII - responder pelo descumprimento das normas através de suspensão de 3 meses.</li>
            </ul>

            <p className="text-justify">
              <strong>4.</strong> Na hipótese de descumprimento do que versa a PORTARIA 169/23 da FEM, será revogada a autorização do uso do espaço, 
              implicando no cancelamento do evento.
            </p>

            <p className="text-justify">
              <strong>5.</strong> O(A) COMPROMISSADO(A) declara ter ciência da obrigatoriedade do espaço utilizado nas mesmas condições físicas, 
              estruturais, estéticas e de funcionamento, sendo responsável por eventuais danos ao espaço.
            </p>

            <p className="text-justify">
              <strong>6.</strong> O(A) COMPROMISSADO(A) declara sua ciência e concordância com todas as condições de uso estabelecidas no presente Termo.
            </p>

            <p className="text-justify">
              <strong>7.</strong> Este Termo deverá ser assinado em 2 (duas) vias, de igual teor, antes da realização da atividade.
            </p>

            <div className="mt-8 pt-8 border-t border-slate-300">
              <p className="text-right mb-4">Rio Branco, ___ de ___________ de ______</p>
              <div className="h-24"></div>
              <div className="border-t border-slate-400 pt-2 text-center">
                <p className="text-sm">ASSINATURA DO(A) COMPROMISSADO(A)</p>
                <p className="text-xs text-slate-500 mt-1">Nome: {formData.nome || '_______________________________'} | CPF/CNPJ: {formData.cpfCnpj || '________________'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800">
            <strong>📌 Observação:</strong> Este Termo deve ser impresso, assinado e entregue na FEM antes da realização do evento. 
            O agendamento só será confirmado após entrega do Termo assinado.
          </p>
        </div>
      </div>
    </div>
  );
}