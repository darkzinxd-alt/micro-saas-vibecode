"use client"
import { useState } from 'react';
import { Search, Globe, Star, Phone, Code, X } from 'lucide-react';

export default function Home() {
  const [niche, setNiche] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [generatedSite, setGeneratedSite] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, city })
      });
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleGenerateSite = async (client: any) => {
    setGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: client.displayName?.text,
          niche,
          phone: client.nationalPhoneNumber,
          rating: client.rating
        })
      });
      const data = await res.json();
      setGeneratedSite(data.code);
    } catch (error) {
      console.error(error);
    }
    setGenerating(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center gap-3">
            <Globe className="w-10 h-10 text-blue-600" />
            Vibe<span className="text-blue-600">Site</span> Finder
          </h1>
          <p className="text-gray-500 mt-2">Encontre empresas sem site e gere landing pages com IA em segundos.</p>
        </header>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl shadow-sm border flex gap-4 mb-10">
          <input
            type="text"
            placeholder="Nicho (ex: Assistência de Celular, Delivery)"
            className="flex-1 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 text-black"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Cidade (ex: São Paulo, Rio de Janeiro)"
            className="flex-1 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 text-black"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-8 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50">
            {loading ? 'Buscando...' : <><Search className="w-5 h-5" /> Buscar</>}
          </button>
        </form>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.length === 0 && !loading && (
             <div className="col-span-full text-center text-gray-500 py-10">Nenhum resultado ainda. Tente fazer uma busca!</div>
          )}
          {clients.map((client) => (
            <div key={client.id} className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col">
              <div className={`absolute top-0 left-0 w-full h-1 ${client.potentialScore > 80 ? 'bg-green-500' : client.potentialScore > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-gray-900">{client.displayName?.text}</h3>
                <span className="bg-gray-100 text-xs font-bold px-2 py-1 rounded text-gray-600">
                  Potencial: {client.potentialScore}%
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{client.formattedAddress}</p>
              
              <div className="flex gap-4 mb-6 text-sm mt-auto">
                <div className="flex items-center gap-1 text-yellow-600 font-medium">
                  <Star className="w-4 h-4" /> {client.rating || 'N/A'} ({client.userRatingCount || 0})
                </div>
                {client.nationalPhoneNumber && (
                  <div className="flex items-center gap-1 text-gray-500">
                    <Phone className="w-4 h-4" /> Tel.
                  </div>
                )}
              </div>

              <button 
                onClick={() => handleGenerateSite(client)}
                disabled={generating}
                className="w-full bg-black text-white py-2.5 rounded-lg flex justify-center items-center gap-2 hover:bg-gray-800 transition disabled:opacity-50 font-medium mt-auto"
              >
                <Code className="w-4 h-4" /> {generating ? 'Gerando...' : 'Analisar e Criar Site'}
              </button>
            </div>
          ))}
        </div>

        {/* Preview Modal */}
        {generatedSite && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-6xl h-[90vh] rounded-xl overflow-hidden flex flex-col">
              <div className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center">
                <h3 className="font-semibold">Pré-visualização do Site Gerado</h3>
                <button onClick={() => setGeneratedSite(null)} className="hover:text-red-400">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <iframe 
                className="w-full flex-1 bg-white" 
                srcDoc={generatedSite}
                title="Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}