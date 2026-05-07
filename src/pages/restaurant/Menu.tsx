
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UtensilsCrossed, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Star, 
  ChevronRight, 
  MoreVertical,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  ArrowRight,
  LayoutGrid,
  List
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/auth/AuthContext';
import { RestaurantCategory, MenuItem } from '../../types/restaurant';

export function RestaurantMenu() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<RestaurantCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchMenu = async () => {
      if (!user?.client_id) return;
      
      try {
        setLoading(true);
        // In a real scenario, we would call the backend with the real client_id
        // const categoriesData = await apiGet(`/api/restaurant/categories?client_id=${user.client_id}`);
        // const itemsData = await apiGet(`/api/restaurant/menu-items?client_id=${user.client_id}`);
        
        // Mock data for categories and menu items, but using the real client_id from session
        setTimeout(() => {
          setCategories([
            { id: 'c1', client_id: user.client_id, name: 'Hambúrgueres', slug: 'hamburgueres', sort_order: 1, created_at: '' },
            { id: 'c2', client_id: user.client_id, name: 'Pizzas', slug: 'pizzas', sort_order: 2, created_at: '' },
            { id: 'c3', client_id: user.client_id, name: 'Saladas', slug: 'saladas', sort_order: 3, created_at: '' },
            { id: 'c4', client_id: user.client_id, name: 'Bebidas', slug: 'bebidas', sort_order: 4, created_at: '' },
          ]);

          setMenuItems([
            {
              id: 'm1',
              client_id: user.client_id,
              category_id: 'c1',
              name: 'Hambúrguer Gourmet',
              slug: 'hamburguer-gourmet',
              description: 'Carne maturada 200g, queijo cheddar, bacon crocante, cebola caramelizada e molho especial.',
              price: 12.50,
              highlight: true,
              whatsapp_enabled: true,
              is_active: true,
              sort_order: 1,
              created_at: '',
              updated_at: ''
            },
            {
              id: 'm2',
              client_id: user.client_id,
              category_id: 'c1',
              name: 'Hambúrguer Clássico',
              slug: 'hamburguer-classico',
              description: 'Carne 150g, queijo, alface, tomate e maionese caseira.',
              price: 9.50,
              highlight: false,
              whatsapp_enabled: true,
              is_active: true,
              sort_order: 2,
              created_at: '',
              updated_at: ''
            },
            {
              id: 'm3',
              client_id: user.client_id,
              category_id: 'c2',
              name: 'Pizza Margherita',
              slug: 'pizza-margherita',
              description: 'Molho de tomate italiano, mozzarella fresca, manjericão e azeite extra virgem.',
              price: 11.00,
              highlight: true,
              whatsapp_enabled: true,
              is_active: true,
              sort_order: 1,
              created_at: '',
              updated_at: ''
            },
            {
              id: 'm4',
              client_id: user.client_id,
              category_id: 'c4',
              name: 'Limonada Caseira',
              slug: 'limonada-caseira',
              description: 'Limonada fresca com hortelã e pouco açúcar.',
              price: 3.50,
              highlight: false,
              whatsapp_enabled: true,
              is_active: true,
              sort_order: 1,
              created_at: '',
              updated_at: ''
            }
          ]);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching menu:', error);
        setLoading(false);
      }
    };

    fetchMenu();
  }, [user?.client_id]);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900">Gestão da Ementa</h1>
          <p className="text-slate-500 font-medium">Gira as categorias e os produtos do seu restaurante.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nova Categoria
          </button>
          <button className="px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Categories & Search */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar produtos..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-2xl shrink-0">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn("p-2 rounded-xl transition-all", viewMode === 'grid' ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-slate-50")}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn("p-2 rounded-xl transition-all", viewMode === 'list' ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-slate-50")}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              "px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border",
              selectedCategory === 'all' 
                ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20" 
                : "bg-white text-slate-500 border-slate-200 hover:border-primary/30 hover:text-primary"
            )}
          >
            Todos os Produtos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border",
                selectedCategory === cat.id 
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                  : "bg-white text-slate-500 border-slate-200 hover:border-primary/30 hover:text-primary"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "bg-white rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col",
                  !item.is_active && "opacity-60 grayscale"
                )}
              >
                {/* Product Image Placeholder */}
                <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center relative overflow-hidden">
                  <ImageIcon className="w-12 h-12 text-slate-200" />
                  {item.highlight && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-amber-500/20">
                      <Star className="w-3 h-3 fill-white" />
                      Destaque
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white text-slate-600 rounded-xl shadow-lg hover:text-primary transition-all">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-white text-slate-600 rounded-xl shadow-lg hover:text-red-500 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-black text-slate-900 leading-tight">{item.name}</h3>
                    <span className="text-lg font-black text-primary">{item.price.toFixed(2)}€</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-6 flex-1">{item.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest", item.whatsapp_enabled ? "text-emerald-600" : "text-slate-400")}>
                        <Smartphone className="w-3.5 h-3.5" />
                        Bot
                      </div>
                      <div className={cn("flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest", item.is_active ? "text-blue-600" : "text-slate-400")}>
                        {item.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {item.is_active ? 'Ativo' : 'Inativo'}
                      </div>
                    </div>
                    <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Preço</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map((item) => (
                <tr key={item.id} className={cn("hover:bg-slate-50/50 transition-colors group", !item.is_active && "opacity-60")}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        <ImageIcon className="w-5 h-5 text-slate-300" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium line-clamp-1">{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {categories.find(c => c.id === item.category_id)?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-slate-900">{item.price.toFixed(2)}€</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-4">
                      <div className={cn("flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest", item.whatsapp_enabled ? "text-emerald-600" : "text-slate-400")}>
                        <Smartphone className="w-3.5 h-3.5" />
                        Bot
                      </div>
                      <div className={cn("flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest", item.is_active ? "text-blue-600" : "text-slate-400")}>
                        {item.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {item.is_active ? 'Ativo' : 'Inativo'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="p-12 text-center">
          <UtensilsCrossed className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum produto encontrado</h3>
          <p className="text-sm text-slate-500">Tente ajustar os seus filtros ou criar um novo produto.</p>
        </div>
      )}
    </div>
  );
}
