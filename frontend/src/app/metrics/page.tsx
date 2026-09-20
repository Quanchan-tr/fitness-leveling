'use strict';
'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { initialFitnessData } from '@/lib/fitnessData';
import { Activity, Scale, TrendingDown, Calendar, Plus, LineChart } from 'lucide-react';

export default function MetricsPage() {
  const [data, setData] = useState(initialFitnessData);

  return (
    <main className="flex-1 flex flex-col min-w-0">
      <TopBar user={data.user} streak={data.today.streak} />

      <div className="p-6 space-y-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#1F2328] tracking-tight flex items-center gap-2.5">
              <Activity className="w-7 h-7 text-[#FF6B35]" />
              Body Metrics & Composition
            </h1>
            <p className="text-xs text-[#76583E] mt-0.5">
              Historical body measurements, composition analysis, and progress curves.
            </p>
          </div>
        </div>

        {/* Current Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-[#B9A78E]/30 shadow-sm">
            <span className="text-xs font-semibold text-[#76583E]">Current Weight</span>
            <div className="text-2xl font-black text-[#1F2328] mt-1">{data.body.weight} kg</div>
            <div className="text-xs text-[#7FB069] font-semibold mt-1">-0.8 kg this month</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#B9A78E]/30 shadow-sm">
            <span className="text-xs font-semibold text-[#76583E]">Body Fat</span>
            <div className="text-2xl font-black text-[#4D96FF] mt-1">{data.body.bodyFat}%</div>
            <div className="text-xs text-[#76583E] font-medium mt-1">Calipers & Bio-impedance</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#B9A78E]/30 shadow-sm">
            <span className="text-xs font-semibold text-[#76583E]">Muscle Mass</span>
            <div className="text-2xl font-black text-[#7FB069] mt-1">{data.body.muscle} kg</div>
            <div className="text-xs text-[#FF6B35] font-semibold mt-1">+0.4 kg lean growth</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#B9A78E]/30 shadow-sm">
            <span className="text-xs font-semibold text-[#76583E]">BMI (Height {data.body.height}cm)</span>
            <div className="text-2xl font-black text-[#1F2328] mt-1">{data.body.bmi}</div>
            <div className="text-xs text-[#7FB069] font-medium mt-1">Optimal Range</div>
          </div>
        </div>

        {/* Historical Table */}
        <div className="bg-white rounded-2xl border border-[#B9A78E]/40 overflow-hidden shadow-sm">
          <div className="p-4 bg-[#E8E1D5]/40 border-b border-[#B9A78E]/30 flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#1F2328] uppercase tracking-wider">
              Measurement History
            </h3>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#B9A78E]/20 text-[#76583E] font-semibold bg-[#F7F3EA]">
                <th className="p-3.5">Log Date</th>
                <th className="p-3.5">Weight (kg)</th>
                <th className="p-3.5">Body Fat (%)</th>
                <th className="p-3.5">Muscle Mass (kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B9A78E]/20">
              {data.recentMetrics.map((m, idx) => (
                <tr key={idx} className="hover:bg-[#F7F3EA] transition-colors">
                  <td className="p-3.5 font-bold text-[#1F2328]">{m.date}</td>
                  <td className="p-3.5 font-bold text-[#FF6B35]">{m.weight} kg</td>
                  <td className="p-3.5 font-semibold text-[#4D96FF]">{m.bodyFat}%</td>
                  <td className="p-3.5 font-semibold text-[#7FB069]">{m.muscle} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
