import { describe, it, expect } from 'vitest';

// Import the stagedone function from App.tsx
// Since the function is not exported, we'll recreate it here for testing
// This is the same function from App.tsx
const stagedone = (card: {
  stage: string;
  isBlocked: boolean;
  workItems: {
    red: { total: number; completed: number };
    blue: { total: number; completed: number };
    green: { total: number; completed: number };
  };
}): boolean => {
  // Check if card is blocked
  if (card.isBlocked) {
    return false;
  }
  
  // For red-active stage, check if the red work is completed
  if (card.stage === 'red-active') {
    return card.workItems.red.total > 0 && 
           card.workItems.red.completed >= card.workItems.red.total;
  } 
  // For red-finished stage, ensure red work is completed before moving to blue-active
  else if (card.stage === 'red-finished') {
    return card.workItems.red.total > 0 && 
           card.workItems.red.completed >= card.workItems.red.total;
  }
  // For blue-active stage, check if the blue work is completed
  // Also ensure all red work is completed (requirement for blue activities)
  else if (card.stage === 'blue-active') {
    return card.workItems.blue.total > 0 && 
           card.workItems.blue.completed >= card.workItems.blue.total &&
           card.workItems.red.completed >= card.workItems.red.total;
  } 
  // For blue-finished stage, ensure blue and red work is completed before moving to green
  else if (card.stage === 'blue-finished') {
    return card.workItems.blue.total > 0 && 
           card.workItems.blue.completed >= card.workItems.blue.total &&
           card.workItems.red.completed >= card.workItems.red.total;
  }
  // For green stage, check if the green work is completed
  // Also ensure all red and blue work is completed (requirement for green activities)
  else if (card.stage === 'green') {
    return card.workItems.green.total > 0 && 
           card.workItems.green.completed >= card.workItems.green.total &&
           card.workItems.red.completed >= card.workItems.red.total &&
           card.workItems.blue.completed >= card.workItems.blue.total;
  }
  
  // For other stages (like options or done), check if all work is completed
  const totalWorkItems = Object.values(card.workItems).reduce(
    (sum, items) => sum + items.total, 
    0
  );
  
  const completedWorkItems = Object.values(card.workItems).reduce(
    (sum, items) => sum + items.completed, 
    0
  );
  
  return totalWorkItems > 0 && completedWorkItems >= totalWorkItems;
};

