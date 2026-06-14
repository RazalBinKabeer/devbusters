/**
 * Squash the Bugs — Game stub
 */
import GameStubScreen from '../../components/GameStubScreen';

export default function SquashTheBugsScreen() {
  return (
    <GameStubScreen
      title="Squash the Bugs"
      subtitle="Tap fast, debug faster!"
      icon="🐛"
      accentColor="#00D4AA"
      description="Bugs rain from the sky — squash them with your fingers! Use Git Revert to clear all bugs at once. Don't let them reach production!"
      features={[
        'Tap bugs falling from the sky',
        'Different bug types: syntax, runtime, logic',
        'Git Revert power-up: clears ALL bugs instantly',
        'Git Bisect: slows bugs for 5 seconds',
        'Boss bug: The Heisenbug (disappears when observed 👀)',
      ]}
    />
  );
}
