import { planService, PlanEntry } from "./api-services";

// Mock fetch
global.fetch = jest.fn();

describe("Plan API Service", () => {
  // Reset mocks between tests
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("getAllEntries", () => {
    it("should fetch all plan entries", async () => {
      const mockEntries = [
        {
          id: "1",
          meal_id: "meal-1",
          date: "2023-07-10", // Monday
          meal_type: "breakfast",
        },
        {
          id: "2",
          meal_id: "meal-2",
          date: "2023-07-11", // Tuesday
          meal_type: "dinner",
        },
      ];

      // Mock successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEntries,
      });

      const result = await planService.getAllEntries();

      expect(global.fetch).toHaveBeenCalledWith("/api/plan");
      expect(result).toEqual(mockEntries);
    });

    it("should handle fetch error", async () => {
      // Mock error response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "API error" }),
      });

      await expect(planService.getAllEntries()).rejects.toThrow("API error");
    });
  });

  describe("getEntry", () => {
    it("should fetch a single plan entry", async () => {
      const mockEntry = {
        id: "1",
        meal_id: "meal-1",
        date: "2023-07-10", // Monday
        meal_type: "breakfast",
      };

      // Mock successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEntry,
      });

      const result = await planService.getEntry("1");

      expect(global.fetch).toHaveBeenCalledWith("/api/plan/1");
      expect(result).toEqual(mockEntry);
    });

    it("should handle fetch error", async () => {
      // Mock error response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Entry not found" }),
      });

      await expect(planService.getEntry("999")).rejects.toThrow(
        "Entry not found"
      );
    });
  });

  describe("createEntry", () => {
    it("should create a plan entry", async () => {
      const newEntry = {
        meal_id: "meal-1",
        date: "2023-07-10", // Monday
        meal_type: "breakfast",
      };

      const createdEntry = {
        id: "1",
        ...newEntry,
        created_at: "2023-01-01",
        updated_at: "2023-01-01",
      };

      // Mock successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => createdEntry,
      });

      const result = await planService.createEntry(newEntry);

      expect(global.fetch).toHaveBeenCalledWith("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });
      expect(result).toEqual(createdEntry);
    });

    it("should handle create error", async () => {
      const newEntry = {
        meal_id: "meal-1",
        date: "2023-07-10", // Monday
        meal_type: "breakfast",
      };

      // Mock error response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Failed to create" }),
      });

      await expect(planService.createEntry(newEntry)).rejects.toThrow(
        "Failed to create"
      );
    });
  });

  describe("updateEntry", () => {
    it("should update a plan entry", async () => {
      const updateData = {
        meal_type: "lunch",
      };

      const updatedEntry = {
        id: "1",
        meal_id: "meal-1",
        date: "2023-07-10", // Monday
        meal_type: "lunch",
        updated_at: "2023-01-02",
      };

      // Mock successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedEntry,
      });

      const result = await planService.updateEntry("1", updateData);

      expect(global.fetch).toHaveBeenCalledWith("/api/plan/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual(updatedEntry);
    });

    it("should handle update error", async () => {
      // Mock error response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Entry not found" }),
      });

      await expect(
        planService.updateEntry("999", { meal_type: "dinner" })
      ).rejects.toThrow("Entry not found");
    });
  });

  describe("deleteEntry", () => {
    it("should delete a plan entry", async () => {
      // Mock successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await planService.deleteEntry("1");

      expect(global.fetch).toHaveBeenCalledWith("/api/plan/1", {
        method: "DELETE",
      });
      expect(result).toEqual({ success: true });
    });

    it("should handle delete error", async () => {
      // Mock error response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Failed to delete" }),
      });

      await expect(planService.deleteEntry("999")).rejects.toThrow(
        "Failed to delete"
      );
    });
  });
});
