import { Game } from './components/Game';

function App() {
  const handleGameOver = (result: 'win' | 'loss' | 'draw', reason: string) => {
    console.log(`[App] Game over: ${result} - ${reason}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <Game 
          playerColor="w" 
          engineSkill={10}
          engineTimeoutMs={2000}
          onGameOver={handleGameOver}
        />
      </div>
    </div>
  );
}

export default App;
