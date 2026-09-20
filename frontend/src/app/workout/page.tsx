'use strict';
'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { initialFitnessData } from '@/lib/fitnessData';
import { Dumbbell, Plus, CheckCircle2, Calendar, Clock, Trophy } from 'lucide-react';

interface WorkoutSet {
  id: string;
  exerciseName: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  completed: boolean;
}

export default function WorkoutPage() {
  const [sets, setSets] = useState<WorkoutSet[]>([
    { id: '1', exerciseName: 'Barbell Bench Press', setNumber: 1, reps: 10, weightKg: 60, completed: true },
    { id: '2', exerciseName: 'Barbell Bench Press', setNumber: 2, reps: 8, weightKg: 70, completed: true },
    { id: '3', exerciseName: 'Barbell Bench Press', setNumber: 3, reps: 6, weightKg: 75, completed: false },
    { id: '4', exerciseName: 'Incline Dumbbell Flyes', setNumber: 1, reps: 12, weightKg: 16, completed: false },
    { id: '5', exerciseName: 'Incline Dumbbell Flyes', setNumber: 2, reps: 12, weightKg: 16, completed: false },
  ]);

  const [exerciseName, setExerciseName] = useState('Barbell Squat');
  const [reps, setReps] = useState('10');
  const [weightKg, setWeightKg] = useState('60');

  const toggleSetComplete = (id: string) => {
    setSets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleAddSet = (e: React.FormEvent) => {
    e.preventDefault();
    const newSet: WorkoutSet = {
      id: `set-${Date.now()}`,
      exerciseName,
      setNumber: sets.filter((s) => s.exerciseName === exerciseName).length + 1,
      reps: parseInt(reps, 10) || 10,
      weightKg: parseFloat(weightKg) || 0,
      completed: false,
    };
    setSets([...sets, newSet]);
  };

  return (
    <main className="flex-1 flex flex-col min-w-0">
      <TopBar user={initialFitnessData.user} streak={initialFitnessData.today.streak} />

      <div className="p-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#1F2328] tracking-tight flex items-center gap-2.5">
              <Dumbbell className="w-7 h-7 text-[#FF6B35]" />
              Workout Logger
            </h1>
            <p className="text-xs text-[#76583E] mt-0.5">
              Track your sets, reps, and resistance in real time.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#E8E1D5] px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#1F2328]">
            <Clock className="w-4 h-4 text-[#FF6B35]" />
            <span>Session: 42 mins</span>
          </div>
        </div>

        {/* Add Set Form */}
        <form
          onSubmit={handleAddSet}
          className="bg-white p-5 rounded-2xl border border-[#B9A78E]/40 shadow-sm space-y-3"
        >
          <h3 className="text-xs font-bold text-[#1F2328] uppercase tracking-wider">
            Add Exercise Set
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#76583E] mb-1">
                Exercise
              </label>
              <select
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                className="w-full bg-[#F7F3EA] px-3 py-2 rounded-xl border border-[#B9A78E]/40 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              >
                <option value="Barbell Squat">Barbell Squat (Pose Check Ready)</option>
                <option value="Barbell Bench Press">Barbell Bench Press</option>
                <option value="Deadlift">Deadlift</option>
                <option value="Incline Dumbbell Flyes">Incline Dumbbell Flyes</option>
                <option value="Push-up">Push-up (Pose Check Ready)</option>
                <option value="Plank">Plank (Pose Check Ready)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#76583E] mb-1">
                Reps
              </label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="w-full bg-[#F7F3EA] px-3 py-2 rounded-xl border border-[#B9A78E]/40 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#76583E] mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full bg-[#F7F3EA] px-3 py-2 rounded-xl border border-[#B9A78E]/40 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-[#FF6B35] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-[#FF6B35]/90 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Set
            </button>
          </div>
        </form>

        {/* Sets List Table */}
        <div className="bg-white rounded-2xl border border-[#B9A78E]/40 overflow-hidden shadow-sm">
          <div className="p-4 bg-[#E8E1D5]/40 border-b border-[#B9A78E]/30 flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#1F2328] uppercase tracking-wider">
              Today's Session Sets
            </h3>
            <span className="text-xs text-[#76583E] font-medium">
              {sets.filter((s) => s.completed).length} / {sets.length} Completed
            </span>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#B9A78E]/20 text-[#76583E] font-semibold">
                <th className="p-3.5">Exercise</th>
                <th className="p-3.5">Set</th>
                <th className="p-3.5">Target Reps</th>
                <th className="p-3.5">Weight</th>
                <th className="p-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B9A78E]/20">
              {sets.map((s) => (
                <tr
                  key={s.id}
                  className={`transition-colors ${
                    s.completed ? 'bg-[#7FB069]/10' : 'hover:bg-[#F7F3EA]'
                  }`}
                >
                  <td className="p-3.5 font-bold text-[#1F2328]">{s.exerciseName}</td>
                  <td className="p-3.5 text-[#76583E] font-semibold">Set {s.setNumber}</td>
                  <td className="p-3.5 font-medium">{s.reps} reps</td>
                  <td className="p-3.5 font-bold text-[#FF6B35]">{s.weightKg} kg</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => toggleSetComplete(s.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        s.completed
                          ? 'bg-[#7FB069] text-white'
                          : 'bg-[#E8E1D5] text-[#76583E] hover:bg-[#FF6B35] hover:text-white'
                      }`}
                    >
                      {s.completed ? 'Done' : 'Mark Done'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
