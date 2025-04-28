import React, { createContext, useState, useEffect, useContext } from 'react';

interface Space {
  id: number;
  name: string;
  description: string;
  tools: string[];
  users: string[];
}

interface SpaceContextType {
  spaces: Space[];
  currentSpace: Space | null;
  isLoading: boolean;
  error: string | null;
  selectSpace: (id: number) => void;
  createSpace: (space: Omit<Space, 'id'>) => Promise<void>;
  updateSpace: (id: number, updates: Partial<Space>) => Promise<void>;
  deleteSpace: (id: number) => Promise<void>;
}

const SpaceContext = createContext<SpaceContextType>(null!);

export const useSpaces = () => useContext(SpaceContext);

export const SpaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [currentSpace, setCurrentSpace] = useState<Space | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load spaces on mount
  useEffect(() => {
    // In a real app, this would be an API call
    // For now, we'll load mock data
    const loadSpaces = async () => {
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockSpaces: Space[] = [
          {
            id: 1,
            name: 'CSM Space',
            description: 'Space for Customer Success Management team with relevant tools',
            tools: ['CRM Connector', 'QBR Builder'],
            users: ['john.doe@example.com', 'jane.smith@example.com'],
          },
          {
            id: 2,
            name: 'Sales Space',
            description: 'Space for Sales team with prospecting and deal analysis tools',
            tools: ['CRM Connector', 'Prospecting Tools'],
            users: ['mike.johnson@example.com', 'sarah.williams@example.com'],
          },
          {
            id: 3,
            name: 'Engineering Space',
            description: 'Space for Engineering team with code and documentation tools',
            tools: ['GitHub Integration', 'Documentation Generator', 'Code Analyzer'],
            users: ['david.brown@example.com', 'emily.davis@example.com'],
          },
        ];

        setSpaces(mockSpaces);
        // Set the first space as the default current space
        if (mockSpaces.length > 0) {
          setCurrentSpace(mockSpaces[0]);
        }
      } catch (err) {
        setError('Failed to load spaces');
        console.error('Error loading spaces:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSpaces();
  }, []);

  const selectSpace = (id: number) => {
    const space = spaces.find((s) => s.id === id);
    if (space) {
      setCurrentSpace(space);
    } else {
      setError(`Space with ID ${id} not found`);
    }
  };

  const createSpace = async (space: Omit<Space, 'id'>) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newSpace: Space = {
        ...space,
        id: Date.now(), // Use timestamp as ID
      };

      setSpaces((prevSpaces) => [...prevSpaces, newSpace]);
      setCurrentSpace(newSpace);
    } catch (err) {
      setError('Failed to create space');
      console.error('Error creating space:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSpace = async (id: number, updates: Partial<Space>) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSpaces((prevSpaces) =>
        prevSpaces.map((space) =>
          space.id === id ? { ...space, ...updates } : space
        )
      );

      // Update current space if it's the one being updated
      if (currentSpace?.id === id) {
        setCurrentSpace((prev) => (prev ? { ...prev, ...updates } : prev));
      }
    } catch (err) {
      setError(`Failed to update space ${id}`);
      console.error('Error updating space:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSpace = async (id: number) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSpaces((prevSpaces) => prevSpaces.filter((space) => space.id !== id));

      // If the deleted space is the current space, set the first available space as current
      if (currentSpace?.id === id) {
        const remainingSpaces = spaces.filter((space) => space.id !== id);
        if (remainingSpaces.length > 0) {
          setCurrentSpace(remainingSpaces[0]);
        } else {
          setCurrentSpace(null);
        }
      }
    } catch (err) {
      setError(`Failed to delete space ${id}`);
      console.error('Error deleting space:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    spaces,
    currentSpace,
    isLoading,
    error,
    selectSpace,
    createSpace,
    updateSpace,
    deleteSpace,
  };

  return <SpaceContext.Provider value={value}>{children}</SpaceContext.Provider>;
};
