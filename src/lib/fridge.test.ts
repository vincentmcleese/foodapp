import {
  addIngredient,
  getIngredients,
  updateIngredient,
  deleteIngredient,
  clearFridge,
} from "./fridge";

describe("Fridge CRUD logic", () => {
  beforeEach(() => {
    clearFridge();
  });

  it("should add an ingredient", () => {
    addIngredient({ name: "Milk", quantity: 2, unit: "L" });
    const ingredients = getIngredients();
    expect(ingredients).toHaveLength(1);
    expect(ingredients[0]).toMatchObject({
      name: "Milk",
      quantity: 2,
      unit: "L",
    });
  });

  it("should update an ingredient", () => {
    const { id } = addIngredient({ name: "Eggs", quantity: 12, unit: "pcs" });
    updateIngredient(id, { quantity: 6 });
    const updated = getIngredients().find((i) => i.id === id);
    expect(updated?.quantity).toBe(6);
  });

  it("should delete an ingredient", () => {
    const { id } = addIngredient({ name: "Butter", quantity: 1, unit: "kg" });
    deleteIngredient(id);
    const ingredients = getIngredients();
    expect(ingredients.find((i) => i.id === id)).toBeUndefined();
  });
});
