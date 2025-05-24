type Ingredient = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
};

let fridge: Ingredient[] = [];

export function addIngredient({
  name,
  quantity,
  unit,
}: Omit<Ingredient, "id">): Ingredient {
  const id = Math.random().toString(36).slice(2);
  const ingredient = { id, name, quantity, unit };
  fridge.push(ingredient);
  return ingredient;
}

export function getIngredients(): Ingredient[] {
  return [...fridge];
}

export function updateIngredient(
  id: string,
  updates: Partial<Omit<Ingredient, "id">>
) {
  const idx = fridge.findIndex((i) => i.id === id);
  if (idx !== -1) {
    fridge[idx] = { ...fridge[idx], ...updates };
  }
}

export function deleteIngredient(id: string) {
  fridge = fridge.filter((i) => i.id !== id);
}

export function clearFridge() {
  fridge = [];
}
