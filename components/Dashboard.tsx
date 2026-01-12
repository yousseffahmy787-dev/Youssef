
import React from 'react';
import { Order } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { TrendingUp, Clock, CheckCircle, Users, Target, Award, ShoppingBag, Flame, Star } from 'lucide-react';

interface DashboardProps {
  orders: Order[];
  userRole?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ orders = [], userRole }) => {
  const MONTHLY_TARGET = 150;
  const DAILY_TARGET = 7;
  
  const isAdmin = userRole === 'admin';
  const today = new Date().toLocaleDateString('en-CA');
  
  const safeOrders = Array.isArray(orders) ? orders : [];
  
  const totalRevenue = safeOrders.reduce((sum, o) => sum + (Number(o?.paid) || 0), 0);
  const pendingAmount = safeOrders.reduce((sum, o) => sum + (Number(o?.remaining) || 0), 0);
  const todayOrders = safeOrders.filter(o => o?.createdAt && o.createdAt.startsWith(today)).length;
  
  const totalOrdersCount = safeOrders.length;
  const remainingToTarget = Math.max(0, MONTHLY_TARGET - totalOrdersCount);
  const progressPercentage = Math.min(100, Math.round((totalOrdersCount / MONTHLY_TARGET) * 100)) || 0;

  const cityData = safeOrders.reduce((acc: any, order) => {
    const cityName = order?.city || 'أخرى';
    const existing = acc.find((item: any) => item.name === cityName);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: cityName, value: 1 });
    }
    return acc;
  }, []);

  const salesPerformance = safeOrders.reduce((acc: any, order) => {
    const name = order?.salesUsername || 'غير معروف';
    const existing = acc.find((item: any) => item.name === name);
    if (existing) {
      existing.revenue += (Number(order?.paid) || 0);
      existing.orders += 1;
    } else {
      acc.push({ name: name, revenue: (Number(order?.paid) || 0), orders: 1 });
    }
    return acc;
  }, []).sort((a: any, b: any) => b.revenue - a.revenue);

  const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#047857', '#064e3b'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 text-right" dir="rtl">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-emerald-950 tracking-tight">مركز القيادة</h2>
          <p className="text-slate-500 font-bold mt-1">
            {isAdmin ? 'مراقبة السيولة المالية وأداء الفريق' : 'متابعة أهدافك اليومية والشهرية'}
          </p>
        </div>
        
        {!isAdmin && (
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${progressPercentage >= 100 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-600'}`}>
              <Award size={24} />
            </div>
            <div className="pl-4 pr-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">مستوى الإنجاز</p>
              <p className="text-lg font-black text-emerald-950 leading-none">
                {progressPercentage >= 100 ? 'تجاوزت الهدف! 🏆' : `إنجازك (${progressPercentage}%)`}
              </p>
            </div>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin ? (
          <>
            <StatCard title="إجمالي الإيرادات" value={`${totalRevenue.toLocaleString()} ج.م`} icon={<TrendingUp className="text-emerald-700" />} trend="محصل فعلي" bgColor="bg-emerald-50" borderColor="border-emerald-100" />
            <StatCard title="إجمالي المبيعات" value={String(totalOrdersCount)} icon={<CheckCircle className="text-emerald-700" />} trend="عدد الأوردرات" bgColor="bg-emerald-50" borderColor="border-emerald-100" />
            <StatCard title="المبالغ المعلقة" value={`${pendingAmount.toLocaleString()} ج.م`} icon={<Clock className="text-amber-700" />} trend="تحت التحصيل" bgColor="bg-amber-50" borderColor="border-amber-100" />
            <StatCard title="عدد المناديب" value={String(salesPerformance.length)} icon={<Users className="text-indigo-700" />} trend="طاقم العمل" bgColor="bg-indigo-50" borderColor="border-indigo-100" />
          </>
        ) : (
          <>
            <StatCard title="أوردرات اليوم" value={String(todayOrders)} icon={<Flame className="text-orange-600" />} trend="المحقق اليوم" bgColor="bg-orange-50" borderColor="border-orange-100" />
            <StatCard title="التارجت اليومي" value={`${DAILY_TARGET} أوردر`} icon={<Star className="text-amber-600" />} trend={`باقي: ${Math.max(0, DAILY_TARGET - todayOrders)}`} bgColor="bg-amber-50" borderColor="border-amber-100" />
            <StatCard title="أوردرات الشهر" value={String(totalOrdersCount)} icon={<ShoppingBag className="text-emerald-700" />} trend="إجمالي العدد" bgColor="bg-emerald-50" borderColor="border-emerald-100" />
            <StatCard title="باقي على تارجتك" value={String(remainingToTarget)} icon={<Target className="text-blue-700" />} trend={`الهدف: ${MONTHLY_TARGET}`} bgColor="bg-blue-50" borderColor="border-blue-100" />
          </>
        )}
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-2xl font-black text-emerald-950 flex items-center gap-3">
                <Target size={28} className="text-emerald-600" /> 
                {isAdmin ? 'معدل نمو الأوردرات' : 'طريقك نحو التارجت الشهري'}
              </h3>
              <p className="text-slate-400 font-bold mt-1">تم تحقيق {totalOrdersCount} من {MONTHLY_TARGET}</p>
            </div>
            <div className="text-right">
              <span className="text-5xl font-black text-emerald-600">{progressPercentage}%</span>
            </div>
          </div>
          <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden p-1">
            <div className={`h-full rounded-full transition-all duration-1000 ${progressPercentage >= 100 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
          <h3 className="text-xl font-black mb-8 text-emerald-950">توزيع الأوردرات جغرافياً</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]}>
                  {cityData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
          <h3 className="text-xl font-black mb-8 text-emerald-950">الأداء المالي (ج.م)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={salesPerformance} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="revenue">
                  {salesPerformance.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, bgColor, borderColor }: any) => (
  <div className={`bg-white p-8 rounded-[2.5rem] border-2 ${borderColor} shadow-sm group overflow-hidden relative`}>
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 ${bgColor} rounded-2xl`}>{icon}</div>
      <span className="text-[10px] font-black px-3 py-1 bg-slate-100 rounded-full text-slate-500">{String(trend)}</span>
    </div>
    <p className="text-slate-500 text-sm font-bold mb-1">{title}</p>
    <h4 className="text-3xl font-black text-emerald-950">{String(value)}</h4>
  </div>
);

export default Dashboard;
