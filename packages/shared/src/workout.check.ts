// Self-check for workout.ts. Run: npm test -w @fitness/shared  (Node >= 22.18 strips types natively)
import assert from 'node:assert/strict';
import {
  addSet,
  apiExerciseToExercise,
  defaultSets,
  removeSet,
  resetExercises,
  summarizeWorkout,
  updateSet,
} from './workout.ts';

const bench = apiExerciseToExercise({ id: '1', name: 'Bench Press', equipment: 'Barbell', target_muscle: 'chest' });
assert.equal(bench.equipment, 'barbell');
assert.equal(bench.type, 'weight_reps');
const pushup = apiExerciseToExercise({ id: '2', name: 'Push Up', equipment: 'body weight' });
assert.equal(pushup.equipment, 'bodyweight');
assert.equal(pushup.type, 'bodyweight_reps');

let sets = defaultSets('weight_reps');
assert.equal(sets.length, 3);
sets = addSet(sets, 'weight_reps');
assert.deepEqual(sets.map((s) => s.setNumber), [1, 2, 3, 4]);
sets = removeSet(sets, 0);
assert.deepEqual(sets.map((s) => s.setNumber), [1, 2, 3]);
assert.equal(removeSet([sets[0]], 0).length, 1, 'never drops the last set');

let items = [{ exercise: bench, sets }];
items = updateSet(items, 0, 0, { isCompleted: true, weightKg: 50, reps: 8 });
items = updateSet(items, 0, 1, { isCompleted: true });
const sum = summarizeWorkout(items);
assert.equal(sum.totalSets, 2);
assert.equal(sum.totalReps, 18);
assert.equal(sum.totalVolumeKg, 50 * 8 + 20 * 10);
assert.ok(resetExercises(items)[0].sets.every((s) => !s.isCompleted));
assert.equal(items[0].sets[0].isCompleted, true, 'inputs are not mutated');

console.log('workout.ts OK');
