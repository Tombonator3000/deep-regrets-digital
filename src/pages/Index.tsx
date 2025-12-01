import { useState, useReducer, Reducer, useEffect, useRef, useCallback } from 'react';
import { IntroScreen } from '@/components/IntroScreen';
import { StartScreen, GameSetup } from '@/components/StartScreen';
import { CharacterSelection, SelectedCharacter } from '@/components/CharacterSelection';
import { GameBoard } from '@/components/GameBoard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AITurnIndicator } from '@/components/game/AITurnIndicator';
import { CharacterOption, GameState, GameAction } from '@/types/game';
import { AIDecision } from '@/types/ai';
import { initializeGame, gameReducer } from '@/utils/gameEngine';
import { useToast } from '@/hooks/use-toast';
import { useAudio } from '@/context/AudioContext';
import { generateAIAction, shouldAIAct } from '@/utils/aiOpponent';

type GameScreen = 'intro' | 'start' | 'character-selection' | 'game';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('intro');
  const [playerCount, setPlayerCount] = useState(2);
  const [gameSetup, setGameSetup] = useState<GameSetup | undefined>();
  const [gameState, dispatch] = useReducer<Reducer<GameState | null, GameAction>>(gameReducer, null);
  const { toast } = useToast();
  const { play, pause, isMusicEnabled, playBubbleSfx, playRandomTrack } = useAudio();
  const [hasStartedMusic, setHasStartedMusic] = useState(false);
  const aiActionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [lastCharacters, setLastCharacters] = useState<SelectedCharacter[] | null>(null);
  const [aiSpeedSetting, setAiSpeedSetting] = useState<GameSetup['aiSpeed']>('normal');

  // AI turn state
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [currentAIAction, setCurrentAIAction] = useState<AIDecision | null>(null);

  useEffect(() => {
    if (!isMusicEnabled) {
      pause();
      return;
    }

    if (hasStartedMusic) {
      void play();
    }
  }, [hasStartedMusic, isMusicEnabled, pause, play]);

  // Start random music when entering the game screen
  useEffect(() => {
    if (currentScreen === 'game' && isMusicEnabled && hasStartedMusic) {
      void playRandomTrack();
    }
  }, [currentScreen, isMusicEnabled, hasStartedMusic, playRandomTrack]);

  const handleIntroContinue = () => {
    if (isMusicEnabled) {
      void play();
    }

    setHasStartedMusic(true);
    setCurrentScreen('start');
  };

  const handleStartGame = (players: number, setup?: GameSetup) => {
    setPlayerCount(players);
    setGameSetup(setup);
    setAiSpeedSetting(setup?.aiSpeed ?? 'normal');
    setCurrentScreen('character-selection');
    toast({
      title: "Welcome to Deep Regrets!",
      description: setup?.aiPlayers
        ? `You'll face ${setup.aiPlayers} AI opponent${setup.aiPlayers > 1 ? 's' : ''} on ${setup.aiDifficulty} difficulty.`
        : "Choose your captains wisely - the deep sea holds many secrets.",
    });
  };

  const startGameWithCharacters = (characters: SelectedCharacter[]) => {
    const newGameState = initializeGame(characters);
    setPlayerCount(characters.length);

    // Mark AI players in the game state
    characters.forEach((char, index) => {
      if (char.isAI && newGameState.players[index]) {
        newGameState.players[index].isAI = true;
        newGameState.players[index].aiDifficulty = char.aiDifficulty || 'medium';
      }
    });

    dispatch({ type: 'INIT_GAME', playerId: 'system', payload: newGameState });
    setCurrentScreen('game');
    setLastCharacters(characters);

    const aiCount = characters.filter(c => c.isAI).length;
    toast({
      title: "Game Started!",
      description: aiCount > 0
        ? `Your voyage begins against ${aiCount} AI opponent${aiCount > 1 ? 's' : ''}. May fortune favor the bold.`
        : "Your voyage into the deep begins. May fortune favor the bold.",
    });

    playBubbleSfx();
  };

  const handleCharactersSelected = (characters: SelectedCharacter[]) => {
    startGameWithCharacters(characters);
  };

  const handleBackToStart = () => {
    if (aiActionTimeoutRef.current) {
      clearTimeout(aiActionTimeoutRef.current);
    }
    setIsAIThinking(false);
    setCurrentAIAction(null);
    setCurrentScreen('start');
    setGameSetup(undefined);
    dispatch({ type: 'RESET_GAME', playerId: 'system', payload: {} });
  };

  const handleRestartWithSameSetup = () => {
    if (!lastCharacters) {
      handleBackToStart();
      return;
    }

    if (aiActionTimeoutRef.current) {
      clearTimeout(aiActionTimeoutRef.current);
    }

    startGameWithCharacters(lastCharacters);
  };

  const handleGameAction = useCallback((action: GameAction) => {
    if (gameState) {
      dispatch(action);
      // After a player passes, end their turn to advance to the next player
      if (action.type === 'PASS') {
        dispatch({ type: 'END_TURN', playerId: 'system', payload: {} });
      }
    }
  }, [gameState]);

  // AI Action Effect - triggers when it's an AI player's turn
  useEffect(() => {
    if (!gameState || gameState.isGameOver) return;
    if (gameState.phase !== 'action' && gameState.phase !== 'declaration') return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer?.isAI || currentPlayer.hasPassed) return;

    // Clear any existing timeout
    if (aiActionTimeoutRef.current) {
      clearTimeout(aiActionTimeoutRef.current);
    }

    // Start thinking phase
    setIsAIThinking(true);
    setCurrentAIAction(null);

    // Thinking delay based on difficulty and chosen AI speed
    const baseThinkingDelay = currentPlayer.aiDifficulty === 'hard' ? 1200 :
                              currentPlayer.aiDifficulty === 'medium' ? 900 : 600;
    const aiSpeedPresets = {
      slow: { thinkingMultiplier: 1.25, actionDisplayDelay: 1000 },
      normal: { thinkingMultiplier: 1, actionDisplayDelay: 800 },
      fast: { thinkingMultiplier: 0.6, actionDisplayDelay: 300 },
    } as const;
    const selectedSpeed = aiSpeedPresets[aiSpeedSetting] ?? aiSpeedPresets.normal;
    const thinkingDelay = baseThinkingDelay * selectedSpeed.thinkingMultiplier;
    const actionDisplayDelay = selectedSpeed.actionDisplayDelay;

    aiActionTimeoutRef.current = setTimeout(() => {
      // Generate the AI decision
      const aiDecision = generateAIAction(
        gameState,
        currentPlayer,
        currentPlayer.aiDifficulty || 'medium'
      );

      // Show the decision (stop thinking, show action)
      setIsAIThinking(false);
      setCurrentAIAction(aiDecision);

      // Execute the action after displaying it
      setTimeout(() => {
        dispatch(aiDecision.action);

        // After AI action, move to next player (only during action phase)
        // During declaration phase, DECLARE_LOCATION already handles player advancement
        if (gameState.phase === 'action') {
          dispatch({ type: 'END_TURN', playerId: 'system', payload: {} });
        }

        // Clear the action display after a brief moment
        setTimeout(() => {
          setCurrentAIAction(null);
        }, 300);
      }, actionDisplayDelay);
    }, thinkingDelay);

    return () => {
      if (aiActionTimeoutRef.current) {
        clearTimeout(aiActionTimeoutRef.current);
      }
      setIsAIThinking(false);
      setCurrentAIAction(null);
    };
  }, [gameState?.currentPlayerIndex, gameState?.phase, gameState?.players, gameState?.isGameOver, aiSpeedSetting]);

  const handleErrorReset = () => {
    handleBackToStart();
  };

  // Render current screen
  switch (currentScreen) {
    case 'intro':
      return <IntroScreen onContinue={handleIntroContinue} />;

    case 'start':
      return <StartScreen onStartGame={handleStartGame} />;
    
    case 'character-selection':
      return (
        <CharacterSelection
          playerCount={playerCount}
          gameSetup={gameSetup}
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

      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const showAIIndicator = currentPlayer?.isAI && (isAIThinking || currentAIAction);

      return (
        <ErrorBoundary onReset={handleErrorReset}>
          <GameBoard
            gameState={gameState}
            onAction={handleGameAction}
            onRestartGame={handleRestartWithSameSetup}
            onBackToStart={handleBackToStart}
          />
          {showAIIndicator && (
            <AITurnIndicator
              player={currentPlayer}
              gameState={gameState}
              currentAction={currentAIAction}
              isThinking={isAIThinking}
            />
          )}
        </ErrorBoundary>
      );
    
    default:
      return null;
  }
};

export default Index;
