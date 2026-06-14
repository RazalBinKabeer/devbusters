/**
 * Whack Your Boss — Game stub
 */
import GameStubScreen from '../../components/GameStubScreen';

export default function WhackYourBossScreen() {
  return (
    <GameStubScreen
      title="Whack Your Boss"
      subtitle="Pick. Name. Whack. Repeat."
      icon="🔨"
      accentColor="#FFD23F"
      description="Create a custom avatar with any gender, give it a name, and whack it until your frustration meter hits zero. Therapeutic rage!"
      features={[
        'Customizable avatar — pick gender & appearance',
        'Name your target (we won\'t judge 😏)',
        'Multiple whack animations & tools',
        'Frustration meter goes DOWN as you whack',
        'Zen achievement: reach 0% frustration',
      ]}
    />
  );
}
