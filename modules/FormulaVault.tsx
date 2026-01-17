
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Formula, Service } from '../types';

const FormulaVault: React.FC = () => {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Editor state
  const [editFormula, setEditFormula] = useState<Partial<Formula>>({
    steps: [''],
    ingredients: [{ item: '', amount: '' }]
  });

  useEffect(() => {
    const load = async () => {
      setFormulas(await db.get<Formula>('FORMULAS'));
      setServices(await db.get<Service>('SERVICES'));
    };
    load();
  }, []);

  const activeFormula = formulas.find(f => f.serviceId === selectedServiceId);

  const handleSave = async () => {
    if (!selectedServiceId) return;

    const newFormula: Formula = {
      id: activeFormula?.id || Date.now().toString(),
      serviceId: selectedServiceId,
      name: services.find(s => s.id === selectedServiceId)?.name || 'Unknown',
      steps: editFormula.steps?.filter(s => s) || [],
      ingredients: editFormula.ingredients?.filter(i => i.item) || [],
      safetyNotes: editFormula.safetyNotes || ''
    };

    if (activeFormula) {
      await db.update('FORMULAS', activeFormula.id, newFormula);
    } else {
      await db.add('FORMULAS', newFormula);
    }

    setFormulas(await db.get<Formula>('FORMULAS'));
    setIsEditing(false);
  };

  const startEdit = () => {
    if (activeFormula) {
      setEditFormula(JSON.parse(JSON.stringify(activeFormula)));
    } else {
      setEditFormula({ steps: [''], ingredients: [{ item: '', amount: '' }], safetyNotes: '' });
    }
    setIsEditing(true);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-140px)]">
      {/* Left Sidebar: Service List */}
      <div className="w-full lg:w-80 bg-[#111] border border-white/5 rounded-3xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-bold luxury-font text-white">Service Vault</h2>
          <p className="text-xs text-gray-500 mt-1">Select a service to view technical data</p>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {services.map(svc => {
            const hasFormula = formulas.some(f => f.serviceId === svc.id);
            return (
              <button
                key={svc.id}
                onClick={() => { setSelectedServiceId(svc.id); setIsEditing(false); }}
                className={`w-full text-left p-4 rounded-xl mb-1 transition-all flex items-center justify-between ${
                  selectedServiceId === svc.id 
                    ? 'bg-amber-600/20 text-amber-500 border border-amber-500/30' 
                    : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <span className="font-medium text-sm truncate">{svc.name}</span>
                {hasFormula && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content: Formula Display/Editor */}
      <div className="flex-1 bg-[#111] border border-white/5 rounded-3xl overflow-hidden flex flex-col">
        {!selectedServiceId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-50">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            <p className="text-sm font-bold uppercase tracking-widest">Select a service to access vault</p>
          </div>
        ) : isEditing ? (
          // Editor Mode
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-amber-900/10">
              <h3 className="text-lg font-bold text-amber-500">Editing Formula: {services.find(s => s.id === selectedServiceId)?.name}</h3>
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 text-xs font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-500">Save Changes</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div>
                <label className="block text-xs text-gray-500 uppercase font-black tracking-widest mb-3">Ingredients</label>
                {editFormula.ingredients?.map((ing, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input 
                      placeholder="Item Name"
                      value={ing.item}
                      onChange={e => {
                        const newIngs = [...(editFormula.ingredients || [])];
                        newIngs[i].item = e.target.value;
                        setEditFormula({...editFormula, ingredients: newIngs});
                      }}
                      className="flex-1 bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 outline-none"
                    />
                    <input 
                      placeholder="Amount (e.g. 50ml)"
                      value={ing.amount}
                      onChange={e => {
                        const newIngs = [...(editFormula.ingredients || [])];
                        newIngs[i].amount = e.target.value;
                        setEditFormula({...editFormula, ingredients: newIngs});
                      }}
                      className="w-32 bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 outline-none"
                    />
                  </div>
                ))}
                <button 
                  onClick={() => setEditFormula({...editFormula, ingredients: [...(editFormula.ingredients || []), {item: '', amount: ''}]})}
                  className="mt-2 text-xs text-amber-500 hover:underline font-bold"
                >
                  + Add Ingredient
                </button>
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase font-black tracking-widest mb-3">Process Steps</label>
                {editFormula.steps?.map((step, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <span className="text-gray-500 font-mono py-2">{i+1}.</span>
                    <input 
                      value={step}
                      onChange={e => {
                        const newSteps = [...(editFormula.steps || [])];
                        newSteps[i] = e.target.value;
                        setEditFormula({...editFormula, steps: newSteps});
                      }}
                      className="flex-1 bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 outline-none"
                    />
                  </div>
                ))}
                <button 
                  onClick={() => setEditFormula({...editFormula, steps: [...(editFormula.steps || []), '']})}
                  className="mt-2 text-xs text-amber-500 hover:underline font-bold"
                >
                  + Add Step
                </button>
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase font-black tracking-widest mb-3">Safety & Notes</label>
                <textarea 
                  value={editFormula.safetyNotes}
                  onChange={e => setEditFormula({...editFormula, safetyNotes: e.target.value})}
                  rows={4}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none"
                />
              </div>
            </div>
          </div>
        ) : (
          // View Mode
          <div className="flex-1 flex flex-col">
            <div className="p-8 border-b border-white/5 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{services.find(s => s.id === selectedServiceId)?.name}</h3>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-400 border border-white/10">Version 1.0</span>
                  <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-400 border border-white/10">Last updated today</span>
                </div>
              </div>
              <button 
                onClick={startEdit}
                className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-bold border border-white/10"
              >
                {activeFormula ? 'Edit Formula' : 'Create Formula'}
              </button>
            </div>

            {activeFormula ? (
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
                    <h4 className="text-amber-500 font-bold mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                      Ingredients / Mix
                    </h4>
                    <ul className="space-y-3">
                      {activeFormula.ingredients.map((ing, i) => (
                        <li key={i} className="flex justify-between text-sm border-b border-white/5 pb-2 last:border-0">
                          <span className="text-gray-300">{ing.item}</span>
                          <span className="font-mono text-emerald-500">{ing.amount}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-red-900/10 border border-red-500/20 rounded-2xl p-6">
                    <h4 className="text-red-400 font-bold mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                      Safety Protocols
                    </h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {activeFormula.safetyNotes || 'No specific warnings logged.'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-gray-200 font-bold mb-4 text-lg">Procedure</h4>
                  <div className="space-y-4">
                    {activeFormula.steps.map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold text-gray-500 font-mono">
                          {i + 1}
                        </div>
                        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 flex-1 text-gray-300 text-sm leading-relaxed">
                          {step}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                <p>No formula recorded for this service.</p>
                <button onClick={startEdit} className="text-amber-500 hover:underline mt-2 text-sm">Create one now</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormulaVault;
