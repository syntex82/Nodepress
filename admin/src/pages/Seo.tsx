/**
 * SEO Management Dashboard
 * Manage redirects, sitemap, and schema markup
 */

import { useEffect, useState } from 'react';
import { seoApi } from '../services/api';
import toast from 'react-hot-toast';
import { FiArrowRight, FiPlus, FiTrash2, FiExternalLink, FiMap, FiCode } from 'react-icons/fi';

type TabType = 'redirects' | 'sitemap' | 'schema';

interface Redirect {
  id: string;
  fromPath: string;
  toPath: string;
  type: number;
  isActive: boolean;
  hitCount: number;
  lastHitAt: string | null;
}

interface SitemapEntry {
  id: string;
  url: string;
  priority: number;
  changefreq: string;
  isActive: boolean;
}

interface Schema {
  id: string;
  name: string;
  type: string;
  content: any;
  scope: string;
  isActive: boolean;
}

export default function Seo() {
  const [activeTab, setActiveTab] = useState<TabType>('redirects');
  const [loading, setLoading] = useState(true);
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [sitemapEntries, setSitemapEntries] = useState<SitemapEntry[]>([]);
  const [schemas, setSchemas] = useState<Schema[]>([]);

  // Form states
  const [showRedirectForm, setShowRedirectForm] = useState(false);
  const [redirectForm, setRedirectForm] = useState({ fromPath: '', toPath: '', type: 301 });
  const [showSitemapForm, setShowSitemapForm] = useState(false);
  const [sitemapForm, setSitemapForm] = useState({ url: '', priority: 0.5, changefreq: 'weekly' });
  const [showSchemaForm, setShowSchemaForm] = useState(false);
  const [schemaForm, setSchemaForm] = useState({ name: '', type: 'Organization', content: '{}', scope: 'global' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [rRes, sRes, scRes] = await Promise.all([
        seoApi.getRedirects(),
        seoApi.getSitemapEntries(),
        seoApi.getSchemas(),
      ]);
      setRedirects(rRes.data || []);
      setSitemapEntries(sRes.data || []);
      setSchemas(scRes.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load SEO data');
      console.error('SEO data error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateRedirect = async () => {
    try {
      await seoApi.createRedirect(redirectForm);
      toast.success('Redirect created');
      setShowRedirectForm(false);
      setRedirectForm({ fromPath: '', toPath: '', type: 301 });
      loadData();
    } catch (error) {
      toast.error('Failed to create redirect');
    }
  };

  const handleDeleteRedirect = async (id: string) => {
    if (!confirm('Delete this redirect?')) return;
    try {
      await seoApi.deleteRedirect(id);
      toast.success('Redirect deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete redirect');
    }
  };

  const handleCreateSitemapEntry = async () => {
    try {
      await seoApi.createSitemapEntry(sitemapForm);
      toast.success('Sitemap entry created');
      setShowSitemapForm(false);
      setSitemapForm({ url: '', priority: 0.5, changefreq: 'weekly' });
      loadData();
    } catch (error) {
      toast.error('Failed to create sitemap entry');
    }
  };

  const handleDeleteSitemapEntry = async (id: string) => {
    if (!confirm('Delete this sitemap entry?')) return;
    try {
      await seoApi.deleteSitemapEntry(id);
      toast.success('Entry deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete entry');
    }
  };

  const handleCreateSchema = async () => {
    try {
      let content;
      try { content = JSON.parse(schemaForm.content); }
      catch { toast.error('Invalid JSON'); return; }
      await seoApi.createSchema({ ...schemaForm, content });
      toast.success('Schema created');
      setShowSchemaForm(false);
      setSchemaForm({ name: '', type: 'Organization', content: '{}', scope: 'global' });
      loadData();
    } catch (error) {
      toast.error('Failed to create schema');
    }
  };

  const handleDeleteSchema = async (id: string) => {
    if (!confirm('Delete this schema?')) return;
    try {
      await seoApi.deleteSchema(id);
      toast.success('Schema deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete schema');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );

  const tabs = [
    { id: 'redirects' as TabType, label: 'Redirects', icon: FiArrowRight },
    { id: 'sitemap' as TabType, label: 'Sitemap', icon: FiMap },
    { id: 'schema' as TabType, label: 'Schema Markup', icon: FiCode },
  ];

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">SEO Management</h1>
        <a href="/api/seo/sitemap.xml" target="_blank" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
          <FiExternalLink /> View Sitemap
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-700/50 mb-6">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 -mb-px transition-all ${activeTab === tab.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}`}>
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>
      {/* Redirects Tab */}
      {activeTab === 'redirects' && (
        <div>
          <div className="flex justify-between mb-4">
            <p className="text-slate-400">{redirects.length} redirect(s) configured</p>
            <button onClick={() => setShowRedirectForm(true)} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-xl hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/20 transition-all">
              <FiPlus /> Add Redirect
            </button>
          </div>
          {showRedirectForm && (
            <div className="bg-slate-800/50 backdrop-blur p-4 rounded-xl border border-slate-700/50 mb-4 flex gap-4 items-end flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-slate-300 mb-1">From Path</label>
                <input type="text" value={redirectForm.fromPath} onChange={e => setRedirectForm({...redirectForm, fromPath: e.target.value})} placeholder="/old-page" className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-slate-300 mb-1">To Path/URL</label>
                <input type="text" value={redirectForm.toPath} onChange={e => setRedirectForm({...redirectForm, toPath: e.target.value})} placeholder="/new-page" className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div className="w-40">
                <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                <select value={redirectForm.type} onChange={e => setRedirectForm({...redirectForm, type: parseInt(e.target.value)})} className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                  <option value={301}>301 Permanent</option>
                  <option value={302}>302 Temporary</option>
                </select>
              </div>
              <button onClick={handleCreateRedirect} className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-2 rounded-xl hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20 transition-all">Save</button>
              <button onClick={() => setShowRedirectForm(false)} className="bg-slate-700/50 text-slate-300 px-4 py-2 rounded-xl hover:bg-slate-600/50 transition-all">Cancel</button>
            </div>
          )}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-700/50">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">To</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase">Type</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase">Hits</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {redirects.map(r => (
                  <tr key={r.id} className={!r.isActive ? 'bg-slate-800/30 opacity-60' : 'hover:bg-slate-700/30 transition-colors'}>
                    <td className="px-6 py-4 font-mono text-sm text-white">{r.fromPath}</td>
                    <td className="px-6 py-4 font-mono text-sm text-white">{r.toPath}</td>
                    <td className="px-6 py-4 text-center"><span className={`px-2 py-1 rounded-lg text-xs font-medium ${r.type === 301 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{r.type}</span></td>
                    <td className="px-6 py-4 text-center text-slate-400">{r.hitCount}</td>
                    <td className="px-6 py-4 text-right"><button onClick={() => handleDeleteRedirect(r.id)} className="text-red-400 hover:text-red-300 transition-colors"><FiTrash2 /></button></td>
                  </tr>
                ))}
                {redirects.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No redirects configured</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sitemap Tab */}
      {activeTab === 'sitemap' && (
        <div>
          <div className="flex justify-between mb-4">
            <p className="text-slate-400">{sitemapEntries.length} custom entries (posts, pages, products auto-included)</p>
            <button onClick={() => setShowSitemapForm(true)} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-xl hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/20 transition-all">
              <FiPlus /> Add Entry
            </button>
          </div>
          {showSitemapForm && (
            <div className="bg-slate-800/50 backdrop-blur p-4 rounded-xl border border-slate-700/50 mb-4 flex gap-4 items-end flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-slate-300 mb-1">URL/Path</label>
                <input type="text" value={sitemapForm.url} onChange={e => setSitemapForm({...sitemapForm, url: e.target.value})} placeholder="/custom-page" className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
                <input type="number" min="0" max="1" step="0.1" value={sitemapForm.priority} onChange={e => setSitemapForm({...sitemapForm, priority: parseFloat(e.target.value)})} className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div className="w-40">
                <label className="block text-sm font-medium text-slate-300 mb-1">Change Freq</label>
                <select value={sitemapForm.changefreq} onChange={e => setSitemapForm({...sitemapForm, changefreq: e.target.value})} className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                  <option value="always">Always</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="never">Never</option>
                </select>
              </div>
              <button onClick={handleCreateSitemapEntry} className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-2 rounded-xl hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20 transition-all">Save</button>
              <button onClick={() => setShowSitemapForm(false)} className="bg-slate-700/50 text-slate-300 px-4 py-2 rounded-xl hover:bg-slate-600/50 transition-all">Cancel</button>
            </div>
          )}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-700/50">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">URL</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase">Priority</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase">Change Freq</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {sitemapEntries.map(e => (
                  <tr key={e.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-white">{e.url}</td>
                    <td className="px-6 py-4 text-center text-slate-300">{e.priority}</td>
                    <td className="px-6 py-4 text-center capitalize text-slate-300">{e.changefreq}</td>
                    <td className="px-6 py-4 text-right"><button onClick={() => handleDeleteSitemapEntry(e.id)} className="text-red-400 hover:text-red-300 transition-colors"><FiTrash2 /></button></td>
                  </tr>
                ))}
                {sitemapEntries.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No custom entries</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schema Tab */}
      {activeTab === 'schema' && (
        <div>
          <div className="flex justify-between mb-4">
            <p className="text-slate-400">{schemas.length} schema(s) configured</p>
            <button onClick={() => setShowSchemaForm(true)} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-xl hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/20 transition-all">
              <FiPlus /> Add Schema
            </button>
          </div>
          {showSchemaForm && (
            <div className="bg-slate-800/50 backdrop-blur p-4 rounded-xl border border-slate-700/50 mb-4 space-y-4">
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                  <input type="text" value={schemaForm.name} onChange={e => setSchemaForm({...schemaForm, name: e.target.value})} placeholder="My Organization" className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div className="w-48">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                  <select value={schemaForm.type} onChange={e => setSchemaForm({...schemaForm, type: e.target.value})} className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    <option value="Organization">Organization</option>
                    <option value="LocalBusiness">Local Business</option>
                    <option value="WebSite">Website</option>
                    <option value="Article">Article</option>
                    <option value="Product">Product</option>
                    <option value="FAQPage">FAQ Page</option>
                    <option value="BreadcrumbList">Breadcrumbs</option>
                  </select>
                </div>
                <div className="w-40">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Scope</label>
                  <select value={schemaForm.scope} onChange={e => setSchemaForm({...schemaForm, scope: e.target.value})} className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    <option value="global">Global</option>
                    <option value="post">Posts</option>
                    <option value="page">Pages</option>
                    <option value="product">Products</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">JSON-LD Content</label>
                <textarea value={schemaForm.content} onChange={e => setSchemaForm({...schemaForm, content: e.target.value})} rows={6} className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder='{"@context":"https://schema.org","@type":"Organization",...}' />
              </div>
              <div className="flex gap-2">
                <button onClick={handleCreateSchema} className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-2 rounded-xl hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20 transition-all">Save</button>
                <button onClick={() => setShowSchemaForm(false)} className="bg-slate-700/50 text-slate-300 px-4 py-2 rounded-xl hover:bg-slate-600/50 transition-all">Cancel</button>
              </div>
            </div>
          )}
          <div className="grid gap-4">
            {schemas.map(s => (
              <div key={s.id} className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-4 hover:border-slate-600/50 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-white">{s.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs">{s.type}</span>
                      <span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded-lg text-xs capitalize">{s.scope}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteSchema(s.id)} className="text-red-400 hover:text-red-300 transition-colors"><FiTrash2 /></button>
                </div>
                <pre className="mt-3 p-3 bg-slate-900/50 rounded-xl text-xs overflow-auto max-h-32 text-slate-300">{JSON.stringify(s.content, null, 2)}</pre>
              </div>
            ))}
            {schemas.length === 0 && <p className="text-center py-8 text-slate-400">No schemas configured. Add structured data for better search results!</p>}
          </div>
        </div>
      )}
    </div>
  );
}

