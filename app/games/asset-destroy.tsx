/**
 * Asset Destroy — Game stub
 */
import GameStubScreen from '../../components/GameStubScreen';

export default function AssetDestroyScreen() {
  return (
    <GameStubScreen
      title="Asset Destroy"
      subtitle="Smash all the things!"
      icon="💻"
      accentColor="#7B2FF7"
      description="Pick your weapon and destroy office equipment. Laptops, monitors, keyboards — nothing is safe from your developer rage!"
      features={[
        'Choose your weapon: bat 🏏, fist 👊, or gun 🔫',
        'Destroy laptops, monitors, keyboards, mice',
        'Realistic destruction animations',
        'Rage meter builds with each hit',
        'Unlock legendary weapons (golden keyboard!)',
      ]}
    />
  );
}
