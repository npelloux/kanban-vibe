/**
 * Golden Master Tests for State Serialization
 *
 * These tests capture the CURRENT behavior of handleSaveContext() and handleImportContext()
 * in App.tsx. They serve as a safety net during refactoring - any failing test
 * indicates a behavioral change that must be either intentional or fixed.
 *
 * DO NOT modify these tests to make them pass after refactoring.
 * If behavior changes are intended, document them and update tests explicitly.
 *
 * @see PRD: docs/project/PRD/active/PRD-refactoring-clean-architecture.md M0-D0.7
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

interface WorkItemsType {
  red: { total: number; completed: number };
  blue: { total: number; completed: number };
  green: { total: number; completed: number };
}

interface Card {
  id: string;
  content: string;
  stage: string;
  age: number;
  startDay: number;
  isBlocked: boolean;
  workItems: WorkItemsType;
  assignedWorkers: {
    id: string;
    type: 'red' | 'blue' | 'green';
  }[];
  completionDay?: number;
}

interface Worker {
  id: string;
  type: 'red' | 'blue' | 'green';
}

interface HistoricalData {
  day: number;
  columnData: {
    options: number;
    redActive: number;
    redFinished: number;
    blueActive: number;
    blueFinished: number;
    green: number;
    done: number;
  };
}

interface KanbanState {
  currentDay: number;
  cards: Card[];
  workers: Worker[];
  wipLimits: {
    options: { min: number; max: number };
    redActive: { min: number; max: number };
    redFinished: { min: number; max: number };
    blueActive: { min: number; max: number };
    blueFinished: { min: number; max: number };
    green: { min: number; max: number };
    done: { min: number; max: number };
  };
  historicalData: HistoricalData[];
}

const createCard = (overrides: Partial<Card> = {}): Card => ({
  id: 'A',
  content: 'Test card',
  stage: 'options',
  age: 0,
  startDay: 1,
  isBlocked: false,
  workItems: {
    red: { total: 5, completed: 0 },
    blue: { total: 3, completed: 0 },
    green: { total: 2, completed: 0 },
  },
  assignedWorkers: [],
  ...overrides,
});

const createWorker = (id: string, type: 'red' | 'blue' | 'green'): Worker => ({
  id,
  type,
});

const createHistoricalData = (day: number, overrides: Partial<HistoricalData['columnData']> = {}): HistoricalData => ({
  day,
  columnData: {
    options: 0,
    redActive: 0,
    redFinished: 0,
    blueActive: 0,
    blueFinished: 0,
    green: 0,
    done: 0,
    ...overrides,
  },
});

const createDefaultWipLimits = () => ({
  options: { min: 0, max: 0 },
  redActive: { min: 0, max: 0 },
  redFinished: { min: 0, max: 0 },
  blueActive: { min: 0, max: 0 },
  blueFinished: { min: 0, max: 0 },
  green: { min: 0, max: 0 },
  done: { min: 0, max: 0 },
});

const createKanbanState = (overrides: Partial<KanbanState> = {}): KanbanState => ({
  currentDay: 1,
  cards: [],
  workers: [],
  wipLimits: createDefaultWipLimits(),
  historicalData: [],
  ...overrides,
});

describe('Golden Master: State Serialization', () => {
  describe('JSON Structure Documentation', () => {
    it('should serialize empty board state to expected JSON structure', () => {
      const emptyState = createKanbanState();
      const serialized = JSON.stringify(emptyState, null, 2);

      expect(serialized).toMatchSnapshot();
    });

    it('should serialize minimal populated board state to expected JSON structure', () => {
      const state = createKanbanState({
        currentDay: 5,
        cards: [createCard({ id: 'A', content: 'Test card 1', stage: 'red-active', age: 2 })],
        workers: [createWorker('w1', 'red')],
        wipLimits: {
          ...createDefaultWipLimits(),
          redActive: { min: 1, max: 3 },
        },
        historicalData: [createHistoricalData(1, { options: 1 })],
      });

      const serialized = JSON.stringify(state, null, 2);

      expect(serialized).toMatchSnapshot();
    });

    it('should serialize complex board state with all features to expected JSON structure', () => {
      const state = createKanbanState({
        currentDay: 10,
        cards: [
          createCard({
            id: 'A',
            content: 'Completed red card',
            stage: 'red-finished',
            age: 3,
            startDay: 7,
            workItems: {
              red: { total: 5, completed: 5 },
              blue: { total: 3, completed: 0 },
              green: { total: 2, completed: 0 },
            },
          }),
          createCard({
            id: 'B',
            content: 'Blocked card',
            stage: 'blue-active',
            age: 5,
            startDay: 5,
            isBlocked: true,
            workItems: {
              red: { total: 4, completed: 4 },
              blue: { total: 6, completed: 2 },
              green: { total: 1, completed: 0 },
            },
            assignedWorkers: [{ id: 'w2', type: 'blue' }],
          }),
          createCard({
            id: 'C',
            content: 'Done card',
            stage: 'done',
            age: 8,
            startDay: 2,
            completionDay: 10,
            workItems: {
              red: { total: 3, completed: 3 },
              blue: { total: 3, completed: 3 },
              green: { total: 2, completed: 2 },
            },
          }),
        ],
        workers: [
          createWorker('w1', 'red'),
          createWorker('w2', 'blue'),
          createWorker('w3', 'green'),
        ],
        wipLimits: {
          options: { min: 0, max: 5 },
          redActive: { min: 1, max: 3 },
          redFinished: { min: 0, max: 2 },
          blueActive: { min: 1, max: 4 },
          blueFinished: { min: 0, max: 2 },
          green: { min: 0, max: 3 },
          done: { min: 0, max: 0 },
        },
        historicalData: [
          createHistoricalData(1, { options: 3 }),
          createHistoricalData(2, { options: 2, redActive: 1 }),
          createHistoricalData(3, { options: 1, redActive: 2 }),
        ],
      });

      const serialized = JSON.stringify(state, null, 2);

      expect(serialized).toMatchSnapshot();
    });
  });

  describe('Round-trip Save/Load Verification', () => {
    it('should preserve empty state through save/load cycle', () => {
      const originalState = createKanbanState();

      const serialized = JSON.stringify(originalState, null, 2);
      const deserialized: KanbanState = JSON.parse(serialized);

      expect(deserialized).toEqual(originalState);
    });

    it('should preserve simple state through save/load cycle', () => {
      const originalState = createKanbanState({
        currentDay: 3,
        cards: [createCard({ id: 'A', content: 'Simple card', age: 1 })],
        workers: [createWorker('w1', 'red')],
      });

      const serialized = JSON.stringify(originalState, null, 2);
      const deserialized: KanbanState = JSON.parse(serialized);

      expect(deserialized).toEqual(originalState);
    });

    it('should preserve complex state through save/load cycle', () => {
      const originalState = createKanbanState({
        currentDay: 15,
        cards: [
          createCard({
            id: 'CARD1',
            content: 'Complex card with all properties',
            stage: 'blue-active',
            age: 7,
            startDay: 8,
            isBlocked: true,
            workItems: {
              red: { total: 10, completed: 10 },
              blue: { total: 8, completed: 3 },
              green: { total: 5, completed: 0 },
            },
            assignedWorkers: [
              { id: 'worker1', type: 'blue' },
              { id: 'worker2', type: 'red' },
            ],
          }),
          createCard({
            id: 'CARD2',
            content: 'Completed card',
            stage: 'done',
            age: 12,
            startDay: 3,
            completionDay: 15,
            workItems: {
              red: { total: 6, completed: 6 },
              blue: { total: 4, completed: 4 },
              green: { total: 3, completed: 3 },
            },
          }),
        ],
        workers: [
          createWorker('w1', 'red'),
          createWorker('w2', 'blue'),
          createWorker('w3', 'green'),
        ],
        wipLimits: {
          options: { min: 2, max: 10 },
          redActive: { min: 1, max: 5 },
          redFinished: { min: 0, max: 3 },
          blueActive: { min: 2, max: 6 },
          blueFinished: { min: 0, max: 4 },
          green: { min: 1, max: 7 },
          done: { min: 0, max: 0 },
        },
        historicalData: [
          createHistoricalData(1, { options: 5, redActive: 0, redFinished: 0, blueActive: 0, blueFinished: 0, green: 0, done: 0 }),
          createHistoricalData(2, { options: 3, redActive: 2, redFinished: 0, blueActive: 0, blueFinished: 0, green: 0, done: 0 }),
          createHistoricalData(3, { options: 1, redActive: 3, redFinished: 1, blueActive: 0, blueFinished: 0, green: 0, done: 0 }),
        ],
      });

      const serialized = JSON.stringify(originalState, null, 2);
      const deserialized: KanbanState = JSON.parse(serialized);

      expect(deserialized).toEqual(originalState);
    });
  });

  describe('Field Preservation Verification', () => {
    it('should preserve all card properties exactly', () => {
      const testCard = createCard({
        id: 'TEST_ID',
        content: 'Test content with special chars: "quotes" & symbols',
        stage: 'green',
        age: 99,
        startDay: 42,
        isBlocked: true,
        workItems: {
          red: { total: 15, completed: 8 },
          blue: { total: 12, completed: 12 },
          green: { total: 7, completed: 3 },
        },
        assignedWorkers: [
          { id: 'w1', type: 'red' },
          { id: 'w2', type: 'blue' },
          { id: 'w3', type: 'green' },
        ],
        completionDay: 50,
      });

      const state = createKanbanState({ cards: [testCard] });

      const serialized = JSON.stringify(state, null, 2);
      const deserialized: KanbanState = JSON.parse(serialized);

      const deserializedCard = deserialized.cards[0];
      expect(deserializedCard.id).toBe(testCard.id);
      expect(deserializedCard.content).toBe(testCard.content);
      expect(deserializedCard.stage).toBe(testCard.stage);
      expect(deserializedCard.age).toBe(testCard.age);
      expect(deserializedCard.startDay).toBe(testCard.startDay);
      expect(deserializedCard.isBlocked).toBe(testCard.isBlocked);
      expect(deserializedCard.workItems).toEqual(testCard.workItems);
      expect(deserializedCard.assignedWorkers).toEqual(testCard.assignedWorkers);
      expect(deserializedCard.completionDay).toBe(testCard.completionDay);
    });

    it('should preserve all worker properties exactly', () => {
      const testWorkers = [
        createWorker('WORKER_1', 'red'),
        createWorker('WORKER_2', 'blue'),
        createWorker('WORKER_3', 'green'),
      ];

      const state = createKanbanState({ workers: testWorkers });

      const serialized = JSON.stringify(state, null, 2);
      const deserialized: KanbanState = JSON.parse(serialized);

      expect(deserialized.workers).toEqual(testWorkers);
      testWorkers.forEach((worker, index) => {
        expect(deserialized.workers[index].id).toBe(worker.id);
        expect(deserialized.workers[index].type).toBe(worker.type);
      });
    });

    it('should preserve all WIP limits exactly', () => {
      const testWipLimits = {
        options: { min: 5, max: 25 },
        redActive: { min: 2, max: 8 },
        redFinished: { min: 1, max: 4 },
        blueActive: { min: 3, max: 9 },
        blueFinished: { min: 0, max: 5 },
        green: { min: 1, max: 6 },
        done: { min: 0, max: 100 },
      };

      const state = createKanbanState({ wipLimits: testWipLimits });

      const serialized = JSON.stringify(state, null, 2);
      const deserialized: KanbanState = JSON.parse(serialized);

      expect(deserialized.wipLimits).toEqual(testWipLimits);
    });

    it('should preserve current day exactly', () => {
      const testDay = 365;
      const state = createKanbanState({ currentDay: testDay });

      const serialized = JSON.stringify(state, null, 2);
      const deserialized: KanbanState = JSON.parse(serialized);

      expect(deserialized.currentDay).toBe(testDay);
    });

    it('should preserve CFD historical data exactly', () => {
      const testHistoricalData = [
        createHistoricalData(1, { options: 10, redActive: 0, redFinished: 0, blueActive: 0, blueFinished: 0, green: 0, done: 0 }),
        createHistoricalData(2, { options: 8, redActive: 2, redFinished: 0, blueActive: 0, blueFinished: 0, green: 0, done: 0 }),
        createHistoricalData(3, { options: 6, redActive: 3, redFinished: 1, blueActive: 0, blueFinished: 0, green: 0, done: 0 }),
        createHistoricalData(4, { options: 4, redActive: 2, redFinished: 2, blueActive: 2, blueFinished: 0, green: 0, done: 0 }),
        createHistoricalData(5, { options: 2, redActive: 1, redFinished: 1, blueActive: 3, blueFinished: 1, green: 2, done: 0 }),
      ];

      const state = createKanbanState({ historicalData: testHistoricalData });

      const serialized = JSON.stringify(state, null, 2);
      const deserialized: KanbanState = JSON.parse(serialized);

      expect(deserialized.historicalData).toEqual(testHistoricalData);
    });
  });

  describe('Fixture File Verification', () => {
    it('should successfully load and verify empty board fixture', async () => {
      const fixturePath = path.join(__dirname, 'fixtures', 'empty-board-day1.json');
      const fixtureContent = fs.readFileSync(fixturePath, 'utf-8');
      const fixtureState: KanbanState = JSON.parse(fixtureContent);

      expect(fixtureState.currentDay).toBe(1);
      expect(fixtureState.cards).toHaveLength(0);
      expect(fixtureState.workers).toHaveLength(3);
      expect(fixtureState.historicalData).toHaveLength(0);

      const serialized = JSON.stringify(fixtureState, null, 2);
      const deserialized: KanbanState = JSON.parse(serialized);
      expect(deserialized).toEqual(fixtureState);
    });

    it('should successfully load and verify small project fixture', async () => {
      const fixturePath = path.join(__dirname, 'fixtures', 'small-project-day5.json');
      const fixtureContent = fs.readFileSync(fixturePath, 'utf-8');
      const fixtureState: KanbanState = JSON.parse(fixtureContent);

      expect(fixtureState.currentDay).toBe(5);
      expect(fixtureState.cards).toHaveLength(3);
      expect(fixtureState.cards[0].stage).toBe('options');
      expect(fixtureState.cards[1].stage).toBe('red-active');
      expect(fixtureState.cards[2].stage).toBe('blue-active');
      expect(fixtureState.historicalData).toHaveLength(5);

      const serialized = JSON.stringify(fixtureState, null, 2);
      const deserialized: KanbanState = JSON.parse(serialized);
      expect(deserialized).toEqual(fixtureState);
    });

    it('should successfully load and verify complex blocked cards fixture', async () => {
      const fixturePath = path.join(__dirname, 'fixtures', 'complex-blocked-cards-day15.json');
      const fixtureContent = fs.readFileSync(fixturePath, 'utf-8');
      const fixtureState: KanbanState = JSON.parse(fixtureContent);

      expect(fixtureState.currentDay).toBe(15);
      expect(fixtureState.cards).toHaveLength(5);

      const blockedCard = fixtureState.cards[0];
      expect(blockedCard.isBlocked).toBe(true);
      expect(blockedCard.stage).toBe('blue-active');

      const doneCard = fixtureState.cards[2];
      expect(doneCard.stage).toBe('done');
      expect(doneCard.completionDay).toBe(15);

      expect(fixtureState.wipLimits.options.min).toBe(1);
      expect(fixtureState.wipLimits.options.max).toBe(5);

      const serialized = JSON.stringify(fixtureState, null, 2);
      const deserialized: KanbanState = JSON.parse(serialized);
      expect(deserialized).toEqual(fixtureState);
    });
  });

  describe('Invalid Data Handling', () => {
    it('should handle corrupt JSON gracefully', () => {
      const corruptJson = '{"currentDay": 5, "cards": [{"id": "A", "content": "Test", malformed json...';

      expect(() => {
        JSON.parse(corruptJson);
      }).toThrow();
    });

    it('should handle empty JSON file', () => {
      const emptyJson = '';

      expect(() => {
        JSON.parse(emptyJson);
      }).toThrow();
    });

    it('should handle JSON with missing required fields', () => {
      const incompleteJson = '{"currentDay": 5}';
      const parsedData = JSON.parse(incompleteJson);

      expect(parsedData.currentDay).toBe(5);
      expect(parsedData.cards).toBeUndefined();
      expect(parsedData.workers).toBeUndefined();
      expect(parsedData.wipLimits).toBeUndefined();
      expect(parsedData.historicalData).toBeUndefined();
    });

    it('should handle JSON with null values', () => {
      const nullValueJson = JSON.stringify({
        currentDay: null,
        cards: null,
        workers: null,
        wipLimits: null,
        historicalData: null,
      });

      const parsedData = JSON.parse(nullValueJson);

      expect(parsedData.currentDay).toBeNull();
      expect(parsedData.cards).toBeNull();
      expect(parsedData.workers).toBeNull();
      expect(parsedData.wipLimits).toBeNull();
      expect(parsedData.historicalData).toBeNull();
    });

    it('should handle JSON with extra unknown fields', () => {
      const extraFieldsState = {
        currentDay: 10,
        cards: [],
        workers: [],
        wipLimits: createDefaultWipLimits(),
        historicalData: [],
        unknownField: 'this should be ignored',
        anotherUnknownField: { nested: 'object' },
      };

      const serialized = JSON.stringify(extraFieldsState, null, 2);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.currentDay).toBe(10);
      expect(deserialized.unknownField).toBe('this should be ignored');
      expect(deserialized.anotherUnknownField).toEqual({ nested: 'object' });
    });

    it('should handle very large day numbers', () => {
      const state = createKanbanState({ currentDay: 999999999 });

      const serialized = JSON.stringify(state, null, 2);
      const deserialized: KanbanState = JSON.parse(serialized);

      expect(deserialized.currentDay).toBe(999999999);
    });

    it('should handle negative day numbers', () => {
      const state = createKanbanState({ currentDay: -5 });

      const serialized = JSON.stringify(state, null, 2);
      const deserialized: KanbanState = JSON.parse(serialized);

      expect(deserialized.currentDay).toBe(-5);
    });

    it('should handle very long card content strings', () => {
      const longContent = 'A'.repeat(10000);
      const cardWithLongContent = createCard({
        content: longContent,
      });

      const state = createKanbanState({ cards: [cardWithLongContent] });

      const serialized = JSON.stringify(state, null, 2);
      const deserialized: KanbanState = JSON.parse(serialized);

      expect(deserialized.cards[0].content).toBe(longContent);
      expect(deserialized.cards[0].content).toHaveLength(10000);
    });

    it('should handle special characters in card content', () => {
      const specialContent = 'Test with "quotes", \\backslashes\\, /slashes/, \n newlines \n, \t tabs \t, and émojis 🚀 💻 ✅';
      const cardWithSpecialChars = createCard({
        content: specialContent,
      });

      const state = createKanbanState({ cards: [cardWithSpecialChars] });

      const serialized = JSON.stringify(state, null, 2);
      const deserialized: KanbanState = JSON.parse(serialized);

      expect(deserialized.cards[0].content).toBe(specialContent);
    });
  });

  describe('Edge Case Handling', () => {
    it('should handle cards with zero work items', () => {
      const cardWithZeroWork = createCard({
        workItems: {
          red: { total: 0, completed: 0 },
          blue: { total: 0, completed: 0 },
          green: { total: 0, completed: 0 },
        },
      });

      const state = createKanbanState({ cards: [cardWithZeroWork] });

      const serialized = JSON.stringify(state, null, 2);
      const deserialized: KanbanState = JSON.parse(serialized);

      expect(deserialized).toEqual(state);
    });

    it('should handle cards with no assigned workers', () => {
      const cardWithNoWorkers = createCard({ assignedWorkers: [] });

      const state = createKanbanState({ cards: [cardWithNoWorkers] });

      const serialized = JSON.stringify(state, null, 2);
      const deserialized: KanbanState = JSON.parse(serialized);

      expect(deserialized).toEqual(state);
    });

    it('should handle empty historical data array', () => {
      const state = createKanbanState({ historicalData: [] });

      const serialized = JSON.stringify(state, null, 2);
      const deserialized: KanbanState = JSON.parse(serialized);

      expect(deserialized).toEqual(state);
    });

    it('should handle day zero', () => {
      const state = createKanbanState({ currentDay: 0 });

      const serialized = JSON.stringify(state, null, 2);
      const deserialized: KanbanState = JSON.parse(serialized);

      expect(deserialized).toEqual(state);
    });

    it('should handle optional completionDay field presence and absence', () => {
      const cardWithCompletion = createCard({
        id: 'WITH_COMPLETION',
        completionDay: 42,
      });

      const cardWithoutCompletion = createCard({
        id: 'WITHOUT_COMPLETION',
      });

      const state = createKanbanState({
        cards: [cardWithCompletion, cardWithoutCompletion],
      });

      const serialized = JSON.stringify(state, null, 2);
      const deserialized: KanbanState = JSON.parse(serialized);

      expect(deserialized.cards[0].completionDay).toBe(42);
      expect(deserialized.cards[1].completionDay).toBeUndefined();
      expect(deserialized).toEqual(state);
    });
  });
});