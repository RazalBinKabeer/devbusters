/**
 * Shout to Break — Game stub
 */
import GameStubScreen from '../../components/GameStubScreen';

export default function ShoutToBreakScreen() {
  return (
    <GameStubScreen
      title="Shout to Break"
      subtitle="Scream your stress away!"
      icon="🗣️"
      accentColor="#FF3366"
      description="Use your real voice to shatter objects. The louder you scream, the more destruction you cause! Pure vocal rage therapy."
      features={[
        'Real microphone input — your actual voice!',
        'Shatter windows, glasses, pots, monitors',
        'Decibel-based destruction physics',
        'Combo system for sustained screaming',
        'Challenge mode: Break everything in 10 seconds',
      ]}
    />
  );
}