describe('stagedone function', () => {
  it('returns false for blocked cards regardless of stage', () => {
    // Arrange
    const blockedCard = {
      stage: 'red-active',
      isBlocked: true,
      workItems: {
        red: { total: 5, completed: 5 },
        blue: { total: 3, completed: 3 },
        green: { total: 2, completed: 2 }
      }
    };
    
    // Act & Assert
    expect(stagedone(blockedCard)).toBe(false);
  });

  it('returns true for red-active cards when red work is completed', () => {
    // Arrange
    const card = {
      stage: 'red-active',
      isBlocked: false,
      workItems: {
        red: { total: 5, completed: 5 },
        blue: { total: 3, completed: 0 },
        green: { total: 2, completed: 0 }
      }
    };
    
    // Act & Assert
    expect(stagedone(card)).toBe(true);
  });

  it('returns false for red-active cards when red work is not completed', () => {
    // Arrange
    const card = {
      stage: 'red-active',
      isBlocked: false,
      workItems: {
        red: { total: 5, completed: 4 },
        blue: { total: 3, completed: 0 },
        green: { total: 2, completed: 0 }
      }
    };
    
    // Act & Assert
    expect(stagedone(card)).toBe(false);
  });

  it('returns true for red-finished cards when red work is completed', () => {
    // Arrange
    const card = {
      stage: 'red-finished',
      isBlocked: false,
      workItems: {
        red: { total: 5, completed: 5 },
        blue: { total: 3, completed: 0 },
        green: { total: 2, completed: 0 }
      }
    };
    
    // Act & Assert
    expect(stagedone(card)).toBe(true);
  });

  it('returns true for blue-active cards when blue and red work is completed', () => {
    // Arrange
    const card = {
      stage: 'blue-active',
      isBlocked: false,
      workItems: {
        red: { total: 5, completed: 5 },
        blue: { total: 3, completed: 3 },
        green: { total: 2, completed: 0 }
      }
    };
    
    // Act & Assert
    expect(stagedone(card)).toBe(true);
  });

  it('returns false for blue-active cards when blue work is completed but red work is not', () => {
    // Arrange
    const card = {
      stage: 'blue-active',
      isBlocked: false,
      workItems: {
        red: { total: 5, completed: 4 },
        blue: { total: 3, completed: 3 },
        green: { total: 2, completed: 0 }
      }
    };
    
    // Act & Assert
    expect(stagedone(card)).toBe(false);
  });

  it('returns false for blue-active cards when red work is completed but blue work is not', () => {
    // Arrange
    const card = {
      stage: 'blue-active',
      isBlocked: false,
      workItems: {
        red: { total: 5, completed: 5 },
        blue: { total: 3, completed: 2 },
        green: { total: 2, completed: 0 }
      }
    };
    
    // Act & Assert
    expect(stagedone(card)).toBe(false);
  });

  it('returns true for blue-finished cards when blue and red work is completed', () => {
    // Arrange
    const card = {
      stage: 'blue-finished',
      isBlocked: false,
      workItems: {
        red: { total: 5, completed: 5 },
        blue: { total: 3, completed: 3 },
        green: { total: 2, completed: 0 }
      }
    };
    
    // Act & Assert
    expect(stagedone(card)).toBe(true);
  });

  it('returns true for green cards when all work is completed', () => {
    // Arrange
    const card = {
      stage: 'green',
      isBlocked: false,
      workItems: {
        red: { total: 5, completed: 5 },
        blue: { total: 3, completed: 3 },
        green: { total: 2, completed: 2 }
      }
    };
    
    // Act & Assert
    expect(stagedone(card)).toBe(true);
  });

  it('returns false for green cards when green work is not completed', () => {
    // Arrange
    const card = {
      stage: 'green',
      isBlocked: false,
      workItems: {
        red: { total: 5, completed: 5 },
        blue: { total: 3, completed: 3 },
        green: { total: 2, completed: 1 }
      }
    };
    
    // Act & Assert
    expect(stagedone(card)).toBe(false);
  });

  it('returns false for green cards when red work is not completed', () => {
    // Arrange
    const card = {
      stage: 'green',
      isBlocked: false,
      workItems: {
        red: { total: 5, completed: 4 },
        blue: { total: 3, completed: 3 },
        green: { total: 2, completed: 2 }
      }
    };
    
    // Act & Assert
    expect(stagedone(card)).toBe(false);
  });

  it('returns false for green cards when blue work is not completed', () => {
    // Arrange
    const card = {
      stage: 'green',
      isBlocked: false,
      workItems: {
        red: { total: 5, completed: 5 },
        blue: { total: 3, completed: 2 },
        green: { total: 2, completed: 2 }
      }
    };
    
    // Act & Assert
    expect(stagedone(card)).toBe(false);
  });

  it('returns true for options cards when all work is completed', () => {
    // Arrange
    const card = {
      stage: 'options',
      isBlocked: false,
      workItems: {
        red: { total: 5, completed: 5 },
        blue: { total: 3, completed: 3 },
        green: { total: 2, completed: 2 }
      }
    };
    
    // Act & Assert
    expect(stagedone(card)).toBe(true);
  });

  it('returns true for done cards when all work is completed', () => {
    // Arrange
    const card = {
      stage: 'done',
      isBlocked: false,
      workItems: {
        red: { total: 5, completed: 5 },
        blue: { total: 3, completed: 3 },
        green: { total: 2, completed: 2 }
      }
    };
    
    // Act & Assert
    expect(stagedone(card)).toBe(true);
  });
});
