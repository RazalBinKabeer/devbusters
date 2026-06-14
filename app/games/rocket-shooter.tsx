/**
 * Rocket Shooter — Game stub
 */
import GameStubScreen from '../../components/GameStubScreen';

export default function RocketShooterScreen() {
  return (
    <GameStubScreen
      title="Rocket Shooter"
      subtitle="Blast those tickets away!"
      icon="🚀"
      accentColor="#FF6B35"
      description="Shoot down Jira tickets, meeting invites, and Slack notifications with rocket bullets. Collect coffee and snacks for power-ups!"
      features={[
        'Side-scrolling space shooter',
        'Destroy Jira tickets, Slack pings, meeting invites',
        'Collect ☕ coffee for speed boost',
        'Collect 🍕 snacks for health regen',
        'Boss battles: The Sprint Review 👀',
      ]}
    />
  );
}
