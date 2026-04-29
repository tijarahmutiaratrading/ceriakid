// Offline sync queue for game progress
const SYNC_QUEUE_KEY = 'game_sync_queue';
const LAST_SYNC_KEY = 'last_sync_timestamp';

export const queueGameProgress = (progressData) => {
  try {
    const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    queue.push({
      ...progressData,
      queuedAt: new Date().toISOString(),
    });
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    return true;
  } catch (error) {
    console.error('Failed to queue progress:', error);
    return false;
  }
};

export const getSyncQueue = () => {
  try {
    return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const clearSyncQueue = () => {
  localStorage.removeItem(SYNC_QUEUE_KEY);
};

export const syncOfflineProgress = async (base44, user) => {
  if (!user) return false;
  
  try {
    const queue = getSyncQueue();
    if (queue.length === 0) return true;
    
    for (const item of queue) {
      const { queuedAt, ...progressData } = item;
      
      // Check if already exists
      const existing = await base44.entities.ChildGameProgress.filter({
        userEmail: progressData.userEmail,
        childName: progressData.childName,
        gameType: progressData.gameType,
      });
      
      if (existing.length > 0) {
        await base44.entities.ChildGameProgress.update(existing[0].id, progressData);
      } else {
        await base44.entities.ChildGameProgress.create(progressData);
      }
    }
    
    clearSyncQueue();
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    return true;
  } catch (error) {
    console.error('Offline sync failed:', error);
    return false;
  }
};

export const getLastSyncTime = () => {
  const lastSync = localStorage.getItem(LAST_SYNC_KEY);
  return lastSync ? new Date(lastSync) : null;
};