import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CHARACTERS } from '@/data/characters';
import { CharacterOption } from '@/types/game';
import { BubbleField } from '@/components/effects/BubbleField';
import { GameSetup } from './StartScreen';

export interface SelectedCharacter extends CharacterOption {
  isAI?: boolean;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
}

interface CharacterSelectionProps {
  playerCount: number;
  gameSetup?: GameSetup;
  onCharactersSelected: (selectedCharacters: SelectedCharacter[]) => void;
  onBack: () => void;
}

export const CharacterSelection = ({ playerCount, gameSetup, onCharactersSelected, onBack }: CharacterSelectionProps) => {
  const [selectedCharacters, setSelectedCharacters] = useState<SelectedCharacter[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const humanPlayers = gameSetup?.humanPlayers ?? playerCount;
  const aiPlayers = gameSetup?.aiPlayers ?? 0;
  const aiDifficulty = gameSetup?.aiDifficulty ?? 'medium';

  const isSelectingForAI = currentPlayerIndex >= humanPlayers;
  const currentLabel = isSelectingForAI
    ? `AI ${currentPlayerIndex - humanPlayers + 1}`
    : `Player ${currentPlayerIndex + 1}`;

  // Auto-select for AI players
  useEffect(() => {
    if (isSelectingForAI && selectedCharacters.length === currentPlayerIndex) {
      // Get available characters
      const available = CHARACTERS.filter(
        char => !selectedCharacters.some(selected => selected.id === char.id)
      );

      if (available.length > 0) {
        // Randomly select a character for AI
        const randomIndex = Math.floor(Math.random() * available.length);
        const aiCharacter: SelectedCharacter = {
          ...available[randomIndex],
          isAI: true,
          aiDifficulty
        };

        const newSelected = [...selectedCharacters, aiCharacter];

        // Small delay for visual feedback
        const timer = setTimeout(() => {
          setSelectedCharacters(newSelected);

          if (newSelected.length === playerCount) {
            onCharactersSelected(newSelected);
          } else {
            setCurrentPlayerIndex(currentPlayerIndex + 1);
          }
        }, 300);

        return () => clearTimeout(timer);
      }
    }
  }, [currentPlayerIndex, selectedCharacters, isSelectingForAI, playerCount, aiDifficulty, onCharactersSelected]);

  const handleCharacterSelect = (character: CharacterOption) => {
    const selectedChar: SelectedCharacter = {
      ...character,
      isAI: false
    };
    const newSelected = [...selectedCharacters, selectedChar];
    setSelectedCharacters(newSelected);

    if (newSelected.length === playerCount) {
      onCharactersSelected(newSelected);
    } else {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    }
  };

  const availableCharacters = CHARACTERS.filter(
    char => !selectedCharacters.some(selected => selected.id === char.id)
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      {/* Background effects */}
      <div className="ocean-particles">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="particle animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`
            }}
          />
        ))}
      </div>
      <BubbleField bubbleCount={56} className="opacity-70" />
      <div className="tentacle-shadow" />
      
      <div className="relative z-10 w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-glow mb-2">
            {isSelectingForAI ? 'AI Selecting...' : 'Choose Your Captain'}
          </h1>
          <p className="text-xl text-muted-foreground">
            {currentLabel} of {playerCount}
          </p>
          {selectedCharacters.length > 0 && (
            <div className="mt-4 flex justify-center flex-wrap gap-3">
              {selectedCharacters.map((char, index) => (
                <div
                  key={char.id}
                  className={`text-sm px-3 py-1 rounded-full ${
                    char.isAI
                      ? 'bg-purple-600/30 border border-purple-400/50'
                      : 'bg-primary/20 border border-primary/30'
                  }`}
                >
                  <span className={char.isAI ? 'text-purple-300' : 'text-primary'}>
                    {char.isAI ? `AI ${index - humanPlayers + 2}` : `P${index + 1}`}:
                  </span>{' '}
                  {char.name}
                </div>
              ))}
            </div>
          )}
          {aiPlayers > 0 && (
            <p className="mt-2 text-sm text-purple-400">
              {aiPlayers} AI opponent{aiPlayers > 1 ? 's' : ''} ({aiDifficulty} difficulty)
            </p>
          )}
        </div>

        {/* Character Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {availableCharacters.map((character) => (
            <Card 
              key={character.id}
              className="card-game hover:scale-105 transition-all duration-300 cursor-pointer group"
              onClick={() => handleCharacterSelect(character)}
            >
              <CardHeader className="text-center pb-2">
                {/* Character Portrait Placeholder */}
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-sea-shallow to-sea-deep border-4 border-primary/30 flex items-center justify-center group-hover:border-primary transition-colors">
                  <span className="text-3xl font-bold text-primary-glow">
                    {character.name.charAt(0)}
                  </span>
                </div>
                <CardTitle className="text-lg text-card-foreground">
                  {character.name}
                </CardTitle>
                <CardDescription className="text-primary text-sm font-medium">
                  {character.title}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  {character.description}
                </p>
                
                <div className="p-3 rounded-lg bg-accent/20 border border-accent/30">
                  <p className="text-xs font-medium text-accent-foreground text-center">
                    <strong>Starting Bonus:</strong>
                  </p>
                  <p className="text-xs text-accent text-center mt-1">
                    {character.startingBonus}
                  </p>
                </div>
                
                <Button 
                  className="w-full btn-ocean group-hover:shadow-lg transition-all"
                  size="sm"
                >
                  Select Captain
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Navigation buttons */}
        <div className="text-center mt-8 space-x-4">
          <Button 
            variant="outline"
            onClick={onBack}
            className="border-primary/30 hover:border-primary"
          >
            ← Back to Start
          </Button>
          
          {currentPlayerIndex > 0 && (
            <Button 
              variant="outline"
              onClick={() => {
                setSelectedCharacters(selectedCharacters.slice(0, -1));
                setCurrentPlayerIndex(currentPlayerIndex - 1);
              }}
              className="border-primary/30 hover:border-primary"
            >
              ← Previous Player
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};