import { useEffect, useMemo, useState } from 'react';

export const useDiceSelection = (dice: number[]) => {
  const [selectedDiceIndices, setSelectedDiceIndices] = useState<number[]>([]);

  useEffect(() => {
    setSelectedDiceIndices((prev) => prev.filter((index) => index < dice.length));
  }, [dice.length]);

  const availableDiceTotal = useMemo(
    () => dice.reduce((sum, value) => sum + value, 0),
    [dice]
  );

  const selectedDiceTotal = useMemo(
    () => selectedDiceIndices.reduce((sum, index) => sum + (dice[index] ?? 0), 0),
    [dice, selectedDiceIndices]
  );

  const toggleDiceSelection = (index: number) => {
    setSelectedDiceIndices((prev) =>
      prev.includes(index)
        ? prev.filter((idx) => idx !== index)
        : [...prev, index]
    );
  };

  const resetDiceSelection = () => setSelectedDiceIndices([]);

  return {
    availableDiceTotal,
    resetDiceSelection,
    selectedDiceIndices,
    selectedDiceTotal,
    toggleDiceSelection,
  };
};
