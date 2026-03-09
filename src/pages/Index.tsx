import { useState, useEffect } from "react";
import { useStore } from "../StoreContext";
import { useHotkeys } from "../hooks/useHotkeys";
import TableView from "../components/TableView";
import ChallengeView from "../components/ChallengeView";
import ActionOverlay from "../components/ActionOverlay";
import PhysicsJar from "../components/PhysicsJar";
import QuickInput from "../components/QuickInput";
import FloatingFansView from "../components/FloatingFansView";
import DashboardView from "../components/DashboardView";
import EffectsOverlay from "../components/EffectsOverlay";
import BackgroundSlideshow from "../components/BackgroundSlideshow";

const Index = () => {
  const { viewMode, editingEntity, setEditingEntity } = useStore();
  const [actionOverlay, setActionOverlay] = useState<'donator' | 'fan' | 'challenge' | null>(null);

  useEffect(() => {
    if (editingEntity) {
      setActionOverlay(editingEntity.type);
    }
  }, [editingEntity]);

  useHotkeys((action) => {
    setActionOverlay(action);
  });

  return (
    <main className="min-h-screen overflow-hidden text-white font-body selection:bg-primary/30 relative bg-[#020202]">

      {viewMode === 'main' && (
        <>
          <BackgroundSlideshow />
          <FloatingFansView />
          <PhysicsJar />
        </>
      )}
      {viewMode === 'table' && <TableView />}
      {viewMode === 'challenge' && <ChallengeView />}
      {viewMode === 'dashboard' && <DashboardView />}

      <EffectsOverlay />
      <QuickInput />
      <ActionOverlay action={actionOverlay} onClose={() => { setActionOverlay(null); setEditingEntity(null); }} />
    </main>
  );
};

export default Index;
