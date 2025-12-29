import { useState, useEffect } from 'react';
import { FiPackage, FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiClock, FiGlobe, FiCheck } from 'react-icons/fi';
import { shippingApi, ShippingMethod } from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';

const COUNTRY_CODES = ['US', 'CA', 'GB', 'DE', 'FR', 'AU', 'NZ', 'JP', 'KR', 'CN', 'IN', 'BR', 'MX'];

export default function Shipping() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    cost: '',
    freeAbove: '',
    minDays: '',
    maxDays: '',
    countries: '',
    isActive: true,
    priority: '0',
  });

  useEffect(() => { loadMethods(); }, []);

  const loadMethods = async () => {
    try {
      setLoading(true);
      const { data } = await shippingApi.getAll(true);
      setMethods(data);
    } catch (error) {
      console.error('Failed to load shipping methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', cost: '', freeAbove: '', minDays: '', maxDays: '', countries: '', isActive: true, priority: '0' });
    setEditingMethod(null);
  };

  const openCreate = () => { resetForm(); setShowModal(true); };

  const openEdit = (method: ShippingMethod) => {
    setEditingMethod(method);
    setForm({
      name: method.name,
      description: method.description || '',
      cost: String(method.cost),
      freeAbove: method.freeAbove ? String(method.freeAbove) : '',
      minDays: method.minDays ? String(method.minDays) : '',
      maxDays: method.maxDays ? String(method.maxDays) : '',
      countries: method.countries || '',
      isActive: method.isActive,
      priority: String(method.priority),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: form.name,
        description: form.description || undefined,
        cost: parseFloat(form.cost),
        freeAbove: form.freeAbove ? parseFloat(form.freeAbove) : undefined,
        minDays: form.minDays ? parseInt(form.minDays) : undefined,
        maxDays: form.maxDays ? parseInt(form.maxDays) : undefined,
        countries: form.countries || undefined,
        isActive: form.isActive,
        priority: parseInt(form.priority),
      };
      if (editingMethod) {
        await shippingApi.update(editingMethod.id, data);
      } else {
        await shippingApi.create(data);
      }
      setShowModal(false);
      resetForm();
      loadMethods();
    } catch (error) {
      console.error('Failed to save shipping method:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await shippingApi.delete(deleteId);
      setDeleteId(null);
      loadMethods();
    } catch (error) {
      console.error('Failed to delete shipping method:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FiPackage className="text-blue-400" /> Shipping Methods
          </h1>
          <p className="text-slate-400 mt-1">Configure shipping rates and delivery options</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
          <FiPlus size={18} /> Add Method
        </button>
      </div>

      <div className="grid gap-4">
        {methods.length === 0 ? (
          <div className="bg-slate-800/50 rounded-xl p-8 text-center">
            <FiPackage className="mx-auto text-slate-500 mb-3" size={48} />
            <p className="text-slate-400">No shipping methods configured</p>
            <button onClick={openCreate} className="mt-4 text-blue-400 hover:text-blue-300">Add your first shipping method</button>
          </div>
        ) : (
          methods.map(method => (
            <div key={method.id} className={`bg-slate-800/50 backdrop-blur rounded-xl border ${method.isActive ? 'border-slate-700/50' : 'border-red-500/30 opacity-60'} p-5`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">{method.name}</h3>
                    {!method.isActive && <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">Inactive</span>}
                  </div>
                  {method.description && <p className="text-slate-400 text-sm mt-1">{method.description}</p>}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1.5 text-green-400">
                      <FiDollarSign size={14} />
                      <span>${Number(method.cost).toFixed(2)}</span>
                    </div>
                    {method.freeAbove && (
                      <div className="flex items-center gap-1.5 text-blue-400">
                        <FiCheck size={14} />
                        <span>Free above ${Number(method.freeAbove).toFixed(2)}</span>
                      </div>
                    )}
                    {(method.minDays || method.maxDays) && (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <FiClock size={14} />
                        <span>{method.minDays && method.maxDays ? `${method.minDays}-${method.maxDays} days` : method.minDays ? `${method.minDays}+ days` : `Up to ${method.maxDays} days`}</span>
                      </div>
                    )}
                    {method.countries ? (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <FiGlobe size={14} />
                        <span>{method.countries}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <FiGlobe size={14} />
                        <span>Worldwide</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(method)} className="p-2 text-slate-400 hover:text-blue-400 transition-colors"><FiEdit2 size={18} /></button>
                  <button onClick={() => setDeleteId(method.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors"><FiTrash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">{editingMethod ? 'Edit Shipping Method' : 'Create Shipping Method'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white" placeholder="e.g., Standard Shipping" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white" placeholder="e.g., Delivered in 5-7 business days" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Cost ($) *</label>
                  <input type="number" step="0.01" min="0" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} required
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white" placeholder="5.99" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Free Above ($)</label>
                  <input type="number" step="0.01" min="0" value={form.freeAbove} onChange={e => setForm({ ...form, freeAbove: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white" placeholder="50.00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Min Days</label>
                  <input type="number" min="1" value={form.minDays} onChange={e => setForm({ ...form, minDays: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white" placeholder="3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Max Days</label>
                  <input type="number" min="1" value={form.maxDays} onChange={e => setForm({ ...form, maxDays: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white" placeholder="7" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Countries (comma-separated codes, empty = all)</label>
                <input type="text" value={form.countries} onChange={e => setForm({ ...form, countries: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white" placeholder="US, CA, GB" />
                <p className="text-xs text-slate-500 mt-1">Leave empty for worldwide shipping. Use: {COUNTRY_CODES.join(', ')}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
                  <input type="number" min="0" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white" placeholder="0" />
                  <p className="text-xs text-slate-500 mt-1">Lower = shown first</p>
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500" />
                    <span className="text-slate-300">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  {editingMethod ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!deleteId} onCancel={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Shipping Method" message="Are you sure you want to delete this shipping method? This action cannot be undone."
        confirmText="Delete" variant="danger" />
    </div>
  );
}

