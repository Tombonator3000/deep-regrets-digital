import { useState, useReducer } from 'react';
import { StartScreen } from '@/components/StartScreen';
import { CharacterSelection } from '@/components/CharacterSelection';
import { GameBoard } from '@/components/GameBoard';
import { CharacterOption, GameState } from '@/types/game';
import { initializeGame, gameReducer } from '@/utils/gameEngine';
import { useToast } from '@/hooks/use-toast';

type GameScreen = 'start' | 'character-selection' | 'game';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('start');
  const [playerCount, setPlayerCount] = useState(2);
  const [gameState, dispatch] = useReducer(gameReducer, null as GameState | null);
  const { toast } = useToast();

  const handleStartGame = (players: number) => {
    setPlayerCount(players);
    setCurrentScreen('character-selection');
    toast({
      title: "Welcome to Deep Regrets!",
      description: "Choose your captains wisely - the deep sea holds many secrets.",
    });
  };

  const handleCharactersSelected = (characters: CharacterOption[]) => {
    const newGameState = initializeGame(characters);
    dispatch({ type: 'INIT_GAME', playerId: 'system', payload: newGameState });
    setCurrentScreen('game');
    toast({
      title: "Game Started!",
      description: "Your voyage into the deep begins. May fortune favor the bold.",
    });
  };

  const handleBackToStart = () => {
    setCurrentScreen('start');
  };

  const handleGameAction = (action: any) => {
    if (gameState) {
      dispatch(action);
    }
  };

  const handleNewGame = () => {
    setCurrentScreen('start');
    dispatch({ type: 'RESET_GAME', playerId: 'system', payload: {} });
  };

  // Render current screen
  switch (currentScreen) {
    case 'start':
      return <StartScreen onStartGame={handleStartGame} />;
    
    case 'character-selection':
      return (
        <CharacterSelection 
          playerCount={playerCount}
          onCharactersSelected={handleCharactersSelected}
          onBack={handleBackToStart}
        />
      );
    
    case 'game':
      if (!gameState) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary-glow mb-4">Loading Game...</h2>
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
          </div>
        );
      }
      
      return (
        <GameBoard 
          gameState={gameState}
          onAction={handleGameAction}
          onNewGame={handleNewGame}
        />
      );
    
    default:
      return null;
  }
};

export default Index;
